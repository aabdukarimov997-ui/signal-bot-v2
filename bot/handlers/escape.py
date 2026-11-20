"""Global chiqish handler'i.

Foydalanuvchi biror FSM holatida (masalan promo kod kiritish yoki to'lov cheki
yuborish) qotib qolishi mumkin. Bu handler boshqa routerlardan OLDIN ishlaydi va
holatni tozalab, bosh menyuga qaytaradi:

  • /menu, /cancel buyruqlari
  • "🏠 Bosh menyu" / "❌ Bekor qilish" tugmalari
  • "back_main" callback'lari

/start va "🚀 Start" boshqa handler'lar (start.py) orqali ishlaydi — ular ham
holatni tozalaydi, shuning uchun bu yerda takrorlanmaydi.
"""

import contextlib

from aiogram import Bot, F, Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from bot.services.settings_service import get_admin_ids, get_setting
from bot.utils.keyboards import main_menu_kb
from bot.utils.texts import START_TEXT

escape_router = Router()

EXIT_COMMANDS = {"menu", "cancel", "bekor"}
EXIT_BUTTONS = {
    "🏠 Bosh menyu",
    "❌ Bekor qilish",
    "⬅️ Orqaga",
}


async def send_main_menu(bot: Bot, chat_id: int, user) -> None:
    """Bosh menyuni yuboradi (welcome_message mavjud bo'lsa)."""
    welcome_msg = await get_setting("welcome_message")
    if not welcome_msg:
        welcome_msg = START_TEXT
    welcome_video = await get_setting("welcome_video")

    is_admin = user is not None and user.telegram_id in await get_admin_ids()
    reply_markup = main_menu_kb(is_admin=is_admin)

    if welcome_video:
        try:
            await bot.send_video(chat_id=chat_id, video=welcome_video, caption=welcome_msg, reply_markup=reply_markup)
            return
        except Exception:
            pass
    await bot.send_message(chat_id=chat_id, text=welcome_msg, reply_markup=reply_markup)


@escape_router.message(Command(*EXIT_COMMANDS))
async def escape_command_handler(message: Message, state: FSMContext, user, bot: Bot) -> None:
    await state.clear()
    await send_main_menu(bot, message.chat.id, user)


@escape_router.message(F.text.in_(EXIT_BUTTONS))
async def escape_button_handler(message: Message, state: FSMContext, user, bot: Bot) -> None:
    await state.clear()
    await send_main_menu(bot, message.chat.id, user)


@escape_router.callback_query(
    F.data.in_({
        "back_main",
        "menu_cancel",
        "cancel_state",
        "cancel_promo",
        "promo_cancel",
        "cancel_promo_code",
        "promo_code_cancel",
    })
)
async def escape_callback_handler(callback: CallbackQuery, state: FSMContext, user, bot: Bot) -> None:
    await state.clear()
    with contextlib.suppress(Exception):
        await callback.message.delete()
    await send_main_menu(bot, callback.message.chat.id, user)
    await callback.answer()
