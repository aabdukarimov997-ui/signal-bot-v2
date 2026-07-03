from aiogram import Router, F
from aiogram.types import CallbackQuery, Message
from aiogram.fsm.context import FSMContext

from bot.config import settings
from bot.models.user import User
from bot.services.settings_service import get_admin_ids
from bot.services.user_service import get_all_users, ban_user, unban_user
from bot.utils.helpers import safe_edit, format_date
from bot.utils.keyboards import InlineKeyboardMarkup, InlineKeyboardButton

admin_users_router = Router()


@admin_users_router.callback_query(F.data == "admin_users")
async def admin_users_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    users = await get_all_users()
    if not users:
        await safe_edit(callback.message, "👥 Hozircha foydalanuvchilar yo'q.", reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
        ]))
        await callback.answer()
        return

    text = "👥 <b>Foydalanuvchilar ro'yxati:</b>\n\n"
    for u in users[:20]:  # Limit to 20
        status = "🚫" if u.is_banned else "✅"
        text += f"{status} {u.full_name} — <code>{u.telegram_id}</code>\n"

    await safe_edit(callback.message, text, reply_markup=InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
    ]))
    await callback.answer()