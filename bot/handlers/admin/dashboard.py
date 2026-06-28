from aiogram import Router, F
from aiogram.filters import Command, or_f
from aiogram.types import Message, CallbackQuery

from bot.config import settings
from bot.models.user import User
from bot.services.settings_service import get_admin_ids
from bot.utils.keyboards import admin_menu_kb
from bot.utils.texts import ADMIN_WELCOME, NOT_ADMIN

admin_router = Router()


# Global admin filter on the parent router — protects ALL sub-handlers
@admin_router.message(Command("admin"))
async def admin_entry_handler(message: Message, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await message.answer(NOT_ADMIN)
        return
    await message.answer(ADMIN_WELCOME, reply_markup=admin_menu_kb())


@admin_router.callback_query(F.data == "admin_back")
async def admin_back_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    from bot.utils.helpers import safe_edit
    await safe_edit(callback.message, ADMIN_WELCOME, reply_markup=admin_menu_kb())
    await callback.answer()