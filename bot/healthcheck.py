"""
Railway healthcheck server — keeps Railway happy while the bot polls Telegram.

Starts a minimal aiohttp server on $PORT (Railway default: 8080)
so Railway knows the service is alive.
"""

import asyncio
import logging
import os

from aiohttp import web

logger = logging.getLogger(__name__)

PORT = int(os.getenv("PORT", "8080"))


async def handle_health(request: web.Request) -> web.Response:
    return web.json_response({"status": "ok", "service": "signal-bot-v2"})


async def handle_ready(request: web.Request) -> web.Response:
    """Readiness check — also used as a startup probe."""
    return web.json_response({"status": "ready"})


async def start_http_server(bot=None, dispatcher=None) -> web.AppRunner:
    """Serve health checks and the isolated Mini App in the polling process."""
    from bot.miniapp.server import install

    app = web.Application(client_max_size=9 * 1024 * 1024)
    if bot is None:
        from bot.miniapp.server import redirect_to_app

        app.router.add_get("/", redirect_to_app)
    else:
        app.router.add_get("/", handle_health)
    app.router.add_get("/health", handle_health)
    app.router.add_get("/ready", handle_ready)
    install(app, bot, dispatcher)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", PORT)
    await site.start()
    logger.info("HTTP / Mini App server running on 0.0.0.0:%d", PORT)
    return runner


async def run_healthcheck_server() -> None:
    """Standalone static preview; authenticated API needs the live bot process."""
    runner = await start_http_server()
    try:
        await asyncio.Event().wait()
    finally:
        await runner.cleanup()


if __name__ == "__main__":
    asyncio.run(run_healthcheck_server())
