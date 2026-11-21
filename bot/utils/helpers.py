import contextlib
import html

from aiogram.exceptions import TelegramBadRequest
from aiogram.types import InlineKeyboardMarkup, Message


async def safe_send(
    target: Message,
    text: str,
    reply_markup: InlineKeyboardMarkup | None = None,
    disable_web_page_preview: bool = True,
) -> bool:
    """Send message safely — falls back to plain text if HTML parsing fails."""
    try:
        await target.answer(text, reply_markup=reply_markup, disable_web_page_preview=disable_web_page_preview)
        return True
    except TelegramBadRequest as e:
        msg = str(e).lower()
        if "can't parse entities" in msg:
            # HTML noto'g'ri — escaped qilib yuboramiz
            safe_text = html.escape(text)
            try:
                await target.answer(
                    safe_text, reply_markup=reply_markup, disable_web_page_preview=disable_web_page_preview
                )
                return True
            except Exception:
                return False
        raise


async def safe_edit(
    message: Message,
    text: str,
    reply_markup: InlineKeyboardMarkup | None = None,
    disable_web_page_preview: bool = True,
) -> bool:
    """Edit message text/caption safely, ignoring common transient errors."""
    # Telegram photo caption limit is 1024 characters. Admin settings and
    # payment guides can exceed it, so replace the media message with a text
    # message instead of letting the callback fail.
    if message.photo and len(text) > 1024:
        try:
            await message.bot.send_message(
                chat_id=message.chat.id,
                text=text,
                reply_markup=reply_markup,
                disable_web_page_preview=disable_web_page_preview,
            )
            with contextlib.suppress(Exception):
                await message.delete()
            return True
        except Exception:
            return False
    try:
        if message.photo:
            await message.edit_caption(caption=text, reply_markup=reply_markup)
        else:
            await message.edit_text(text, reply_markup=reply_markup, disable_web_page_preview=disable_web_page_preview)
        return True
    except TelegramBadRequest as e:
        msg = str(e).lower()
        if any(
            x in msg
            for x in [
                "message is not modified",
                "no text in the message to edit",
                "can't parse entities",
                "media_caption_too_long",
            ]
        ):
            if "media_caption_too_long" in msg:
                with contextlib.suppress(Exception):
                    await message.bot.send_message(
                        chat_id=message.chat.id,
                        text=text,
                        reply_markup=reply_markup,
                        disable_web_page_preview=disable_web_page_preview,
                    )
                    await message.delete()
                    return True
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
