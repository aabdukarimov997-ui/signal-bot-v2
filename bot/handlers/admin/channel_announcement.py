"""
📢 KANALGA E'LON — Admin panel uchun.

Admin kanallarga chiroyli formatda xabar yuborishi mumkin:
  • Matnli xabar
  • Rasm + matn
  • Video + matn

Qo'llab-quvvatlanadigan kanallar: VIP Signal kanali, Darslar kanali, Custom kanal.
"""

import html

from aiogram import Router, F, Bot
from aiogram.types import CallbackQuery, Message, ContentType
from aiogram.fsm.context import FSMContext

from bot.services.settings_service import get_setting, get_admin_ids
from bot.utils.helpers import safe_edit
from bot.utils.keyboards import InlineKeyboardMarkup, InlineKeyboardButton
from bot.utils.states import AdminChannelAnnouncementStates

admin_channel_announce_router = Router()

# ─────────────────────────────────────────────────────────
# ❇️ KANAL TANLASH
# ─────────────────────────────────────────────────────────

def channel_selection_kb() -> InlineKeyboardMarkup:
    """Kanallar ro'yxati — qaysi kanalga xabar yuborishni tanlash."""
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔒 VIP Signal kanali", callback_data="announce_channel_signal")],
        [InlineKeyboardButton(text="📚 Darslar kanali", callback_data="announce_channel_course")],
        [InlineKeyboardButton(text="✏️ Boshqa kanal (ID kiriting)", callback_data="announce_channel_custom")],
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
    ])


def content_type_kb() -> InlineKeyboardMarkup:
    """Xabar turini tanlash — matn, rasm+matn, video+matn."""
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📝 Matnli xabar", callback_data="announce_type_text")],
        [InlineKeyboardButton(text="🖼 Rasm + matn", callback_data="announce_type_photo")],
        [InlineKeyboardButton(text="🎬 Video + matn", callback_data="announce_type_video")],
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="announce_back_channels")],
    ])


def confirm_send_kb() -> InlineKeyboardMarkup:
    """Tasdiqlash tugmalari."""
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ Kanalga yuborish", callback_data="announce_confirm_send")],
        [InlineKeyboardButton(text="🔄 Qayta yozish", callback_data="announce_redo")],
        [InlineKeyboardButton(text="❌ Bekor qilish", callback_data="announce_cancel")],
    ])


# ─────────────────────────────────────────────────────────
# 🔊 ENTRY: Admin panel → "📢 Kanalga e'lon"
# ─────────────────────────────────────────────────────────

@admin_channel_announce_router.callback_query(F.data == "admin_channel_announce")
async def announce_start_handler(callback: CallbackQuery) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    await safe_edit(
        callback.message,
        "📢 <b>Kanalga e'lon yuborish</b>\n\n"
        "Qaysi kanalga xabar yubormoqchisiz?",
        reply_markup=channel_selection_kb(),
    )
    await callback.answer()


# ─────────────────────────────────────────────────────────
# 🔙 BACK TO CHANNEL SELECTION
# ─────────────────────────────────────────────────────────

@admin_channel_announce_router.callback_query(F.data == "announce_back_channels")
async def announce_back_channels_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    await safe_edit(
        callback.message,
        "📢 <b>Kanalga e'lon yuborish</b>\n\n"
        "Qaysi kanalga xabar yubormoqchisiz?",
        reply_markup=channel_selection_kb(),
    )
    await callback.answer()


# ─────────────────────────────────────────────────────────
# 🎯 CHANNEL SELECTED
# ─────────────────────────────────────────────────────────

@admin_channel_announce_router.callback_query(F.data.startswith("announce_channel_"))
async def announce_channel_selected_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    channel_type = callback.data.replace("announce_channel_", "")

    if channel_type == "custom":
        await state.set_state(AdminChannelAnnouncementStates.waiting_channel)
        await safe_edit(
            callback.message,
            "✏️ <b>Kanal ID sini kiriting</b>\n\n"
            "Misol: <code>-1001234567890</code>\n\n"
            "💡 Kanal ID ni olish uchun kanalga habar yuboring va "
            "<code>@username_infobot</code>'ga forward qiling.\n\n"
            "❌ Bekor qilish: /cancel",
            reply_markup=None,
        )
        await callback.answer()
        return

    # Predefined channels — get their IDs from settings
    channel_info = await _resolve_channel(channel_type)
    if not channel_info:
        await safe_edit(
            callback.message,
            f"❌ <b>{channel_type.capitalize()} kanali sozlanmagan!</b>\n\n"
            "Iltimos, avval ⚙️ Sozlamalar bo'limida kanal ID sini o'rnating.",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
            ]),
        )
        await callback.answer()
        return

    await state.update_data(channel_id=channel_info["id"], channel_name=channel_info["name"])
    await _ask_content_type(callback.message, state)
    await callback.answer()


