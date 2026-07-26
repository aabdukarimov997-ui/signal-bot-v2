import html

from aiogram import Router, F
from aiogram.types import CallbackQuery, Message, ContentType, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext
from aiogram import Bot

from bot.services.settings_service import get_setting, set_setting, get_admin_ids
from bot.services.subscription_service import get_all_tariffs
from bot.utils.keyboards import admin_course_content_kb, admin_menu_kb
import html

from aiogram.exceptions import TelegramBadRequest

from bot.utils.helpers import safe_edit
from bot.utils.states import AdminCourseContentStates, AdminCourseComboStates

admin_course_content_router = Router()


@admin_course_content_router.callback_query(F.data == "admin_course_content")
async def admin_course_content_handler(callback: CallbackQuery, bot: Bot) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    course_msg = await get_setting("course_message")
    course_name = await get_setting("course_tariff_name") or "Darslar"
    course_desc = await get_setting("course_description") or ""
    course_img = await get_setting("course_image")
    course_vid = await get_setting("course_video")

    status_lines = []

    if course_msg:
        preview = html.escape(course_msg[:60] + "..." if len(course_msg) > 60 else course_msg)
        status_lines.append(f"📝 Custom xabar: ✅ ({preview})")
    else:
        status_lines.append(f"📝 Custom xabar: ⚪ (auto-generatsiya)")

    status_lines.append(f"📝 Nomi: {html.escape(course_name)}")

    # Show current course tariff price
    tariffs_list = await get_all_tariffs("course")
    if tariffs_list:
        price_str = ", ".join([f"${float(t.price):.0f}" for t in tariffs_list])
        status_lines.append(f"💰 Narx: ✅ ({price_str})")
    else:
        status_lines.append("💰 Narx: ⚪ (tariflar yo'q)")

    if course_desc:
        preview = html.escape(course_desc[:60] + "..." if len(course_desc) > 60 else course_desc)
        status_lines.append(f"📝 Tavsif: ✅ ({preview})")
    else:
        status_lines.append("📝 Tavsif: ⚪ (yo'q)")

    if course_img:
        status_lines.append("🖼 Rasm: ✅")
    else:
        status_lines.append("🖼 Rasm: ⚪ (yo'q)")

    if course_vid:
        status_lines.append("🎬 Video: ✅")
    else:
        status_lines.append("🎬 Video: ⚪ (yo'q)")

    text = "📚 <b>Darslar obuna xabari</b>\n\n" + "\n".join(status_lines) + "\n\nQuyidagi tugmalar orqali o'zgartiring:"
    await safe_edit(callback.message, text, reply_markup=admin_course_content_kb())
    await callback.answer()


# (eski individual handlerlar olib tashlandi — ✏️ Xabar+Rasm+Video combo ishlatiladi)


@admin_course_content_router.callback_query(F.data == "admin_course_desc")
async def admin_course_desc_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    course_name = await get_setting("course_tariff_name") or "Darslar"
    course_desc = await get_setting("course_description") or ""

    await state.set_state(AdminCourseContentStates.waiting_name)
    await safe_edit(
        callback.message,
        f"📝 <b>1-qadam: Darslar nomi</b>\n\n"
        f"Joriy: <code>{course_name}</code>\n\n"
        f"Yangi nom kiriting:",
        reply_markup=None,
    )
    await callback.answer()


@admin_course_content_router.callback_query(F.data == "admin_course_price")
async def admin_course_price_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    # Fetch current course tariff price from DB
    tariffs = await get_all_tariffs("course")
    current_price = "$500"
    if tariffs:
        current_price = f"${float(tariffs[0].price):.0f}"

    await state.set_state(AdminCourseContentStates.waiting_price)
    await safe_edit(
        callback.message,
        f"💰 <b>Darslar narxini o'zgartirish</b>\n\n"
        f"Joriy narx: <code>{current_price}</code>\n\n"
        f"Yangi narx kiriting ($):\nMasalan: 25, 50, 100",
        reply_markup=None,
    )
    await callback.answer()


