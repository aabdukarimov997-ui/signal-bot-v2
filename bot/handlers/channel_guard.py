"""Channel guard — kick non-subscribers who join private channels."""

import logging

from aiogram import Router, Bot, F
from aiogram.types import ChatMemberUpdated
from aiogram.enums import ChatMemberStatus

from bot.services.channel_service import ban_channel_member, get_signal_channel_id
from bot.services.subscription_service import get_active_subscription, get_active_subscription_by_type
from bot.services.settings_service import get_setting
from bot.services.user_service import get_user_by_telegram_id
from bot.config import settings

logger = logging.getLogger(__name__)
channel_guard_router = Router()


async def _get_all_managed_channels() -> list[str]:
    """Collect all channel IDs that the bot should guard."""
    channels = set()

    # Global signal channel
    global_signal = await get_setting("private_channel_id") or settings.PRIVATE_CHANNEL_ID
    if global_signal:
        channels.add(global_signal)

    # Course channel
    course_channel = await get_setting("course_channel_id")
    if course_channel:
        channels.add(course_channel)

    # Per-tariff channels
    from bot.database.session import get_session
    from sqlalchemy import select
    from bot.models.tariff import SignalTariff
    async with get_session() as session:
        result = await session.execute(
            select(SignalTariff.channel_id).where(SignalTariff.channel_id.isnot(None))
        )
        for cid in result.scalars().all():
            if cid:
                channels.add(cid)

    return list(channels)


async def _is_subscriber_allowed(telegram_id: int, channel_id: str) -> bool:
    """Check if a user has an active subscription for the given channel."""
    user = await get_user_by_telegram_id(telegram_id)
    if not user:
        return False

    # Check if admin
    admin_ids = await get_setting("admin_ids")
    if admin_ids:
        try:
            if telegram_id in [int(x) for x in admin_ids.split(",")]:
                return True
        except Exception:
            pass
    if telegram_id in settings.admin_ids:
        return True

    # Determine which channel this is and check corresponding subscription
    # First check if this is a tariff-specific channel
    from bot.database.session import get_session
    from sqlalchemy import select
    from bot.models.tariff import SignalTariff
    async with get_session() as session:
        result = await session.execute(
            select(SignalTariff).where(SignalTariff.channel_id == channel_id)
        )
        tariff = result.scalar_one_or_none()

    if tariff:
        # This channel belongs to a specific tariff
        if tariff.product_type == "course":
            sub = await get_active_subscription_by_type(user.id, "course")
        else:
            sub = await get_active_subscription(user.id)
        return sub is not None

    # Check if this is the global signal channel
    global_signal = await get_setting("private_channel_id") or settings.PRIVATE_CHANNEL_ID
    if channel_id == global_signal:
        sub = await get_active_subscription(user.id)
        return sub is not None

    # Check if this is the course channel
    course_channel = await get_setting("course_channel_id")
    if channel_id == course_channel:
        sub = await get_active_subscription_by_type(user.id, "course")
        return sub is not None

    # Unknown channel — default deny
    return False


@channel_guard_router.chat_member()
async def on_chat_member_update(event: ChatMemberUpdated, bot: Bot) -> None:
    """Handle chat_member events — kick non-subscribers who join managed channels."""
    channel_id = str(event.chat.id)
    new_status = event.new_chat_member.status
    old_status = event.old_chat_member.status if event.old_chat_member else None
    user_id = event.new_chat_member.user.id

    # Only handle joins (member, administrator statuses)
    if new_status not in (ChatMemberStatus.MEMBER, ChatMemberStatus.ADMINISTRATOR):
        return

    # Skip if user was already a member (e.g. admin promotion)
    if old_status in (ChatMemberStatus.MEMBER, ChatMemberStatus.ADMINISTRATOR, ChatMemberStatus.OWNER):
        return

    # Check all managed channels
    managed_channels = await _get_all_managed_channels()
    if channel_id not in managed_channels:
        return

    # Check if user is allowed
    allowed = await _is_subscriber_allowed(user_id, channel_id)

    if not allowed:
        logger.info(f"🚫 Kicking non-subscriber {user_id} from channel {channel_id}")
        await ban_channel_member(bot, channel_id, user_id)
        try:
            await bot.send_message(
                chat_id=user_id,
                text="🚫 <b>Kanalga kirish rad etildi</b>\n\n"
                     "Siz faol obunaga ega bo'lmaganingiz uchun kanaldan chiqarib yuborildingiz.\n\n"
                     "Obuna sotib olish uchun botga qayting va «📈 Signal kanal» tugmasini bosing.",
            )
        except Exception:
            pass
    else:
        logger.info(f"✅ Subscriber {user_id} allowed in channel {channel_id}")