async def _resolve_channel(channel_type: str) -> dict | None:
    """Kanal turiga qarab ID va nomni qaytaradi."""
    if channel_type == "signal":
        channel_id = await get_setting("private_channel_id")
        if not channel_id:
            return None
        return {"id": channel_id, "name": "🔒 VIP Signal kanali"}
    elif channel_type == "course":
        # Try course channels in order
        for i in range(1, 4):
            cid = await get_setting(f"course_channel_{i}_id" if i > 1 else "course_channel_id")
            cname = await get_setting(f"course_channel_{i}_name" if i > 1 else "course_channel_1_name")
            if cid:
                return {"id": cid, "name": f"📚 {cname or f'Kanal {i}'}"}
        return None
    return None


# ─────────────────────────────────────────────────────────
# 🆕 CUSTOM CHANNEL — manual ID kiritish
# ─────────────────────────────────────────────────────────

@admin_channel_announce_router.message(F.text, AdminChannelAnnouncementStates.waiting_channel)
async def announce_custom_channel_handler(message: Message, state: FSMContext) -> None:
    channel_id = message.text.strip()

    # Validate: should be a numeric ID starting with -100 or @username
    if not channel_id.startswith("-100") and not channel_id.startswith("@"):
        await message.answer(
            "❌ Noto'g'ri format. Kanal ID <code>-100xxxx</code> yoki <code>@username</code> ko'rinishida bo'lishi kerak.\n\n"
            "Qayta urinib ko'ring yoki /cancel"
        )
        return

    await state.update_data(channel_id=channel_id, channel_name=f"📢 {channel_id}")
    await _ask_content_type(message, state)


# ─────────────────────────────────────────────────────────
# 📝 POST TURINI TANLASH (matn/rasm+matn/video+matn)
# ─────────────────────────────────────────────────────────

async def _ask_content_type(target: Message, state: FSMContext) -> None:
    """Admin dan xabar turini so'rash."""
    data = await state.get_data()
    channel_name = data.get("channel_name", "Kanal")

    await state.set_state(AdminChannelAnnouncementStates.waiting_content_type)

    text = (
        f"📢 <b>E'lon yuborish</b>\n\n"
        f"📌 <b>Kanal:</b> {channel_name}\n\n"
        f"Xabar turini tanlang:"
    )

    kb = content_type_kb()
    await target.answer(text, reply_markup=kb)


@admin_channel_announce_router.message(AdminChannelAnnouncementStates.waiting_channel)
async def announce_custom_channel_invalid(message: Message) -> None:
    await message.answer("❌ Iltimos, kanal ID sini matn sifatida yuboring.")


# ─────────────────────────────────────────────────────────
# 🎨 POST TURI TANLANDI
# ─────────────────────────────────────────────────────────

