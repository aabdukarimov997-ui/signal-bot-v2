"""
📢 MARKETING — Admin panel uchun marketing boshqaruvi.

Admin bu yerdan:
  • Marketing holatini ko'radi (yoqilgan/o'chirilgan, interval, matn)
  • Marketingni yoqadi/o'chiradi
  • Marketing matnini o'zgartiradi
  • Marketing intervalini o'zgartiradi
  • Sinov xabarini yuboradi
"""

from aiogram import Router, F, Bot
from aiogram.types import CallbackQuery, Message, ContentType
from aiogram.fsm.context import FSMContext

from bot.models.user import User
from bot.services.settings_service import get_setting, set_setting, get_admin_ids
from bot.utils.helpers import safe_edit
from bot.utils.keyboards import InlineKeyboardMarkup, InlineKeyboardButton, admin_back_kb
from aiogram.fsm.state import State, StatesGroup

admin_marketing_router = Router()


class MarketingStates(StatesGroup):
    waiting_message = State()
    waiting_interval = State()


def admin_marketing_kb(
    enabled: bool,
    interval: str,
    has_message: bool,
) -> InlineKeyboardMarkup:
    status = "✅ Yoqilgan" if enabled else "❌ O'chirilgan"
    buttons = [
        [InlineKeyboardButton(
            text=f"{'🟢' if enabled else '🔴'} {status}",
            callback_data="admin_mkt_toggle",
        )],
        [InlineKeyboardButton(
            text=f"⏱ Interval: {interval} soat",
            callback_data="admin_mkt_interval",
        )],
        [InlineKeyboardButton(
            text="📝 Xabarni o'zgartirish",
            callback_data="admin_mkt_edit_msg",
        )],
        [InlineKeyboardButton(
            text="👁 Xabarni ko'rish (preview)",
            callback_data="admin_mkt_preview",
        )],
        [InlineKeyboardButton(
            text="📤 Sinov xabarini yuborish",
            callback_data="admin_mkt_test",
        )],
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


@admin_marketing_router.callback_query(F.data == "admin_marketing")
async def admin_marketing_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    enabled_str = await get_setting("marketing_enabled") or "false"
    enabled = enabled_str == "true"
    interval = await get_setting("marketing_interval_hours") or "3"
    msg = await get_setting("marketing_message") or ""
    has_message = bool(msg)

    status = "✅ Yoqilgan" if enabled else "❌ O'chirilgan"
    msg_status = "✅ Bor" if has_message else "❌ Mavjud emas"
    text = (
        "📢 <b>Marketing boshqaruvi</b>\n\n"
        f"📊 <b>Holat:</b> {status}\n"
        f"⏱ <b>Interval:</b> {interval} soat\n"
        f"📝 <b>Xabar:</b> {msg_status}\n"
        f"👥 <b>Kimga:</b> Obuna olmagan foydalanuvchilar\n\n"
        "Pastdagi tugmalar orqali boshqaring:"
    )
    await safe_edit(
        callback.message,
        text,
        reply_markup=admin_marketing_kb(enabled, interval, has_message),
    )
    await callback.answer()


@admin_marketing_router.callback_query(F.data == "admin_mkt_toggle")
async def admin_mkt_toggle_handler(callback: CallbackQuery) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    enabled_str = await get_setting("marketing_enabled") or "false"
    new_val = "false" if enabled_str == "true" else "true"
    await set_setting("marketing_enabled", new_val)

    status = "✅ Yoqildi" if new_val == "true" else "❌ O'chirildi"
    await callback.answer(f"Marketing {status}", show_alert=True)

    # Refresh the view
    enabled = new_val == "true"
    interval = await get_setting("marketing_interval_hours") or "3"
    msg = await get_setting("marketing_message") or ""
    holat = "✅ Yoqilgan" if enabled else "❌ O\'chirilgan"
    msg_status = "✅ Bor" if msg else "❌ Mavjud emas"
    text = (
        "📢 <b>Marketing boshqaruvi</b>\n\n"
        f"📊 <b>Holat:</b> {holat}\n"
        f"⏱ <b>Interval:</b> {interval} soat\n"
        f"📝 <b>Xabar:</b> {msg_status}\n\n"
        "Pastdagi tugmalar orqali boshqaring:"
    )
    await safe_edit(
        callback.message,
        text,
        reply_markup=admin_marketing_kb(enabled, interval, bool(msg)),
    )


@admin_marketing_router.callback_query(F.data == "admin_mkt_edit_msg")
async def admin_mkt_edit_msg_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    current_msg = await get_setting("marketing_message") or ""
    preview = current_msg[:100] + "..." if len(current_msg) > 100 else current_msg

    await state.set_state(MarketingStates.waiting_message)
    await safe_edit(
        callback.message,
        f"📝 <b>Marketing xabar matnini kiriting</b>\n\n"
        f"Joriy xabar:\n<code>{preview}</code>\n\n"
        f"Yangi xabar matnini yuboring (HTML formatda).\n"
        f"<b>bold</b> <i>italic</i> <code>code</code>\n\n"
        f"💡 Bekor qilish: /cancel",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_marketing")],
        ]),
    )
    await callback.answer()


