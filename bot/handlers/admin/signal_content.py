import html

from aiogram import Router, F
from aiogram.types import CallbackQuery, Message, ContentType
from aiogram.fsm.context import FSMContext
from aiogram import Bot

from bot.services.settings_service import get_setting, set_setting, get_admin_ids
from bot.services.subscription_service import get_all_tariffs
from bot.utils.keyboards import admin_signal_content_kb, admin_menu_kb
from bot.utils.helpers import safe_edit
from bot.utils.texts import SIGNAL_TEXT
from bot.utils.states import AdminSignalContentStates

admin_signal_content_router = Router()


@admin_signal_content_router.callback_query(F.data == "admin_signal_content")
async def admin_signal_content_handler(callback: CallbackQuery, bot: Bot) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    signal_msg = await get_setting("signal_message") or SIGNAL_TEXT
    signal_img = await get_setting("signal_image")
    signal_vid = await get_setting("signal_video")

    status_lines = []
    if signal_msg and signal_msg != SIGNAL_TEXT:
        preview = html.escape(signal_msg[:80] + "..." if len(signal_msg) > 80 else signal_msg)
        status_lines.append(f"📝 Xabar: ✅ (custom)")
    else:
        status_lines.append(f"📝 Xabar: ⚪ (default)")

    # Show current signal tariff prices
    tariffs_list = await get_all_tariffs("signal")
    if tariffs_list:
        price_str = ", ".join([f"{t.label}: ${float(t.price):.0f}" for t in tariffs_list])
        status_lines.append(f"💰 Narxlar: ✅ ({price_str})")
    else:
        status_lines.append("💰 Narxlar: ⚪ (tariflar yo'q)")

    if signal_img:
        status_lines.append("🖼 Rasm: ✅")
    else:
        status_lines.append("🖼 Rasm: ⚪ (yo'q)")

    if signal_vid:
        status_lines.append("🎬 Video: ✅")
    else:
        status_lines.append("🎬 Video: ⚪ (yo'q)")

    text = "🚀 <b>VIP Signal obuna xabari</b>\n\n" + "\n".join(status_lines) + "\n\nQuyidagi tugmalar orqali xabar, rasm yoki videoni o'zgartiring:"
    await safe_edit(callback.message, text, reply_markup=admin_signal_content_kb())
    await callback.answer()


@admin_signal_content_router.callback_query(F.data == "admin_signal_msg")
async def admin_signal_msg_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    current_msg = await get_setting("signal_message") or SIGNAL_TEXT
    await state.set_state(AdminSignalContentStates.waiting_message)
    await safe_edit(
        callback.message,
        f"📝 <b>VIP Signal xabar matnini o'zgartirish</b>\n\n"
        f"Joriy xabar:\n<code>{current_msg[:200]}{'...' if len(current_msg) > 200 else ''}</code>\n\n"
        f"Yangi xabar matnini yuboring (HTML formatda):\n"
        f"• <b>bold</b> — <code>&lt;b&gt;text&lt;/b&gt;</code>\n"
        f"• <i>italic</i> — <code>&lt;i&gt;text&lt;/i&gt;</code>\n"
        f"• <code>code</code> — <code>&lt;code&gt;text&lt;/code&gt;</code>",
        reply_markup=None,
    )
    await callback.answer()