@admin_channel_announce_router.callback_query(F.data.startswith("announce_type_"), AdminChannelAnnouncementStates.waiting_content_type)
async def announce_type_selected_handler(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    post_type = callback.data.replace("announce_type_", "")
    await state.update_data(post_type=post_type)

    data = await state.get_data()
    channel_name = data.get("channel_name", "Kanal")

    if post_type == "text":
        await state.set_state(AdminChannelAnnouncementStates.waiting_text)
        await safe_edit(
            callback.message,
            f"📝 <b>Matnli xabar yozing</b>\n\n"
            f"📌 <b>Kanal:</b> {channel_name}\n\n"
            f"Xabar matnini yuboring. HTML formatda yozishingiz mumkin:\n"
            f"• <b>Qalin</b> → <code>&lt;b&gt;text&lt;/b&gt;</code>\n"
            f"• <i>Yotiq</i> → <code>&lt;i&gt;text&lt;/i&gt;</code>\n"
            f"• <u>Tag chiziq</u> → <code>&lt;u&gt;text&lt;/u&gt;</code>\n"
            f"• <code>Kod</code> → <code>&lt;code&gt;text&lt;/code&gt;</code>\n"
            f"• <a href='https://t.me'>Havola</a> → <code>&lt;a href='url'&gt;text&lt;/a&gt;</code>\n\n"
            f"❌ Bekor qilish: /cancel",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="announce_back_type")],
            ]),
        )
    elif post_type == "photo":
        await state.set_state(AdminChannelAnnouncementStates.waiting_photo)
        await safe_edit(
            callback.message,
            f"🖼 <b>Rasm + matn yuboring</b>\n\n"
            f"📌 <b>Kanal:</b> {channel_name}\n\n"
            f"<b>1.</b> Rasm yuboring\n"
            f"<b>2.</b> Rasm caption'iga xabar matnini yozing\n\n"
            f"💡 HTML format qo'llab-quvvatlanadi!\n\n"
            f"❌ Bekor qilish: /cancel",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="announce_back_type")],
            ]),
        )
    elif post_type == "video":
        await state.set_state(AdminChannelAnnouncementStates.waiting_video)
        await safe_edit(
            callback.message,
            f"🎬 <b>Video + matn yuboring</b>\n\n"
            f"📌 <b>Kanal:</b> {channel_name}\n\n"
            f"<b>1.</b> Video yuboring\n"
            f"<b>2.</b> Video caption'iga xabar matnini yozing\n\n"
            f"💡 HTML format qo'llab-quvvatlanadi!\n\n"
            f"❌ Bekor qilish: /cancel",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="announce_back_type")],
            ]),
        )

    await callback.answer()


@admin_channel_announce_router.callback_query(F.data == "announce_back_type")
async def announce_back_type_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(AdminChannelAnnouncementStates.waiting_content_type)
    data = await state.get_data()
    channel_name = data.get("channel_name", "Kanal")
    await safe_edit(
        callback.message,
        f"📢 <b>E'lon yuborish</b>\n\n📌 <b>Kanal:</b> {channel_name}\n\nXabar turini tanlang:",
        reply_markup=content_type_kb(),
    )
    await callback.answer()


# ─────────────────────────────────────────────────────────
# 📝 TEXT RECEIVED — Preview
# ─────────────────────────────────────────────────────────

@admin_channel_announce_router.message(AdminChannelAnnouncementStates.waiting_text)
async def announce_text_received_handler(message: Message, state: FSMContext, bot: Bot) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, matn yuboring.")
        return

    text = message.text.strip()
    await state.update_data(text=text)
    await _show_preview(message, state, bot)
    await state.set_state(AdminChannelAnnouncementStates.confirm)


# ─────────────────────────────────────────────────────────
# 🖼 PHOTO + CAPTION RECEIVED — Preview
# ─────────────────────────────────────────────────────────

@admin_channel_announce_router.message(F.photo, AdminChannelAnnouncementStates.waiting_photo)
async def announce_photo_received_handler(message: Message, state: FSMContext, bot: Bot) -> None:
    file_id = message.photo[-1].file_id
    caption = message.caption or ""

    await state.update_data(photo_file_id=file_id, text=caption)
    await _show_preview(message, state, bot)
    await state.set_state(AdminChannelAnnouncementStates.confirm)


@admin_channel_announce_router.message(AdminChannelAnnouncementStates.waiting_photo)
async def announce_photo_invalid_handler(message: Message) -> None:
    await message.answer("❌ Iltimos, rasm yuboring. Rasm caption'iga matn yozishingiz mumkin.")


# ─────────────────────────────────────────────────────────
# 🎬 VIDEO + CAPTION RECEIVED — Preview
# ─────────────────────────────────────────────────────────

@admin_channel_announce_router.message(F.content_type == ContentType.VIDEO, AdminChannelAnnouncementStates.waiting_video)
async def announce_video_received_handler(message: Message, state: FSMContext, bot: Bot) -> None:
    file_id = message.video.file_id
    caption = message.caption or ""

    await state.update_data(video_file_id=file_id, text=caption)
    await _show_preview(message, state, bot)
    await state.set_state(AdminChannelAnnouncementStates.confirm)


