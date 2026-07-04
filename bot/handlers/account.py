from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup

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
        
        text = ACCOUNT_TEXT.format(
            telegram_id=user.telegram_id,
            full_name=user.full_name,
            subscription_status=sub_status,
            expiry_date=expiry,
            referral_count=await get_referral_count(user.id),
        )
        # Obuna uzaytirish tugmasi
        reply_markup = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔄 Obuna uzaytirish", callback_data="extend_subscription")]
        ])
        await message.answer(text, reply_markup=reply_markup)
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


@account_router.callback_query(F.data == "extend_subscription")
async def extend_subscription_handler(callback: CallbackQuery, user: User) -> None:
    """Redirect to signal tariffs for extension."""
    from bot.utils.helpers import safe_edit
    from bot.services.subscription_service import get_all_tariffs
    from bot.utils.keyboards import tariff_selection_kb
    from bot.utils.texts import SIGNAL_TEXT

    tariffs = await get_all_tariffs("signal")
    text = SIGNAL_TEXT
    await safe_edit(callback.message, text, reply_markup=tariff_selection_kb(tariffs) if tariffs else None)
    await callback.answer()