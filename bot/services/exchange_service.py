"""
💰 USD → UZB SO'M (UZS) jonli kurs xizmati.

USD/UZS kursini oladi va 5 daqiqa cache'laydi.
Bir nechta API manbalari:
1. CBU (Markaziy Bank) — https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/
2. open.er-api.com (fallback) — https://open.er-api.com/v6/latest/USD
"""

import logging
import time
from typing import Optional

import aiohttp

logger = logging.getLogger(__name__)

# API endpoints — USD kursi
CBU_API_URL = "https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/"
ER_API_URL = "https://open.er-api.com/v6/latest/USD"

# Cache: {rate: float, timestamp: float}
_cache: dict[str, float | None] = {"rate": None, "timestamp": 0}
CACHE_TTL = 300  # 5 daqiqa

# Oxirgi ma'lum kurs (fallback)
FALLBACK_RATE = 11900.0


def _format_uzs(amount: float) -> str:
    """Summani UZS formatida chiroyli ko'rsatish: 1 250 000 so'm"""
    return f"{amount:,.0f}".replace(",", " ") + " so'm"


async def _fetch_cbu() -> Optional[float]:
    """Markaziy Bank API dan USD/UZS kursini oladi."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(CBU_API_URL, timeout=8) as resp:
                if resp.status != 200:
                    logger.warning("CBU API %d", resp.status)
                    return None
                data = await resp.json()
                if isinstance(data, list) and len(data) > 0:
                    rate_str = data[0].get("Rate")
                    if rate_str:
                        return float(rate_str)
    except Exception as e:
        logger.warning("CBU API xatolik: %s", e)
    return None


async def _fetch_er_api() -> Optional[float]:
    """open.er-api.com dan USD/UZS kursini oladi (fallback)."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(ER_API_URL, timeout=8) as resp:
                if resp.status != 200:
                    logger.warning("ER API %d", resp.status)
                    return None
                data = await resp.json()
                if data.get("result") == "success":
                    rate = data.get("rates", {}).get("UZS")
                    if rate:
                        return float(rate)
    except Exception as e:
        logger.warning("ER API xatolik: %s", e)
    return None


async def get_usd_uzs_rate(*, force_refresh: bool = False) -> Optional[float]:
    """
    USD/UZS jonli kursini qaytaradi.
    1 USD = ? UZS

    Avval cache'dan tekshiradi, agar 5 daqiqadan eski bo'lsa yoki
    force_refresh=True bo'lsa, API'dan yangilab oladi.
    """
    now = time.time()
    if not force_refresh and _cache["rate"] is not None and (now - _cache["timestamp"]) < CACHE_TTL:
        return _cache["rate"]

    # 1) CBU API
    rate = await _fetch_cbu()
    if rate is not None:
        _cache["rate"] = rate
        _cache["timestamp"] = now
        logger.info("USD/UZS kurs yangilandi (CBU): 1 USD = %.2f UZS", rate)
        return rate

    # 2) Fallback: open.er-api.com
    rate = await _fetch_er_api()
    if rate is not None:
        _cache["rate"] = rate
        _cache["timestamp"] = now
        logger.info("USD/UZS kurs yangilandi (ER API): 1 USD = %.2f UZS", rate)
        return rate

    # 3) Cache'da eski kurs bo'lsa, uni qaytar
    if _cache["rate"] is not None:
        return _cache["rate"]

    # 4) So'nggi ma'lum kurs
    logger.warning("Kurs olishda xatolik — fallback %.0f ishlatilmoqda", FALLBACK_RATE)
    return FALLBACK_RATE


async def get_uzs_amount(usd_amount: float) -> tuple[float, float, str]:
    """
    USD summani UZS ga o'tkazadi.

    Returns: (uzs_amount, exchange_rate, formatted_uzs_string)
    """
    rate = await get_usd_uzs_rate() or FALLBACK_RATE
    uzs = usd_amount * rate
    return uzs, rate, _format_uzs(uzs)


async def format_payment_with_uzs(
    usd_amount: float,
    template: str,
    card_number: str,
    card_holder: str,
    force_refresh: bool = False,
) -> tuple[str, float]:
    """
    To'lov matnini USD va jonli UZS kursi bilan formatlaydi.

    force_refresh=True bo'lsa, cache'ni tozalab qayta yuklaydi.

    Returns: (formatted_text, exchange_rate)
    """
    rate = await get_usd_uzs_rate(force_refresh=force_refresh) or FALLBACK_RATE
    uzs_amount = usd_amount * rate
    uzs_str = _format_uzs(uzs_amount)

    text = template.format(
        card_number=card_number,
        card_holder=card_holder,
        usd_amount=f"${usd_amount:.0f}",
        uzs_amount=uzs_str,
        exchange_rate=f"{rate:,.0f}".replace(",", " "),
    )
    return text, rate
