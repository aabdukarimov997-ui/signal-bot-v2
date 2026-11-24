from aiogram import Bot, F, Router
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message

from bot.models.user import User
from bot.services.referral_service import get_referral_count
from bot.services.subscription_service import get_active_subscription, get_user_subscription_history
from bot.utils.helpers import format_date
from bot.utils.texts import (
    ACCOUNT_TEXT,
    NO_SUBSCRIPTION,
    SUBSCRIPTION_HISTORY_EMPTY,
    SUBSCRIPTION_HISTORY_ROW,
    SUBSCRIPTION_HISTORY_TEXT,
)

account_router = Router()

STATUS_LABELS = {
    "active": ("✅", "Faol"),
    "expired": ("⏳", "Tugagan"),
    "cancelled": ("❌", "Bekor qilingan"),
    "pending": ("🕐", "Kutilmoqda"),
}


def _history_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="📜 Obunalar tarixi", callback_data="sub_history")],
        ]
    )


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
        reply_markup = InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="🔄 Obuna uzaytirish", callback_data="extend_subscription")],
                [InlineKeyboardButton(text="📜 Obunalar tarixi", callback_data="sub_history")],
            ]
        )
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
        await message.answer(text, reply_markup=_history_kb())


@account_router.callback_query(F.data == "sub_history")
async def subscription_history_handler(callback: CallbackQuery, user: User) -> None:
    rows = await get_user_subscription_history(user.id, limit=10)
    if not rows:
        await callback.message.answer(SUBSCRIPTION_HISTORY_EMPTY)
        await callback.answer()
        return

    parts = []
    for sub, tariff_name in rows:
        icon, label = STATUS_LABELS.get(sub.status, ("❔", sub.status))
        parts.append(
            SUBSCRIPTION_HISTORY_ROW.format(
                icon=icon,
                tariff=tariff_name or "Signal",
                status=label,
                start=format_date(sub.start_date),
                end=format_date(sub.end_date),
            )
        )

    text = SUBSCRIPTION_HISTORY_TEXT.format(rows="".join(parts), total=len(rows))
    await callback.message.answer(text)
    await callback.answer()


@account_router.callback_query(F.data == "extend_subscription")
async def extend_subscription_handler(callback: CallbackQuery, user: User, bot: Bot) -> None:
    """Redirect to signal tariffs for extension."""
    from bot.handlers.signals import send_signal_menu
    from bot.services.pricing_service import build_price
    from bot.services.subscription_service import get_all_tariffs

    tariffs = await get_all_tariffs("signal")
    prices = {t.id: await build_price(user.id, float(t.price), "signal") for t in tariffs}
    await send_signal_menu(callback, tariffs, bot, is_edit=True, prices=prices)
    await callback.answer()
