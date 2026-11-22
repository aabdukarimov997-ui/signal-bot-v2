"""HD hamyon (har bir mijozga alohida manzil) testlari.

Test xpub'i BIP39 test vektori (`abandon ... about`) dan olingan, shuning uchun
kutilgan manzillar mustaqil ravishda (bip_utils bilan) tekshirilgan.
"""

import pytest

from bot.services.hd_wallet import (
    ExtendedPublicKey,
    HDWalletError,
    derive_address,
    validate_xpub,
    xpub_fingerprint,
)

TRON_XPUB = (
    "xpub6D1AabNHCupeiLM65ZR9UStMhJ1vCpyV4XbZdyhMZBiJXALQtmn9p42VTQckoHVn8WNqS7dqnJokZHAHcHGoaQgmv8D45oNUKx6DZMNZBCd"
)
EVM_XPUB = (
    "xpub6DCoCpSuQZB2jawqnGMEPS63ePKWkwWPH4TU45Q7LPXWuNd8TMtVxRrgjtEshuqpK3mdhaWHPFsBngh5GFZaM6si3yZdUsT8ddYM3PwnATt"
)
XPRV = (
    "xprv9yrdwPSRnvomqFK4u1y5uW2SaXS2Vnr3pAYTjJjbyRZR8p9BwoadRsCxtgUFdAKeRPbwvGRcCSYMV69nNK4N2kadevJ6L5iQVy1SwGKDTHQ"
)

TRON_ADDRESSES = [
    "TUEZSdKsoDHQMeZwihtdoBiN46zxhGWYdH",
    "TSeJkUh4Qv67VNFwY8LaAxERygNdy6NQZK",
    "TYJPRrdB5APNeRs4R7fYZSwW3TcrTKw2gx",
]

EVM_ADDRESSES = [
    "0x9858EfFD232B4033E47d90003D41EC34EcaEda94",
    "0x6Fac4D18c912343BF86fa7049364Dd4E424Ab9C0",
    "0xb6716976A3ebe8D39aCEB04372f22Ff8e6802D7A",
]


def test_tron_derivation_matches_reference():
    for index, expected in enumerate(TRON_ADDRESSES):
        assert derive_address(TRON_XPUB, "tron", index) == expected


def test_evm_derivation_matches_reference():
    for index, expected in enumerate(EVM_ADDRESSES):
        assert derive_address(EVM_XPUB, "bnb", index) == expected


def test_each_customer_gets_unique_address():
    tron = {derive_address(TRON_XPUB, "tron", i) for i in range(20)}
    evm = {derive_address(EVM_XPUB, "bnb", i) for i in range(20)}
    assert len(tron) == 20
    assert len(evm) == 20


def test_trc20_address_format():
    address = derive_address(TRON_XPUB, "tron", 5)
    assert address.startswith("T")
    assert len(address) == 34


def test_evm_address_checksum_format():
    address = derive_address(EVM_XPUB, "bnb", 5)
    assert address.startswith("0x")
    assert len(address) == 42
    assert any(c.isupper() for c in address[2:])


def test_rejects_private_key_input():
    with pytest.raises(HDWalletError, match="xprv"):
        ExtendedPublicKey.from_string(XPRV)


def test_rejects_garbage():
    with pytest.raises(HDWalletError):
        ExtendedPublicKey.from_string("not-an-xpub")


def test_rejects_empty():
    with pytest.raises(HDWalletError):
        ExtendedPublicKey.from_string("")


def test_rejects_checksum_tampering():
    tampered = TRON_XPUB[:-1] + ("1" if TRON_XPUB[-1] != "1" else "2")
    with pytest.raises(HDWalletError):
        ExtendedPublicKey.from_string(tampered)


def test_rejects_hardened_path():
    node = ExtendedPublicKey.from_string(TRON_XPUB)
    with pytest.raises(HDWalletError, match="qattiqlashtirilgan"):
        node.derive("0'/1")


def test_validate_xpub_accepts_matching_network():
    assert validate_xpub(TRON_XPUB, "tron") == TRON_XPUB
    assert validate_xpub(EVM_XPUB, "bnb") == EVM_XPUB


def test_validate_xpub_accepts_same_key_for_both_networks():
    """TRON va EVM bir xil secp256k1 kalitdan foydalanadi — bitta xpub
    ikkala tarmoq uchun ham ishlaydi, faqat manzil kodlash farq qiladi."""
    assert validate_xpub(TRON_XPUB, "tron")
    assert validate_xpub(TRON_XPUB, "bnb")


def test_validate_xpub_rejects_master_key():
    master = (
        "xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8"
    )
    with pytest.raises(HDWalletError, match="chuqurligi"):
        validate_xpub(master, "tron")


