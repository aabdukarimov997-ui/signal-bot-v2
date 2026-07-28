import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from bot.config import settings
from bot.handlers.start import start_router
from bot.handlers.signals import signal_router
from bot.handlers.course import course_router
from bot.handlers.announcement import announcement_router
from bot.handlers.account import account_router
from bot.handlers.referral import referral_router
from bot.handlers.social import social_router
from bot.handlers.help import help_router
from bot.handlers.setup import setup_router
from bot.handlers.channel_guard import channel_guard_router
from bot.handlers.admin import routers as admin_routers
from bot.middlewares.auth import AuthMiddleware
from bot.scheduler.setup import setup_scheduler, start_scheduler

logging.basicConfig(level=logging.INFO, stream=sys.stdout)

dp = Dispatcher()
bot = Bot(
    token=settings.BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML),
)


def register_routers() -> None:
    dp.include_router(channel_guard_router)
    dp.include_router(setup_router)
    dp.include_router(start_router)
    dp.include_router(signal_router)
    dp.include_router(course_router)
    dp.include_router(announcement_router)
    dp.include_router(account_router)
    dp.include_router(referral_router)
    dp.include_router(social_router)
    dp.include_router(help_router)
    for router in admin_routers:
        dp.include_router(router)


def register_middlewares() -> None:
    dp.message.middleware(AuthMiddleware())
    dp.callback_query.middleware(AuthMiddleware())


async def on_startup() -> None:
    """Startup hook: ensure webhook is deleted before polling."""
    await bot.delete_webhook(drop_pending_updates=True)
    logging.info("✅ Webhook deleted (startup hook)")


async def main() -> None:
    register_routers()
    register_middlewares()
    setup_scheduler(bot)
    start_scheduler()

    # ─── Delete webhook FIRST, before any DB work ─────────────────
    # This prevents race conditions where another service re-sets
    # the webhook while we're busy with database setup.
    logging.info("🗑 Deleting any existing webhook...")
    await bot.delete_webhook(drop_pending_updates=True)
    webhook_info = await bot.get_webhook_info()
    if webhook_info.url:
        logging.warning(f"⚠️ Webhook STILL active: {webhook_info.url} — retrying...")
        await bot.delete_webhook(drop_pending_updates=True)
    logging.info("✅ Webhook confirmed deleted")

    # Create tables if not exist
    from bot.database.engine import engine
    from bot.models.base import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Add channel_id column if missing (ALTER TABLE for existing DB)
        from sqlalchemy import text
        result = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='signal_tariffs' AND column_name='channel_id'"
        ))
        if not result.scalar():
            await conn.execute(text(
                "ALTER TABLE signal_tariffs ADD COLUMN channel_id VARCHAR(64) NULL DEFAULT NULL"
            ))

        # Add contact_messages table (Yordam xabarlari) - create_all handles new table
        # Add reminder tracking columns if missing (old DB migration)
        for col in ["reminder_7_sent", "reminder_3_sent", "reminder_1_sent"]:
            result = await conn.execute(text(
                f"SELECT column_name FROM information_schema.columns "
                f"WHERE table_name='subscriptions' AND column_name='{col}'"
            ))
            if not result.scalar():
                await conn.execute(text(
                    f"ALTER TABLE subscriptions ADD COLUMN {col} BOOLEAN NOT NULL DEFAULT FALSE"
                ))

    # Seed settings from .env defaults if no settings exist
    from bot.services.settings_service import seed_defaults_from_env, is_setup_completed
    await seed_defaults_from_env()

    # Seed tariffs from DB settings if no tariffs exist
    from bot.database.session import get_session
    from sqlalchemy import select, func
    from bot.models.tariff import SignalTariff
    from bot.services.settings_service import get_setting

    async with get_session() as session:
        # Seed signal tariffs
        result = await session.execute(
            select(func.count(SignalTariff.id)).where(SignalTariff.product_type == "signal")
        )
        count = result.scalar() or 0
        if count == 0:
            price_1 = float(await get_setting("price_1_month") or "25")
            price_3 = float(await get_setting("price_3_month") or "50")
            price_6 = float(await get_setting("price_6_month") or "100")
            session.add_all([
                SignalTariff(name="1 oy", duration_months=1, price=price_1, product_type="signal", sort_order=1),
                SignalTariff(name="3 oy", duration_months=3, price=price_3, product_type="signal", sort_order=2),
                SignalTariff(name="6 oy", duration_months=6, price=price_6, product_type="signal", sort_order=3),
            ])

        # Seed course tariffs (only 1 tariff)
        result = await session.execute(
            select(func.count(SignalTariff.id)).where(SignalTariff.product_type == "course")
        )
        course_count = result.scalar() or 0
        if course_count == 0:
            c_price = float(await get_setting("course_price_1_month") or "25")
            c_name = await get_setting("course_tariff_name") or "Kurs"
            session.add(
                SignalTariff(name=c_name, duration_months=1, price=c_price, product_type="course", sort_order=1),
            )

    # Check if setup wizard is needed
    setup_done = await is_setup_completed()
    if not setup_done:
        logging.info("⚠️ Setup wizard needed — first admin will configure the bot")

    # Register the startup hook as a final safety net
    dp.startup.register(on_startup)

    logging.info("🚀 Bot started!")
    await dp.start_polling(bot, allowed_updates=["message", "callback_query", "pre_checkout_query", "chat_member"])


if __name__ == "__main__":
    asyncio.run(main())