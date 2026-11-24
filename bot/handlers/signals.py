import contextlib

from aiogram import Bot, F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, ContentType, Message, PreCheckoutQuery

from bot.config import settings
from bot.models.user import User
from bot.services.channel_service import get_course_invite_links, get_invite_link, get_signal_channel_id
from bot.services.exchange_service import format_payment_with_uzs
from bot.services.payment_service import create_crypto_invoice, create_payment, get_payment_by_id
from bot.services.pricing_service import Price, build_price
from bot.services.settings_service import get_admin_ids, get_enabled_payment_methods, get_setting
from bot.services.subscription_service import (
    create_subscription,
    get_active_subscription_by_type,
    get_all_tariffs,
    get_tariff_by_id,
)
from bot.services.user_service import consume_referral_bonus_days
from bot.utils.helpers import format_date, safe_edit, safe_send
from bot.utils.keyboards import (
    admin_approval_kb,
    bnb_payment_kb,
    cancel_upload_kb,
    card_payment_kb,
    check_uploaded_kb,
    course_channels_kb,
    payment_method_kb,
    tariff_selection_kb,
    toncoin_payment_kb,
    tron_payment_kb,
    visa_payment_kb,
)
from bot.utils.states import PaymentStates
from bot.utils.texts import (
    ACTIVE_SUB_DISCOUNT_NOTICE_TEXT,
    ADMIN_PAYMENT_NOTIFICATION,
    ALREADY_SUBSCRIBED_TEXT,
    BNB_PAYMENT_TEXT,
    BNB_RECEIVED_TEXT,
    CARD_PAYMENT_TEXT,
    CHECK_RECEIVED_TEXT,
    CHECK_UPLOAD_TEXT,
    PAYMENT_METHOD_TEXT,
    PAYMENT_REJECTED_TEXT,
    SIGNAL_TEXT,
    STARS_SUCCESS_COURSE_TEXT,
    STARS_SUCCESS_TEXT,
    TON_PAYMENT_TEXT,
    TON_RECEIVED_TEXT,
    TON_UPLOAD_TEXT,
    TRON_PAYMENT_TEXT,
    TRON_RECEIVED_TEXT,
    VISA_PAYMENT_TEXT,
    VISA_RECEIVED_TEXT,
    VISA_UPLOAD_TEXT,
)

signal_router = Router()


# ─── Helper: Send Signal Subscription Message ──────────────────────


async def send_signal_menu(
    target: Message | CallbackQuery,
    tariffs: list,
    bot: Bot,
    is_edit: bool = False,
    prices: dict[str, Price] | None = None,
) -> None:
    """Send the VIP signal subscription message with optional photo/video from DB settings."""
    signal_msg = await get_setting("signal_message") or SIGNAL_TEXT
    signal_img = await get_setting("signal_image")
    signal_vid = await get_setting("signal_video")

    if not tariffs:
        signal_msg += "\n\n❌ Hozircha tariflar mavjud emas."

    kb = tariff_selection_kb(tariffs, prices) if tariffs else None
    message = target if isinstance(target, Message) else target.message

    # Priority: video > image > text-only (with fallback chain)
    sent = False

    if signal_vid:
        try:
            await bot.send_video(chat_id=message.chat.id, video=signal_vid, caption=signal_msg, reply_markup=kb)
            sent = True
            if is_edit:
                with contextlib.suppress(Exception):
                    await message.delete()
        except Exception:
            pass  # Video ishlamadi — rasmga o'tamiz

    if not sent and signal_img:
        try:
            await bot.send_photo(chat_id=message.chat.id, photo=signal_img, caption=signal_msg, reply_markup=kb)
            sent = True
            if is_edit:
                with contextlib.suppress(Exception):
                    await message.delete()
        except Exception:
            pass  # Rasm ishlamadi — matnga o'tamiz

    if not sent:
        if is_edit:
            await safe_edit(message, signal_msg, reply_markup=kb)
        else:
            await safe_send(message, signal_msg, reply_markup=kb)