@admin_signal_content_router.message(AdminSignalContentStates.waiting_message)
async def admin_signal_msg_save(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, matn yuboring.")
        return
    value = message.text.strip()
    await set_setting("signal_message", value)
    await state.clear()
    await message.answer(
        f"✅ <b>VIP Signal xabari yangilandi!</b>\n\nYangi xabar:\n{value[:100]}{'...' if len(value) > 100 else ''}",
        reply_markup=admin_signal_content_kb(),
    )


@admin_signal_content_router.callback_query(F.data == "admin_signal_price")
async def admin_signal_price_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    tariffs = await get_all_tariffs("signal")
    if not tariffs:
        await callback.answer("❌ Signal tariflar yo'q", show_alert=True)
        return

    price_list = "\n".join([f"• {t.label} — ${float(t.price):.0f} (id: {t.id})" for t in tariffs])
    await state.set_state(AdminSignalContentStates.waiting_price)
    await safe_edit(
        callback.message,
        f"💰 <b>Signal narxlarini o'zgartirish</b>\n\n"
        f"Joriy narxlar:\n{price_list}\n\n"
        f"Tarif ID va yangi narx kiriting:\n"
        f"Format: <code>tarif_id narx</code>\n"
        f"Masalan: <code>abc123 30</code>\n\n"
        f"⚠️ Har bir tarif ID uning narxini yangilaydi.",
        reply_markup=None,
    )
    await callback.answer()


@admin_signal_content_router.message(AdminSignalContentStates.waiting_price)
async def admin_signal_price_save(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, matn yuboring.")
        return
    text = message.text.strip()
    try:
        parts = text.split()
        if len(parts) != 2:
            raise ValueError("2 ta qiymat kerak")
        tariff_id = parts[0]
        price = float(parts[1])
        if price <= 0:
            raise ValueError("narx > 0 bo'lishi kerak")
    except (ValueError, IndexError):
        await message.answer("❌ Format noto'g'ri. Masalan: <code>tarif_id narx</code>")
        return

    from bot.database.session import get_session
    from sqlalchemy import select
    from bot.models.tariff import SignalTariff

    async with get_session() as session:
        result = await session.execute(select(SignalTariff).where(SignalTariff.id == tariff_id))
        tariff = result.scalar_one_or_none()
        if not tariff:
            await message.answer(f"❌ Tarif ID '{tariff_id}' topilmadi.\n\nJoriy tarif ID'larni ko'rish uchun «💰 Narx o'zgartirish» tugmasini qayta bosing.")
            return
        tariff.price = price

    await state.clear()
    await message.answer(
        f"✅ <b>Signal narxi yangilandi!</b>\n\n💰 {tariff.label}: ${price:.0f}",
        reply_markup=admin_signal_content_kb(),
    )


@admin_signal_content_router.callback_query(F.data == "admin_signal_img")
async def admin_signal_img_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    await state.set_state(AdminSignalContentStates.waiting_image)
    await safe_edit(
        callback.message,
        "🖼 <b>VIP Signal rasmini o'zgartirish</b>\n\nRasmni yuboring — bot uni signal obuna xabariga biriktiradi.\n\n⚠️ Rasm botga to'g'ridan-to'g'ri yuborilishi kerak (file_id boshqa botdan olingan bo'lishi mumkin emas).",
        reply_markup=None,
    )
    await callback.answer()


@admin_signal_content_router.message(AdminSignalContentStates.waiting_image, F.photo)
async def admin_signal_img_save(message: Message, state: FSMContext) -> None:
    file_id = message.photo[-1].file_id
    await set_setting("signal_image", file_id)
    await state.clear()
    await message.answer("✅ <b>VIP Signal rasmi yangilandi!</b>", reply_markup=admin_signal_content_kb())


@admin_signal_content_router.message(AdminSignalContentStates.waiting_image)
async def admin_signal_img_invalid(message: Message) -> None:
    await message.answer("❌ Iltimos, rasm yuboring.")


@admin_signal_content_router.callback_query(F.data == "admin_signal_vid")
async def admin_signal_vid_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    await state.set_state(AdminSignalContentStates.waiting_video)
    await safe_edit(
        callback.message,
        "🎬 <b>VIP Signal videoni o'zgartirish</b>\n\nVideo yuboring — bot uni signal obuna xabariga biriktiradi.\n\n⚠️ Video botga to'g'ridan-to'g'ri yuborilishi kerak.",
        reply_markup=None,
    )
    await callback.answer()


@admin_signal_content_router.message(AdminSignalContentStates.waiting_video, F.content_type == ContentType.VIDEO)
async def admin_signal_vid_save(message: Message, state: FSMContext) -> None:
    file_id = message.video.file_id
    await set_setting("signal_video", file_id)
    await state.clear()
    await message.answer("✅ <b>VIP Signal video yangilandi!</b>", reply_markup=admin_signal_content_kb())


@admin_signal_content_router.message(AdminSignalContentStates.waiting_video)
async def admin_signal_vid_invalid(message: Message) -> None:
    await message.answer("❌ Iltimos, video yuboring.")


@admin_signal_content_router.callback_query(F.data == "admin_signal_media_del")
async def admin_signal_media_del_handler(callback: CallbackQuery) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    await set_setting("signal_image", "")
    await set_setting("signal_video", "")
    await safe_edit(callback.message, "✅ <b>Rasm va video o'chirildi!</b>\n\nEndi signal obuna xabari faqat matn ko'rinishida chiqadi.", reply_markup=admin_signal_content_kb())
    await callback.answer()


@admin_signal_content_router.callback_query(F.data == "admin_signal_preview")
async def admin_signal_preview_handler(callback: CallbackQuery, bot: Bot) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    signal_msg = await get_setting("signal_message") or SIGNAL_TEXT
    signal_img = await get_setting("signal_image")
    signal_vid = await get_setting("signal_video")

    kb = admin_signal_content_kb()

    if signal_vid:
        try:
            await bot.send_video(chat_id=callback.from_user.id, video=signal_vid, caption=signal_msg, reply_markup=kb)
            await callback.answer("✅ Preview yuborildi")
            return
        except Exception:
            pass

    if signal_img:
        try:
            await bot.send_photo(chat_id=callback.from_user.id, photo=signal_img, caption=signal_msg, reply_markup=kb)
            await callback.answer("✅ Preview yuborildi")
            return
        except Exception:
            pass

    await bot.send_message(chat_id=callback.from_user.id, text=signal_msg, reply_markup=kb)
    await callback.answer("✅ Preview yuborildi")
