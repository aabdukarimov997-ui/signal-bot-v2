from aiogram import Router, F
from aiogram.types import CallbackQuery, Message, ContentType
from aiogram.fsm.context import FSMContext
from aiogram import Bot

from bot.services.settings_service import get_setting, set_setting, get_admin_ids
from bot.services.subscription_service import get_all_tariffs
from bot.utils.keyboards import admin_course_content_kb, admin_menu_kb
from bot.utils.helpers import safe_edit
from bot.utils.states import AdminCourseContentStates

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
        preview = course_msg[:60] + "..." if len(course_msg) > 60 else course_msg
        status_lines.append(f"📝 Custom xabar: ✅ ({preview})")
    else:
        status_lines.append(f"📝 Custom xabar: ⚪ (auto-generatsiya)")

    status_lines.append(f"📝 Nomi: {course_name}")

    # Show current course tariff price
    tariffs_list = await get_all_tariffs("course")
    if tariffs_list:
        price_str = ", ".join([f"${float(t.price):.0f}" for t in tariffs_list])
        status_lines.append(f"💰 Narx: ✅ ({price_str})")
    else:
        status_lines.append("💰 Narx: ⚪ (tariflar yo'q)")

    if course_desc:
        preview = course_desc[:60] + "..." if len(course_desc) > 60 else course_desc
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


@admin_course_content_router.callback_query(F.data == "admin_course_msg")
async def admin_course_msg_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    current_msg = await get_setting("course_message") or ""
    if not current_msg:
        course_name = await get_setting("course_tariff_name") or "Darslar"
        current_msg = f"(Auto-generatsiya: 📚 {course_name} + Tariflar ro'yxati)"

    await state.set_state(AdminCourseContentStates.waiting_message)
    await safe_edit(
        callback.message,
        f"📝 <b>Darslar to'liq xabarini o'zgartirish</b>\n\n"
        f"Joriy xabar:\n<code>{current_msg[:200]}{'...' if len(current_msg) > 200 else ''}</code>\n\n"
        f"Yangi xabar matnini yuboring (HTML formatda).\n"
        f"⚠️ Bu xabar butun obuna matnini ALMASHTIRADI — nomi, tavsifi va tariflar ro'yxati ham shu matnda bo'ladi.\n"
        f"⚠️ Bo'sh matn yuborsangiz auto-generatsiya qaytadi.\n\n"
        f"HTML format:\n"
        f"• <b>bold</b> — <code>&lt;b&gt;text&lt;/b&gt;</code>\n"
        f"• <i>italic</i> — <code>&lt;i&gt;text&lt;/i&gt;</code>",
        reply_markup=None,
    )
    await callback.answer()


@admin_course_content_router.message(AdminCourseContentStates.waiting_message)
async def admin_course_msg_save(message: Message, state: FSMContext) -> None:
    value = message.text.strip()
    await set_setting("course_message", value)
    await state.clear()
    if value:
        await message.answer(
            f"✅ <b>Darslar xabari yangilandi!</b>\n\nYangi xabar:\n{value[:100]}{'...' if len(value) > 100 else ''}",
            reply_markup=admin_course_content_kb(),
        )
    else:
        await message.answer(
            "✅ <b>Custom xabar o'chirildi!</b>\nEndi auto-generatsiya ishlaydi (nomi + tavsif + tariflar ro'yxati).",
            reply_markup=admin_course_content_kb(),
        )


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


@admin_course_content_router.callback_query(F.data == "admin_course_img")
async def admin_course_img_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    await state.set_state(AdminCourseContentStates.waiting_image)
    await safe_edit(
        callback.message,
        "🖼 <b>Darslar rasmini o'zgartirish</b>\n\nRasmni yuboring — bot uni darslar obuna xabariga biriktiradi.\n\n⚠️ Rasm botga to'g'ridan-to'g'ri yuborilishi kerak.",
        reply_markup=None,
    )
    await callback.answer()


@admin_course_content_router.message(AdminCourseContentStates.waiting_image, F.photo)
async def admin_course_img_save(message: Message, state: FSMContext) -> None:
    file_id = message.photo[-1].file_id
    await set_setting("course_image", file_id)
    await state.clear()
    await message.answer("✅ <b>Darslar rasmi yangilandi!</b>", reply_markup=admin_course_content_kb())


@admin_course_content_router.message(AdminCourseContentStates.waiting_image)
async def admin_course_img_invalid(message: Message) -> None:
    await message.answer("❌ Iltimos, rasm yuboring.")


@admin_course_content_router.callback_query(F.data == "admin_course_vid")
async def admin_course_vid_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    await state.set_state(AdminCourseContentStates.waiting_video)
    await safe_edit(
        callback.message,
        "🎬 <b>Darslar videoni o'zgartirish</b>\n\nVideo yuboring — bot uni darslar obuna xabariga biriktiradi.\n\n⚠️ Video botga to'g'ridan-to'g'ri yuborilishi kerak.",
        reply_markup=None,
    )
    await callback.answer()


@admin_course_content_router.message(AdminCourseContentStates.waiting_video, F.content_type == ContentType.VIDEO)
async def admin_course_vid_save(message: Message, state: FSMContext) -> None:
    file_id = message.video.file_id
    await set_setting("course_video", file_id)
    await state.clear()
    await message.answer("✅ <b>Darslar video yangilandi!</b>", reply_markup=admin_course_content_kb())


@admin_course_content_router.message(AdminCourseContentStates.waiting_video)
async def admin_course_vid_invalid(message: Message) -> None:
    await message.answer("❌ Iltimos, video yuboring.")


@admin_course_content_router.callback_query(F.data == "admin_course_media_del")
async def admin_course_media_del_handler(callback: CallbackQuery) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    await set_setting("course_image", "")
    await set_setting("course_video", "")
    await safe_edit(callback.message, "✅ <b>Rasm va video o'chirildi!</b>\n\nEndi darslar obuna xabari faqat matn ko'rinishida chiqadi.", reply_markup=admin_course_content_kb())
    await callback.answer()


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

    await bot.send_message(chat_id=callback.from_user.id, text=text, reply_markup=kb)
    await callback.answer("✅ Preview yuborildi")