async def _notify_active_subscription(
    message: Message,
    tariffs: list,
    prices: dict[str, Price],
) -> None:
    """Faol obunasi bor foydalanuvchiga bitta qisqa xabar (chegirma yoki eslatma)."""
    price = prices.get(tariffs[0].id) if tariffs and prices else None
    if price is not None and price.has_discount:
        await message.answer(ACTIVE_SUB_DISCOUNT_NOTICE_TEXT.format(discount=price.discount_percent))
    else:
        await message.answer(ALREADY_SUBSCRIBED_TEXT)


# ─── Signal Menu: Show Tariffs ─────────────────────────────────────


@signal_router.message(F.text == "📈 Signal kanal")
async def signal_menu_handler(message: Message, user: User, bot: Bot) -> None:
    tariffs = await get_all_tariffs("signal")
    if not tariffs:
        await message.answer("❌ Hozircha tariflar mavjud emas.")
        return

    prices = {t.id: await build_price(user.id, float(t.price), "signal") for t in tariffs}

    # Faol obunasi bor bo'lsa ham tariflarni ko'rsatamiz — uzaytirishda chegirma beriladi.
    if await get_active_subscription_by_type(user.id, "signal"):
        await _notify_active_subscription(message, tariffs, prices)
    await send_signal_menu(message, tariffs, bot, prices=prices)


@signal_router.callback_query(F.data == "back_tariffs")
async def back_tariffs_handler(callback: CallbackQuery, user: User, bot: Bot) -> None:
    tariffs = await get_all_tariffs("signal")
    prices = {t.id: await build_price(user.id, float(t.price), "signal") for t in tariffs}
    await send_signal_menu(callback, tariffs, bot, is_edit=True, prices=prices)
    await callback.answer()


# ─── Select Tariff → Payment Method ────────────────────────────────


