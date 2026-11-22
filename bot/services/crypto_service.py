"""Blokcheyndan avtomatik kripto to'lovlarni tekshirish.

Qo'llab-quvvatlanadigan tarmoqlar:
  • TRON (USDT TRC20) — TronGrid REST API orqali
  • BNB Smart Chain (USDT BEP20) — JSON-RPC `eth_getLogs` orqali

Ishlash mantig'i:
  1. Foydalanuvchi TRON/BNB usulini tanlaganda invoice yaratiladi va unga
     NOYOB summa biriktiriladi (masalan tarif $25 → 25.0137 USDT).
  2. Foydalanuvchi aynan shu summani walletga o'tkazadi.
  3. Bot har 60 soniyada walletga kelgan tranzaksiyalarni tekshiradi,
     summasi invoice summasiga mos kelgani topilsa — to'lov avtomatik
     tasdiqlanadi (admin arx bermaydi).
"""

from __future__ import annotations

import logging
import time

import aiohttp

logger = logging.getLogger(__name__)

# USDT (TRC20) — TronGrid orqali tekshiriladigan tranzaksiya turi
TRON_TX_TYPE_TRANSFER = "Transfer"

# BEP20 `Transfer(address,address,uint256)` event topic0
BEP20_TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

# TronGrid / BSC RPC endpointlari
TRONGRID_API = "https://api.trongrid.io"
BSC_RPC_URL = "https://bsc-dataseed.binance.org"

HTTP_TIMEOUT = 15


async def _get_config(network: str) -> dict[str, str]:
    """Tarmoq bo'yicha joriy sozlamalarni (wallet, kontrakt, RPC) beradi."""
    from bot.config import settings
    from bot.services.settings_service import get_setting

    if network == "tron":
        address = await get_setting("tron_wallet_address") or settings.TRON_WALLET_ADDRESS
        contract = await get_setting("tron_usdt_contract") or settings.TRON_USDT_CONTRACT
        api_key = await get_setting("trongrid_api_key") or settings.TRONGRID_API_KEY
        return {"address": address, "contract": contract, "api_key": api_key}
    if network == "bnb":
        address = await get_setting("bnb_wallet_address") or settings.BNB_WALLET_ADDRESS
        contract = await get_setting("bnb_usdt_contract") or settings.BNB_USDT_CONTRACT
        rpc = await get_setting("bsc_rpc_url") or settings.BSC_RPC_URL
        return {"address": address, "contract": contract, "api_key": rpc}
    return {}


def is_wallet_configured(network: str, cfg: dict[str, str]) -> bool:
    """Manzil haqiqiy hamyonmi (kontrakt emasmi) va tarmoqqa mosmi.

    Noto'g'ri kiritilgan (kontrakt yoki boshqa tarmoq manzili) qiymatlar
    bo'lsa invoice yaratilmaydi va tranzaksiyalar tekshirilmaydi —
    aks holda tasdiqlanmagan transferlar ham to'lov deb hisoblanishi mumkin.
    """
    from bot.utils.validators import (
        CONTRACT_KEYS,
        WALLET_KEYS,
        find_contract_in_wallet_field,
        is_evm_address,
        is_tron_address,
    )

    address = (cfg.get("address") or "").strip()
    contract = (cfg.get("contract") or "").strip()
    if not address or not contract:
        return False

    wallet_key = WALLET_KEYS[0] if network == "tron" else WALLET_KEYS[1]
    contract_key = CONTRACT_KEYS[0] if network == "tron" else CONTRACT_KEYS[1]
    if find_contract_in_wallet_field(wallet_key, address):
        return False
    if find_contract_in_wallet_field(contract_key, contract):
        return False

    if network == "tron":
        return (
            is_tron_address(address)
            and is_tron_address(contract)
            and address != contract
        )
    if network == "bnb":
        return (
            is_evm_address(address)
            and is_evm_address(contract)
            and address.lower() != contract.lower()
        )
    return False


async def _tron_transfers(address: str, contract: str, api_key: str) -> list[dict]:
    """Walletga kelgan USDT TRC20 transferlarini (nominal, USDT) qaytaradi."""
    url = f"{TRONGRID_API}/v1/accounts/{address}/transactions/trc20"
    params = {
        "only_confirmed": "true",
        "contract_address": contract,
        "limit": "50",
        "order_by": "block_timestamp,desc",
    }
    headers = {"Accept": "application/json"}
    if api_key:
        headers["TRON-PRO-API-KEY"] = api_key

    try:
        timeout = aiohttp.ClientTimeout(total=HTTP_TIMEOUT)
        async with aiohttp.ClientSession(timeout=timeout) as session, session.get(
            url, params=params, headers=headers
        ) as resp:
            if resp.status != 200:
                logger.warning("TronGrid %d — javob yaroqsiz", resp.status)
                return []
            data = await resp.json()
    except Exception as e:
        logger.warning("TronGrid xatoligi: %s", e)
        return []

    transfers: list[dict] = []
    for item in data.get("data") or []:
        # Faqat walletga KIRAYOTGAN transferlar
        if (item.get("to") or "").lower() != address.lower():
            continue
        if (item.get("from") or "").lower() == address.lower():
            continue
        raw = item.get("value")
        if raw in (None, ""):
            continue
        try:
            amount = float(raw) / 1_000_000  # USDT TRC20 — 6 decimal
        except (TypeError, ValueError):
            continue
        transfers.append(
            {
                "tx_hash": item.get("transaction_id") or item.get("tx_id") or "",
                "amount": amount,
                "timestamp": (item.get("block_timestamp") or 0) / 1000,
            }
        )
    return transfers


