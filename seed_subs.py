"""Seed old subscribers + cleanup visible admin tariffs."""
import asyncio
import sys
sys.path.insert(0, "/app")

from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from bot.config import settings

OLD_SUBS = [
    (1344432995, 6, "2026-06-26", "User 1344432995"),
    (922948492,  3, "2026-06-17", "User 922948492"),
    (6017160093, 1, "2026-06-18", "User 6017160093"),
    (6212712641, 3, "2026-06-18", "User 6212712641"),
    (8487073137, 3, "2026-06-18", "User 8487073137"),
    (7875594093, 1, "2026-06-17", "User 7875594093"),
]

async def main():
    engine = create_async_engine(settings.db_url)
    async with engine.begin() as conn:
        # ── Step 1: Hide all non-standard tariffs ──
        r = await conn.execute(text(
            "UPDATE signal_tariffs SET is_active = FALSE "
            "WHERE product_type = 'signal' AND sort_order NOT IN (1,2,3) AND is_active = TRUE"
        ))
        print(f"✅ Hidden {r.rowcount} visible admin tariffs from signal menu")

        # ── Step 2: Create users + subs for old subscribers ──
        for tg_id, months, end_str, name in OLD_SUBS:
            end_date = datetime.strptime(end_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            start_date = end_date - timedelta(days=months * 30)

            # Check / create user
            r = await conn.execute(text(
                "SELECT id, full_name FROM users WHERE telegram_id = :tg_id"
            ), {"tg_id": tg_id})
            row = r.fetchone()
            if row:
                user_id = row[0]
                existing_name = row[1]
                print(f"  👤 User {tg_id} exists: {existing_name}")
            else:
                r = await conn.execute(text(
                    "INSERT INTO users (id, telegram_id, full_name, username, language, is_banned, is_admin, referral_code) "
                    "VALUES (gen_random_uuid(), :tg_id, :name, NULL, 'uz', FALSE, FALSE, :ref) RETURNING id"
                ), {"tg_id": tg_id, "name": name, "ref": f"ref_{tg_id}"})
                user_id = r.fetchone()[0]
                print(f"  🆕 Created user {tg_id} ({name})")

            # Create hidden tariff
            r = await conn.execute(text(
                "INSERT INTO signal_tariffs (id, name, duration_months, price, product_type, is_active, sort_order) "
                "VALUES (gen_random_uuid(), :tname, :months, 0, 'signal', FALSE, 999) RETURNING id"
            ), {"tname": f"Admin: {months} oy", "months": months})
            tariff_id = r.fetchone()[0]

            # Create subscription
            r = await conn.execute(text(
                "INSERT INTO subscriptions (id, user_id, tariff_id, start_date, end_date, status, auto_renew) "
                "VALUES (gen_random_uuid(), :uid, :tid, :start, :end, 'active', FALSE) RETURNING id"
            ), {"uid": user_id, "tid": tariff_id, "start": start_date, "end": end_date})
            sub_id = r.fetchone()[0]
            print(f"  ✅ Sub added: {tg_id} | {months} oy | {start_date.strftime('%d.%m.%Y')}→{end_date.strftime('%d.%m.%Y')}")

    await engine.dispose()
    print("\n=== ALL DONE ===")

asyncio.run(main())