def test_validate_xpub_rejects_unknown_network():
    with pytest.raises(HDWalletError, match="Noma'lum tarmoq"):
        validate_xpub(TRON_XPUB, "ton")


def test_fingerprint_is_stable_and_not_secret():
    first = xpub_fingerprint(TRON_XPUB)
    assert first == xpub_fingerprint(TRON_XPUB)
    assert len(first) == 12
    assert TRON_XPUB not in first


def test_unknown_network_rejected():
    with pytest.raises(HDWalletError):
        derive_address(TRON_XPUB, "ton", 0)

@pytest.mark.asyncio
async def test_hd_invoice_uses_unique_address_per_user(sample_user):
    """HD rejim yoqilganda har bir foydalanuvchi alohida manzil oladi."""
    from bot.services.payment_service import create_crypto_invoice
    from bot.services.settings_service import set_setting
    from bot.services.user_service import create_user

    await set_setting("tron_hd_xpub", TRON_XPUB)
    await set_setting("tron_usdt_contract", "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t")

    first_user = await create_user(telegram_id=770001, full_name="HD User 1")
    second_user = await create_user(telegram_id=770002, full_name="HD User 2")

    first = await create_crypto_invoice(
        user_id=first_user.id, product_type="signal", product_id="t1", network="tron", amount=25.0
    )
    second = await create_crypto_invoice(
        user_id=second_user.id, product_type="signal", product_id="t1", network="tron", amount=25.0
    )

    assert first.crypto_address != second.crypto_address

    from bot.database.engine import async_session_factory
    from bot.models.user import User

    async with async_session_factory() as session:
        fresh_first = await session.get(User, first_user.id)
        fresh_second = await session.get(User, second_user.id)

    assert fresh_first.hd_index is not None
    assert fresh_second.hd_index is not None
    assert fresh_first.hd_index != fresh_second.hd_index
    assert first.crypto_address == derive_address(TRON_XPUB, "tron", fresh_first.hd_index)
    assert second.crypto_address == derive_address(TRON_XPUB, "tron", fresh_second.hd_index)


@pytest.mark.asyncio
async def test_hd_index_is_stable_across_invoices(sample_user):
    """Bir mijozning barcha invoice'lari bir xil manzilga tushadi."""
    from bot.services.payment_service import create_crypto_invoice
    from bot.services.settings_service import set_setting

    await set_setting("tron_hd_xpub", TRON_XPUB)

    first = await create_crypto_invoice(
        user_id=sample_user.id, product_type="signal", product_id="t1", network="tron", amount=25.0
    )
    second = await create_crypto_invoice(
        user_id=sample_user.id, product_type="signal", product_id="t2", network="tron", amount=50.0
    )

    assert first.crypto_address == second.crypto_address


@pytest.mark.asyncio
async def test_hd_disabled_falls_back_to_shared_wallet(sample_user):
    """xpub bo'sh bo'lsa umumiy hamyon manzili ishlatiladi."""
    from bot.services.payment_service import create_crypto_invoice
    from bot.services.settings_service import set_setting

    shared = "TQn9Y2khE4YQ8pA9nK9a1Kz2fSdq8mYQ3a"
    await set_setting("tron_hd_xpub", "")
    await set_setting("tron_wallet_address", shared)

    payment = await create_crypto_invoice(
        user_id=sample_user.id, product_type="signal", product_id="t1", network="tron", amount=25.0
    )
    assert payment.crypto_address == shared


@pytest.mark.asyncio
async def test_hd_invoice_checked_on_its_own_address(sample_user, monkeypatch):
    """HD invoice faqat o'z manziliga kelgan transfer bilan tasdiqlanadi."""
    from bot.services import crypto_service
    from bot.services.payment_service import create_crypto_invoice, get_payment_by_id
    from bot.services.settings_service import set_setting

    await set_setting("tron_hd_xpub", TRON_XPUB)
    payment = await create_crypto_invoice(
        user_id=sample_user.id, product_type="signal", product_id="t1", network="tron", amount=25.0
    )
    expected = float(payment.crypto_amount)
    asked: list[str] = []

    async def fake_transfers(network: str, address: str):
        asked.append(address)
        if address != payment.crypto_address:
            return []
        return [{"tx_hash": "tx-hd", "amount": expected, "timestamp": 0}]

    monkeypatch.setattr(crypto_service, "get_transfers_for_address", fake_transfers)
    monkeypatch.setattr(crypto_service, "get_wallet_transfers", lambda *a, **k: [])

    confirmed = await crypto_service.check_network_payments("tron", bot=None)

    assert payment.crypto_address in asked
    assert [c["payment_id"] for c in confirmed] == [payment.id]
    fresh = await get_payment_by_id(payment.id)
    assert fresh.status == "approved"
