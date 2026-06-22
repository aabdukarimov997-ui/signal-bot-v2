from typing import Union

from aiogram.exceptions import TelegramBadRequest
from aiogram.types import InlineKeyboardMarkup, Message


async def safe_edit(
    message: Message,
    text: str,
    reply_markup: Union[InlineKeyboardMarkup, None] = None,
    disable_web_page_preview: bool = True,
) -> bool:
    """Edit message text safely, ignoring 'message is not modified' errors."""
    try:
        await message.edit_text(text, reply_markup=reply_markup, disable_web_page_preview=disable_web_page_preview)
        return True
    except TelegramBadRequest as e:
        if "message is not modified" in str(e).lower():
            return False
        raise


def format_date(dt) -> str:
    if not dt:
        return "—"
    return dt.strftime("%d.%m.%Y %H:%M")


def format_currency(amount: float) -> str:
    return f"${amount:.2f}"


def calculate_discounted_price(price: float, discount_percent: int) -> float:
    return round(price * (100 - discount_percent) / 100, 2)