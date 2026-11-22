from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError

from bot.database.session import get_session
from bot.models.payment import Payment


async def _generate_invoice_id(session) -> str:
    """Generate invoice ID in format DDMMYY-NNNN (e.g. 260426-0001).

    Kunlik eng katta ketma-ket raqamdan boshlab oshiramiz (count o'rniga),
    shunda o'chirilgan yoki parallel yozuvlar sababli to'qnashuv kamayadi.
    """
    now = datetime.now(UTC)
    date_prefix = now.strftime("%d%m%y")

    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_start = today_start + timedelta(days=1)
    result = await session.execute(
        select(func.max(Payment.invoice_id)).where(
            Payment.created_at >= today_start,
            Payment.created_at < tomorrow_start,
            Payment.invoice_id.isnot(None),
        )
    )
    last = result.scalar()
    last_seq = 0
    if last:
        try:
            last_seq = int(last.split("-")[-1])
        except (ValueError, IndexError):
            last_seq = 0
    return f"{date_prefix}-{last_seq + 1:04d}"


async def create_payment(
    user_id: str,
    product_type: str,
    amount: float,
    payment_method: str,
    currency: str = "USD",
    product_id: str | None = None,
    promo_code: str | None = None,
    discount: float = 0,
    photo_file_id: str | None = None,
    telegram_charge_id: str | None = None,
    provider_charge_id: str | None = None,
    status: str | None = None,
    crypto_network: str | None = None,
    crypto_address: str | None = None,
    crypto_amount: float | None = None,
    crypto_expires_at: datetime | None = None,
) -> Payment:
    async with get_session() as session:
        payment = Payment(
            user_id=user_id,
            product_type=product_type,
            product_id=product_id,
            amount=amount,
            currency=currency,
            payment_method=payment_method,
            status=status or ("approved" if payment_method == "stars" else "pending"),
            promo_code=promo_code,
            discount=discount,
            photo_file_id=photo_file_id,
            telegram_charge_id=telegram_charge_id,
            provider_charge_id=provider_charge_id,
            crypto_network=crypto_network,
            crypto_address=crypto_address,
            crypto_amount=crypto_amount,
            crypto_expires_at=crypto_expires_at,
        )
        # invoice_id unikal — parallel yozuvlarda to'qnashsa qayta urinamiz
        for attempt in range(5):
            payment.invoice_id = await _generate_invoice_id(session)
            session.add(payment)
            try:
                await session.flush()
                return payment
            except IntegrityError:
                await session.rollback()
                if attempt == 4:
                    raise
        return payment


async def approve_payment(payment_id: str, admin_id: int) -> Payment | None:
    async with get_session() as session:
        result = await session.execute(select(Payment).where(Payment.id == payment_id))
        payment = result.scalar_one_or_none()
        if payment and payment.status == "pending":
            payment.status = "approved"
            payment.reviewed_at = datetime.now(UTC)
            payment.reviewed_by = admin_id
        return payment


async def reject_payment(payment_id: str, admin_id: int) -> Payment | None:
    async with get_session() as session:
        result = await session.execute(select(Payment).where(Payment.id == payment_id))
        payment = result.scalar_one_or_none()
        if payment and payment.status == "pending":
            payment.status = "rejected"
            payment.reviewed_at = datetime.now(UTC)
            payment.reviewed_by = admin_id
        return payment


async def get_pending_payments() -> list[Payment]:
    async with get_session() as session:
        result = await session.execute(
            select(Payment).where(Payment.status == "pending").order_by(Payment.created_at.desc())
        )
        return list(result.scalars().all())


async def get_payment_by_id(payment_id: str) -> Payment | None:
    async with get_session() as session:
        result = await session.execute(select(Payment).where(Payment.id == payment_id))
        return result.scalar_one_or_none()


async def get_payments_by_user(user_id: str) -> list[Payment]:
    async with get_session() as session:
        result = await session.execute(
            select(Payment).where(Payment.user_id == user_id).order_by(Payment.created_at.desc())
        )
        return list(result.scalars().all())


async def get_total_revenue() -> float:
    async with get_session() as session:
        result = await session.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status == "approved")
        )
        return float(result.scalar() or 0)


async def get_today_revenue() -> float:
    async with get_session() as session:
        today = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
        result = await session.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                Payment.status == "approved",
                Payment.created_at >= today,
            )
        )
        return float(result.scalar() or 0)


