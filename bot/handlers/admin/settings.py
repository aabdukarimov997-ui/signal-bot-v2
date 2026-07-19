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


def settings_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📝 Sozlamalarni tahrirlash", callback_data="admin_settings_edit")],
        [InlineKeyboardButton(text="📦 Export (JSON)", callback_data="admin_settings_export")],
        [InlineKeyboardButton(text="📥 Import (JSON)", callback_data="admin_settings_import")],
        [InlineKeyboardButton(text="🔄 Setup Wizard", callback_data="admin_settings_wizard")],
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
    ])


def settings_edit_kb() -> InlineKeyboardMarkup:
    # Keys that are managed via dedicated UI (not plain text input)
    skip_keys = {"setup_completed", "payment_visa_enabled", "payment_card_enabled",
                 "payment_tron_enabled", "payment_bnb_enabled", "payment_ton_enabled",
                 "payment_stars_enabled"}
    buttons = []
    for key, desc in SETTINGS_KEYS.items():
        if key in skip_keys:
            continue
        buttons.append([InlineKeyboardButton(text=f"✏️ {desc}", callback_data=f"admin_set_{key}")])
    buttons.append([InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_settings")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


@admin_settings_router.callback_query(F.data == "admin_settings")
async def admin_settings_handler(callback: CallbackQuery) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    all_settings = await get_all_settings()
    text = "⚙️ <b>Sozlamalar</b>\n\n"
    for key, desc in SETTINGS_KEYS.items():
        val = all_settings.get(key, "—")
        if len(val) > 40:
            val = val[:40] + "..."
        text += f"<b>{desc}</b>: {val}\n"

    await safe_edit(callback.message, text, reply_markup=settings_kb())
    await callback.answer()


@admin_settings_router.callback_query(F.data == "admin_settings_edit")
async def admin_settings_edit_handler(callback: CallbackQuery) -> None:
    await safe_edit(callback.message, "✏️ <b>Sozlamalarni tahrirlash</b>\n\nO'zgartirish uchun tugmani bosing:", reply_markup=settings_edit_kb())
    await callback.answer()


@admin_settings_router.callback_query(F.data.startswith("admin_set_"))
async def admin_set_key_handler(callback: CallbackQuery, state: FSMContext) -> None:
    key = callback.data.replace("admin_set_", "")
    current_val = await get_all_settings()
    desc = SETTINGS_KEYS.get(key, key)

    await state.set_state(AdminSettingsStates.waiting_setting_value)
    await state.update_data(setting_key=key)

    await safe_edit(callback.message, f"✏️ <b>{desc}</b>\n\nJoriy: <code>{current_val.get(key, '—')}</code>\n\nYangi qiymat kiriting:", reply_markup=None)
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

    # Handle video setting (welcome_video, course_image, etc.)
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

    value = message.text.strip()
    await set_setting(key, value)
    await state.clear()

    await message.answer(f"✅ <b>{desc}</b> yangilandi!\nQiymat: <code>{value}</code>")
    await message.answer("⚙️ Sozlamalar", reply_markup=settings_kb())


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
    try:
        await import_settings(message.text)
        await state.clear()
        await message.answer("✅ <b>Sozlamalar import qilindi!</b>\nBarcha qiymatlar yangilandi.")
    except Exception:
        await state.clear()
        await message.answer("❌ JSON format noto'g'ri. Qayta urinib ko'ring.")


@admin_settings_router.callback_query(F.data == "admin_settings_wizard")
async def admin_wizard_handler(callback: CallbackQuery) -> None:
    from bot.handlers.setup import start_wizard
    await start_wizard(callback.message, callback.from_user.id)
    await callback.answer()
