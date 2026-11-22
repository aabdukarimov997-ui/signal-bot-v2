"""Blokcheyn manzillari va kontrlari uchun validatsiya."""

import re

TRON_ADDRESS_RE = re.compile(r"^T[1-9A-HJ-NP-Za-km-z]{33}$")
EVM_ADDRESS_RE = re.compile(r"^0x[a-fA-F0-9]{40}$")
TON_ADDRESS_RE = re.compile(r"^(EQ|UQ|0:|-1:)[A-Za-z0-9_+\-]{20,}$")

TRON_USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
BNB_USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955"

WALLET_KEYS = (
    "tron_wallet_address",
    "bnb_wallet_address",
    "ton_wallet_address",
    "toncoin_wallet_address",
)
CONTRACT_KEYS = ("tron_usdt_contract", "bnb_usdt_contract")


def is_tron_address(value: str) -> bool:
    return bool(TRON_ADDRESS_RE.match(value or ""))


def is_evm_address(value: str) -> bool:
    return bool(EVM_ADDRESS_RE.match(value or ""))


def is_ton_address(value: str) -> bool:
    return bool(TON_ADDRESS_RE.match(value or ""))


def find_contract_in_wallet_field(key: str, value: str) -> str | None:
    """Hamyon maydoniga kontrakt yoki boshqa tarmoq manzili kiritilganini aniqlaydi."""
    value = (value or "").strip()

    if key == "tron_wallet_address":
        if value == TRON_USDT_CONTRACT:
            return (
                "Bu USDT TRC20 kontrakt manzili, hamyon manzili emas. "
                "Trust Wallet → Receive → TRON → Copy orqali olingan hamyon manzilini kiriting."
            )
        if value and not is_tron_address(value):
            return "TRON hamyon manzili noto'g'ri. `T` bilan boshlanadigan 34 belgili manzil kiriting."

    elif key == "tron_usdt_contract":
        if value and not is_tron_address(value):
            return "USDT TRC20 kontrakt noto'g'ri. `T` bilan boshlanadigan 34 belgili manzil kiriting."

    elif key == "bnb_wallet_address":
        if value == BNB_USDT_CONTRACT:
            return (
                "Bu USDT BEP20 kontrakt manzili, hamyon manzili emas. "
                "Trust Wallet → Receive → BNB Smart Chain → Copy orqali olingan hamyon manzilini kiriting."
            )
        if is_tron_address(value):
            return "Bu TRON manzili. BNB hamyon manzili `0x` bilan boshlanadigan 42 belgili manzil bo'ladi."
        if value and not is_evm_address(value):
            return "BNB (EVM) hamyon manzili noto'g'ri. `0x` bilan boshlanadigan 42 belgili manzil kiriting."

    elif key == "bnb_usdt_contract":
        if is_tron_address(value):
            return "Bu TRON manzili. USDT BEP20 kontrakti `0x...` bilan boshlanadi."
        if value and not is_evm_address(value):
            return "USDT BEP20 kontrakt noto'g'ri. `0x` bilan boshlanadigan 42 belgili manzil kiriting."

    elif key in ("ton_wallet_address", "toncoin_wallet_address"):
        if is_tron_address(value):
            return "Bu TRON manzili. TON hamyon manzili `UQ`/`EQ` bilan boshlanadi."
        if is_evm_address(value):
            return "Bu EVM manzili. TON hamyon manzili `UQ`/`EQ` bilan boshlanadi."
        if value and not is_ton_address(value):
            return "TON hamyon manzili noto'g'ri. `UQ`/`EQ` bilan boshlanadigan manzil kiriting."

    return None
