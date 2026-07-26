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


async def run_healthcheck_server() -> None:
    """Run a lightweight HTTP server for Railway health checks."""
    app = web.Application()

    app.router.add_get("/", handle_health)
    app.router.add_get("/health", handle_health)
    app.router.add_get("/ready", handle_ready)

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", PORT)

    logger.info("Healthcheck server running on 0.0.0.0:%d", PORT)
    await site.start()

    # Keep running forever
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(run_healthcheck_server())
