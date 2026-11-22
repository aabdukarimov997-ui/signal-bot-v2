"""Kripto manzil validatsiyasi testlari."""

from bot.utils.validators import (
    BNB_USDT_CONTRACT,
    TRON_USDT_CONTRACT,
    find_contract_in_wallet_field,
    is_evm_address,
    is_ton_address,
    is_tron_address,
)


def test_rejects_contract_as_tron_wallet():
    assert find_contract_in_wallet_field("tron_wallet_address", TRON_USDT_CONTRACT)


def test_rejects_contract_as_bnb_wallet():
    assert find_contract_in_wallet_field("bnb_wallet_address", BNB_USDT_CONTRACT)


def test_rejects_tron_address_in_bnb_wallet():
    assert find_contract_in_wallet_field("bnb_wallet_address", TRON_USDT_CONTRACT)


def test_rejects_tron_address_in_ton_wallet():
    assert find_contract_in_wallet_field("ton_wallet_address", TRON_USDT_CONTRACT)


def test_accepts_valid_bnb_wallet():
    address = "0x1234567890AbcdEF1234567890aBcdef12345678"
    assert find_contract_in_wallet_field("bnb_wallet_address", address) is None


def test_accepts_valid_tron_wallet():
    address = "TQn9Y2khE4YQ8pA9nK9a1Kz2fSdq8mYQ3a"
    assert find_contract_in_wallet_field("tron_wallet_address", address) is None


def test_accepts_ton_wallet():
    assert is_ton_address("UQA1234567890abcdefghijklmnopqrstu")


def test_format_helpers():
    assert is_tron_address(TRON_USDT_CONTRACT)
    assert is_evm_address(BNB_USDT_CONTRACT)
    assert not is_tron_address(BNB_USDT_CONTRACT)
    assert not is_evm_address(TRON_USDT_CONTRACT)
