from aiogram import Router, F, Bot
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import Message

from bot.models.user import User
from bot.services.settings_service import get_admin_ids
from bot.services.user_service import get_all_user_telegram_ids

announcement_router = Router()


class AnnouncementStates(StatesGroup):
    waiting_text = State()


@announcement_router.message(F.text == "📢 E'lon")
async def announcement_start_handler(message: Message, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        await message.answer("⛔ Bu funksiya faqat adminlar uchun.")
        return

    await state.set_state(AnnouncementStates.waiting_text)
    await message.answer(
        "📢 <b>E'lon yuborish</b>\n\n"
        "Barcha foydalanuvchilarga yuboriladigan xabarni kiriting:\n\n"
        "💡 Xabar HTML formatda bo'lishi mumkin.\n"
        "💡 Rasm yuborish: avval rasm, keyin matn.\n\n"
        "Bekor qilish: /cancel"
    )


@announcement_router.message(Command("cancel"), AnnouncementStates.waiting_text)
async def cancel_announcement(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer("❌ E'lon bekor qilindi.")


@announcement_router.message(AnnouncementStates.waiting_text)
async def send_announcement_handler(message: Message, user: User, state: FSMContext, bot: Bot) -> None:
    if user.telegram_id not in await get_admin_ids():
        await message.answer("⛔ Ruxsat yo'q.")
        await state.clear()
        return

    text = message.text or message.caption or ""
    photo_file_id = message.photo[-1].file_id if message.photo else None

    if not text and not photo_file_id:
        await message.answer("❌ Matn yoki rasm kiritilmadi.")
        await state.clear()
        return

    telegram_ids = await get_all_user_telegram_ids()
    sent = 0
    failed = 0

    for tg_id in telegram_ids:
        try:
            if photo_file_id:
                await bot.send_photo(
                    chat_id=tg_id,
                    photo=photo_file_id,
                    caption=text or "",
                )
            else:
                await bot.send_message(chat_id=tg_id, text=text)
            sent += 1
        except Exception:
            failed += 1

    await state.clear()
    await message.answer(
        f"📢 <b>E'lon yuborildi!</b>\n\n"
        f"✅ Yuborilgan: <b>{sent}</b>\n"
        f"❌ Xatolik: <b>{failed}</b>\n"
        f"👥 Jami: <b>{len(telegram_ids)}</b>"
    )
