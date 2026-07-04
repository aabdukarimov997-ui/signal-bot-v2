from aiogram import Router, F, Bot
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message, PreCheckoutQuery, LabeledPrice, ContentType

from bot.config import settings
from bot.models.user import User
from bot.models.tariff import SignalTariff
from bot.services.subscription_service import (
    get_all_tariffs,
    get_tariff_by_id,
    create_subscription,
)
from bot.services.payment_service import create_payment, get_payment_by_id
from bot.services.channel_service import create_invite_link
from bot.services.settings_service import get_setting, get_admin_ids
from bot.utils.keyboards import (
    course_tariff_selection_kb,
    course_payment_method_kb,
    course_card_payment_kb,
    course_tron_payment_kb,
    course_bnb_payment_kb,
    course_toncoin_payment_kb,
    check_uploaded_kb,
    admin_approval_kb,
)
from bot.utils.texts import (
    PAYMENT_METHOD_TEXT,
    STARS_SUCCESS_COURSE_TEXT,
    CARD_PAYMENT_TEXT,
    CHECK_UPLOAD_TEXT,
    CHECK_RECEIVED_TEXT,
    TRON_PAYMENT_TEXT,
    TRON_UPLOAD_TEXT,
    TRON_RECEIVED_TEXT,
    BNB_PAYMENT_TEXT,
    BNB_UPLOAD_TEXT,
    BNB_RECEIVED_TEXT,
    TON_PAYMENT_TEXT,
    TON_UPLOAD_TEXT,
    TON_RECEIVED_TEXT,
    PAYMENT_APPROVED_COURSE_TEXT,
    PAYMENT_REJECTED_TEXT,
    ADMIN_PAYMENT_NOTIFICATION,
)
from bot.utils.states import CoursePaymentStates
from bot.utils.helpers import safe_edit, format_date

course_router = Router()


def _build_course_text(course_name: str, course_description: str, tariffs: list[SignalTariff]) -> str:
    """Build course menu text with name, description, and tariff prices."""
    text = f"📚 <b>{course_name}</b>\n\n"
    if course_description:
        text += f"{course_description}\n\n"
    text += "Tariflar:"
    for t in tariffs:
        text += f"\n• {t.name} — ${float(t.price):.0f}"
    return text


# ─── Darslar Menu: Show Tariffs ─────────────────────────────────────

@course_router.message(F.text == "📚 Darslar")
async def course_menu_handler(message: Message, bot: Bot) -> None:
    tariffs = await get_all_tariffs("course")
    if not tariffs:
        await message.answer("❌ Hozircha darslar tariflar mavjud emas.")
        return

    course_name = await get_setting("course_tariff_name") or "Darslar"
    course_description = await get_setting("course_description") or ""
    course_image = await get_setting("course_image") or ""
    text = _build_course_text(course_name, course_description, tariffs)
    kb = course_tariff_selection_kb(tariffs)

    if course_image:
        try:
            await bot.send_photo(
                chat_id=message.chat.id,
                photo=course_image,
                caption=text,
                reply_markup=kb,
            )
        except Exception:
            await message.answer(text, reply_markup=kb)
    else:
        await message.answer(text, reply_markup=kb)


@course_router.callback_query(F.data == "back_course_tariffs")
async def back_course_tariffs_handler(callback: CallbackQuery, bot: Bot) -> None:
    tariffs = await get_all_tariffs("course")
    course_name = await get_setting("course_tariff_name") or "Darslar"
    course_description = await get_setting("course_description") or ""
    course_image = await get_setting("course_image") or ""
    text = _build_course_text(course_name, course_description, tariffs)
    kb = course_tariff_selection_kb(tariffs)

    if course_image:
        try:
            await bot.send_photo(
                chat_id=callback.message.chat.id,
                photo=course_image,
                caption=text,
                reply_markup=kb,
            )
        except Exception:
            await callback.message.answer(text, reply_markup=kb)
    else:
        await safe_edit(callback.message, text, reply_markup=kb)
    await callback.answer()


# ─── Select Course Tariff → Payment Method ──────────────────────────

@course_router.callback_query(F.data.startswith("course_tariff_"))
async def course_tariff_selected_handler(callback: CallbackQuery) -> None:
    tariff_id = callback.data.replace("course_tariff_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    text = (
        f"📚 <b>{tariff.name}</b>\n\n"
        f"💰 Narx: <b>${float(tariff.price):.0f}</b>\n"
        f"📅 Muddati: <b>{tariff.duration_months} oy</b>\n\n"
        f"{PAYMENT_METHOD_TEXT}"
    )
    await safe_edit(callback.message, text, reply_markup=course_payment_method_kb(tariff.id))
    await callback.answer()


