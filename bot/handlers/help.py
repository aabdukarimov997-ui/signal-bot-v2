from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from bot.config import settings
from bot.services.settings_service import get_setting, get_admin_ids
from bot.utils.texts import HELP_TEXT, CONTACT_START_TEXT, CONTACT_RECEIVED_TEXT
from bot.utils.keyboards import (
    InlineKeyboardMarkup, InlineKeyboardButton,
    help_kb,
)
from bot.services.contact_service import create_contact_message
from bot.utils.states import ContactState

help_router = Router()


@help_router.message(F.text == "☎️ Yordam")
async def help_handler(message: Message) -> None:
    admin_link = await get_setting("support_username") or settings.ADMIN_LINK
    await message.answer(
        HELP_TEXT.format(admin_link=admin_link),
        reply_markup=help_kb(),
        disable_web_page_preview=True,
    )


@help_router.callback_query(F.data == "contact_send")
async def contact_send_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(ContactState.waiting_message)
    await callback.message.edit_text(
        CONTACT_START_TEXT,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="❌ Bekor qilish", callback_data="contact_cancel")],
        ]),
    )
    await callback.answer()


@help_router.callback_query(F.data == "contact_cancel")
async def contact_cancel_handler(callback: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    admin_link = await get_setting("support_username") or settings.ADMIN_LINK
    await callback.message.edit_text(
        HELP_TEXT.format(admin_link=admin_link),
        reply_markup=help_kb(),
    )
    await callback.answer()


@help_router.message(ContactState.waiting_message)
async def contact_receive_message(message: Message, state: FSMContext, user) -> None:
    text = message.text or message.caption or ""
    photo = message.photo[-1].file_id if message.photo else None

    if not text and not photo:
        await message.answer("❌ Iltimos, matn yoki rasm yuboring.")
        return

    # Store in database
    await create_contact_message(
        user_id=user.id,
        message_text=text or "[Rasm]",
        photo_file_id=photo,
    )

    await state.clear()
    await message.answer(CONTACT_RECEIVED_TEXT)

    # Notify all admins
    admin_ids = await get_admin_ids()
    for admin_id in admin_ids:
        try:
            from bot.services.contact_service import get_unread_count
            unread = await get_unread_count()
            notification = (
                f"💬 <b>Yangi xabar!</b>\n\n"
                f"👤 Foydalanuvchi: {user.full_name}\n"
                f"🆔 Telegram ID: <code>{user.telegram_id}</code>\n"
                f"📝 Xabar: {text[:200] if text else '[Rasm]'}\n\n"
                f"📊 O'qilmagan xabarlar: {unread} ta"
            )
            if photo:
                await message.bot.send_photo(
                    chat_id=admin_id,
                    photo=photo,
                    caption=notification,
                    reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                        [InlineKeyboardButton(text="📋 Xabarlarni ko'rish", callback_data="admin_contacts")],
                    ]),
                )
            else:
                await message.bot.send_message(
                    chat_id=admin_id,
                    text=notification,
                    reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                        [InlineKeyboardButton(text="📋 Xabarlarni ko'rish", callback_data="admin_contacts")],
                    ]),
                )
        except Exception:
            pass