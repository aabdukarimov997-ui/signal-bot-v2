from aiogram import Router, F
from aiogram.types import Message, CallbackQuery

from bot.models.user import User
from bot.services.subscription_service import get_active_subscription
from bot.services.referral_service import get_referral_count
from bot.utils.keyboards import main_menu_kb
from bot.utils.texts import ACCOUNT_TEXT, NO_SUBSCRIPTION
from bot.utils.helpers import format_date

account_router = Router()


@account_router.message(F.text == "👤 Hisobim")
async def account_handler(message: Message, user: User) -> None:
    sub = await get_active_subscription(user.id)
    if sub:
        sub_status = f"✅ {sub.tariff_id}"  # Simple status
        expiry = format_date(sub.end_date)
    else:
        sub_status = NO_SUBSCRIPTION
        expiry = "—"

    ref_count = await get_referral_count(user.id)

    text = ACCOUNT_TEXT.format(
        telegram_id=user.telegram_id,
        full_name=user.full_name,
        subscription_status=sub_status,
        expiry_date=expiry,
        referral_count=ref_count,
    )
    await message.answer(text)