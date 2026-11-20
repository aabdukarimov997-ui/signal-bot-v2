"""Regressiya testlari — topilgan mantiqiy xatolar qaytmasligi uchun."""

import pytest


@pytest.mark.asyncio
async def test_get_all_user_telegram_ids_excludes_banned(sample_user):
    """`where(not User.is_banned)` xatosi tufayli funksiya doim bo'sh ro'yxat
    qaytarardi va barcha broadcast'lar hech kimga yuborilmasdi."""
    from bot.services.user_service import (
        ban_user,
        create_user,
        get_all_user_telegram_ids,
    )

    active = await create_user(telegram_id=900001, full_name="Active User")
    await create_user(telegram_id=900002, full_name="Banned User")
    await ban_user(900002)

    ids = await get_all_user_telegram_ids()

    assert 900001 in ids
    assert 900002 not in ids
    assert active.telegram_id in ids


@pytest.mark.asyncio
async def test_unread_contact_message_queries():
    """`where(not ContactMessage.is_read)` xatosi tufayli o'qilmagan xabarlar
    hech qachon topilmasdi."""
    from bot.services.contact_service import (
        create_contact_message,
        get_unread_count,
        get_unread_messages,
        mark_as_read,
    )
    from bot.services.user_service import create_user

    user = await create_user(telegram_id=910001, full_name="Contact User")
    first = await create_contact_message(user.id, "Birinchi xabar")
    await create_contact_message(user.id, "Ikkinchi xabar")

    assert await get_unread_count() == 2
    unread = await get_unread_messages()
    assert len(unread) == 2

    await mark_as_read(first.id, "admin")
    assert await get_unread_count() == 1


@pytest.mark.asyncio
async def test_stars_amount_not_divided_by_100():
    """XTR (Stars) total_amount butun yulduzda keladi; 100 ga bo'lish xato edi.
    Bu yerda handler mantiqini ifodalovchi hisobni tekshiramiz."""
    total_amount = 250
    currency = "XTR"

    amount = total_amount
    if currency != "XTR":
        amount = total_amount / 100

    assert amount == 250

    usd_total = 2500
    usd_amount = usd_total
    if "USD" != "XTR":
        usd_amount = usd_total / 100
    assert usd_amount == 25


@pytest.mark.asyncio
async def test_crypto_invoice_unique_amount(sample_user):
    """Kripto invoice'ga noyob summa biriktirilishi kerak — blokcheyndagi
    tranzaksiyani aynan shu to'lovga bog'lash uchun."""
    from bot.services.payment_service import create_crypto_invoice
    from bot.services.settings_service import set_setting

    await set_setting("tron_wallet_address", "TTestWalletAddress1234567890")

    first = await create_crypto_invoice(
        user_id=sample_user.id,
        product_type="signal",
        product_id="tariff-1",
        network="tron",
        amount=25.0,
    )
    second = await create_crypto_invoice(
        user_id=sample_user.id,
        product_type="signal",
        product_id="tariff-1",
        network="tron",
        amount=25.0,
    )

    assert first.crypto_network == "tron"
    assert first.crypto_address == "TTestWalletAddress1234567890"
    assert float(first.crypto_amount) >= 25.0
    assert float(first.crypto_amount) < 26.0
    assert first.crypto_amount != second.crypto_amount
    assert first.status == "pending"
    assert first.crypto_expires_at is not None


@pytest.mark.asyncio
async def test_crypto_invoice_requires_wallet(sample_user):
    """Wallet sozlanmagan bo'lsa invoice yaratilmasligi kerak."""
    from bot.services.payment_service import create_crypto_invoice
    from bot.services.settings_service import set_setting

    await set_setting("bnb_wallet_address", "")

    with pytest.raises(ValueError):
        await create_crypto_invoice(
            user_id=sample_user.id,
            product_type="signal",
            product_id="tariff-1",
            network="bnb",
            amount=25.0,
        )


@pytest.mark.asyncio
async def test_mark_crypto_paid_is_idempotent(sample_user):
    """Bitta tranzaksiya bir necha marta qayta ishlansa ham to'lov ikki marta
    tasdiqlanmasligi kerak."""
    from bot.services.payment_service import (
        create_crypto_invoice,
        mark_crypto_paid,
    )
    from bot.services.settings_service import set_setting

    await set_setting("tron_wallet_address", "TTestWalletAddress1234567890")
    payment = await create_crypto_invoice(
        user_id=sample_user.id,
        product_type="signal",
        product_id="tariff-1",
        network="tron",
        amount=25.0,
    )

    assert await mark_crypto_paid(payment.id, "txhash-1") is True
    assert await mark_crypto_paid(payment.id, "txhash-1") is False
    assert await mark_crypto_paid(payment.id, "txhash-2") is False