@admin_channel_announce_router.message(AdminChannelAnnouncementStates.waiting_video)
async def announce_video_invalid_handler(message: Message) -> None:
    await message.answer("❌ Iltimos, video yuboring. Video caption'iga matn yozishingiz mumkin.")


# ─────────────────────────────────────────────────────────
# 👁 PREVIEW — Xabarni oldindan ko'rish
# ─────────────────────────────────────────────────────────

async def _show_preview(target: Message, state: FSMContext, bot: Bot) -> None:
    """Admin ga xabar preview + tasdiqlash tugmalarini ko'rsatish."""
    data = await state.get_data()
    channel_name = data.get("channel_name", "Kanal")
    text = data.get("text", "")
    photo_file_id = data.get("photo_file_id")
    video_file_id = data.get("video_file_id")

    preview_text = (
        f"👁 <b>Xabar ko'rinishi</b>\n\n"
        f"📌 <b>Kanal:</b> {channel_name}\n"
        f"📝 <b>Xabar:</b>\n"
        f"───\n{text or '<i>(matnsiz)</i>'}\n───\n\n"
        f"✅ Agar hammasi yaxshi bo'lsa, «Kanalga yuborish» tugmasini bosing."
    )

    kb = confirm_send_kb()

    # Send the actual preview to the admin (so they see exactly how it'll look)
    try:
        if photo_file_id:
            await bot.send_photo(
                chat_id=target.chat.id,
                photo=photo_file_id,
                caption=text,
            )
        elif video_file_id:
            await bot.send_video(
                chat_id=target.chat.id,
                video=video_file_id,
                caption=text,
            )
        else:
            # Text-only: send a proper preview as it will appear
            await bot.send_message(
                chat_id=target.chat.id,
                text=text,
                parse_mode="HTML",
            )
    except Exception:
        pass  # Preview failed — still show the confirmation

    # Show the confirmation prompt
    await target.answer(preview_text, reply_markup=kb)

    # Delete the user's original message to keep chat clean
    try:
        await target.delete()
    except Exception:
        pass


# ─────────────────────────────────────────────────────────
# ✅ CONFIRM SEND — Kanalga jo'natish
# ─────────────────────────────────────────────────────────

@admin_channel_announce_router.callback_query(F.data == "announce_confirm_send", AdminChannelAnnouncementStates.confirm)
async def announce_confirm_send_handler(callback: CallbackQuery, state: FSMContext, bot: Bot) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    data = await state.get_data()
    channel_id = data.get("channel_id")
    channel_name = data.get("channel_name", "Kanal")
    text = data.get("text", "")
    photo_file_id = data.get("photo_file_id")
    video_file_id = data.get("video_file_id")

    if not channel_id:
        await callback.answer("❌ Kanal ID topilmadi", show_alert=True)
        return

    try:
        if photo_file_id:
            sent = await bot.send_photo(
                chat_id=channel_id,
                photo=photo_file_id,
                caption=text or None,
                parse_mode="HTML",
            )
        elif video_file_id:
            sent = await bot.send_video(
                chat_id=channel_id,
                video=video_file_id,
                caption=text or None,
                parse_mode="HTML",
            )
        else:
            sent = await bot.send_message(
                chat_id=channel_id,
                text=text or "📢 E'lon",
                parse_mode="HTML",
            )

        # Success — pin the message in the channel (optional)
        try:
            await bot.pin_chat_message(chat_id=channel_id, message_id=sent.message_id)
        except Exception:
            pass  # Bot may not have pin permission

        await safe_edit(
            callback.message,
            f"✅ <b>Xabar muvaffaqiyatli yuborildi!</b>\n\n"
            f"📌 <b>Kanal:</b> {channel_name}\n"
            f"📝 <b>Xabar:</b>\n"
            f"───\n{(text[:100] + '...') if len(text) > 100 else text}\n───\n\n"
            f"🚀 <b>Yana e'lon yuborish</b> uchun <b>📢 Kanalga e'lon</b> tugmasini bosing.",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="📢 Yana e'lon", callback_data="admin_channel_announce")],
                [InlineKeyboardButton(text="⬅️ Admin panel", callback_data="admin_back")],
            ]),
        )

    except Exception as e:
        error_msg = str(e)
        await safe_edit(
            callback.message,
            f"❌ <b>Xatolik yuz berdi!</b>\n\n"
            f"📌 <b>Kanal:</b> {channel_name}\n"
            f"<code>{html.escape(error_msg[:200])}</code>\n\n"
            f"💡 Tekshiring:\n"
            f"• Bot kanalda adminmi?\n"
            f"• Kanal ID to'g'rimi?\n"
            f"• Botda xabar yozish ruxsati bormi?",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🔄 Qayta yuborish", callback_data="announce_redo")],
                [InlineKeyboardButton(text="⬅️ Admin panel", callback_data="admin_back")],
            ]),
        )

    await state.clear()
    await callback.answer()


