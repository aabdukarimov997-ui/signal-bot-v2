"""
💰 USD → UZB SO'M (UZS) jonli kurs xizmati.

Markaziy Bank API dan USD/UZS kursini oladi va 5 daqiqa cache'laydi.
API: https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/
"""

import logging
import time
from typing import Optional

import aiohttp

logger = logging.getLogger(__name__)

# CBU API endpoint — USD kursi
CBU_API_URL = "https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/"

# Cache: {rate: float, timestamp: float}
_cache: dict[str, float | None] = {"rate": None, "timestamp": 0}
CACHE_TTL = 300  # 5 daqiqa


def _format_uzs(amount: float) -> str:
    """Summani UZS formatida chiroyli ko'rsatish: 1 250 000 so'm"""
    return f"{amount:,.0f}".replace(",", " ") + " so'm"


async def get_usd_uzs_rate(*, force_refresh: bool = False) -> Optional[float]:
    """
    USD/UZS jonli kursini qaytaradi.
    1 USD = ? UZS

    Avval cache'dan tekshiradi, agar 5 daqiqadan eski bo'lsa yoki
    force_refresh=True bo'lsa, CBU API dan yangilab oladi.
    """
    now = time.time()
    if not force_refresh and _cache["rate"] is not None and (now - _cache["timestamp"]) < CACHE_TTL:
        return _cache["rate"]

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(CBU_API_URL, timeout=10) as resp:
                if resp.status != 200:
                    logger.warning("CBU API %d: %s", resp.status, await resp.text())
                    return _cache["rate"]  # Eski kursni qaytar

                data = await resp.json()
                # API returns: [{"id": "1", "Code": "USD", "Ccy": "USD", ... "Rate": "12950.00"}]
                if isinstance(data, list) and len(data) > 0:
                    rate_str = data[0].get("Rate")
                    if rate_str:
                        rate = float(rate_str)
                        _cache["rate"] = rate
                        _cache["timestamp"] = now
                        logger.info("USD/UZS kurs yangilandi: 1 USD = %.2f UZS", rate)
                        return rate

        logger.warning("CBU API dan kurs olishda xatolik: %s", data)
        return _cache["rate"]

    except Exception as e:
        logger.error("CBU API xatolik: %s", e)
        # Agar cache'da kurs bo'lsa, eski kursni qaytar
        if _cache["rate"] is not None:
            return _cache["rate"]
        # Fallback: so'nggi ma'lum kurs
        return 13000.0  # 1 USD ≈ 13 000 UZS (fallback)


async def get_uzs_amount(usd_amount: float) -> tuple[float, float, str]:
    """
    USD summani UZS ga o'tkazadi.

    Returns: (uzs_amount, exchange_rate, formatted_uzs_string)
    """
    rate = await get_usd_uzs_rate() or 13000.0
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
    rate = await get_usd_uzs_rate(force_refresh=force_refresh) or 13000.0
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
