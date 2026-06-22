import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from bot.config import settings
from bot.handlers.start import start_router
from bot.handlers.signals import signal_router
from bot.handlers.account import account_router
from bot.handlers.referral import referral_router
from bot.handlers.social import social_router
from bot.handlers.help import help_router
from bot.handlers.admin.dashboard import admin_router
from bot.handlers.admin.payments import admin_payments_router
from bot.handlers.admin.tariffs import admin_tariffs_router
from bot.handlers.admin.stats import admin_stats_router
from bot.handlers.admin.users import admin_users_router
from bot.handlers.admin.social import admin_social_router
from bot.middlewares.auth import AuthMiddleware
from bot.scheduler.setup import setup_scheduler, start_scheduler

logging.basicConfig(level=logging.INFO, stream=sys.stdout)

dp = Dispatcher()
bot = Bot(
    token=settings.BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML),
)


def register_routers() -> None:
    dp.include_router(start_router)
    dp.include_router(signal_router)
    dp.include_router(account_router)
    dp.include_router(referral_router)
    dp.include_router(social_router)
    dp.include_router(help_router)
    dp.include_router(admin_router)
    dp.include_router(admin_payments_router)
    dp.include_router(admin_tariffs_router)
    dp.include_router(admin_stats_router)
    dp.include_router(admin_users_router)
    dp.include_router(admin_social_router)


def register_middlewares() -> None:
    dp.message.middleware(AuthMiddleware())
    dp.callback_query.middleware(AuthMiddleware())


async def main() -> None:
    register_routers()
    register_middlewares()
    setup_scheduler(bot)
    start_scheduler()

    # Create tables if not exist
    from bot.database.engine import engine
    from bot.models.base import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed default tariffs if none exist
    from bot.database.session import get_session
    from sqlalchemy import select, func
    from bot.models.tariff import SignalTariff
    async with get_session() as session:
        result = await session.execute(select(func.count(SignalTariff.id)))
        count = result.scalar() or 0
        if count == 0:
            session.add_all([
                SignalTariff(name="1 oy", duration_months=1, price=25, sort_order=1),
                SignalTariff(name="3 oy", duration_months=3, price=50, sort_order=2),
                SignalTariff(name="6 oy", duration_months=6, price=100, sort_order=3),
            ])

    await bot.delete_webhook(drop_pending_updates=True)
    logging.info("Bot started!")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())