from aiogram import F, Router
from aiogram.types import CallbackQuery, Message

from bot.models.user import User
from bot.services.contact_service import (
    get_all_messages,
    get_message_by_id,
    get_unread_messages,
    mark_as_read,
)
from bot.services.settings_service import get_admin_ids
from bot.utils.helpers import safe_edit
from bot.utils.keyboards import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    admin_back_kb,
    admin_contact_messages_kb,
)

admin_messages_router = Router()


@admin_messages_router.callback_query(F.data == "admin_contacts")
async def admin_contacts_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    unread = await get_unread_messages()
    all_msgs = await get_all_messages(limit=50)

    text = "💬 <b>Foydalanuvchi xabarlari</b>\n\n"

    if unread:
        text += f"📩 <b>O'qilmagan xabarlar ({len(unread)} ta):</b>\n\n"
        for msg in unread[:10]:  # Show max 10 unread
            from sqlalchemy import select

            from bot.database.session import get_session
            from bot.models.user import User as UserModel

            async with get_session() as session:
                result = await session.execute(select(UserModel).where(UserModel.id == msg.user_id))
                user_data = result.scalar_one_or_none()
            name = user_data.full_name if user_data else "Noma'lum"
            preview = (msg.message_text or "[Rasm]")[:50]
            if len(preview) >= 50:
                preview += "..."
            text += f"• <b>{name}</b>: {preview}\n"
            text += f"  🕐 {msg.created_at.strftime('%d.%m.%Y %H:%M')}\n"
            text += f"  ➡️ <code>/view_msg_{msg.id}</code>\n\n"
    else:
        text += "📭 Hozircha hech qanday xabar yo'q.\n\n"

    if all_msgs:
        text += f"📜 Jami xabarlar: {len(all_msgs)} ta"

    await safe_edit(
        callback.message,
        text,
        reply_markup=admin_contact_messages_kb(),
    )
    await callback.answer()


@admin_messages_router.message(F.text.startswith("/view_msg_"))
async def admin_view_message_cmd(message: Message, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        return

    msg_id = message.text.replace("/view_msg_", "").strip()
    msg = await get_message_by_id(msg_id)
    if not msg:
        await message.answer("❌ Xabar topilmadi.")
        return

    from sqlalchemy import select

    from bot.database.session import get_session
    from bot.models.user import User as UserModel

    async with get_session() as session:
        result = await session.execute(select(UserModel).where(UserModel.id == msg.user_id))
        user_data = result.scalar_one_or_none()

    name = user_data.full_name if user_data else "Noma'lum"
    tg_id = user_data.telegram_id if user_data else "Noma'lum"
    read_status = "✅ O'qilgan" if msg.is_read else "📩 O'qilmagan"

    text = (
        f"💬 <b>Xabar tafsilotlari</b>\n\n"
        f"👤 Foydalanuvchi: {name}\n"
        f"🆔 Telegram ID: <code>{tg_id}</code>\n"
        f"📅 Vaqt: {msg.created_at.strftime('%d.%m.%Y %H:%M')}\n"
        f"📝 Matn: {msg.message_text or '[Rasm]'}\n"
        f"📖 Holat: {read_status}\n"
    )

    # Mark as read
    if not msg.is_read:
        await mark_as_read(msg_id, user.id)
        text = "✅ <b>Xabar o'qilgan deb belgilandi!</b>\n\n" + text

    reply_markup = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="📨 Javob yozish", url=f"tg://user?id={tg_id}")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_contacts")],
        ]
    )

    if msg.photo_file_id:
        await message.answer_photo(photo=msg.photo_file_id, caption=text, reply_markup=reply_markup)
    else:
        await message.answer(text, reply_markup=reply_markup)


@admin_messages_router.callback_query(F.data == "admin_contacts_all")
async def admin_all_messages_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    all_msgs = await get_all_messages(limit=50)
    if not all_msgs:
        await safe_edit(
            callback.message, "📭 Hozircha hech qanday xabar yo'q.", reply_markup=admin_back_kb("admin_contacts")
        )
        await callback.answer()
        return

    text = "💬 <b>Barcha xabarlar:</b>\n\n"
    for msg in all_msgs[:30]:
        from sqlalchemy import select

        from bot.database.session import get_session
        from bot.models.user import User as UserModel

        async with get_session() as session:
            result = await session.execute(select(UserModel).where(UserModel.id == msg.user_id))
            user_data = result.scalar_one_or_none()
        name = user_data.full_name if user_data else "Noma'lum"
        status = "✅" if msg.is_read else "📩"
        preview = (msg.message_text or "[Rasm]")[:40]
        text += f"{status} <b>{name}</b>: {preview}...\n"
        text += f"   🕐 {msg.created_at.strftime('%d.%m.%Y %H:%M')}\n"
        text += f"   ➡️ <code>/view_msg_{msg.id}</code>\n\n"

    await safe_edit(callback.message, text, reply_markup=admin_back_kb("admin_contacts"))
    await callback.answer()
