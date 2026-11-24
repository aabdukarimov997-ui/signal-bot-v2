"""Crypto Pay invoices. Only provider-verified payments grant access."""

import logging
from datetime import UTC, datetime, timedelta
from decimal import Decimal, InvalidOperation
from urllib.parse import urlparse

import aiohttp
from sqlalchemy import select, update

from bot.config import settings
from bot.database.session import get_session
from bot.models.payment import Payment
from bot.models.subscription import Subscription
from bot.models.tariff import SignalTariff
from bot.models.user import User
from bot.services.payment_service import create_payment
from bot.services.subscription_service import _as_aware

logger = logging.getLogger(__name__)


async def api_call(method: str, params: dict) -> dict:
    if not settings.PROJECT_CRYPTO_PAY_TOKEN:
        raise ValueError("Crypto Pay sozlanmagan")
    host = "testnet-pay.crypt.bot" if settings.PROJECT_CRYPTO_PAY_TESTNET else "pay.crypt.bot"
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=15)) as client, client.post(
            f"https://{host}/api/{method}",
            headers={"Crypto-Pay-API-Token": settings.PROJECT_CRYPTO_PAY_TOKEN},
            json=params,
        ) as response:
            data = await response.json()
            if response.status != 200 or data.get("ok") is not True:
                raise ValueError("Crypto Pay vaqtincha mavjud emas")
            return data["result"]
    except (aiohttp.ClientError, TimeoutError, KeyError) as exc:
        raise ValueError("Crypto Pay vaqtincha mavjud emas") from exc


def valid_invoice_url(value: str) -> bool:
    url = urlparse(value)
    return url.scheme == "https" and (url.hostname == "t.me" or (url.hostname or "").endswith(".crypt.bot"))


async def create_invoice(user_id: str, tariff: SignalTariff) -> Payment:
    if not settings.PROJECT_CRYPTO_PAY_TOKEN:
        raise ValueError("Crypto Pay sozlanmagan")
    async with get_session() as session:
        existing = await session.scalar(
            select(Payment).where(
                Payment.user_id == user_id,
                Payment.product_id == tariff.id,
                Payment.payment_method == "crypto_pay",
                Payment.status == "pending",
                Payment.crypto_expires_at > datetime.now(UTC),
                Payment.provider_charge_id.isnot(None),
            ).order_by(Payment.created_at.desc()).limit(1)
        )
    if existing and valid_invoice_url(existing.telegram_charge_id or ""):
        return existing
    from bot.services.pricing_service import build_price

    price = await build_price(user_id, float(tariff.price), tariff.product_type)
    payment = await create_payment(
        user_id=user_id, product_type=tariff.product_type, product_id=tariff.id,
        amount=price.final, discount=price.saved, payment_method="crypto_pay", status="pending",
        crypto_expires_at=datetime.now(UTC) + timedelta(hours=1),
    )
    try:
        invoice = await api_call("createInvoice", {
            "currency_type": "crypto", "asset": "USDT", "amount": str(price.final),
            "payload": payment.id, "expires_in": 3600, "allow_comments": False, "allow_anonymous": False,
        })
        url = invoice.get("bot_invoice_url", "")
        if not invoice.get("invoice_id") or not valid_invoice_url(url):
            raise ValueError("Crypto Pay invoice yaratilmadi")
        async with get_session() as session:
            await session.execute(update(Payment).where(Payment.id == payment.id).values(
                provider_charge_id=str(invoice["invoice_id"]), telegram_charge_id=url,
            ))
        payment.provider_charge_id = str(invoice["invoice_id"])
        payment.telegram_charge_id = url
        return payment
    except Exception:
        async with get_session() as session:
            await session.execute(update(Payment).where(Payment.id == payment.id).values(status="failed"))
        raise ValueError("Crypto Pay invoice yaratilmadi. Keyinroq urinib ko'ring.") from None


def invoice_matches(payment: Payment, invoice: dict) -> bool:
    try:
        return (
            str(invoice.get("invoice_id")) == payment.provider_charge_id
            and invoice.get("status") == "paid"
            and invoice.get("asset") == "USDT"
            and invoice.get("currency_type", "crypto") == "crypto"
            and invoice.get("payload") == payment.id
            and Decimal(str(invoice.get("amount"))) == Decimal(str(payment.amount))
        )
    except (InvalidOperation, ValueError):
        return False


async def settle_invoice(payment: Payment, invoice: dict) -> bool:
    if not invoice_matches(payment, invoice):
        return False
    # Approval and entitlement are committed together; retries cannot extend twice.
    async with get_session() as session:
        claimed = await session.execute(
            update(Payment).where(
                Payment.id == payment.id, Payment.status == "pending",
                Payment.payment_method == "crypto_pay",
                Payment.provider_charge_id == str(invoice["invoice_id"]),
            ).values(status="approved", auto_approved=True, reviewed_at=datetime.now(UTC))
        )
        if not claimed.rowcount:
            return False
        user = await session.scalar(select(User).where(User.id == payment.user_id).with_for_update())
        tariff = await session.get(SignalTariff, payment.product_id)
        if not user or not tariff or tariff.product_type != payment.product_type:
            raise ValueError("Payment entitlement unavailable")
        now = datetime.now(UTC)
        bonus = max(user.referral_bonus_days or 0, 0)
        user.referral_bonus_days = 0
        days = tariff.duration_days if tariff.duration_days is not None else tariff.duration_months * 30
        sub = await session.scalar(
            select(Subscription).join(SignalTariff, Subscription.tariff_id == SignalTariff.id)
            .where(Subscription.user_id == user.id, Subscription.status == "active",
                   SignalTariff.product_type == tariff.product_type)
            .order_by(Subscription.end_date.desc()).limit(1).with_for_update()
        )
        if sub:
            sub.end_date = max(now, _as_aware(sub.end_date)) + timedelta(days=days + bonus)
            sub.reminder_7_sent = sub.reminder_3_sent = sub.reminder_1_sent = False
        else:
            session.add(Subscription(user_id=user.id, tariff_id=tariff.id, start_date=now,
                                     end_date=now + timedelta(days=days + bonus), status="active"))
    return True


async def check_payments(bot) -> None:
    if not settings.PROJECT_CRYPTO_PAY_TOKEN:
        return
    async with get_session() as session:
        pending = list((await session.scalars(select(Payment).where(
            Payment.payment_method == "crypto_pay", Payment.status == "pending",
            Payment.provider_charge_id.isnot(None),
        ).order_by(Payment.created_at).limit(100))).all())
    for payment in pending:
        try:
            result = await api_call("getInvoices", {"invoice_ids": payment.provider_charge_id})
            for invoice in result.get("items", []):
                if str(invoice.get("invoice_id")) != payment.provider_charge_id:
                    continue
                if await settle_invoice(payment, invoice):
                    from bot.services.payment_finalizer import finalize_payment

                    await finalize_payment(bot, payment, activate=False)
                elif invoice.get("status") == "expired":
                    async with get_session() as session:
                        await session.execute(update(Payment).where(
                            Payment.id == payment.id, Payment.status == "pending",
                        ).values(status="expired"))
        except Exception:
            logger.warning("Crypto Pay check failed for payment %s; will retry", payment.id)
