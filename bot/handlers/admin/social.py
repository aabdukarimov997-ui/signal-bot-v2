from aiogram import Router, F
from aiogram.types import CallbackQuery, Message
from aiogram.fsm.context import FSMContext

from bot.models.user import User
from bot.services.settings_service import get_admin_ids, get_setting, set_setting
from bot.utils.keyboards import admin_social_kb
from bot.utils.texts import ADMIN_SOCIAL_TEXT
from bot.utils.states import AdminSocialStates
from bot.utils.helpers import safe_edit

admin_social_router = Router()

# Mapping: env field name → DB settings key + display label
SOCIAL_FIELD_MAP = {
    "SOCIAL_INSTAGRAM": ("instagram_url", "Instagram"),
    "SOCIAL_TWITTER": ("twitter_url", "Twitter (X)"),
    "SOCIAL_YOUTUBE": ("youtube_url", "YouTube"),
    "SOCIAL_WEBSITE": ("website_url", "Website"),
    "FREE_CHANNEL_LINK": ("free_channel_url", "Bepul kanal"),
}


@admin_social_router.callback_query(F.data == "admin_social")
async def admin_social_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    await safe_edit(callback.message, ADMIN_SOCIAL_TEXT, reply_markup=admin_social_kb())
    await callback.answer()


async def _ask_link(callback: CallbackQuery, state: FSMContext, target_state: str, env_field: str) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    db_key, label = SOCIAL_FIELD_MAP[env_field]
    current = await get_setting(db_key) or "—"
    await state.set_state(target_state)
    await state.update_data(db_key=db_key, label=label)
    await safe_edit(
        callback.message,
        f"🔗 <b>{label} havolasini kiriting:</b>\n\n"
        f"Joriy: <code>{current}</code>\n\n"
        f"Bekor qilish uchun /cancel",
        reply_markup=None,
    )
    await callback.answer()


@admin_social_router.callback_query(F.data == "admin_social_instagram")
async def social_instagram_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await _ask_link(callback, state, AdminSocialStates.waiting_instagram, "SOCIAL_INSTAGRAM")


@admin_social_router.callback_query(F.data == "admin_social_twitter")
async def social_twitter_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await _ask_link(callback, state, AdminSocialStates.waiting_twitter, "SOCIAL_TWITTER")


@admin_social_router.callback_query(F.data == "admin_social_youtube")
async def social_youtube_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await _ask_link(callback, state, AdminSocialStates.waiting_youtube, "SOCIAL_YOUTUBE")


@admin_social_router.callback_query(F.data == "admin_social_website")
async def social_website_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await _ask_link(callback, state, AdminSocialStates.waiting_website, "SOCIAL_WEBSITE")


@admin_social_router.callback_query(F.data == "admin_social_free")
async def social_free_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await _ask_link(callback, state, AdminSocialStates.waiting_free_channel, "FREE_CHANNEL_LINK")


async def _save_link(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    db_key = data.get("db_key", "")
    label = data.get("label", "")
    new_link = message.text.strip()

    await set_setting(db_key, new_link)

    await state.clear()
    await message.answer(f"✅ <b>{label}</b> havolasi yangilandi!")
    await message.answer(ADMIN_SOCIAL_TEXT, reply_markup=admin_social_kb())


@admin_social_router.message(AdminSocialStates.waiting_instagram)
async def save_instagram(message: Message, state: FSMContext) -> None:
    await _save_link(message, state)

@admin_social_router.message(AdminSocialStates.waiting_twitter)
async def save_twitter(message: Message, state: FSMContext) -> None:
    await _save_link(message, state)

@admin_social_router.message(AdminSocialStates.waiting_youtube)
async def save_youtube(message: Message, state: FSMContext) -> None:
    await _save_link(message, state)

@admin_social_router.message(AdminSocialStates.waiting_website)
async def save_website(message: Message, state: FSMContext) -> None:
    await _save_link(message, state)

@admin_social_router.message(AdminSocialStates.waiting_free_channel)
async def save_free_channel(message: Message, state: FSMContext) -> None:
    await _save_link(message, state)