# ─────────────────────────────────────────────────────────
# 🔄 REDO — Qayta yozish
# ─────────────────────────────────────────────────────────

@admin_channel_announce_router.callback_query(F.data == "announce_redo")
async def announce_redo_handler(callback: CallbackQuery, state: FSMContext) -> None:
    data = await state.get_data()
    post_type = data.get("post_type", "text")
    channel_name = data.get("channel_name", "Kanal")

    # Keep channel info, reset content
    await state.update_data(text="", photo_file_id=None, video_file_id=None)

    if post_type == "photo":
        await state.set_state(AdminChannelAnnouncementStates.waiting_photo)
        await safe_edit(
            callback.message,
            f"🖼 <b>Rasm + matn yuboring</b>\n\n"
            f"📌 <b>Kanal:</b> {channel_name}\n\n"
            f"<b>1.</b> Rasm yuboring\n"
            f"<b>2.</b> Rasm caption'iga xabar matnini yozing\n\n"
            f"❌ Bekor qilish: /cancel",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="announce_back_type")],
            ]),
        )
    elif post_type == "video":
        await state.set_state(AdminChannelAnnouncementStates.waiting_video)
        await safe_edit(
            callback.message,
            f"🎬 <b>Video + matn yuboring</b>\n\n"
            f"📌 <b>Kanal:</b> {channel_name}\n\n"
            f"<b>1.</b> Video yuboring\n"
            f"<b>2.</b> Video caption'iga xabar matnini yozing\n\n"
            f"❌ Bekor qilish: /cancel",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="announce_back_type")],
            ]),
        )
    else:
        await state.set_state(AdminChannelAnnouncementStates.waiting_text)
        await safe_edit(
            callback.message,
            f"📝 <b>Matnli xabar yozing</b>\n\n"
            f"📌 <b>Kanal:</b> {channel_name}\n\n"
            f"Xabar matnini yuboring. HTML formatda yozishingiz mumkin...\n\n"
            f"❌ Bekor qilish: /cancel",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="announce_back_type")],
            ]),
        )

    await callback.answer()


# ─────────────────────────────────────────────────────────
# ❌ CANCEL
# ─────────────────────────────────────────────────────────

@admin_channel_announce_router.callback_query(F.data == "announce_cancel")
async def announce_cancel_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    await safe_edit(
        callback.message,
        "❌ E'lon bekor qilindi.\n\n"
        "📢 <b>Yangi e'lon yuborish</b> uchun admin panelda «📢 Kanalga e'lon» tugmasini bosing.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📢 Yana e'lon", callback_data="admin_channel_announce")],
            [InlineKeyboardButton(text="⬅️ Admin panel", callback_data="admin_back")],
        ]),
    )
    await callback.answer()


@admin_channel_announce_router.message(F.text == "/cancel", AdminChannelAnnouncementStates.waiting_channel)
@admin_channel_announce_router.message(F.text == "/cancel", AdminChannelAnnouncementStates.waiting_content_type)
@admin_channel_announce_router.message(F.text == "/cancel", AdminChannelAnnouncementStates.waiting_text)
@admin_channel_announce_router.message(F.text == "/cancel", AdminChannelAnnouncementStates.waiting_photo)
@admin_channel_announce_router.message(F.text == "/cancel", AdminChannelAnnouncementStates.waiting_video)
@admin_channel_announce_router.message(F.text == "/cancel", AdminChannelAnnouncementStates.confirm)
async def announce_cancel_text_handler(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer(
        "❌ E'lon bekor qilindi.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📢 Yangi e'lon", callback_data="admin_channel_announce")],
            [InlineKeyboardButton(text="⬅️ Admin panel", callback_data="admin_back")],
        ]),
    )
