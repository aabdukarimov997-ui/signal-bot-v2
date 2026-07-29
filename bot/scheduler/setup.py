from __future__ import annotations

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from bot.config import settings

scheduler = AsyncIOScheduler(timezone="Asia/Tashkent")


def setup_scheduler(bot) -> None:  # type: ignore[no-untyped-def]
    """Register all scheduled jobs."""

    @scheduler.scheduled_job(CronTrigger(hour=0, minute=0))
    async def expire_job():
        from bot.scheduler.jobs import expire_subscriptions_job
        await expire_subscriptions_job(bot)

    @scheduler.scheduled_job(IntervalTrigger(hours=6))
    async def verify_membership_job():
        from bot.scheduler.jobs import verify_channel_membership_job
        await verify_channel_membership_job(bot)

    @scheduler.scheduled_job(CronTrigger(hour=3, minute=0))
    async def purge_job():
        from bot.scheduler.jobs import purge_non_subscribers_job
        await purge_non_subscribers_job(bot)

    # Marketing job — obuna olmaganlarga xabar (har 3 soatda tekshiriladi,
    # lekin faqat marketing_interval_hours dan keyin yana yuboradi)
    @scheduler.scheduled_job(IntervalTrigger(hours=3))
    async def marketing_job():
        from bot.scheduler.jobs import send_marketing_job
        await send_marketing_job(bot)


def start_scheduler() -> None:
    scheduler.start()