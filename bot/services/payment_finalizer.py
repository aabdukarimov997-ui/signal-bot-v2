"""To'lov tasdiqlangandan keyin obunani faollashtirish (umumiy mantiq).

Bu modul ikki joyda ishlatiladi:
  • Admin qo'lda tasdiqlaganda (bot/handlers/signals.py)
  • Blokcheyn orqali avtomatik tasdiqlanganda (bot/services/crypto_service.py)

Shu bilan invite link yaratish, obuna muddatini hisoblash va foydalanuvchiga
xabar yuborish mantig'i bir joyda saqlanadi.
"""

from __future__ import annotations

import contextlib
import logging

from aiogram import Bot

from bot.services.channel_service import get_course_invite_links, get_invite_link, get_signal_channel_id
from bot.services.subscription_service import create_subscription, get_tariff_by_id
from bot.services.user_service import consume_referral_bonus_days, get_user_by_id
from bot.utils.keyboards import course_channels_kb
from bot.utils.texts import PAYMENT_APPROVED_COURSE_TEXT, PAYMENT_APPROVED_TEXT

logger = logging.getLogger(__name__)


async def finalize_payment(bot: Bot, payment, *, auto: bool = False, activate: bool = True) -> bool:
    """Tasdiqlangan to'lov uchun obunani faollashtiradi va foydalanuvchiga xabar yuboradi.

    Returns: True — obuna yaratildi va xabar yuborildi, False — xatolik.
    """
    tariff = await get_tariff_by_id(payment.product_id)
    user = await get_user_by_id(payment.user_id)
    if not tariff or not user:
        logger.warning("finalize_payment: tarif yoki user topilmadi (payment=%s)", payment.id)
        return False

    product_type = payment.product_type or "signal"
    bonus_days = await consume_referral_bonus_days(user.id, user.referral_bonus_days or 0) if activate else 0

    auto_note = "\n\n🤖 <i>To'lov blokcheyndagi tranzaksiya orqali avtomatik tasdiqlandi.</i>" if auto else ""

    if product_type == "course":
        channels = await get_course_invite_links(bot)
        first_link = channels[0]["link"] if channels else None
        if activate:
            await create_subscription(user.id, tariff, invite_link=first_link, bonus_days=bonus_days)

        if channels:
            invite_links_text = ""
            for ch in channels:
                invite_links_text += f"\n🔗 <b>{ch['name']}</b> — <a href='{ch['link']}'>Kanalga kirish</a>"
            text = PAYMENT_APPROVED_COURSE_TEXT.format(invite_links=invite_links_text)
            text += "\n\n⚠️ Har bir link faqat 1 marta ishlatilishi mumkin." + auto_note
            with contextlib.suppress(Exception):
                await bot.send_message(
                    chat_id=user.telegram_id,
                    text=text,
                    disable_web_page_preview=True,
                    reply_markup=course_channels_kb(channels),
                )
        else:
            text = PAYMENT_APPROVED_COURSE_TEXT.format(invite_links="") + "\n\n❌ Linklar yaratilmadi" + auto_note
            with contextlib.suppress(Exception):
                await bot.send_message(chat_id=user.telegram_id, text=text, disable_web_page_preview=True)
        return True

    channel_id = await get_signal_channel_id(tariff=tariff)
    invite_link = await get_invite_link(bot, channel_id) if channel_id else None
    if activate:
        await create_subscription(user.id, tariff, invite_link=invite_link, bonus_days=bonus_days)

    text = PAYMENT_APPROVED_TEXT.format(invite_link=invite_link or "")
    if invite_link:
        text += f"\n\n🔗 <a href='{invite_link}'>Kanalga kirish</a>\n\n⚠️ Link faqat 1 marta ishlatilishi mumkin."
    else:
        text += "\n\n❌ Link yaratilmadi"
    text += auto_note
    with contextlib.suppress(Exception):
        await bot.send_message(chat_id=user.telegram_id, text=text, disable_web_page_preview=True)
    return True


async def notify_admins_auto_approved(bot: Bot, payment, tariff, user, tx_hash: str | None = None) -> None:
    """Avtomatik tasdiqlangan to'lov haqida adminlarga qisqa xabar yuboradi."""
    from bot.services.settings_service import get_admin_ids

    network_label = "TRON TRC20" if payment.crypto_network == "tron" else "BNB BEP20"
    amount = float(payment.crypto_amount or payment.amount or 0)
    text = (
        "🤖 <b>Avtomatik to'lov qabul qilindi</b>\n\n"
        f"🧾 ID: <code>#{payment.invoice_id or '???'}</code>\n"
        f"👤 Foydalanuvchi: {user.full_name if user else '—'}\n"
        f"💰 Tarif: {tariff.label if tariff else '—'}\n"
        f"💵 Summa: {amount:.4f} USDT\n"
        f"🔗 Tarmoq: {network_label}\n"
    )
    if tx_hash:
        text += f"🧮 TX: <code>{tx_hash}</code>\n"
    text += "\nObuna avtomatik faollashtirildi ✅"

    for admin_id in await get_admin_ids():
        with contextlib.suppress(Exception):
            await bot.send_message(chat_id=admin_id, text=text, disable_web_page_preview=True)


async def finalize_crypto_payment(bot: Bot, payment_id: str, tx_hash: str) -> bool:
    """Blokcheyn orqali topilgan kripto to'lovni yakunlaydi."""
    from bot.services.payment_service import get_payment_by_id

    payment = await get_payment_by_id(payment_id)
    if not payment:
        return False
    tariff = await get_tariff_by_id(payment.product_id)
    user = await get_user_by_id(payment.user_id)
    ok = await finalize_payment(bot, payment, auto=True)
    if ok:
        await notify_admins_auto_approved(bot, payment, tariff, user, tx_hash)
    return ok