# ─── Avtomatik kripto to'lov (TRON TRC20 / BNB BEP20) ──────────────

CRYPTO_METHODS = {
    "tron": "tron_trc20",
    "bnb": "bnb",
}


async def _generate_unique_crypto_amount(base_amount: float) -> float:
    """Tarif narxiga asoslangan NOYOB summa yaratadi.

    Masalan $25 → 25.0137 USDT. Noyoblik shu tarmoqda kutilayotgan
    to'lovlar orasida tekshiriladi — aks holda ikki foydalanuvchi bir xil
    summa yuborsa, blokcheyn transferi noto'g'ri to'lovga yozilishi mumkin.
    """
    import random

    for _ in range(50):
        candidate = round(base_amount + random.randint(1, 9999) / 10000, 4)
        async with get_session() as session:
            result = await session.execute(
                select(Payment.id).where(
                    Payment.crypto_amount == candidate,
                    Payment.status == "pending",
                    Payment.crypto_network.isnot(None),
                )
            )
            if result.scalar_one_or_none() is None:
                return candidate
    return round(base_amount, 4)


async def _next_hd_index() -> int:
    """Keyingi bo'sh HD indeksni beradi (commit qilinmagan sessiyalarga bog'liq emas)."""
    from sqlalchemy import func

    from bot.models.user import User

    async with get_session() as session:
        result = await session.execute(select(func.max(User.hd_index)))
        current = result.scalar()
        return 0 if current is None else int(current) + 1


async def _allocate_hd_index(user_id: str) -> int:
    """Mijozga HD indeksni atomik ajratadi (parallel so'rovlarga chidamli).

    Indeks alohida tranzaksiyada yoziladi; unique constraint to'qnashuvni
    ushlab qolsa, qayta urinamiz va yangi bo'sh indeksni olamiz.
    """
    import asyncio

    from sqlalchemy import update

    from bot.models.user import User

    for _ in range(10):
        async with get_session() as session:
            existing = await session.scalar(select(User.hd_index).where(User.id == user_id))
            if existing is not None:
                return int(existing)

            candidate = await _next_hd_index()
            try:
                result = await session.execute(
                    update(User)
                    .where(User.id == user_id, User.hd_index.is_(None))
                    .values(hd_index=candidate)
                )
            except IntegrityError:
                result = None
            if result is not None and result.rowcount:
                return candidate

        await asyncio.sleep(0.01)

    raise ValueError("HD indeks ajratilmadi — keyinroq qayta urinib ko'ring")


async def _resolve_deposit_address(user_id: str, network: str, cfg: dict) -> str:
    """Mijoz uchun depozit manzilini beradi.

    HD rejim yoqilgan bo'lsa — foydalanuvchining doimiy `hd_index` i asosida
    xpub'dan manzil hosil qilinadi (har bir mijozga alohida manzil).
    Aks holda umumiy hamyon manzili qaytadi.
    """
    from bot.services.crypto_service import is_hd_enabled
    from bot.services.hd_wallet import HDWalletError, derive_address

    if not is_hd_enabled(cfg):
        return (cfg.get("address") or "").strip()

    index = await _allocate_hd_index(user_id)

    try:
        return derive_address(cfg["xpub"], network, index)
    except HDWalletError as exc:
        raise ValueError(f"HD manzil hosil qilib bo'lmadi: {exc}") from exc