@admin_marketing_router.message(MarketingStates.waiting_message)
async def admin_mkt_msg_save(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, matn yuboring.")
        return

    text = message.text.strip()
    await set_setting("marketing_message", text)
    await state.clear()

    preview = text[:80] + "..." if len(text) > 80 else text
    await message.answer(
        f"✅ <b>Marketing xabari saqlandi!</b>\n\n{preview}",
        reply_markup=admin_back_kb("admin_marketing"),
    )


@admin_marketing_router.callback_query(F.data == "admin_mkt_interval")
async def admin_mkt_interval_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    current = await get_setting("marketing_interval_hours") or "3"
    await state.set_state(MarketingStates.waiting_interval)
    await safe_edit(
        callback.message,
        f"⏱ <b>Marketing intervalini kiriting (soatlarda)</b>\n\n"
        f"Joriy: <code>{current} soat</code>\n\n"
        f"Yangi intervalni kiriting:\n"
        f"Masalan: <code>1</code>, <code>3</code>, <code>6</code>, <code>12</code>, <code>24</code>\n\n"
        f"💡 Bot qayta ishga tushganda yangi interval kuchga kiradi.\n"
        f"Bekor qilish: /cancel",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_marketing")],
        ]),
    )
    await callback.answer()


@admin_marketing_router.message(MarketingStates.waiting_interval)
async def admin_mkt_interval_save(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, son kiriting.")
        return

    try:
        hours = int(message.text.strip())
        if hours < 1 or hours > 168:
            raise ValueError
    except ValueError:
        await message.answer("❌ Iltimos, 1 dan 168 gacha son kiriting.")
        return

    await set_setting("marketing_interval_hours", str(hours))
    await state.clear()
    await message.answer(
        f"✅ <b>Interval yangilandi!</b>\n\n"
        f"Marketing endi har <b>{hours} soatda</b> yuboriladi.\n"
        f"⚠️ Bot qayta ishga tushganda yangi interval kuchga kiradi."
    )
    # Show marketing menu
    enabled_str = await get_setting("marketing_enabled") or "false"
    enabled = enabled_str == "true"
    msg = await get_setting("marketing_message") or ""
    holat = "✅ Yoqilgan" if enabled else "❌ O\'chirilgan"
    msg_status = "✅ Bor" if msg else "❌ Mavjud emas"
    text = (
        "📢 <b>Marketing boshqaruvi</b>\n\n"
        f"📊 <b>Holat:</b> {holat}\n"
        f"⏱ <b>Interval:</b> {hours} soat\n"
        f"📝 <b>Xabar:</b> {msg_status}\n\n"
        "Pastdagi tugmalar orqali boshqaring:"
    )
    await message.answer(text, reply_markup=admin_marketing_kb(enabled, str(hours), bool(msg)))


@admin_marketing_router.callback_query(F.data == "admin_mkt_preview")
async def admin_mkt_preview_handler(callback: CallbackQuery, bot: Bot) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    msg = await get_setting("marketing_message") or ""
    img = await get_setting("marketing_image")

    if not msg:
        await callback.answer("❌ Marketing xabari yo'q. Avval matn kiriting.", show_alert=True)
        return

    from bot.services.subscription_service import get_all_tariffs
    from bot.utils.keyboards import tariff_selection_kb

    tariffs = await get_all_tariffs("signal")
    kb = tariff_selection_kb(tariffs) if tariffs else None

    try:
        if img:
            await bot.send_photo(chat_id=callback.from_user.id, photo=img, caption=msg, reply_markup=kb)
        else:
            await bot.send_message(chat_id=callback.from_user.id, text=msg, reply_markup=kb)
        await callback.answer("✅ Preview yuborildi")
    except Exception as e:
        await callback.answer(f"❌ Xatolik: {e}", show_alert=True)


@admin_marketing_router.callback_query(F.data == "admin_mkt_test")
async def admin_mkt_test_handler(callback: CallbackQuery, bot: Bot) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    msg = await get_setting("marketing_message") or ""
    img = await get_setting("marketing_image")

    if not msg:
        await callback.answer("❌ Marketing xabari yo'q. Avval matn kiriting.", show_alert=True)
        return

    from bot.services.subscription_service import get_all_tariffs
    from bot.utils.keyboards import tariff_selection_kb

    tariffs = await get_all_tariffs("signal")
    kb = tariff_selection_kb(tariffs) if tariffs else None

    try:
        if img:
            await bot.send_photo(chat_id=callback.from_user.id, photo=img, caption=msg, reply_markup=kb)
        else:
            await bot.send_message(chat_id=callback.from_user.id, text=msg, reply_markup=kb)
        await callback.answer("📤 Sinov xabari yuborildi!")
    except Exception as e:
        await callback.answer(f"❌ Xatolik: {e}", show_alert=True)
