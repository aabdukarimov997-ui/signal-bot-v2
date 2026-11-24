"""Narx hisoblash — faol obunasi bor mijozlarga chegirma.

Qoida: foydalanuvchida shu mahsulot turi bo'yicha **faol obunasi** bo'lsa,
yangi tarif/sotib olishda 25% chegirma ko'rsatiladi va aynan shu chegirma
bo'yicha pul olinadi.

Muhim:
  • Chegirma faqat ko'rinishda emas — to'lov summasiga ham ta'sir qiladi.
  • Tarifning o'z narxi (signal_tariffs.price) o'zgarmaydi — chegirma
    hisob-kitob vaqti qo'shiladi, shuning uchun admin narxlarni o'zgartirsa
    chegirma avtomatik yangi narxga nisbatan hisoblanadi.
"""

import logging
from dataclasses import dataclass
from datetime import UTC, datetime

from bot.services.settings_service import get_setting
from bot.services.subscription_service import get_active_subscription_by_type

logger = logging.getLogger(__name__)

DEFAULT_LOYALTY_DISCOUNT_PERCENT = 25
SETTING_KEY = "loyalty_discount_percent"


@dataclass(frozen=True)
class Price:
    """Tarif narxi — asosiy va chegirma hisobga olingan."""

    base: float
    final: float
    discount_percent: int

    @property
    def has_discount(self) -> bool:
        return self.discount_percent > 0 and self.final < self.base

    @property
    def saved(self) -> float:
        return round(self.base - self.final, 2)

    def format_final(self) -> str:
        return f"${self.final:.0f}" if self.final == int(self.final) else f"${self.final:.2f}"

    def format_base(self) -> str:
        return f"${self.base:.0f}" if self.base == int(self.base) else f"${self.base:.2f}"

    def button_label(self) -> str:
        """Tugma uchun qisqa yozuv: "$18.75 (-25%)"."""
        if self.has_discount:
            return f"{self.format_final()} (-{self.discount_percent}%)"
        return self.format_final()

    def format_html(self) -> str:
        """HTML matn uchun: eski narx ustidan chizilgan + chegirma."""
        if self.has_discount:
            return f"<s>{self.format_base()}</s> <b>{self.format_final()}</b> 🎁 -{self.discount_percent}%"
        return f"<b>{self.format_final()}</b>"


async def get_discount_percent() -> int:
    """Admin sozlagan chegirma foizi (1-100). Standart: 25%."""
    raw = await get_setting(SETTING_KEY)
    if raw is None:
        return DEFAULT_LOYALTY_DISCOUNT_PERCENT
    try:
        value = int(str(raw).strip())
    except (TypeError, ValueError):
        return DEFAULT_LOYALTY_DISCOUNT_PERCENT
    return min(max(value, 0), 100)


async def has_active_subscription(user_id: str, product_type: str) -> bool:
    """Foydalanuvchida shu mahsulot turi bo'yicha faol obuna bor mi.

    `status == "active"` bilan birga `end_date` ham tekshiriladi — scheduler
    hali eskirgan obunani "expired" ga o'tkazmagan bo'lsa ham chegirma
    muddati o'tgan obunaga berilmaydi.
    """
    sub = await get_active_subscription_by_type(user_id, product_type)
    if sub is None:
        return False
    end = sub.end_date
    if end.tzinfo is None:
        end = end.replace(tzinfo=UTC)
    return end > datetime.now(UTC)


async def build_price(user_id: str, base: float, product_type: str) -> Price:
    """Narxni hisoblaydi — faol obunasi bo'lsa chegirma qo'llanadi."""
    base = float(base)
    if not await has_active_subscription(user_id, product_type):
        return Price(base=base, final=round(base, 2), discount_percent=0)

    percent = await get_discount_percent()
    if percent <= 0:
        return Price(base=base, final=round(base, 2), discount_percent=0)

    final = round(base * (100 - percent) / 100, 2)
    return Price(base=base, final=final, discount_percent=percent)
