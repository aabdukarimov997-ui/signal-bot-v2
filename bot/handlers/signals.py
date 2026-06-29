from datetime import datetime, timezone
from typing import Optional

from aiogram import Router, F
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message, PreCheckoutQuery, LabeledPrice, ContentType
from aiogram import Bot

from bot.config import settings
from bot.models.user import User
from bot.models.tariff import SignalTariff
from bot.services.subscription_service import (
    get_all_tariffs,
    get_tariff_by_id,
    create_subscription,
    get_active_subscription,
)
from bot.services.payment_service import create_payment, get_payment_by_id
from bot.services.channel_service import create_invite_link
from bot.services.promo_service import validate_promo, apply_promo
from bot.services.user_service import add_referral_bonus_days
from bot.services.settings_service import get_setting, get_admin_ids
from bot.utils.keyboards import (
    tariff_selection_kb,
    payment_method_kb,
    card_payment_kb,
    tron_payment_kb,
    check_uploaded_kb,
    admin_approval_kb,
)
from bot.utils.texts import (
    SIGNAL_TEXT,
    PAYMENT_METHOD_TEXT,
    STARS_PAYMENT_TEXT,
    STARS_SUCCESS_TEXT,
    STARS_SUCCESS_COURSE_TEXT,
    CARD_PAYMENT_TEXT,
    CHECK_UPLOAD_TEXT,
    CHECK_RECEIVED_TEXT,
    TRON_PAYMENT_TEXT,
    TRON_UPLOAD_TEXT,
    TRON_RECEIVED_TEXT,
    PAYMENT_APPROVED_TEXT,
    PAYMENT_APPROVED_COURSE_TEXT,
    PAYMENT_REJECTED_TEXT,
    ADMIN_PAYMENT_NOTIFICATION,
)
from bot.utils.states import PaymentStates
from bot.utils.helpers import safe_edit, format_date, calculate_discounted_price

signal_router = Router()


# ─── Signal Menu: Show Tariffs ─────────────────────────────────────

@signal_router.message(F.text == "📈 Signal kanal")
async def signal_menu_handler(message: Message) -> None:
    tariffs = await get_all_tariffs("signal")
    text = SIGNAL_TEXT
    if not tariffs:
        text += "\n\n❌ Hozircha tariflar mavjud emas."
    await message.answer(text, reply_markup=tariff_selection_kb(tariffs) if tariffs else None)


@signal_router.callback_query(F.data == "back_tariffs")
async def back_tariffs_handler(callback: CallbackQuery) -> None:
    tariffs = await get_all_tariffs("signal")
    text = SIGNAL_TEXT
    for t in tariffs:
        text += f"\n• {t.label} — ${float(t.price):.0f}"
    await safe_edit(callback.message, text, reply_markup=tariff_selection_kb(tariffs))
    await callback.answer()


# ─── Select Tariff → Payment Method ────────────────────────────────

@signal_router.callback_query(F.data.startswith("tariff_"))
async def tariff_selected_handler(callback: CallbackQuery) -> None:
    tariff_id = callback.data.replace("tariff_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    text = (
        f"📈 <b>{tariff.label}</b>\n\n"
        f"💰 Narx: <b>${float(tariff.price):.0f}</b>\n"
        f"📅 Muddati: <b>{tariff.duration_months} oy</b>\n\n"
        f"{PAYMENT_METHOD_TEXT}"
    )
    await safe_edit(callback.message, text, reply_markup=payment_method_kb(tariff.id))
    await callback.answer()