@admin_course_content_router.message(AdminCourseContentStates.waiting_price)
async def admin_course_price_save(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, narxni matn sifatida yuboring.")
        return
    try:
        price = float(message.text.strip())
        if price <= 0:
            raise ValueError
    except ValueError:
        await message.answer("❌ Iltimos, to'g'ri narx kiriting (Masalan: 25)")
        return

    # Update course tariff price in DB
    from bot.database.session import get_session
    from sqlalchemy import select
    from bot.models.tariff import SignalTariff

    async with get_session() as session:
        result = await session.execute(
            select(SignalTariff).where(SignalTariff.product_type == "course")
        )
        tariffs = result.scalars().all()
        for t in tariffs:
            t.price = price

    await state.clear()
    await message.answer(
        f"✅ <b>Darslar narxi yangilandi!</b>\n\n💰 Yangi narx: ${price:.0f}",
        reply_markup=admin_course_content_kb(),
    )


@admin_course_content_router.message(AdminCourseContentStates.waiting_name)
async def admin_course_name_save(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, matn yuboring.")
        return
    value = message.text.strip()
    await set_setting("course_tariff_name", value)
    await state.set_state(AdminCourseContentStates.waiting_description)

    current_desc = await get_setting("course_description") or ""
    await message.answer(
        f"✅ <b>Nomi yangilandi:</b> {value}\n\n"
        f"📝 <b>2-qadam: Tavsif</b>\n\n"
        f"Joriy tavsif:\n<code>{current_desc[:100]}{'...' if len(current_desc) > 100 else ''}</code>\n\n"
        f"Yangi tavsif kiriting (agar o'zgartirmasangiz 'skip' yozing):"
    )


@admin_course_content_router.message(AdminCourseContentStates.waiting_description)
async def admin_course_desc_save(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, matn yuboring.")
        return
    value = message.text.strip()
    if value.lower() != "skip":
        await set_setting("course_description", value)
        await message.answer(
            f"✅ <b>Tavsif yangilandi!</b>\n\n{value[:60]}{'...' if len(value) > 60 else ''}",
            reply_markup=admin_course_content_kb(),
        )
    else:
        await message.answer("✅ Tavsif o'zgartirilmadi.", reply_markup=admin_course_content_kb())
    await state.clear()


# (eski individual rasm/video handlerlar olib tashlandi — combo ishlatiladi)


# ─── ✏️ Xabar + Rasm + Video COMBO ──────────────────────────────────

@admin_course_content_router.callback_query(F.data == "admin_course_combo")
async def admin_course_combo_start(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    await state.set_state(AdminCourseComboStates.waiting_text)
    await state.update_data(image_file_id=None, video_file_id=None)
    await safe_edit(
        callback.message,
        "✏️ <b>1/3: Xabar matnini yozing</b>\n\n"
        "Darslar uchun xabar matnini yuboring (HTML formatda).\n\n"
        "Keyin rasm va video ham qo'shishingiz mumkin.\n\n"
        "❌ Bekor qilish: /cancel",
        reply_markup=None,
    )
    await callback.answer()


@admin_course_content_router.message(AdminCourseComboStates.waiting_text)
async def admin_course_combo_text(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, matn yuboring.")
        return

    await state.update_data(text=message.text.strip())
    await state.set_state(AdminCourseComboStates.waiting_image)
    await message.answer(
        "✏️ <b>2/3: Rasm (ixtiyoriy)</b>\n\n"
        "Agar rasm qo'shmoqchi bo'lsangiz, yuboring.\n"
        "Rasm kerak bo'lmasa → <b>skip</b> yozing.",
        reply_markup=None,
    )


@admin_course_content_router.message(AdminCourseComboStates.waiting_image, F.content_type == ContentType.PHOTO)
async def admin_course_combo_image(message: Message, state: FSMContext) -> None:
    await state.update_data(image_file_id=message.photo[-1].file_id)
    await _ask_combo_video(message, state)


@admin_course_content_router.message(AdminCourseComboStates.waiting_image)
async def admin_course_combo_image_skip(message: Message, state: FSMContext) -> None:
    if message.text and message.text.strip().lower() == "skip":
        await _ask_combo_video(message, state)
    else:
        await message.answer("❌ Rasm yuboring yoki 'skip' yozing.")


async def _ask_combo_video(target: Message, state: FSMContext) -> None:
    await state.set_state(AdminCourseComboStates.waiting_video)
    await target.answer(
        "✏️ <b>3/3: Video (ixtiyoriy)</b>\n\n"
        "Agar video qo'shmoqchi bo'lsangiz, yuboring.\n"
        "Video kerak bo'lmasa → <b>skip</b> yozing.",
        reply_markup=None,
    )


@admin_course_content_router.message(AdminCourseComboStates.waiting_video, F.content_type == ContentType.VIDEO)
async def admin_course_combo_video(message: Message, state: FSMContext, bot: Bot) -> None:
    await state.update_data(video_file_id=message.video.file_id)
    await _show_combo_preview(message, state, bot)


@admin_course_content_router.message(AdminCourseComboStates.waiting_video)
async def admin_course_combo_video_skip(message: Message, state: FSMContext, bot: Bot) -> None:
    if message.text and message.text.strip().lower() == "skip":
        await _show_combo_preview(message, state, bot)
    else:
        await message.answer("❌ Video yuboring yoki 'skip' yozing.")


async def _show_combo_preview(target: Message, state: FSMContext, bot: Bot) -> None:
    """Preview + tasdiqlash."""
    data = await state.get_data()
    text = data.get("text", "")
    image_file_id = data.get("image_file_id")
    video_file_id = data.get("video_file_id")

    # Saqlashdan oldin preview ko'rsat
    if image_file_id:
        try:
            await bot.send_photo(chat_id=target.chat.id, photo=image_file_id, caption=text[:200])
        except Exception:
            pass
    if video_file_id:
        try:
            await bot.send_video(chat_id=target.chat.id, video=video_file_id)
        except Exception:
            pass

    status = f"✅ <b>Xabar</b>: {text[:50]}...\n"
    status += f"{'✅' if image_file_id else '❌'} <b>Rasm</b>\n"
    status += f"{'✅' if video_file_id else '❌'} <b>Video</b>\n"

    await state.set_state(AdminCourseComboStates.confirm)
    await target.answer(
        f"👁 <b>Preview</b>\n\n{status}\n"
        f"Hammasi to'g'rimi?\n\n"
        f"✅ <b>Saqlash</b> — xabar, rasm va videoni saqlaydi\n"
        f"🔄 <b>Qayta</b> — boshidan yozish\n"
        f"❌ <b>Bekor</b> — bekor qilish",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="✅ Saqlash", callback_data="combo_save")],
            [InlineKeyboardButton(text="🔄 Qayta", callback_data="combo_redo")],
            [InlineKeyboardButton(text="❌ Bekor qilish", callback_data="combo_cancel")],
        ]),
    )


@admin_course_content_router.callback_query(F.data == "combo_save", AdminCourseComboStates.confirm)
async def admin_course_combo_save(callback: CallbackQuery, state: FSMContext) -> None:
    data = await state.get_data()
    text = data.get("text", "")
    image_file_id = data.get("image_file_id")
    video_file_id = data.get("video_file_id")

    await set_setting("course_message", text)
    await set_setting("course_image", image_file_id or "")
    await set_setting("course_video", video_file_id or "")

    await state.clear()
    await safe_edit(
        callback.message,
        "✅ <b>Darslar xabari to'liq saqlandi!</b>\n\n"
        f"📝 Xabar: ✅\n"
        f"{'🖼 Rasm: ✅' if image_file_id else '🖼 Rasm: ⚪'}\n"
        f"{'🎬 Video: ✅' if video_file_id else '🎬 Video: ⚪'}",
        reply_markup=admin_course_content_kb(),
    )
    await callback.answer()


@admin_course_content_router.callback_query(F.data == "combo_redo", AdminCourseComboStates.confirm)
async def admin_course_combo_redo(callback: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(AdminCourseComboStates.waiting_text)
    await state.update_data(image_file_id=None, video_file_id=None)
    await safe_edit(
        callback.message,
        "✏️ <b>1/3: Xabar matnini yozing</b>\n\n"
        "Yangi xabar matnini yuboring (HTML formatda).",
        reply_markup=None,
    )
    await callback.answer()


@admin_course_content_router.callback_query(F.data == "combo_cancel")
async def admin_course_combo_cancel(callback: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    await safe_edit(callback.message, "❌ Bekor qilindi.", reply_markup=admin_course_content_kb())
    await callback.answer()


@admin_course_content_router.message(F.text == "/cancel", AdminCourseComboStates.waiting_text)
@admin_course_content_router.message(F.text == "/cancel", AdminCourseComboStates.waiting_image)
@admin_course_content_router.message(F.text == "/cancel", AdminCourseComboStates.waiting_video)
@admin_course_content_router.message(F.text == "/cancel", AdminCourseComboStates.confirm)
async def admin_course_combo_cancel_text(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer("❌ Bekor qilindi.", reply_markup=admin_course_content_kb())


# ─── Admin course media preview ─────────────────────────────────────

@admin_course_content_router.callback_query(F.data == "admin_course_preview")
async def admin_course_preview_handler(callback: CallbackQuery, bot: Bot) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    from bot.handlers.course import _build_course_text, send_course_menu
    course_msg = await get_setting("course_message")
    if course_msg:
        text = course_msg
    else:
        course_name = await get_setting("course_tariff_name") or "Darslar"
        course_description = await get_setting("course_description") or ""
        tariffs = await get_all_tariffs("course")
        if not tariffs:
            await callback.answer("❌ Tariflar yo'q", show_alert=True)
            return
        text = _build_course_text(course_name, course_description, tariffs)

    course_img = await get_setting("course_image")
    course_vid = await get_setting("course_video")
    kb = admin_course_content_kb()

    if course_vid:
        try:
            await bot.send_video(chat_id=callback.from_user.id, video=course_vid, caption=text, reply_markup=kb)
            await callback.answer("✅ Preview yuborildi")
            return
        except Exception:
            pass

    if course_img:
        try:
            await bot.send_photo(chat_id=callback.from_user.id, photo=course_img, caption=text, reply_markup=kb)
            await callback.answer("✅ Preview yuborildi")
            return
        except Exception:
            pass

    try:
        await bot.send_message(chat_id=callback.from_user.id, text=text, reply_markup=kb)
        await callback.answer("✅ Preview yuborildi")
    except TelegramBadRequest as e:
        if "can't parse entities" in str(e).lower():
            safe_text = html.escape(text)
            await bot.send_message(chat_id=callback.from_user.id, text=safe_text, reply_markup=kb)
            await callback.answer("✅ Preview yuborildi (HTML escaped)")
        else:
            await callback.answer(f"❌ Xatolik: {e}", show_alert=True)
