from aiogram import Bot

from bot.config import settings
from bot.services.subscription_service import (
    expire_all_expired_subscriptions,
    get_expiring_soon,
    get_all_subscriptions,
)
from bot.services.channel_service import ban_channel_member, get_invite_link
from bot.services.settings_service import get_setting
from bot.utils.texts import (
    REMINDER_7_DAYS,
    REMINDER_3_DAYS,
    REMINDER_1_DAY,
    REMINDER_7_DAYS_COURSE,
    REMINDER_3_DAYS_COURSE,
    REMINDER_1_DAY_COURSE,
    SUBSCRIPTION_EXPIRED,
    SUBSCRIPTION_EXPIRED_COURSE,
)


async def _get_channel_for_product(product_type: str) -> str:
    if product_type == "course":
        return await get_setting("course_channel_id") or ""
    return await get_setting("private_channel_id") or settings.PRIVATE_CHANNEL_ID


async def _get_reminder_text(product_type: str, days: int) -> str:
    if product_type == "course":
        return {7: REMINDER_7_DAYS_COURSE, 3: REMINDER_3_DAYS_COURSE, 1: REMINDER_1_DAY_COURSE}[days]
    return {7: REMINDER_7_DAYS, 3: REMINDER_3_DAYS, 1: REMINDER_1_DAY}[days]


async def _get_product_type(sub) -> str:
    from bot.database.session import get_session
    from sqlalchemy import select
    from bot.models.tariff import SignalTariff
    async with get_session() as session:
        result = await session.execute(select(SignalTariff).where(SignalTariff.id == sub.tariff_id))
        tariff = result.scalar_one_or_none()
    return tariff.product_type if tariff else "signal"


async def expire_subscriptions_job(bot: Bot) -> None:
    expired = await expire_all_expired_subscriptions()
    for sub in expired:
        from bot.database.session import get_session
        from sqlalchemy import select
        from bot.models.user import User
        async with get_session() as session:
            result = await session.execute(select(User).where(User.id == sub.user_id))
            user = result.scalar_one_or_none()

        product_type = await _get_product_type(sub)
        channel_id = await _get_channel_for_product(product_type)

        if user:
            try:
                text = SUBSCRIPTION_EXPIRED_COURSE if product_type == "course" else SUBSCRIPTION_EXPIRED
                await bot.send_message(chat_id=user.telegram_id, text=text)
                if channel_id:
                    await ban_channel_member(bot, channel_id, user.telegram_id)
            except Exception:
                pass


async def verify_channel_membership_job(bot: Bot) -> None:
    """Check active subscribers are in channel; re-send invite link if kicked/left."""
    subs = await get_all_subscriptions(status="active")
    for sub in subs:
        product_type = await _get_product_type(sub)
        channel_id = await _get_channel_for_product(product_type)
        if not channel_id:
            continue
        try:
            member = await bot.get_chat_member(channel_id, sub.telegram_id)
            status = member.status
            if status in ("left", "kicked"):
                invite_link = await get_invite_link(bot, channel_id)
                if invite_link:
                    text = "🔔 <b>Obunangiz faol!</b>\n\n"
                    text += "Kanalga qayta kirish uchun quyidagi havolani bosing:\n"
                    text += f"🔗 <a href='{invite_link}'>Kanalga kirish</a>"
                    await bot.send_message(
                        chat_id=sub.telegram_id,
                        text=text,
                        disable_web_page_preview=True,
                    )
        except Exception:
            pass


async def send_expiry_reminders_job(bot: Bot) -> None:
    for days in (7, 3, 1):
        subs = await get_expiring_soon(days)
        for sub in subs:
            from bot.database.session import get_session
            from sqlalchemy import select
            from bot.models.user import User
            async with get_session() as session:
                result = await session.execute(select(User).where(User.id == sub.user_id))
                user = result.scalar_one_or_none()

            product_type = await _get_product_type(sub)
            text = await _get_reminder_text(product_type, days)

            if user:
                try:
                    await bot.send_message(chat_id=user.telegram_id, text=text)
                except Exception:
                    pass