@signal_router.callback_query(F.data.startswith("pay_method_"))
async def pay_method_handler(callback: CallbackQuery) -> None:
    tariff_id = callback.data.replace("pay_method_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return
    text = (
        f"📈 <b>{tariff.label}</b>\n\n"
        f"💰 Narx: <b>${float(tariff.price):.0f}</b>\n\n"
        f"{PAYMENT_METHOD_TEXT}"
    )
    await safe_edit(callback.message, text, reply_markup=payment_method_kb(tariff.id))
    await callback.answer()


# ─── Telegram Stars Payment ────────────────────────────────────────

@signal_router.callback_query(F.data.startswith("stars_"))
async def stars_payment_handler(callback: CallbackQuery, bot: Bot) -> None:
    tariff_id = callback.data.replace("stars_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    # Get Stars price from DB settings (per duration), fallback to ×50 formula
    stars_key = f"stars_{tariff.duration_months}_month"
    stars_from_db = await get_setting(stars_key)
    stars_amount = int(stars_from_db) if stars_from_db else tariff.stars_price

    prices = [LabeledPrice(label=tariff.label, amount=stars_amount)]
    await bot.send_invoice(
        chat_id=callback.message.chat.id,
        title=f"📈 Signal kanal — {tariff.label}",
        description=f"Signal kanaliga {tariff.label} obuna",
        payload=f"signal_stars_{tariff.id}",
        provider_token="",  # Empty for Telegram Stars
        currency="XTR",
        prices=prices,
        reply_markup=None,
    )
    await callback.answer()


@signal_router.pre_checkout_query(lambda q: True)
async def pre_checkout_handler(pre_checkout_q: PreCheckoutQuery) -> None:
    await pre_checkout_q.answer(ok=True)


@signal_router.message(F.content_type == ContentType.SUCCESSFUL_PAYMENT)
async def successful_payment_handler(message: Message, user: User, bot: Bot) -> None:
    payload = message.successful_payment.invoice_payload
    telegram_charge_id = message.successful_payment.telegram_payment_charge_id
    provider_charge_id = message.successful_payment.provider_payment_charge_id
    total_amount = message.successful_payment.total_amount / 100

    # Parse payload: signal_stars_{tariff_id} or course_stars_{tariff_id}
    parts = payload.split("_")
    if len(parts) < 3:
        await message.answer("❌ Xatolik yuz berdi.")
        return

    product_type = parts[0]  # "signal" or "course"
    tariff_id = parts[2]
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await message.answer("❌ Tarif topilmadi.")
        return

    # Determine channel based on product_type
    if product_type == "course":
        channel_id = await get_setting("course_channel_id") or ""
        success_text = STARS_SUCCESS_COURSE_TEXT
    else:
        channel_id = await get_setting("private_channel_id") or settings.PRIVATE_CHANNEL_ID
        success_text = STARS_SUCCESS_TEXT

    invite_link = await create_invite_link(bot, channel_id) if channel_id else None

    bonus_days = user.referral_bonus_days or 0
    if bonus_days > 0:
        user.referral_bonus_days = 0

    sub = await create_subscription(user.id, tariff, invite_link=invite_link, bonus_days=bonus_days)

    await create_payment(
        user_id=user.id,
        product_type=product_type,
        product_id=tariff.id,
        amount=total_amount,
        currency="XTR",
        payment_method="stars",
        status="approved",
        telegram_charge_id=telegram_charge_id,
        provider_charge_id=provider_charge_id,
    )

    text = success_text
    if invite_link:
        text += f"\n\n🔗 <a href='{invite_link}'>Kanalga kirish</a>"
    await message.answer(text)


# ─── Card Payment ───────────────────────────────────────────────────

@signal_router.callback_query(F.data.startswith("card_"))
async def card_payment_handler(callback: CallbackQuery) -> None:
    tariff_id = callback.data.replace("card_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    card_num = await get_setting("card_number") or settings.CARD_NUMBER
    card_own = await get_setting("card_owner") or settings.CARD_HOLDER
    text = CARD_PAYMENT_TEXT.format(
        card_number=card_num,
        card_holder=card_own,
    )
    await safe_edit(callback.message, text, reply_markup=card_payment_kb(tariff.id))
    await callback.answer()


@signal_router.callback_query(F.data.startswith("upload_check_"))
async def upload_check_handler(callback: CallbackQuery, state: FSMContext) -> None:
    tariff_id = callback.data.replace("upload_check_", "")
    await state.set_state(PaymentStates.upload_receipt)
    await state.update_data(tariff_id=tariff_id, payment_method="check")
    await safe_edit(callback.message, CHECK_UPLOAD_TEXT, reply_markup=None)
    await callback.answer()


@signal_router.message(PaymentStates.upload_receipt, F.photo)
async def receipt_received_handler(message: Message, user: User, state: FSMContext, bot: Bot) -> None:
    data = await state.get_data()
    tariff_id = data.get("tariff_id")
    payment_method = data.get("payment_method", "check")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await message.answer("❌ Xatolik. Qayta urinib ko'ring.")
        await state.clear()
        return

    photo_file_id = message.photo[-1].file_id

    # Create pending payment
    payment = await create_payment(
        user_id=user.id,
        product_type="signal",
        product_id=tariff.id,
        amount=float(tariff.price),
        payment_method=payment_method,
        photo_file_id=photo_file_id,
    )

    # Send to all admins
    method_label = "🔗 TRON TRC20" if payment_method == "tron_trc20" else "💳 Karta/Check"
    admin_text = ADMIN_PAYMENT_NOTIFICATION.format(
        full_name=user.full_name,
        telegram_id=user.telegram_id,
        tariff_name=tariff.label,
        amount=float(tariff.price),
        payment_method=method_label,
        time=format_date(payment.created_at),
    )
    for admin_id in await get_admin_ids():
        try:
            msg = await bot.send_photo(
                chat_id=admin_id,
                photo=photo_file_id,
                caption=admin_text,
                reply_markup=admin_approval_kb(payment.id),
            )
            payment.admin_message_id = msg.message_id
        except Exception:
            pass

    receipt_text = TRON_RECEIVED_TEXT if payment_method == "tron_trc20" else CHECK_RECEIVED_TEXT
    await message.answer(receipt_text, reply_markup=check_uploaded_kb())
    await state.clear()


@signal_router.message(PaymentStates.upload_receipt)
async def invalid_receipt_handler(message: Message) -> None:
    await message.answer("❌ Iltimos, rasm (skrinshot) yuboring.")


# ─── TRON TRC20 Payment ──────────────────────────────────────────────

@signal_router.callback_query(F.data.startswith("tron_"))
async def tron_payment_handler(callback: CallbackQuery) -> None:
    tariff_id = callback.data.replace("tron_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    wallet_addr = await get_setting("ton_wallet_address") or settings.TON_WALLET_ADDRESS
    if not wallet_addr:
        await callback.answer("❌ TRON wallet sozlanmagan", show_alert=True)
        return

    text = TRON_PAYMENT_TEXT.format(wallet_address=wallet_addr)
    await safe_edit(callback.message, text, reply_markup=tron_payment_kb(tariff.id))
    await callback.answer()


@signal_router.callback_query(F.data.startswith("upload_tron_"))
async def upload_tron_handler(callback: CallbackQuery, state: FSMContext) -> None:
    tariff_id = callback.data.replace("upload_tron_", "")
    await state.set_state(PaymentStates.upload_receipt)
    await state.update_data(tariff_id=tariff_id, payment_method="tron_trc20")
    await safe_edit(callback.message, TRON_UPLOAD_TEXT, reply_markup=None)
    await callback.answer()


# ─── Admin Approval Callbacks ──────────────────────────────────────

@signal_router.callback_query(F.data.startswith("approve_"))
async def approve_payment_handler(callback: CallbackQuery, user: User, bot: Bot) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    payment_id = callback.data.replace("approve_", "")
    payment = await get_payment_by_id(payment_id)
    if not payment or payment.status != "pending":
        await callback.answer("❌ To'lov topilmadi yoki allaqachon ko'rib chiqilgan", show_alert=True)
        return

    from bot.services.payment_service import approve_payment as approve_pay
    payment = await approve_pay(payment_id, user.telegram_id)

    # Get tariff and user
    tariff = await get_tariff_by_id(payment.product_id)
    from bot.models.user import User as UserModel
    from bot.database.session import get_session
    from sqlalchemy import select
    async with get_session() as session:
        result = await session.execute(select(UserModel).where(UserModel.id == payment.user_id))
        target_user = result.scalar_one_or_none()

    if not target_user or not tariff:
        await callback.answer("❌ Xatolik", show_alert=True)
        return

    # Determine channel and text based on product_type
    product_type = payment.product_type or "signal"
    if product_type == "course":
        channel_id = await get_setting("course_channel_id") or ""
        approved_text = PAYMENT_APPROVED_COURSE_TEXT
    else:
        channel_id = await get_setting("private_channel_id") or settings.PRIVATE_CHANNEL_ID
        approved_text = PAYMENT_APPROVED_TEXT

    invite_link = await create_invite_link(bot, channel_id) if channel_id else None
    bonus_days = target_user.referral_bonus_days or 0
    if bonus_days > 0:
        target_user.referral_bonus_days = 0
    sub = await create_subscription(target_user.id, tariff, invite_link=invite_link, bonus_days=bonus_days)

    # Notify user
    try:
        text = approved_text.format(invite_link=invite_link or "❌ Link yaratilmadi")
        await bot.send_message(chat_id=target_user.telegram_id, text=text)
    except Exception:
        pass

    # Update admin message
    await safe_edit(
        callback.message,
        f"{callback.message.html_text}\n\n✅ <b>Admin tomonidan tasdiqlandi</b>",
        reply_markup=None,
    )
    await callback.answer("✅ Tasdiqlandi")


@signal_router.callback_query(F.data.startswith("reject_"))
async def reject_payment_handler(callback: CallbackQuery, user: User, bot: Bot) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    payment_id = callback.data.replace("reject_", "")
    payment = await get_payment_by_id(payment_id)
    if not payment or payment.status != "pending":
        await callback.answer("❌ To'lov topilmadi", show_alert=True)
        return

    from bot.services.payment_service import reject_payment as reject_pay
    payment = await reject_pay(payment_id, user.telegram_id)

    # Notify user
    from bot.models.user import User as UserModel
    from bot.database.session import get_session
    from sqlalchemy import select
    async with get_session() as session:
        result = await session.execute(select(UserModel).where(UserModel.id == payment.user_id))
        target_user = result.scalar_one_or_none()

    if target_user:
        try:
            await bot.send_message(chat_id=target_user.telegram_id, text=PAYMENT_REJECTED_TEXT)
        except Exception:
            pass

    await safe_edit(
        callback.message,
        f"{callback.message.html_text}\n\n❌ <b>Admin tomonidan rad etildi</b>",
        reply_markup=None,
    )
    await callback.answer("❌ Rad etildi")