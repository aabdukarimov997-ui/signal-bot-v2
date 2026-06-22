from aiogram import Router, F
from aiogram.types import CallbackQuery, Message
from aiogram.fsm.context import FSMContext

from bot.config import settings
from bot.models.user import User
from bot.utils.keyboards import admin_social_kb
from bot.utils.texts import ADMIN_SOCIAL_TEXT
from bot.utils.states import AdminSocialStates
from bot.utils.helpers import safe_edit

admin_social_router = Router()


@admin_social_router.callback_query(F.data == "admin_social")
async def admin_social_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in settings.admin_ids:
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    await safe_edit(callback.message, ADMIN_SOCIAL_TEXT, reply_markup=admin_social_kb())
    await callback.answer()


async def _ask_link(callback: CallbackQuery, state: FSMContext, target_state: str, field_name: str) -> None:
    if callback.from_user.id not in settings.admin_ids:
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    current = getattr(settings, field_name, "—")
    await state.set_state(target_state)
    await safe_edit(
        callback.message,
        f"🔗 <b>{field_name.replace('SOCIAL_', '').title()} havolasini kiriting:</b>\n\n"
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


async def _save_link(message: Message, state: FSMContext, field: str) -> None:
    new_link = message.text.strip()
    setattr(settings, field, new_link)

    # Update .env file
    env_path = __import__("pathlib").Path(__file__).resolve().parent.parent.parent.parent / ".env"
    try:
        lines = env_path.read_text().splitlines()
        for i, line in enumerate(lines):
            if line.startswith(f"{field}="):
                lines[i] = f"{field}={new_link}"
                break
        else:
            lines.append(f"{field}={new_link}")
        env_path.write_text("\n".join(lines))
    except Exception:
        pass

    await state.clear()
    await message.answer(f"✅ <b>{field.replace('SOCIAL_', '').replace('FREE_CHANNEL_LINK', 'Bepul kanal').title()}</b> havolasi yangilandi!")
    await message.answer(ADMIN_SOCIAL_TEXT, reply_markup=admin_social_kb())


@admin_social_router.message(AdminSocialStates.waiting_instagram)
async def save_instagram(message: Message, state: FSMContext) -> None:
    await _save_link(message, state, "SOCIAL_INSTAGRAM")

@admin_social_router.message(AdminSocialStates.waiting_twitter)
async def save_twitter(message: Message, state: FSMContext) -> None:
    await _save_link(message, state, "SOCIAL_TWITTER")

@admin_social_router.message(AdminSocialStates.waiting_youtube)
async def save_youtube(message: Message, state: FSMContext) -> None:
    await _save_link(message, state, "SOCIAL_YOUTUBE")

@admin_social_router.message(AdminSocialStates.waiting_website)
async def save_website(message: Message, state: FSMContext) -> None:
    await _save_link(message, state, "SOCIAL_WEBSITE")

@admin_social_router.message(AdminSocialStates.waiting_free_channel)
async def save_free_channel(message: Message, state: FSMContext) -> None:
    await _save_link(message, state, "FREE_CHANNEL_LINK")