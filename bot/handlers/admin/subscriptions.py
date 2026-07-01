from aiogram import Router, F, Bot
from aiogram.types import CallbackQuery, Message
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from bot.models.user import User
from bot.services.settings_service import get_admin_ids
from bot.services.user_service import get_user_by_telegram_id, get_or_create_user
from bot.services.subscription_service import get_active_subscription, admin_create_subscription, get_all_subscriptions
from bot.services.channel_service import create_invite_link
from bot.services.settings_service import get_setting
from bot.config import settings
from bot.utils.helpers import safe_edit, format_date
from bot.utils.keyboards import admin_subs_menu_kb, admin_subs_list_kb, admin_sub_confirm_kb, admin_subs_back_kb

admin_subs_router = Router()


class AdminSubStates(StatesGroup):
    add_signal_telegram_id = State()
    add_signal_duration = State()
    add_signal_price = State()
    add_course_telegram_id = State()
    add_course_duration = State()
    add_course_price = State()


@admin_subs_router.callback_query(F.data == "admin_subs")
async def admin_subs_menu(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    text = (
        "📋 <b>Obunalar boshqaruvi</b>\n\n"
        "Quyidagi amallarni tanlang:"
    )
    await safe_edit(callback.message, text, reply_markup=admin_subs_menu_kb())
    await callback.answer()


# ─── Signal obuna qo'shish ────────────────────────────────────────────

@admin_subs_router.callback_query(F.data == "admin_add_signal_sub")
async def admin_add_signal_start(callback: CallbackQuery, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    await state.set_state(AdminSubStates.add_signal_telegram_id)
    text = (
        "➕ <b>Signal obuna qo'shish</b>\n\n"
        "Foydalanuvchining Telegram ID raqamini yuboring:\n"
        "(Masalan: 651248882)"
    )
    await safe_edit(callback.message, text, reply_markup=admin_subs_back_kb())
    await callback.answer()


@admin_subs_router.message(AdminSubStates.add_signal_telegram_id)
async def admin_add_signal_telegram_id(message: Message, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        return
    try:
        target_id = int(message.text.strip())
    except ValueError:
        await message.answer("❌ Faqat raqam yuboring. Telegram ID raqam bo'lishi kerak.")
        return

    target_user = await get_user_by_telegram_id(target_id)
    if target_user:
        existing = await get_active_subscription(target_user.id)
        if existing:
            await message.answer(
                f"⚠️ Bu foydalanuvchi allaqachon faol obunaga ega!\n"
                f"Tugash sanasi: {format_date(existing.end_date)}\n\n"
                f"Yangi obuna qo'shishni davom ettirish uchun kunlar sonini yuboring."
            )
        else:
            await message.answer(f"✅ Foydalanuvchi bazada topildi: {target_user.full_name}")
    else:
        await message.answer(
            f"ℹ️ Telegram ID {target_id} bazada yo'q.\n"
            f"Obuna qo'shilganda avtomatik yaratiladi.\n\n"
            f"Obuna davomiyligi (kunlar soni)ni yuboring:"
        )

    await state.update_data(target_telegram_id=target_id, product_type="signal")
    await state.set_state(AdminSubStates.add_signal_duration)


@admin_subs_router.message(AdminSubStates.add_signal_duration)
async def admin_add_signal_duration(message: Message, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        return
    try:
        duration_days = int(message.text.strip())
        if duration_days <= 0:
            raise ValueError
    except ValueError:
        await message.answer("❌ Musbat kunlar sonini yuboring. (Masalan: 30)")
        return

    await state.update_data(duration_days=duration_days)
    await state.set_state(AdminSubStates.add_signal_price)
    await message.answer("💰 Obuna narxini yuboring ($):\n(Masalan: 25)")


@admin_subs_router.message(AdminSubStates.add_signal_price)
async def admin_add_signal_price(message: Message, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        return
    try:
        price = float(message.text.strip())
        if price < 0:
            raise ValueError
    except ValueError:
        await message.answer("❌ Narx raqam bo'lishi kerak. (Masalan: 25)")
        return

    data = await state.get_data()
    target_id = data.get("target_telegram_id")
    duration_days = data.get("duration_days")
    product_type = data.get("product_type", "signal")

    target_user = await get_user_by_telegram_id(target_id)
    user_info = f"{target_user.full_name} (@{target_user.username})" if target_user else f"ID: {target_id} (yangi foydalanuvchi)"

    text = (
        f"✅ <b>Obuna tasdiqlash</b>\n\n"
        f"👤 Foydalanuvchi: {user_info}\n"
        f"📅 Davomiylik: {duration_days} kun\n"
        f"💰 Narx: ${price:.0f}\n"
        f"📊 Turi: Signal kanal\n\n"
        f"Tasdiqlaysiz?"
    )
    await state.update_data(price=price)
    await message.answer(text, reply_markup=admin_sub_confirm_kb("signal"))


# ─── Kurs obuna qo'shish ──────────────────────────────────────────────

@admin_subs_router.callback_query(F.data == "admin_add_course_sub")
async def admin_add_course_start(callback: CallbackQuery, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    await state.set_state(AdminSubStates.add_course_telegram_id)
    text = (
        "📚 <b>Kurs obuna qo'shish</b>\n\n"
        "Foydalanuvchining Telegram ID raqamini yuboring:\n"
        "(Masalan: 651248882)"
    )
    await safe_edit(callback.message, text, reply_markup=admin_subs_back_kb())
    await callback.answer()


@admin_subs_router.message(AdminSubStates.add_course_telegram_id)
async def admin_add_course_telegram_id(message: Message, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        return
    try:
        target_id = int(message.text.strip())
    except ValueError:
        await message.answer("❌ Faqat raqam yuboring. Telegram ID raqam bo'lishi kerak.")
        return

    target_user = await get_user_by_telegram_id(target_id)
    if target_user:
        await message.answer(f"✅ Foydalanuvchi bazada topildi: {target_user.full_name}")
    else:
        await message.answer(f"ℹ️ Telegram ID {target_id} bazada yo'q. Avtomatik yaratiladi.")

    await state.update_data(target_telegram_id=target_id, product_type="course")
    await state.set_state(AdminSubStates.add_course_duration)


@admin_subs_router.message(AdminSubStates.add_course_duration)
async def admin_add_course_duration(message: Message, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        return
    try:
        duration_days = int(message.text.strip())
        if duration_days <= 0:
            raise ValueError
    except ValueError:
        await message.answer("❌ Musbat kunlar sonini yuboring. (Masalan: 30)")
        return

    await state.update_data(duration_days=duration_days)
    await state.set_state(AdminSubStates.add_course_price)
    await message.answer("💰 Kurs narxini yuboring ($):\n(Masalan: 25)")


@admin_subs_router.message(AdminSubStates.add_course_price)
async def admin_add_course_price(message: Message, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        return
    try:
        price = float(message.text.strip())
        if price < 0:
            raise ValueError
    except ValueError:
        await message.answer("❌ Narx raqam bo'lishi kerak. (Masalan: 25)")
        return

    data = await state.get_data()
    target_id = data.get("target_telegram_id")
    duration_days = data.get("duration_days")
    product_type = data.get("product_type", "course")

    target_user = await get_user_by_telegram_id(target_id)
    user_info = f"{target_user.full_name} (@{target_user.username})" if target_user else f"ID: {target_id} (yangi foydalanuvchi)"

    text = (
        f"✅ <b>Kurs obuna tasdiqlash</b>\n\n"
        f"👤 Foydalanuvchi: {user_info}\n"
        f"📅 Davomiylik: {duration_days} kun\n"
        f"💰 Narx: ${price:.0f}\n"
        f"📊 Turi: Kurs\n\n"
        f"Tasdiqlaysiz?"
    )
    await state.update_data(price=price)
    await message.answer(text, reply_markup=admin_sub_confirm_kb("course"))


# ─── Tasdiqlash ───────────────────────────────────────────────────────

@admin_subs_router.callback_query(F.data == "admin_confirm_sub_signal")
async def admin_confirm_signal_sub(callback: CallbackQuery, user: User, state: FSMContext, bot: Bot) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    data = await state.get_data()
    target_id = data.get("target_telegram_id")
    duration_days = data.get("duration_days")
    price = data.get("price")

    target_user = await get_user_by_telegram_id(target_id)
    if not target_user:
        target_user = await get_or_create_user(target_id, f"User {target_id}")

    channel_id = await get_setting("private_channel_id") or settings.PRIVATE_CHANNEL_ID
    invite_link = await create_invite_link(bot, channel_id) if channel_id else None

    sub = await admin_create_subscription(
        user_id=target_user.id,
        duration_days=duration_days,
        price=price,
        product_type="signal",
        invite_link=invite_link,
    )

    link_text = f"\n🔗 Kanalga kirish: {invite_link}" if invite_link else ""
    await safe_edit(callback.message,
        f"✅ <b>Signal obuna qo'shildi!</b>\n\n"
        f"👤 {target_user.full_name} (ID: {target_id})\n"
        f"📅 {duration_days} kun\n"
        f"💰 ${price:.0f}\n"
        f"📆 Tugash: {format_date(sub.end_date)}"
        f"{link_text}"
    )
    await state.clear()
    await callback.answer("✅ Obuna qo'shildi!")


@admin_subs_router.callback_query(F.data == "admin_confirm_sub_course")
async def admin_confirm_course_sub(callback: CallbackQuery, user: User, state: FSMContext, bot: Bot) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    data = await state.get_data()
    target_id = data.get("target_telegram_id")
    duration_days = data.get("duration_days")
    price = data.get("price")

    target_user = await get_user_by_telegram_id(target_id)
    if not target_user:
        target_user = await get_or_create_user(target_id, f"User {target_id}")

    sub = await admin_create_subscription(
        user_id=target_user.id,
        duration_days=duration_days,
        price=price,
        product_type="course",
        invite_link=None,
    )

    await safe_edit(callback.message,
        f"✅ <b>Kurs obuna qo'shildi!</b>\n\n"
        f"👤 {target_user.full_name} (ID: {target_id})\n"
        f"📅 {duration_days} kun\n"
        f"💰 ${price:.0f}\n"
        f"📆 Tugash: {format_date(sub.end_date)}"
    )
    await state.clear()
    await callback.answer("✅ Kurs obuna qo'shildi!")


@admin_subs_router.callback_query(F.data == "admin_cancel_sub")
async def admin_cancel_sub(callback: CallbackQuery, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    await state.clear()
    text = "📋 <b>Obunalar boshqaruvi</b>\n\nQuyidagi amallarni tanlang:"
    await safe_edit(callback.message, text, reply_markup=admin_subs_menu_kb())
    await callback.answer("❌ Bekor qilindi")


# ─── Obunalar ro'yxati ────────────────────────────────────────────────

@admin_subs_router.callback_query(F.data == "admin_list_active_subs")
async def admin_list_active_subs(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    subs = await get_all_subscriptions(status="active")
    if not subs:
        await safe_edit(callback.message, "📭 Faol obunalar yo'q.", reply_markup=admin_subs_back_kb())
        await callback.answer()
        return
    text = "✅ <b>Faol obunalar:</b>\n\n"
    for s in subs[:20]:
        user_obj = await get_user_by_telegram_id(s.telegram_id) if hasattr(s, 'telegram_id') else None
        text += f"• {s.user_full_name or '?'} (ID: {s.telegram_id or '?'}) — {s.duration_days} kun → {format_date(s.end_date)}\n"
    await safe_edit(callback.message, text, reply_markup=admin_subs_back_kb())
    await callback.answer()


@admin_subs_router.callback_query(F.data == "admin_list_expired_subs")
async def admin_list_expired_subs(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    subs = await get_all_subscriptions(status="expired")
    if not subs:
        await safe_edit(callback.message, "📭 Tugagan obunalar yo'q.", reply_markup=admin_subs_back_kb())
        await callback.answer()
        return
    text = "⏰ <b>Tugagan obunalar:</b>\n\n"
    for s in subs[:20]:
        text += f"• {s.user_full_name or '?'} (ID: {s.telegram_id or '?'}) — {format_date(s.end_date)}\n"
    await safe_edit(callback.message, text, reply_markup=admin_subs_back_kb())
    await callback.answer()
