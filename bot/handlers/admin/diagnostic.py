from datetime import datetime, timezone, timedelta

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery

from bot.models.user import User
from bot.database.session import get_session
from bot.services.settings_service import get_admin_ids
from bot.utils.keyboards import admin_back_kb
from bot.utils.texts import NOT_ADMIN
from sqlalchemy import select, func

from bot.models.subscription import Subscription

admin_diagnostic_router = Router()

# ── Helper: get reminder stats ──────────────────────────────────────


async def get_reminder_stats() -> dict:
    """Return diagnostic data about subscription reminders."""
    stats = {}
    async with get_session() as session:
        # Total active subscriptions
        result = await session.execute(
            select(func.count(Subscription.id)).where(Subscription.status == "active")
        )
        stats["total_active"] = result.scalar() or 0

        # Count with flags = True
        for col in ["reminder_7_sent", "reminder_3_sent", "reminder_1_sent"]:
            result = await session.execute(
                select(func.count(Subscription.id)).where(
                    Subscription.status == "active",
                    getattr(Subscription, col) == True,
                )
            )
            stats[f"{col}_true"] = result.scalar() or 0

        # Subscriptions in each reminder range
        now = datetime.now(timezone.utc)
        ranges = [
            ("7 kun (3-7)", 7, 3),
            ("3 kun (1-3)", 3, 1),
            ("1 kun (0-1)", 1, 0),
        ]
        stats["in_ranges"] = {}
        for label, days_max, days_min in ranges:
            result = await session.execute(
                select(func.count(Subscription.id)).where(
                    Subscription.status == "active",
                    Subscription.end_date <= now + timedelta(days=days_max),
                    Subscription.end_date > now + timedelta(days=days_min),
                )
            )
            stats["in_ranges"][label] = result.scalar() or 0

        # Detailed list: active subs with end_date and flags
        result = await session.execute(
            select(Subscription)
            .where(Subscription.status == "active")
            .order_by(Subscription.end_date.asc())
        )
        subs = result.scalars().all()
        stats["details"] = []
        for sub in subs:
            from bot.models.user import User as UserModel
            user_result = await session.execute(
                select(UserModel).where(UserModel.id == sub.user_id)
            )
            user = user_result.scalar_one_or_none()
            stats["details"].append({
                "sub_id": sub.id[:8] if sub.id else "?",
                "user_tg": user.telegram_id if user else "?",
                "end_date": sub.end_date.strftime("%d.%m.%Y") if sub.end_date else "?",
                "r7": "✅" if sub.reminder_7_sent else "⬜",
                "r3": "✅" if sub.reminder_3_sent else "⬜",
                "r1": "✅" if sub.reminder_1_sent else "⬜",
            })

    return stats


# ── Diagnostic command ──────────────────────────────────────────────


@admin_diagnostic_router.callback_query(F.data == "admin_diagnostic")
async def admin_diagnostic_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    await callback.answer()
    stats = await get_reminder_stats()

    lines = [
        "📊 <b>Diagnostika</b>\n",
        f"👥 Aktiv obunalar: <b>{stats['total_active']}</b>\n",
        "📋 <b>Eslatma flaglari (TRUE):</b>",
        f"   • 7 kun: <b>{stats['reminder_7_sent_true']}</b> ta",
        f"   • 3 kun: <b>{stats['reminder_3_sent_true']}</b> ta",
        f"   • 1 kun: <b>{stats['reminder_1_sent_true']}</b> ta\n",
        "⏳ <b>Oraliqlardagi obunalar:</b>",
    ]
    for label, count in stats["in_ranges"].items():
        lines.append(f"   • {label}: <b>{count}</b> ta")
    lines.append("")

    if stats["details"]:
        lines.append("📋 <b>Barcha aktiv obunalar:</b>")
        lines.append(f"   <code>{'ID':<8} {'User':<12} {'Tugash':<12} {'7':3} {'3':3} {'1':3}</code>")
        for d in stats["details"]:
            lines.append(
                f"   <code>{d['sub_id']:<8} {str(d['user_tg']):<12} {d['end_date']:<12} "
                f"{d['r7']:3} {d['r3']:3} {d['r1']:3}</code>"
            )
    else:
        lines.append("📭 Aktiv obunalar yo'q.")

    text = "\n".join(lines)
    await callback.message.edit_text(text, reply_markup=admin_back_kb("admin_back"))


@admin_diagnostic_router.message(F.text == "📊 Diagnostika")
async def admin_diagnostic_text_handler(message: Message, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await message.answer(NOT_ADMIN)
        return
    stats = await get_reminder_stats()

    lines = [
        "📊 <b>Diagnostika</b>\n",
        f"👥 Aktiv obunalar: <b>{stats['total_active']}</b>\n",
        "📋 <b>Eslatma flaglari (TRUE):</b>",
        f"   • 7 kun: <b>{stats['reminder_7_sent_true']}</b> ta",
        f"   • 3 kun: <b>{stats['reminder_3_sent_true']}</b> ta",
        f"   • 1 kun: <b>{stats['reminder_1_sent_true']}</b> ta\n",
        "⏳ <b>Oraliqlardagi obunalar:</b>",
    ]
    for label, count in stats["in_ranges"].items():
        lines.append(f"   • {label}: <b>{count}</b> ta")
    lines.append("")

    if stats["details"]:
        lines.append("📋 <b>Barcha aktiv obunalar:</b>")
        lines.append(f"   <code>{'ID':<8} {'User':<12} {'Tugash':<12} {'7':3} {'3':3} {'1':3}</code>")
        for d in stats["details"]:
            lines.append(
                f"   <code>{d['sub_id']:<8} {str(d['user_tg']):<12} {d['end_date']:<12} "
                f"{d['r7']:3} {d['r3']:3} {d['r1']:3}</code>"
            )
    else:
        lines.append("📭 Aktiv obunalar yo'q.")

    text = "\n".join(lines)
    await message.answer(text, reply_markup=admin_back_kb("admin_back"))