async def create_crypto_invoice(
    user_id: str,
    product_type: str,
    product_id: str,
    network: str,
    amount: float,
    ttl_minutes: int = 60,
) -> Payment:
    """Kripto to'lov uchun invoice yaratadi.

    Noyob `crypto_amount` biriktiradi — blokcheyndan kelgan transfer aynan
    shu summaga mos kelsa, to'lov avtomatik tasdiqlanadi.

    HD rejim yoqilgan bo'lsa, `crypto_address` — mijozning **shaxsiy**
    manzili bo'ladi (har bir mijozga alohida).
    """
    from bot.services.crypto_service import _get_config, is_hd_enabled, is_wallet_configured

    cfg = await _get_config(network)
    method = CRYPTO_METHODS.get(network)
    if not method:
        raise ValueError(f"Noma'lum tarmoq: {network}")
    if not is_wallet_configured(network, cfg):
        raise ValueError(
            f"{network} wallet manzili noto'g'ri — invoys yaratilmadi. "
            "Admin panelda to'g'ri hamyon manzilini kiriting."
        )

    # Foydalanuvchida shu tarif uchun amaldagi invoice bo'lsa — qayta ishlatamiz
    # (har bosishda yangi pending qator yaratilmasin).
    async with get_session() as session:
        existing_result = await session.execute(
            select(Payment)
            .where(
                Payment.user_id == user_id,
                Payment.product_id == product_id,
                Payment.crypto_network == network,
                Payment.status == "pending",
                Payment.crypto_expires_at.isnot(None),
                Payment.crypto_expires_at > datetime.now(UTC),
            )
            .order_by(Payment.created_at.desc())
            .limit(1)
        )
        existing = existing_result.scalar_one_or_none()
    if existing:
        return existing

    address = await _resolve_deposit_address(user_id, network, cfg)

    # HD rejimda har bir mijozning o'z manzili bor — noyob summa shart emas,
    # aniq tarif narxi ishlatiladi (foydalanuvchi uchun tushunarli).
    # Umumiy hamyon rejimida esa noyob summa kerak (bir manzilga ko'p to'lov).
    if is_hd_enabled(cfg):
        crypto_amount = round(float(amount), 2)
    else:
        crypto_amount = await _generate_unique_crypto_amount(float(amount))

    expires_at = datetime.now(UTC) + timedelta(minutes=ttl_minutes)
    return await create_payment(
        user_id=user_id,
        product_type=product_type,
        product_id=product_id,
        amount=float(amount),
        payment_method=method,
        status="pending",
        crypto_network=network,
        crypto_address=address,
        crypto_amount=crypto_amount,
        crypto_expires_at=expires_at,
    )


async def get_pending_crypto_payments(network: str) -> list[Payment]:
    """Tarmoq bo'yicha blokcheyndan kutilayotgan (pending) kripto to'lovlar.

    Muddati o'tgan invoice'lar hisobga olinmaydi.
    """
    async with get_session() as session:
        result = await session.execute(
            select(Payment)
            .where(
                Payment.crypto_network == network,
                Payment.status == "pending",
                Payment.crypto_expires_at.isnot(None),
                Payment.crypto_expires_at > datetime.now(UTC),
            )
            .order_by(Payment.created_at)
        )
        return list(result.scalars().all())


async def mark_crypto_paid(payment_id: str, tx_hash: str) -> bool:
    """Tranzaksiya topildi — to'lovni atomik ravishda 'approved' qiladi.

    `WHERE status='pending'` sharti bilan bitta UPDATE bajariladi — parallel
    tekshiruvlar (scheduler + qo'lda tekshirish) bir to'lovni ikki marta
    tasdiqlay olmaydi. Bir tx hash faqat bitta to'lovga yoziladi (unique).
    """
    now = datetime.now(UTC)
    async with get_session() as session:
        try:
            result = await session.execute(
                update(Payment)
                .where(Payment.id == payment_id, Payment.status == "pending")
                .values(
                    status="approved",
                    crypto_tx_hash=tx_hash,
                    crypto_checked_at=now,
                    auto_approved=True,
                    reviewed_at=now,
                )
            )
        except IntegrityError:
            return False
        return bool(result.rowcount)


async def get_crypto_payment(payment_id: str) -> Payment | None:
    """ID bo'yicha kripto to'lovni oladi (status tekshirish uchun)."""
    return await get_payment_by_id(payment_id)


async def expire_stale_crypto_invoices(ttl_minutes: int = 60) -> int:
    """Muddati o'tgan, to'lanmagan kripto invoice'larni yopadi.

    Qaytadi: yopilgan invoice'lar soni.
    """
    now = datetime.now(UTC)
    cutoff = now - timedelta(minutes=ttl_minutes)
    async with get_session() as session:
        result = await session.execute(
            select(Payment).where(
                Payment.status == "pending",
                Payment.crypto_network.isnot(None),
                (Payment.crypto_expires_at < now)
                | ((Payment.crypto_expires_at.is_(None)) & (Payment.created_at < cutoff)),
            )
        )
        stale = list(result.scalars().all())
        for payment in stale:
            payment.status = "expired"
        if stale:
            await session.flush()
        return len(stale)
