"""Seed old subscribers + cleanup visible admin tariffs.

OLD_SUBS format: (telegram_id, months, payment_date, name).
The date is the PAYMENT/START date — the subscription runs from that
date for `months` months (end = start + months*30 days).

Idempotent: runs on every deploy (entrypoint.sh). If the user already
has the corrected active subscription, nothing is changed and nothing
is re-sent. Old broken seed rows (active-but-already-expired duplicates
from earlier runs) are removed and replaced with one correct row, and
the affected subscriber gets a fresh personal invite link via the bot.
"""
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

RESTORE_MESSAGE = (
    "✅ Obunangiz tiklandi!\n\n"
    "Texnik nosozlik tufayli kanaldan chiqarilgan bo'lishingiz mumkin — "
    "uzr so'raymiz. Quyidagi shaxsiy havola orqali qaytadan kiring "
    "(havola 1 kishilik, 72 soat amal qiladi):\n"
    "{invite_link}\n\n"
    "Obunangiz tugash sanasi: {end_date}"
)


async def main():
    engine = create_async_engine(settings.db_url)
    to_notify = []  # (telegram_id, end_date) — only users we just repaired
    channel_id = ""

    async with engine.begin() as conn:
        # ── Step 1: Hide all non-standard tariffs ──
        r = await conn.execute(text(
            "UPDATE signal_tariffs SET is_active = FALSE "
            "WHERE product_type = 'signal' AND sort_order NOT IN (1,2,3) AND is_active = TRUE"
        ))
        print(f"✅ Hidden {r.rowcount} visible admin tariffs from signal menu")

        # ── Step 2: Create/repair users + subs for old subscribers ──
        for tg_id, months, start_str, name in OLD_SUBS:
            start_date = datetime.strptime(start_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            end_date = start_date + timedelta(days=months * 30)

            # Check / create user
            r = await conn.execute(text(
                "SELECT id, full_name FROM users WHERE telegram_id = :tg_id"
            ), {"tg_id": tg_id})
            row = r.fetchone()
            if row:
                user_id = row[0]
                print(f"  👤 User {tg_id} exists: {row[1]}")
            else:
                r = await conn.execute(text(
                    "INSERT INTO users (id, telegram_id, full_name, username, language, is_banned, is_admin, referral_code) "
                    "VALUES (gen_random_uuid(), :tg_id, :name, NULL, 'uz', FALSE, FALSE, :ref) RETURNING id"
                ), {"tg_id": tg_id, "name": name, "ref": f"ref_{tg_id}"})
                user_id = r.fetchone()[0]
                print(f"  🆕 Created user {tg_id} ({name})")

            # Already repaired? (correct active sub with this end date) → skip
            r = await conn.execute(text(
                "SELECT id FROM subscriptions "
                "WHERE user_id = :uid AND status = 'active' AND end_date = :end"
            ), {"uid": user_id, "end": end_date})
            if r.fetchone():
                print(f"  ⏭️ Sub already correct for {tg_id}, skipping")
                continue

            # Remove broken/duplicate seed subs (hidden price-0 'Admin: N oy'
            # tariffs from earlier runs), whatever status they ended up in
            r = await conn.execute(text(
                "DELETE FROM subscriptions WHERE user_id = :uid AND tariff_id IN ("
                "  SELECT id FROM signal_tariffs "
                "  WHERE name LIKE 'Admin: % oy' AND price = 0 AND sort_order = 999"
                ")"
            ), {"uid": user_id})
            if r.rowcount:
                print(f"  🧹 Removed {r.rowcount} broken seed sub(s) for {tg_id}")

            # Reuse a matching hidden tariff if one exists, else create it
            r = await conn.execute(text(
                "SELECT id FROM signal_tariffs "
                "WHERE name = :tname AND price = 0 AND sort_order = 999 LIMIT 1"
            ), {"tname": f"Admin: {months} oy"})
            row = r.fetchone()
            if row:
                tariff_id = row[0]
            else:
                r = await conn.execute(text(
                    "INSERT INTO signal_tariffs (id, name, duration_months, price, product_type, is_active, sort_order) "
                    "VALUES (gen_random_uuid(), :tname, :months, 0, 'signal', FALSE, 999) RETURNING id"
                ), {"tname": f"Admin: {months} oy", "months": months})
                tariff_id = r.fetchone()[0]

            # Create corrected subscription
            await conn.execute(text(
                "INSERT INTO subscriptions (id, user_id, tariff_id, start_date, end_date, status, auto_renew) "
                "VALUES (gen_random_uuid(), :uid, :tid, :start, :end, 'active', FALSE)"
            ), {"uid": user_id, "tid": tariff_id, "start": start_date, "end": end_date})
            print(f"  ✅ Sub fixed: {tg_id} | {months} oy | {start_date.strftime('%d.%m.%Y')}→{end_date.strftime('%d.%m.%Y')}")
            to_notify.append((tg_id, end_date))

        # ── Step 3: Drop orphan seed tariffs left by removed duplicates ──
        r = await conn.execute(text(
            "DELETE FROM signal_tariffs "
            "WHERE name LIKE 'Admin: % oy' AND price = 0 AND sort_order = 999 "
            "AND id NOT IN (SELECT tariff_id FROM subscriptions)"
        ))
        if r.rowcount:
            print(f"🧹 Removed {r.rowcount} orphan seed tariff(s)")

        # Channel id for invite links
        r = await conn.execute(text(
            "SELECT value FROM project_settings WHERE key = 'private_channel_id'"
        ))
        row = r.fetchone()
        channel_id = (row[0] if row else "") or settings.PRIVATE_CHANNEL_ID

    await engine.dispose()

    # ── Step 4: Send fresh personal invite links to repaired users ──
    if to_notify and channel_id:
        from aiogram import Bot
        bot = Bot(token=settings.BOT_TOKEN)
        try:
            for tg_id, end_date in to_notify:
                try:
                    link = await bot.create_chat_invite_link(
                        chat_id=channel_id,
                        member_limit=1,
                        expire_date=datetime.now(timezone.utc) + timedelta(hours=72),
                    )
                    await bot.send_message(
                        chat_id=tg_id,
                        text=RESTORE_MESSAGE.format(
                            invite_link=link.invite_link,
                            end_date=end_date.strftime("%d.%m.%Y"),
                        ),
                    )
                    print(f"  📨 Invite link sent to {tg_id}")
                except Exception as e:
                    print(f"  ⚠️ Could not notify {tg_id}: {e}")
        finally:
            await bot.session.close()
    elif to_notify:
        print("⚠️ No channel_id configured — invite links NOT sent")

    print("\n=== ALL DONE ===")


if __name__ == "__main__":
    asyncio.run(main())
