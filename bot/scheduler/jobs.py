from aiogram import Bot

from bot.config import settings
from bot.services.subscription_service import (
    expire_all_expired_subscriptions,
    get_expiring_soon,
    get_all_subscriptions,
    get_all_tariffs,
)
from bot.services.channel_service import ban_channel_member, get_signal_channel_id
from bot.services.settings_service import get_setting
import logging

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

logger = logging.getLogger(__name__)


async def _get_channel_for_sub(sub) -> str:
    """Get channel ID for a subscription, considering tariff-specific channel_id."""
    product_type = await _get_product_type(sub)

    if product_type == "course":
        return await get_setting("course_channel_id") or ""

    # For signal: try tariff-specific channel, fall back to global
    return await get_signal_channel_id(tariff_id=sub.tariff_id)


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
        channel_id = await _get_channel_for_sub(sub)

        if user:
            try:
                text = SUBSCRIPTION_EXPIRED_COURSE if product_type == "course" else SUBSCRIPTION_EXPIRED
                await bot.send_message(chat_id=user.telegram_id, text=text)

                # Ban faqat boshqa aktiv sub bo'lmasa
                from bot.services.subscription_service import get_active_subscription_by_type
                other_active = await get_active_subscription_by_type(sub.user_id, product_type)
                if not other_active and channel_id:
                    await ban_channel_member(bot, channel_id, user.telegram_id)
            except Exception:
                pass


async def verify_channel_membership_job(bot: Bot) -> None:
    """Check active subscribers are in channel; kick those who left/kicked (no re-invite)."""
    subs = await get_all_subscriptions(status="active")
    for sub in subs:
        product_type = await _get_product_type(sub)
        channel_id = await _get_channel_for_sub(sub)
        if not channel_id:
            continue
        try:
            member = await bot.get_chat_member(channel_id, sub.telegram_id)
            status = member.status
            if status in ("left", "kicked"):
                await ban_channel_member(bot, channel_id, sub.telegram_id)
                try:
                    await bot.send_message(
                        chat_id=sub.telegram_id,
                        text="🚫 <b>Kanalga kirish huquqi yo'q</b>\n\n"
                             "Siz kanaldan chiqdingiz yoki chiqarib yuborildingiz.\n"
                             "Qayta kirish uchun admin bilan bog'laning.",
                    )
                except Exception:
                    pass
        except Exception:
            pass


async def purge_non_subscribers_job(bot: Bot) -> None:
    """Remove channel members who don't have an active subscription.
    Iterates over all known user telegram_ids and checks their membership status
    in each managed channel. Kicks those without valid subscriptions.
    """
    from bot.handlers.channel_guard import _get_all_managed_channels, _is_subscriber_allowed
    from bot.services.user_service import get_all_user_telegram_ids

    channels = await _get_all_managed_channels()
    all_telegram_ids = await get_all_user_telegram_ids()

    for channel_id in channels:
        for telegram_id in all_telegram_ids:
            try:
                member = await bot.get_chat_member(channel_id, telegram_id)
                if member.status in ("member", "administrator"):
                    allowed = await _is_subscriber_allowed(telegram_id, channel_id)
                    if not allowed:
                        from bot.services.channel_service import ban_channel_member
                        await ban_channel_member(bot, channel_id, telegram_id)
                        logging.info(f"🚫 Purged {telegram_id} from {channel_id} (no active subscription)")
            except Exception:
                pass


async def send_marketing_job(bot: Bot) -> None:
    """
    Obuna olmagan foydalanuvchilarga chiroyli marketing xabar yuboradi.
    """
    from bot.services.settings_service import get_setting
    from bot.services.user_service import get_all_user_telegram_ids
    from bot.services.subscription_service import get_active_subscription_by_type
    from bot.utils.keyboards import InlineKeyboardMarkup, InlineKeyboardButton

    enabled = await get_setting("marketing_enabled")
    if enabled != "true":
        logger.info("📢 Marketing xabarlar o'chirilgan — o'tkazib yuborildi")
        return

    msg = await get_setting("marketing_message") or ""
    if not msg:
        logger.warning("📢 Marketing xabar matni bo'sh — o'tkazib yuborildi")
        return

    img = await get_setting("marketing_image")
    telegram_ids = await get_all_user_telegram_ids()

    # Get tariffs for inline buttons
    signal_tariffs = await get_all_tariffs("signal")
    kb_buttons = []
    for t in signal_tariffs:
        kb_buttons.append([InlineKeyboardButton(
            text=f"{t.label} — ${float(t.price):.0f}",
            callback_data=f"tariff_{t.id}",
        )])
    kb_buttons.append([InlineKeyboardButton(text="⬅️ Asosiy menyu", callback_data="back_main")])
    kb = InlineKeyboardMarkup(inline_keyboard=kb_buttons)

    sent = 0
    skipped = 0
    for tg_id in telegram_ids:
        # Faqat obuna olmaganlarga yuboramiz
        from bot.database.session import get_session
        from sqlalchemy import select
        from bot.models.user import User

        async with get_session() as session:
            result = await session.execute(select(User).where(User.telegram_id == tg_id))
            user = result.scalar_one_or_none()
            if not user:
                continue

            has_signal = await get_active_subscription_by_type(user.id, "signal")
            has_course = await get_active_subscription_by_type(user.id, "course")
            if has_signal or has_course:
                skipped += 1
                continue

        try:
            if img:
                await bot.send_photo(chat_id=tg_id, photo=img, caption=msg, reply_markup=kb)
            else:
                await bot.send_message(chat_id=tg_id, text=msg, reply_markup=kb)
            sent += 1
        except Exception:
            pass

    logger.info(f"📢 Marketing xabar yuborildi: {sent} ta, o'tkazib yuborildi (obunasi bor): {skipped}")


async def send_expiry_reminders_job(bot: Bot) -> None:
    # Har bir muddat oraliqni bir-biridan ajratamiz (overlap bo'lmasligi uchun)
    # reminder flag kalitlari: (days_left, db_column_name)
    ranges = [
        (7, 3, "reminder_7_sent"),
        (3, 1, "reminder_3_sent"),
        (1, 0, "reminder_1_sent"),
    ]
    from bot.database.session import get_session
    from sqlalchemy import select, text as sa_text
    from bot.models.user import User
    from bot.models.subscription import Subscription

    for days_left, days_min, flag_col in ranges:
        subs = await get_expiring_soon(days_left, days_min)
        for sub in subs:
            # Check if reminder already sent for this range
            flag_value = getattr(sub, flag_col, False)
            if flag_value:
                continue

            async with get_session() as session:
                result = await session.execute(select(User).where(User.id == sub.user_id))
                user = result.scalar_one_or_none()

            product_type = await _get_product_type(sub)
            text = await _get_reminder_text(product_type, days_left)

            if user:
                try:
                    await bot.send_message(chat_id=user.telegram_id, text=text)
                    # Mark reminder as sent — session alohida
                    async with get_session() as session:
                        result = await session.execute(
                            select(Subscription).where(Subscription.id == sub.id)
                        )
                        db_sub = result.scalar_one_or_none()
                        if db_sub:
                            setattr(db_sub, flag_col, True)
                except Exception:
                    pass