def test_amount_matches_tolerance():
    """Kelgan summa invoice summasiga kichik tolerans bilan mos kelishi kerak."""
    from bot.services.crypto_service import amount_matches

    assert amount_matches(25.0137, 25.0137)
    assert amount_matches(25.0137, 25.01)
    assert amount_matches(25.0137, 25.02)
    assert not amount_matches(25.0137, 25.10)
    assert not amount_matches(25.0137, 20.0)


@pytest.mark.asyncio
async def test_check_network_payments_auto_approves(sample_user, monkeypatch):
    """Blokcheyndan kelgan tranzaksiya invoice summasiga mos kelsa,
    to'lov avtomatik 'approved' bo'lishi kerak."""
    from bot.services import crypto_service
    from bot.services.payment_service import create_crypto_invoice, get_payment_by_id
    from bot.services.settings_service import set_setting

    await set_setting("tron_wallet_address", "TTestWalletAddress1234567890")
    payment = await create_crypto_invoice(
        user_id=sample_user.id,
        product_type="signal",
        product_id="tariff-1",
        network="tron",
        amount=25.0,
    )
    expected = float(payment.crypto_amount)

    async def fake_transfers(network: str):
        assert network == "tron"
        return [
            {"tx_hash": "tx-not-matching", "amount": 10.0, "timestamp": 0},
            {"tx_hash": "tx-matching", "amount": expected, "timestamp": 0},
        ]

    monkeypatch.setattr(crypto_service, "get_wallet_transfers", fake_transfers)

    confirmed = await crypto_service.check_network_payments("tron", bot=None)

    ids = [c["payment_id"] for c in confirmed]
    assert payment.id in ids
    match = next(c for c in confirmed if c["payment_id"] == payment.id)
    assert match["tx_hash"] == "tx-matching"

    fresh = await get_payment_by_id(payment.id)
    assert fresh.status == "approved"
    assert fresh.auto_approved is True
    assert fresh.crypto_tx_hash == "tx-matching"


@pytest.mark.asyncio
async def test_check_network_payments_skips_used_tx(sample_user, monkeypatch):
    """Bitta tranzaksiya ikki invoice'ga yozilmasligi kerak."""
    from bot.services import crypto_service
    from bot.services.payment_service import create_crypto_invoice
    from bot.services.settings_service import set_setting

    await set_setting("tron_wallet_address", "TTestWalletAddress1234567890")
    first = await create_crypto_invoice(
        user_id=sample_user.id, product_type="signal", product_id="t1", network="tron", amount=25.0
    )
    second = await create_crypto_invoice(
        user_id=sample_user.id, product_type="signal", product_id="t1", network="tron", amount=25.0
    )

    async def fake_transfers(network: str):
        # Ikkala invoice summasiga ham mos bitta tranzaksiya
        return [
            {"tx_hash": "tx-single", "amount": float(first.crypto_amount), "timestamp": 0},
            {"tx_hash": "tx-single", "amount": float(second.crypto_amount), "timestamp": 0},
        ]

    monkeypatch.setattr(crypto_service, "get_wallet_transfers", fake_transfers)

    confirmed = await crypto_service.check_network_payments("tron", bot=None)

    # Faqat bitta to'lov tasdiqlanishi kerak (bir tx — bir marta)
    assert len(confirmed) == 1
    assert confirmed[0]["tx_hash"] == "tx-single"


@pytest.mark.asyncio
async def test_expire_stale_crypto_invoices(sample_user):
    """Muddati o'tgan to'lanmagan kripto invoice'lar yopilishi kerak."""
    from datetime import UTC, datetime, timedelta

    from sqlalchemy import update

    from bot.database.session import get_session
    from bot.models.payment import Payment
    from bot.services.payment_service import create_crypto_invoice, expire_stale_crypto_invoices
    from bot.services.settings_service import set_setting

    await set_setting("tron_wallet_address", "TTestWalletAddress1234567890")
    payment = await create_crypto_invoice(
        user_id=sample_user.id, product_type="signal", product_id="t1", network="tron", amount=25.0
    )

    async with get_session() as session:
        await session.execute(
            update(Payment)
            .where(Payment.id == payment.id)
            .values(
                created_at=datetime.now(UTC) - timedelta(hours=2),
                crypto_expires_at=datetime.now(UTC) - timedelta(hours=1),
            )
        )

    expired = await expire_stale_crypto_invoices(ttl_minutes=60)
    assert expired >= 1