@signal_router.callback_query(F.data.startswith("tariff_"))
async def tariff_selected_handler(callback: CallbackQuery, user: User) -> None:
    tariff_id = callback.data.replace("tariff_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    enabled_methods = await get_enabled_payment_methods()
    price = await build_price(user.id, float(tariff.price), "signal")
    text = (
        f"📈 <b>{tariff.label}</b>\n\n"
        f"💰 Narx: {price.format_html()}\n"
        f"📅 Muddati: <b>{tariff.duration_display}</b>\n\n"
        f"{PAYMENT_METHOD_TEXT}"
    )
    await safe_edit(callback.message, text, reply_markup=payment_method_kb(tariff.id, enabled_methods))
    await callback.answer()


@signal_router.callback_query(F.data.startswith("pay_method_"))
async def pay_method_handler(callback: CallbackQuery, user: User) -> None:
    tariff_id = callback.data.replace("pay_method_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return
    enabled_methods = await get_enabled_payment_methods()
    price = await build_price(user.id, float(tariff.price), "signal")
    text = f"📈 <b>{tariff.label}</b>\n\n💰 Narx: {price.format_html()}\n\n{PAYMENT_METHOD_TEXT}"
    await safe_edit(callback.message, text, reply_markup=payment_method_kb(tariff.id, enabled_methods))
    await callback.answer()


# ─── Visa Payment ───────────────────────────────────────────────────


@signal_router.callback_query(F.data.startswith("visa_"))
async def visa_payment_handler(callback: CallbackQuery, user: User) -> None:
    tariff_id = callback.data.replace("visa_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    card_num = await get_setting("visa_card_number") or await get_setting("card_number") or settings.CARD_NUMBER
    card_own = await get_setting("visa_card_holder") or await get_setting("card_owner") or settings.CARD_HOLDER
    price = await build_price(user.id, float(tariff.price), "signal")
    text, rate = await format_payment_with_uzs(
        usd_amount=price.final,
        template=VISA_PAYMENT_TEXT,
        card_number=card_num,
        card_holder=card_own,
        usd_label=price.format_final(),
    )
    await safe_edit(callback.message, text, reply_markup=visa_payment_kb(tariff.id))
    await callback.answer()


@signal_router.callback_query(F.data.startswith("upload_visa_"))
async def upload_visa_handler(callback: CallbackQuery, state: FSMContext) -> None:
    tariff_id = callback.data.replace("upload_visa_", "")
    await state.set_state(PaymentStates.upload_receipt)
    await state.update_data(tariff_id=tariff_id, payment_method="visa")
    await safe_edit(callback.message, VISA_UPLOAD_TEXT, reply_markup=cancel_upload_kb())
    await callback.answer()


# ─── Stars Pre-Checkout & Successful Payment ──────────────────────────


@signal_router.pre_checkout_query(lambda q: True)
async def pre_checkout_handler(pre_checkout_q: PreCheckoutQuery) -> None:
    await pre_checkout_q.answer(ok=True)


@signal_router.message(F.content_type == ContentType.SUCCESSFUL_PAYMENT)
async def successful_payment_handler(message: Message, user: User, bot: Bot) -> None:
    payload = message.successful_payment.invoice_payload
    telegram_charge_id = message.successful_payment.telegram_payment_charge_id
    provider_charge_id = message.successful_payment.provider_payment_charge_id
    total_amount = message.successful_payment.total_amount
    # XTR (Stars) butun yulduz birligida keladi — 100 ga bo'lish shart emas.
    # Boshqa valyutalar (USD va h.k.) minimal birlikda keladi, ularni 100 ga bo'lamiz.
    if message.successful_payment.currency != "XTR":
        total_amount = total_amount / 100

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
        success_text = STARS_SUCCESS_COURSE_TEXT
        channels = await get_course_invite_links(bot)
        bonus_days = await consume_referral_bonus_days(user.id, user.referral_bonus_days or 0)
        first_link = channels[0]["link"] if channels else None
        await create_subscription(user.id, tariff, invite_link=first_link, bonus_days=bonus_days)

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

        if channels:
            text = success_text + "\n\nDarslar kanallariga kirish uchun quyidagi havolalardan foydalaning:"
            await message.answer(text, reply_markup=course_channels_kb(channels))
        else:
            text = success_text + "\n\n❌ Linklar yaratilmadi"
            await message.answer(text)
        return
    else:
        channel_id = await get_signal_channel_id(tariff=tariff)
        success_text = STARS_SUCCESS_TEXT

    invite_link = await get_invite_link(bot, channel_id) if channel_id else None

    bonus_days = await consume_referral_bonus_days(user.id, user.referral_bonus_days or 0)

    await create_subscription(user.id, tariff, invite_link=invite_link, bonus_days=bonus_days)

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
        text += f"\n\n🔗 <a href='{invite_link}'>Kanalga kirish</a>\n\n⚠️ Link faqat 1 marta ishlatilishi mumkin."
        await message.answer(text, disable_web_page_preview=True)
    else:
        text += "\n\n❌ Link yaratilmadi"
        await message.answer(text, disable_web_page_preview=True)

    # 6 oylik signal obunasi uchun 1 oylik Telegram Premium sovg'a
    if product_type == "signal" and tariff.duration_months == 6:
        gift_link = await get_setting("premium_gift_link")
        if gift_link:
            await message.answer(
                "🎁 <b>Tabriklaymiz!</b>\n\n"
                "6 oylik obuna sotib olganingiz uchun sizga <b>1 oylik Telegram Premium</b> sovg'a qilindi!\n\n"
                f"Premium ni faollashtirish uchun havolaga o'ting:\n{gift_link}",
                disable_web_page_preview=True,
            )
        else:
            await message.answer(
                "🎁 <b>Tabriklaymiz!</b>\n\n"
                "6 oylik obuna sotib olganingiz uchun sizga <b>1 oylik Telegram Premium</b> sovg'a qilindi!\n\n"
                "Admin tez orada siz bilan bog'lanib, Premium ni faollashtirib beradi."
            )
            # Admin ga xabar yuborish
            admin_ids = await get_admin_ids()
            for admin_id in admin_ids:
                with contextlib.suppress(Exception):
                    await bot.send_message(
                        admin_id,
                        f"🎁 <b>Telegram Premium sovg'a!</b>\n\n"
                        f"👤 Foydalanuvchi: {user.full_name}\n"
                        f"🆔 ID: <code>{user.telegram_id}</code>\n\n"
                        f"6 oylik obuna sotib oldi. Premium sovg'a linkini yuboring!",
                    )


# ─── Card Payment ───────────────────────────────────────────────────

# ─── Helper: refresh exchange rate ────────────────────────────────────


async def _refresh_rate_and_reply(
    callback: CallbackQuery,
    user: User,
    tariff_id: str,
    template: str,
    card_num_key: str,
    card_holder_key: str,
    kb_func,
) -> None:
    """Umumiy helper — kursni yangilab, tumanni qayta ko'rsatadi."""
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    card_num = await get_setting(card_num_key) or settings.CARD_NUMBER
    card_own = await get_setting(card_holder_key) or settings.CARD_HOLDER
    price = await build_price(user.id, float(tariff.price), "signal")

    text, rate = await format_payment_with_uzs(
        usd_amount=price.final,
        usd_label=price.format_final(),
        template=template,
        card_number=card_num,
        card_holder=card_own,
        force_refresh=True,  # Cache'ni tozalab yangi kurs oladi
    )
    await safe_edit(callback.message, text, reply_markup=kb_func(tariff.id))
    rate_str = f"{rate:,.0f}".replace(",", " ")
    await callback.answer(f"✅ Kurs yangilandi: 1 USD = {rate_str} UZS", show_alert=False)


# ─── Refresh Exchange Rate ────────────────────────────────────────────


@signal_router.callback_query(F.data.startswith("refresh_card_"))
async def refresh_card_rate_handler(callback: CallbackQuery, user: User) -> None:
    tariff_id = callback.data.replace("refresh_card_", "")
    await _refresh_rate_and_reply(
        callback,
        user,
        tariff_id,
        CARD_PAYMENT_TEXT,
        "card_number",
        "card_owner",
        card_payment_kb,
    )


@signal_router.callback_query(F.data.startswith("refresh_visa_"))
async def refresh_visa_rate_handler(callback: CallbackQuery, user: User) -> None:
    tariff_id = callback.data.replace("refresh_visa_", "")
    await _refresh_rate_and_reply(
        callback,
        user,
        tariff_id,
        VISA_PAYMENT_TEXT,
        "visa_card_number",
        "visa_card_holder",
        visa_payment_kb,
    )


@signal_router.callback_query(F.data.startswith("card_"))
async def card_payment_handler(callback: CallbackQuery, user: User) -> None:
    tariff_id = callback.data.replace("card_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    card_num = await get_setting("card_number") or settings.CARD_NUMBER
    card_own = await get_setting("card_owner") or settings.CARD_HOLDER
    price = await build_price(user.id, float(tariff.price), "signal")
    text, rate = await format_payment_with_uzs(
        usd_amount=price.final,
        template=CARD_PAYMENT_TEXT,
        card_number=card_num,
        card_holder=card_own,
        usd_label=price.format_final(),
    )
    await safe_edit(callback.message, text, reply_markup=card_payment_kb(tariff.id))
    await callback.answer()


@signal_router.callback_query(F.data.startswith("upload_check_"))
async def upload_check_handler(callback: CallbackQuery, state: FSMContext) -> None:
    tariff_id = callback.data.replace("upload_check_", "")
    await state.set_state(PaymentStates.upload_receipt)
    await state.update_data(tariff_id=tariff_id, payment_method="check")
    await safe_edit(callback.message, CHECK_UPLOAD_TEXT, reply_markup=cancel_upload_kb())
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
    price = await build_price(user.id, float(tariff.price), "signal")

    # Create pending payment (chegirma hisobga olingan summa)
    payment = await create_payment(
        user_id=user.id,
        product_type="signal",
        product_id=tariff.id,
        amount=price.final,
        discount=price.saved,
        payment_method=payment_method,
        photo_file_id=photo_file_id,
    )

    # Send to all admins
    if payment_method == "tron_trc20":
        method_label = "🔗 TRON TRC20"
    elif payment_method == "bnb":
        method_label = "🟡 BNB BEP20"
    elif payment_method == "visa":
        method_label = "💳 Visa karta"
    else:
        method_label = "💳 UZCARD/HUMO"
    admin_text = ADMIN_PAYMENT_NOTIFICATION.format(
        invoice_id=payment.invoice_id or "???",
        full_name=user.full_name,
        telegram_id=user.telegram_id,
        tariff_name=tariff.label,
        amount=price.final,
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

    receipt_text = (
        VISA_RECEIVED_TEXT
        if payment_method == "visa"
        else (
            BNB_RECEIVED_TEXT
            if payment_method == "bnb"
            else (
                TRON_RECEIVED_TEXT
                if payment_method == "tron_trc20"
                else (TON_RECEIVED_TEXT if payment_method == "toncoin" else CHECK_RECEIVED_TEXT)
            )
        )
    )
    await message.answer(receipt_text, reply_markup=check_uploaded_kb())
    await state.clear()


@signal_router.message(PaymentStates.upload_receipt)
async def invalid_receipt_handler(message: Message) -> None:
    await message.answer("❌ Iltimos, rasm (skrinshot) yuboring.")


@signal_router.callback_query(F.data == "cancel_upload", PaymentStates.upload_receipt)
async def cancel_upload_handler(callback: CallbackQuery, user: User, state: FSMContext, bot: Bot) -> None:
    await state.clear()
    tariffs = await get_all_tariffs("signal")
    prices = {t.id: await build_price(user.id, float(t.price), "signal") for t in tariffs}
    await send_signal_menu(callback, tariffs, bot, is_edit=True, prices=prices)
    await callback.answer("❌ Bekor qilindi")


# ─── TRON TRC20 Payment ──────────────────────────────────────────────


@signal_router.callback_query(F.data.startswith("tron_"))
async def tron_payment_handler(callback: CallbackQuery, user: User, bot: Bot) -> None:
    tariff_id = callback.data.replace("tron_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    # Avtomatik to'lov — chegirma hisobga olingan summa bilan invoice yaratamiz
    price = await build_price(user.id, float(tariff.price), tariff.product_type or "signal")
    try:
        payment = await create_crypto_invoice(
            user_id=user.id,
            product_type=tariff.product_type or "signal",
            product_id=tariff.id,
            network="tron",
            amount=price.final,
            discount=price.saved,
        )
    except ValueError:
        await callback.answer("❌ TRON wallet sozlanmagan", show_alert=True)
        return

    qr_code = await get_setting("tron_qr_code")
    text = TRON_PAYMENT_TEXT.format(
        wallet_address=payment.crypto_address,
        amount=f"{float(payment.crypto_amount):.4f}",
    )
    kb = tron_payment_kb(tariff.id, payment.id)
    if qr_code:
        try:
            await callback.message.answer_photo(photo=qr_code, caption=text, reply_markup=kb)
            await callback.message.delete()
        except Exception:
            await safe_edit(callback.message, text, reply_markup=kb)
    else:
        await safe_edit(callback.message, text, reply_markup=kb)
    await callback.answer()


# ─── BNB BEP20 Payment ──────────────────────────────────────────────


@signal_router.callback_query(F.data.startswith("bnb_"))
async def bnb_payment_handler(callback: CallbackQuery, user: User, bot: Bot) -> None:
    tariff_id = callback.data.replace("bnb_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    price = await build_price(user.id, float(tariff.price), tariff.product_type or "signal")
    try:
        payment = await create_crypto_invoice(
            user_id=user.id,
            product_type=tariff.product_type or "signal",
            product_id=tariff.id,
            network="bnb",
            amount=price.final,
            discount=price.saved,
        )
    except ValueError:
        await callback.answer("❌ BNB wallet sozlanmagan", show_alert=True)
        return

    qr_code = await get_setting("bnb_qr_code")
    text = BNB_PAYMENT_TEXT.format(
        wallet_address=payment.crypto_address,
        amount=f"{float(payment.crypto_amount):.4f}",
    )
    kb = bnb_payment_kb(tariff.id, payment.id)
    if qr_code:
        try:
            await callback.message.answer_photo(photo=qr_code, caption=text, reply_markup=kb)
            await callback.message.delete()
        except Exception:
            await safe_edit(callback.message, text, reply_markup=kb)
    else:
        await safe_edit(callback.message, text, reply_markup=kb)
    await callback.answer()


@signal_router.callback_query(F.data.startswith("toncoin_"))
async def toncoin_payment_handler(callback: CallbackQuery, bot: Bot) -> None:
    tariff_id = callback.data.replace("toncoin_", "")
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
            await callback.message.answer_photo(photo=qr_code, caption=text, reply_markup=toncoin_payment_kb(tariff.id))
            await callback.message.delete()
        except Exception:
            await safe_edit(callback.message, text, reply_markup=toncoin_payment_kb(tariff.id))
    else:
        await safe_edit(callback.message, text, reply_markup=toncoin_payment_kb(tariff.id))
    await callback.answer()


@signal_router.callback_query(F.data.startswith("upload_toncoin_"))
async def upload_toncoin_handler(callback: CallbackQuery, state: FSMContext) -> None:
    tariff_id = callback.data.replace("upload_toncoin_", "")
    await state.set_state(PaymentStates.upload_receipt)
    await state.update_data(tariff_id=tariff_id, payment_method="toncoin")
    await safe_edit(callback.message, TON_UPLOAD_TEXT, reply_markup=cancel_upload_kb())
    await callback.answer()


# ─── Kripto to'lovni qo'lda tekshirish ────────────────────────────


@signal_router.callback_query(F.data.startswith("check_crypto_"))
async def check_crypto_handler(callback: CallbackQuery, bot: Bot) -> None:
    """Foydalanuvchi "To'lovni tekshirish" tugmasini bosganda darhol tekshiradi."""
    payment_id = callback.data.replace("check_crypto_", "")
    payment = await get_payment_by_id(payment_id)
    if not payment:
        await callback.answer("❌ To'lov topilmadi", show_alert=True)
        return
    if payment.status == "approved":
        await callback.answer("✅ To'lov allaqachon tasdiqlangan", show_alert=True)
        return
    if payment.status != "pending":
        await callback.answer("❌ To'lov muddati tugagan", show_alert=True)
        return
    if not payment.crypto_network:
        await callback.answer("❌ Bu to'lov avtomatik emas", show_alert=True)
        return

    from bot.services.crypto_service import check_network_payments
    from bot.services.payment_finalizer import finalize_crypto_payment

    await callback.answer("🔎 Blokcheyn tekshirilmoqda...")

    confirmed = await check_network_payments(payment.crypto_network, bot)
    for item in confirmed:
        if item["payment_id"] != payment_id:
            continue
        await finalize_crypto_payment(bot, item["payment_id"], item["tx_hash"])
        await safe_edit(
            callback.message,
            "✅ <b>To'lov tasdiqlandi!</b>\n\n"
            "Blokcheyndagi tranzaksiya aniqlandi va obuna avtomatik faollashtirildi.\n"
            "Kanalga kirish havolasi yuborildi.",
            reply_markup=None,
        )
        return

    # Boshqa payment ham tasdiqlangan bo'lishi mumkin — ularni ham yakunlaymiz
    for item in confirmed:
        if item["payment_id"] != payment_id:
            await finalize_crypto_payment(bot, item["payment_id"], item["tx_hash"])

    await callback.answer(
        "⏳ To'lov hali topilmadi. Tranzaksiya tasdiqlanishi 1-2 daqiqa olishi mumkin. "
        "Birozdan so'ng qayta tekshiring.",
        show_alert=True,
    )


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

    from bot.services.payment_finalizer import finalize_payment
    from bot.services.payment_service import approve_payment as approve_pay

    if payment.payment_method in {"crypto_pay", "tron_trc20", "bnb"}:
        await callback.answer("Bu to'lov faqat avtomatik tekshiruv orqali tasdiqlanadi", show_alert=True)
        return

    payment = await approve_pay(payment_id, user.telegram_id)
    if not payment:
        await callback.answer("❌ Xatolik", show_alert=True)
        return

    ok = await finalize_payment(bot, payment)
    if not ok:
        await callback.answer("❌ Tarif yoki foydalanuvchi topilmadi", show_alert=True)
        return

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
    from sqlalchemy import select

    from bot.database.session import get_session
    from bot.models.user import User as UserModel

    async with get_session() as session:
        result = await session.execute(select(UserModel).where(UserModel.id == payment.user_id))
        target_user = result.scalar_one_or_none()

    if target_user:
        with contextlib.suppress(Exception):
            await bot.send_message(chat_id=target_user.telegram_id, text=PAYMENT_REJECTED_TEXT)

    await safe_edit(
        callback.message,
        f"{callback.message.html_text}\n\n❌ <b>Admin tomonidan rad etildi</b>",
        reply_markup=None,
    )
    await callback.answer("❌ Rad etildi")
