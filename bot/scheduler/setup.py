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

    @scheduler.scheduled_job(CronTrigger(hour=9, minute=0))
    async def reminder_job():
        from bot.scheduler.jobs import send_expiry_reminders_job
        await send_expiry_reminders_job(bot)


def start_scheduler() -> None:
    scheduler.start()