async def _rpc_call(method: str, params: list) -> dict:
    """BSC JSON-RPC chaqiruvi."""
    from bot.services.settings_service import get_setting

    rpc = await get_setting("bsc_rpc_url") or BSC_RPC_URL
    payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
    try:
        timeout = aiohttp.ClientTimeout(total=HTTP_TIMEOUT)
        async with aiohttp.ClientSession(timeout=timeout) as session, session.post(
            rpc, json=payload, headers={"Content-Type": "application/json"}
        ) as resp:
            if resp.status != 200:
                logger.warning("BSC RPC %d — javob yaroqsiz", resp.status)
                return {}
            return await resp.json()
    except Exception as e:
        logger.warning("BSC RPC xatoligi (%s): %s", method, e)
        return {}


def _pad_address(address: str) -> str:
    """EVM manzilni 32 baytli topic ko'rinishiga keltiradi."""
    return "0x" + "0" * 24 + address.lower().replace("0x", "")


async def _bnb_transfers(address: str, contract: str) -> list[dict]:
    """Walletga kelgan USDT BEP20 transferlarini (nominal, USDT) qaytaradi."""
    block_hex = await _rpc_call("eth_blockNumber", [])
    latest = int(block_hex.get("result") or "0x0", 16)
    if latest <= 0:
        logger.warning("BSC: oxirgi blok olinmadi")
        return []

    # Oxirgi ~1 soat (BSC ~3s blok → 1200 blok) oraliqdagi loglarni olamiz
    from_block = max(latest - 1200, 0)
    logs = await _rpc_call(
        "eth_getLogs",
        [
            {
                "address": contract,
                "fromBlock": hex(from_block),
                "toBlock": hex(latest),
                "topics": [BEP20_TRANSFER_TOPIC, None, _pad_address(address)],
            }
        ],
    )

    transfers: list[dict] = []
    for log in logs.get("result") or []:
        topics = log.get("topics") or []
        if len(topics) < 3:
            continue
        # topics[1] — jo'natuvchi manzil (bizning wallet emasligini tekshiramiz)
        sender = topics[1].lower()
        if sender.endswith(address.lower().replace("0x", "")):
            continue
        data_hex = log.get("data") or "0x"
        try:
            raw = int(data_hex, 16)
        except (TypeError, ValueError):
            continue
        amount = raw / 10**18  # USDT BEP20 — 18 decimal
        transfers.append(
            {
                "tx_hash": log.get("transactionHash") or "",
                "amount": amount,
                "timestamp": time.time(),
            }
        )
    return transfers


async def get_wallet_transfers(network: str) -> list[dict]:
    """Tarmoq bo'yicha walletga kelgan USDT transferlari.

    Returns: [{"tx_hash": str, "amount": float, "timestamp": float}, ...]
    """
    cfg = await _get_config(network)
    address = (cfg.get("address") or "").strip()
    if not is_wallet_configured(network, cfg):
        logger.warning("Kripto tekshiruv o'chirilgan: %s hamyoni noto'g'ri sozlangan", network)
        return []

    if network == "tron":
        return await _tron_transfers(address, cfg["contract"], cfg.get("api_key") or "")
    if network == "bnb":
        return await _bnb_transfers(address, cfg["contract"])
    return []


def amount_matches(invoice_amount: float, received: float, tolerance: float = 0.02) -> bool:
    """Kelgan summa invoice summasiga mosmi (ellipsis-tolerant).

    Foydalanuvchi summani biroz yaxlitlashi mumkin (masalan 25.01 → 25.0),
    shuning uchun kichik tolerans qoldiramiz.
    """
    return abs(round(received, 2) - round(invoice_amount, 2)) <= tolerance


async def check_network_payments(network: str, bot=None) -> list[dict]:
    """Kutilayotgan kripto to'lovlarni blokcheyn bilan solishtiradi.

    Yangi tasdiqlangan to'lovlar ro'yxatini qaytaradi:
    [{"payment_id": str, "tx_hash": str, "amount": float, "user_id": str}, ...]
    """
    from bot.services.payment_service import get_pending_crypto_payments, mark_crypto_paid

    pending = await get_pending_crypto_payments(network)
    if not pending:
        return []

    cfg = await _get_config(network)
    if not is_wallet_configured(network, cfg):
        return []

    transfers = await get_wallet_transfers(network)

    # Bir tranzaksiya faqat 1 marta ishlatilishi kerak
    used_hashes: set[str] = set()
    confirmed: list[dict] = []

    for payment in pending:
        for tx in transfers:
            tx_hash = tx.get("tx_hash") or ""
            if not tx_hash or tx_hash in used_hashes:
                continue
            if not amount_matches(float(payment.crypto_amount or 0), float(tx.get("amount") or 0)):
                continue
            if not await mark_crypto_paid(payment.id, tx_hash):
                continue
            used_hashes.add(tx_hash)
            confirmed.append(
                {
                    "payment_id": payment.id,
                    "tx_hash": tx_hash,
                    "amount": float(tx.get("amount") or 0),
                    "user_id": payment.user_id,
                }
            )
            break

    return confirmed


async def check_all_crypto_payments(bot) -> list[dict]:
    """Barcha yoqilgan tarmoqlar bo'yicha to'lovlarni tekshiradi."""
    confirmed: list[dict] = []
    for network in ("tron", "bnb"):
        try:
            confirmed.extend(await check_network_payments(network, bot))
        except Exception as e:
            logger.warning("Kripto tekshiruv xatoligi (%s): %s", network, e)
    return confirmed
