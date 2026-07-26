from aiogram import Router, F
from aiogram.types import CallbackQuery, Message, ContentType
from aiogram.fsm.context import FSMContext

from bot.config import settings
from bot.services.settings_service import (
    get_all_settings,
    set_setting,
    export_settings,
    import_settings,
    SETTINGS_KEYS,
    get_admin_ids,
)
from bot.utils.keyboards import InlineKeyboardMarkup, InlineKeyboardButton
from bot.utils.helpers import safe_edit
from bot.utils.states import AdminSettingsStates

admin_settings_router = Router()


# Settings grouped by category for cleaner UI
SETTINGS_CATEGORIES = {
    "📝 Asosiy": ["project_name", "admin_username", "support_username", "welcome_message", "welcome_video"],
    "📈 Signal": ["signal_message", "signal_image", "signal_video", "private_channel_id", "free_channel_url", "invite_link_url"],
    "💰 Narxlar": ["price_1_month", "price_3_month", "price_6_month", "stars_1_month", "stars_3_month", "stars_6_month"],
    "💳 To'lov": ["card_number", "card_owner", "visa_card_number", "visa_card_holder",
                  "ton_wallet_address", "tron_qr_code", "bnb_wallet_address", "bnb_qr_code",
                  "toncoin_wallet_address", "toncoin_qr_code"],
    "📚 Darslar": ["course_tariff_name", "course_message", "course_description", "course_image", "course_video",
                    "course_price_1_month", "course_stars_1_month",
                    "course_channel_id", "course_channel_2_id", "course_channel_3_id",
                    "course_channel_1_name", "course_channel_2_name", "course_channel_3_name",
                    "course_invite_link_1", "course_invite_link_2", "course_invite_link_3"],
    "🌐 Ijtimoiy": ["instagram_url", "twitter_url", "youtube_url", "website_url"],
    "📢 Marketing": ["marketing_enabled", "marketing_interval_hours", "marketing_message", "marketing_image"],
    "🎁 Bonus": ["premium_gift_link", "admin_ids"],
}


def settings_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📝 Sozlamalarni tahrirlash", callback_data="admin_settings_edit")],
        [InlineKeyboardButton(text="📦 Export (JSON)", callback_data="admin_settings_export")],
        [InlineKeyboardButton(text="📥 Import (JSON)", callback_data="admin_settings_import")],
        [InlineKeyboardButton(text="🔄 Setup Wizard", callback_data="admin_settings_wizard")],
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
    ])