@course_router.callback_query(F.data.startswith("course_pay_method_"))
async def course_pay_method_handler(callback: CallbackQuery) -> None:
    tariff_id = callback.data.replace("course_pay_method_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return
    text = (
        f"📚 <b>{tariff.name}</b>\n\n"
        f"💰 Narx: <b>${float(tariff.price):.0f}</b>\n\n"
        f"{PAYMENT_METHOD_TEXT}"
    )
    await safe_edit(callback.message, text, reply_markup=course_payment_method_kb(tariff.id))
    await callback.answer()


# ─── Telegram Stars Payment (Course) ────────────────────────────────

@course_router.callback_query(F.data.startswith("course_stars_"))
async def course_stars_payment_handler(callback: CallbackQuery, bot: Bot) -> None:
    tariff_id = callback.data.replace("course_stars_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    stars_key = f"course_stars_{tariff.duration_months}_month"
    stars_from_db = await get_setting(stars_key)
    stars_amount = int(stars_from_db) if stars_from_db else tariff.stars_price

    course_name = await get_setting("course_tariff_name") or "Darslar"
    prices = [LabeledPrice(label=tariff.name, amount=stars_amount)]
    await bot.send_invoice(
        chat_id=callback.message.chat.id,
        title=f"📚 {course_name} — {tariff.name}",
        description=f"{course_name} kanaliga {tariff.name} obuna",
        payload=f"course_stars_{tariff.id}",
        provider_token="",
        currency="XTR",
        prices=prices,
    )
    await callback.answer()


# ─── Card Payment (Course) ───────────────────────────────────────────

@course_router.callback_query(F.data.startswith("course_card_"))
async def course_card_payment_handler(callback: CallbackQuery) -> None:
    tariff_id = callback.data.replace("course_card_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    card_num = await get_setting("card_number") or settings.CARD_NUMBER
    card_own = await get_setting("card_owner") or settings.CARD_HOLDER
    text = CARD_PAYMENT_TEXT.format(card_number=card_num, card_holder=card_own)
    await safe_edit(callback.message, text, reply_markup=course_card_payment_kb(tariff.id))
    await callback.answer()


@course_router.callback_query(F.data.startswith("course_upload_check_"))
async def course_upload_check_handler(callback: CallbackQuery, state: FSMContext) -> None:
    tariff_id = callback.data.replace("course_upload_check_", "")
    await state.set_state(CoursePaymentStates.upload_receipt)
    await state.update_data(tariff_id=tariff_id, payment_method="check")
    await safe_edit(callback.message, CHECK_UPLOAD_TEXT, reply_markup=None)
    await callback.answer()


# ─── TRON TRC20 Payment (Course) ──────────────────────────────────────

@course_router.callback_query(F.data.startswith("course_tron_"))
async def course_tron_payment_handler(callback: CallbackQuery, bot: Bot) -> None:
    tariff_id = callback.data.replace("course_tron_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    wallet_addr = await get_setting("ton_wallet_address") or settings.TON_WALLET_ADDRESS
    qr_code = await get_setting("tron_qr_code")
    if not wallet_addr:
        await callback.answer("❌ TRON wallet sozlanmagan", show_alert=True)
        return

    text = TRON_PAYMENT_TEXT.format(wallet_address=wallet_addr)
    if qr_code:
        try:
            await callback.message.answer_photo(
                photo=qr_code,
                caption=text,
                reply_markup=course_tron_payment_kb(tariff.id)
            )
            await callback.message.delete()
        except Exception:
            await safe_edit(callback.message, text, reply_markup=course_tron_payment_kb(tariff.id))
    else:
        await safe_edit(callback.message, text, reply_markup=course_tron_payment_kb(tariff.id))
    await callback.answer()


@course_router.callback_query(F.data.startswith("course_upload_tron_"))
async def course_upload_tron_handler(callback: CallbackQuery, state: FSMContext) -> None:
    tariff_id = callback.data.replace("course_upload_tron_", "")
    await state.set_state(CoursePaymentStates.upload_receipt)
    await state.update_data(tariff_id=tariff_id, payment_method="tron_trc20")
    await safe_edit(callback.message, TRON_UPLOAD_TEXT, reply_markup=None)
    await callback.answer()


# ─── BNB BEP20 Payment (Course) ───────────────────────────────────────

@course_router.callback_query(F.data.startswith("course_bnb_"))
async def course_bnb_payment_handler(callback: CallbackQuery, bot: Bot) -> None:
    tariff_id = callback.data.replace("course_bnb_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    wallet_addr = await get_setting("bnb_wallet_address")
    qr_code = await get_setting("bnb_qr_code")
    if not wallet_addr:
        await callback.answer("❌ BNB wallet sozlanmagan", show_alert=True)
        return

    text = BNB_PAYMENT_TEXT.format(wallet_address=wallet_addr)
    if qr_code:
        try:
            await callback.message.answer_photo(
                photo=qr_code,
                caption=text,
                reply_markup=course_bnb_payment_kb(tariff.id)
            )
            await callback.message.delete()
        except Exception:
            await safe_edit(callback.message, text, reply_markup=course_bnb_payment_kb(tariff.id))
    else:
        await safe_edit(callback.message, text, reply_markup=course_bnb_payment_kb(tariff.id))
    await callback.answer()


@course_router.callback_query(F.data.startswith("course_upload_bnb_"))
async def course_upload_bnb_handler(callback: CallbackQuery, state: FSMContext) -> None:
    tariff_id = callback.data.replace("course_upload_bnb_", "")
    await state.set_state(CoursePaymentStates.upload_receipt)
    await state.update_data(tariff_id=tariff_id, payment_method="bnb")
    await safe_edit(callback.message, BNB_UPLOAD_TEXT, reply_markup=None)
    await callback.answer()


# ─── TON Payment (Course) ────────────────────────────────────────────

@course_router.callback_query(F.data.startswith("course_toncoin_"))
async def course_toncoin_payment_handler(callback: CallbackQuery, bot: Bot) -> None:
    tariff_id = callback.data.replace("course_toncoin_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    wallet_addr = await get_setting("toncoin_wallet_address")
    qr_code = await get_setting("toncoin_qr_code")
    if not wallet_addr:
        await callback.answer("❌ TON wallet sozlanmagan", show_alert=True)
        return

    text = TON_PAYMENT_TEXT.format(wallet_address=wallet_addr)
    if qr_code:
        try:
            await callback.message.answer_photo(
                photo=qr_code,
                caption=text,
                reply_markup=course_toncoin_payment_kb(tariff.id)
            )
            await callback.message.delete()
        except Exception:
            await safe_edit(callback.message, text, reply_markup=course_toncoin_payment_kb(tariff.id))
    else:
        await safe_edit(callback.message, text, reply_markup=course_toncoin_payment_kb(tariff.id))
    await callback.answer()


@course_router.callback_query(F.data.startswith("course_upload_toncoin_"))
async def course_upload_toncoin_handler(callback: CallbackQuery, state: FSMContext) -> None:
    tariff_id = callback.data.replace("course_upload_toncoin_", "")
    await state.set_state(CoursePaymentStates.upload_receipt)
    await state.update_data(tariff_id=tariff_id, payment_method="toncoin")
    await safe_edit(callback.message, TON_UPLOAD_TEXT, reply_markup=None)
    await callback.answer()


@course_router.message(CoursePaymentStates.upload_receipt, F.photo)
async def course_receipt_received_handler(message: Message, user: User, state: FSMContext, bot: Bot) -> None:
    data = await state.get_data()
    tariff_id = data.get("tariff_id")
    payment_method = data.get("payment_method", "check")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await message.answer("❌ Xatolik. Qayta urinib ko'ring.")
        await state.clear()
        return

    photo_file_id = message.photo[-1].file_id

    payment = await create_payment(
        user_id=user.id,
        product_type="course",
        product_id=tariff.id,
        amount=float(tariff.price),
        payment_method=payment_method,
        photo_file_id=photo_file_id,
    )

    if payment_method == "tron_trc20":
        method_label = "🔗 TRON TRC20"
    elif payment_method == "bnb":
        method_label = "🟡 BNB BEP20"
    elif payment_method == "toncoin":
        method_label = "💎 TON"
    else:
        method_label = "💳 Karta/Check"
    admin_text = ADMIN_PAYMENT_NOTIFICATION.format(
        full_name=user.full_name,
        telegram_id=user.telegram_id,
        tariff_name=f"📚 Darslar: {tariff.name}",
        amount=float(tariff.price),
        payment_method=method_label,
        time=format_date(payment.created_at),
    )

    # Fix detached instance: update admin_message_id via service
    for admin_id in await get_admin_ids():
        try:
            msg = await bot.send_photo(
                chat_id=admin_id,
                photo=photo_file_id,
                caption=admin_text,
                reply_markup=admin_approval_kb(payment.id),
            )
            from bot.database.session import get_session
            from sqlalchemy import select, update
            from bot.models.payment import Payment
            async with get_session() as session:
                await session.execute(
                    update(Payment).where(Payment.id == payment.id).values(admin_message_id=msg.message_id)
                )
        except Exception:
            pass

    receipt_text = (
        BNB_RECEIVED_TEXT
        if payment_method == "bnb"
        else (
            TRON_RECEIVED_TEXT
            if payment_method == "tron_trc20"
            else (
                TON_RECEIVED_TEXT
                if payment_method == "toncoin"
                else CHECK_RECEIVED_TEXT
            )
        )
    )
    await message.answer(receipt_text, reply_markup=check_uploaded_kb())
    await state.clear()


@course_router.message(CoursePaymentStates.upload_receipt)
async def course_invalid_receipt_handler(message: Message) -> None:
    await message.answer("❌ Iltimos, rasm (skrinshot) yuboring.")
