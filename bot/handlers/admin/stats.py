from aiogram import Router, F
from aiogram.types import CallbackQuery

from bot.config import settings
from bot.models.user import User
from bot.services.settings_service import get_admin_ids
from bot.services.payment_service import get_total_revenue, get_today_revenue
from bot.services.subscription_service import get_active_subscription_count
from bot.services.user_service import get_user_count
from bot.utils.texts import ADMIN_STATS_TEXT
from bot.utils.helpers import safe_edit
from bot.utils.keyboards import InlineKeyboardMarkup, InlineKeyboardButton

admin_stats_router = Router()


@admin_stats_router.callback_query(F.data == "admin_stats")
async def admin_stats_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    users = await get_user_count()
    subscriptions = await get_active_subscription_count()
    revenue = await get_total_revenue()
    today_revenue = await get_today_revenue()

    text = ADMIN_STATS_TEXT.format(
        users=users,
        subscriptions=subscriptions,
        revenue=revenue,
        today_revenue=today_revenue,
    )
    await safe_edit(callback.message, text, reply_markup=InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
    ]))
    await callback.answer()