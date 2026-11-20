from datetime import timedelta
from unittest.mock import AsyncMock

import pytest

from bot.services import crypto_pay_service as service
from bot.services.payment_service import get_payment_by_id
from bot.services.subscription_service import get_active_subscription_by_type


@pytest.fixture
def provider(monkeypatch):
    monkeypatch.setattr(service.settings, "PROJECT_CRYPTO_PAY_TOKEN", "test-placeholder")
    mock = AsyncMock(return_value={"invoice_id": 123, "bot_invoice_url": "https://t.me/CryptoBot?start=test"})
    monkeypatch.setattr(service, "api_call", mock)
    return mock


@pytest.mark.asyncio
async def test_create_reuses_invoice(sample_user, sample_tariff, provider):
    first = await service.create_invoice(sample_user.id, sample_tariff)
    second = await service.create_invoice(sample_user.id, sample_tariff)
    assert first.id == second.id
    assert first.status == "pending"
    assert first.provider_charge_id == "123"
    assert provider.call_count == 1
    assert provider.call_args.args[1]["payload"] == first.id


@pytest.mark.asyncio
async def test_provider_failure_does_not_grant_access(sample_user, sample_tariff, provider):
    provider.side_effect = ValueError("provider failure")
    with pytest.raises(ValueError, match="invoice yaratilmadi"):
        await service.create_invoice(sample_user.id, sample_tariff)
    assert await get_active_subscription_by_type(sample_user.id, "signal") is None


@pytest.mark.asyncio
async def test_paid_invoice_grants_once(sample_user, sample_tariff, provider):
    payment = await service.create_invoice(sample_user.id, sample_tariff)
    invoice = {"invoice_id": 123, "status": "paid", "asset": "USDT", "currency_type": "crypto",
               "amount": "25.00", "payload": payment.id}
    for field, value in [("status", "active"), ("amount", "1"), ("asset", "TON"),
                         ("payload", "another-payment"), ("invoice_id", 456)]:
        assert not await service.settle_invoice(payment, {**invoice, field: value})
    assert await get_active_subscription_by_type(sample_user.id, "signal") is None
    assert await service.settle_invoice(payment, invoice)
    sub = await get_active_subscription_by_type(sample_user.id, "signal")
    end = sub.end_date
    assert sub.end_date - sub.start_date == timedelta(days=30)
    assert not await service.settle_invoice(payment, invoice)
    assert (await get_active_subscription_by_type(sample_user.id, "signal")).end_date == end
    assert (await get_payment_by_id(payment.id)).status == "approved"


def test_invoice_url_validation():
    assert service.valid_invoice_url("https://t.me/CryptoBot?start=invoice")
    assert not service.valid_invoice_url("http://t.me/CryptoBot")
    assert not service.valid_invoice_url("https://crypt.bot.evil.example/invoice")


@pytest.mark.asyncio
async def test_scheduler_confirms_provider_not_client(sample_user, sample_tariff, provider, monkeypatch):
    from bot.services import payment_finalizer

    payment = await service.create_invoice(sample_user.id, sample_tariff)
    notifier = AsyncMock(return_value=True)
    monkeypatch.setattr(payment_finalizer, "finalize_payment", notifier)
    provider.return_value = {"items": [{"invoice_id": 123, "status": "active"}]}
    await service.check_payments(None)
    assert (await get_payment_by_id(payment.id)).status == "pending"
    notifier.assert_not_called()
    provider.return_value = {"items": [{"invoice_id": 123, "status": "paid", "asset": "USDT",
                                       "amount": "25", "payload": payment.id}]}
    await service.check_payments(None)
    await service.check_payments(None)
    assert (await get_payment_by_id(payment.id)).status == "approved"
    notifier.assert_awaited_once()
    assert notifier.call_args.kwargs == {"activate": False}