def settings_edit_kb() -> InlineKeyboardMarkup:
    # Show category buttons first, then individual settings
    buttons = []
    for category, keys in SETTINGS_CATEGORIES.items():
        buttons.append([InlineKeyboardButton(text=f"📁 {category}", callback_data=f"admin_set_cat_{category}")])
    buttons.append([InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_settings")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def category_settings_kb(category_keys: list[str]) -> InlineKeyboardMarkup:
    buttons = []
    for key in category_keys:
        desc = SETTINGS_KEYS.get(key, key)
        buttons.append([InlineKeyboardButton(text=f"✏️ {desc}", callback_data=f"admin_set_{key}")])
    buttons.append([InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_settings_edit")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


@admin_settings_router.callback_query(F.data == "admin_settings")
async def admin_settings_handler(callback: CallbackQuery) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    # Check if message is too big — show only summary
    all_settings = await get_all_settings()
    text = "⚙️ <b>Sozlamalar</b>\n\n"
    for category, keys in SETTINGS_CATEGORIES.items():
        set_count = sum(1 for k in keys if k in all_settings and all_settings[k])
        total = len(keys)
        text += f"📁 {category}: {set_count}/{total} sozlangan\n"

    await safe_edit(callback.message, text, reply_markup=settings_kb())
    await callback.answer()


@admin_settings_router.callback_query(F.data == "admin_settings_edit")
async def admin_settings_edit_handler(callback: CallbackQuery) -> None:
    await safe_edit(callback.message, "✏️ <b>Sozlamalar kategoriyalari</b>\n\nKategoriyani tanlang:", reply_markup=settings_edit_kb())
    await callback.answer()


@admin_settings_router.callback_query(F.data.startswith("admin_set_cat_"))
async def admin_show_category_handler(callback: CallbackQuery) -> None:
    category = callback.data.replace("admin_set_cat_", "")
    keys = SETTINGS_CATEGORIES.get(category, [])
    if not keys:
        await callback.answer("❌ Kategoriya topilmadi", show_alert=True)
        return

    all_settings = await get_all_settings()
    text = f"📁 <b>{category}</b>\n\n"
    for key in keys:
        desc = SETTINGS_KEYS.get(key, key)
        val = all_settings.get(key, "—")
        if len(val) > 40:
            val = val[:40] + "..."
        text += f"<b>{desc}</b>: {val}\n"

    await safe_edit(callback.message, text, reply_markup=category_settings_kb(keys))
    await callback.answer()


@admin_settings_router.callback_query(F.data.startswith("admin_set_"))
async def admin_set_key_handler(callback: CallbackQuery, state: FSMContext) -> None:
    key = callback.data.replace("admin_set_", "")
    current_val = await get_all_settings()
    desc = SETTINGS_KEYS.get(key, key)

    await state.set_state(AdminSettingsStates.waiting_setting_value)
    await state.update_data(setting_key=key)

    await safe_edit(callback.message, f"✏️ <b>{desc}</b>\n\nJoriy: <code>{current_val.get(key, '—')}</code>\n\nYangi qiymat kiriting (matn, rasm, video yoki fayl):", reply_markup=None)
    await callback.answer()


@admin_settings_router.message(AdminSettingsStates.waiting_setting_value)
async def admin_save_setting(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    key = data.get("setting_key")
    if not key:
        await state.clear()
        return

    desc = SETTINGS_KEYS.get(key, key)

    # Handle photo setting (QR codes, images, etc.)
    if message.content_type == ContentType.PHOTO:
        file_id = message.photo[-1].file_id
        await set_setting(key, file_id)
        await state.clear()
        await message.answer(f"✅ <b>{desc}</b> yangilandi!\nRasm file_id saqlandi.")
        await message.answer("⚙️ Sozlamalar", reply_markup=settings_kb())
        return

    # Handle video setting
    if message.content_type == ContentType.VIDEO:
        file_id = message.video.file_id
        await set_setting(key, file_id)
        await state.clear()
        await message.answer(f"✅ <b>{desc}</b> yangilandi!\nVideo file_id saqlandi.")
        await message.answer("⚙️ Sozlamalar", reply_markup=settings_kb())
        return

    # Handle document/file setting
    if message.content_type == ContentType.DOCUMENT:
        file_id = message.document.file_id
        await set_setting(key, file_id)
        await state.clear()
        await message.answer(f"✅ <b>{desc}</b> yangilandi!\nFayl file_id saqlandi.")
        await message.answer("⚙️ Sozlamalar", reply_markup=settings_kb())
        return

    # Handle text
    if message.text is not None:
        value = message.text.strip()
        await set_setting(key, value)
        await state.clear()
        await message.answer(f"✅ <b>{desc}</b> yangilandi!\nQiymat: <code>{value}</code>")
        await message.answer("⚙️ Sozlamalar", reply_markup=settings_kb())
        return

    # Handle other message types (sticker, voice, etc.)
    await message.answer("❌ Matn, rasm, video yoki fayl yuboring.")


@admin_settings_router.callback_query(F.data == "admin_settings_export")
async def admin_export_handler(callback: CallbackQuery) -> None:
    json_str = await export_settings()
    await callback.message.answer(
        f"📦 <b>Export — Sozlamalar JSON:</b>\n\n<code>{json_str}</code>\n\n"
        "Bu JSON ni nusxalab, yangi botga import qilish mumkin."
    )
    await callback.answer()


@admin_settings_router.callback_query(F.data == "admin_settings_import")
async def admin_import_start_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(AdminSettingsStates.waiting_import_json)
    await safe_edit(callback.message, "📥 <b>Import — Sozlamalar JSON</b>\n\nJSON ni yuboring (barcha sozlamalar o'zgartiriladi):")
    await callback.answer()


@admin_settings_router.message(AdminSettingsStates.waiting_import_json)
async def admin_import_handler(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, JSON matn sifatida yuboring.")
        return
    try:
        import json
        await import_settings(message.text)
        await state.clear()
        await message.answer("✅ <b>Sozlamalar import qilindi!</b>\nBarcha qiymatlar yangilandi.", reply_markup=settings_kb())
    except (json.JSONDecodeError, Exception) as e:
        await state.clear()
        await message.answer(f"❌ Xatolik: {e}")


@admin_settings_router.callback_query(F.data == "admin_settings_wizard")
async def admin_wizard_handler(callback: CallbackQuery, state: FSMContext) -> None:
    from bot.handlers.setup import start_wizard
    await start_wizard(callback.message, state)
    await callback.answer()
