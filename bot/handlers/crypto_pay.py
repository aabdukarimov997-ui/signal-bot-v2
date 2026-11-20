from aiogram import Bot, F, Router
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup

from bot.models.user import User
from bot.services.crypto_pay_service import create_invoice
from bot.services.subscription_service import get_tariff_by_id
from bot.utils.helpers import safe_edit
from bot.utils.texts import CRYPTO_PAY_GUIDE_TEXT

crypto_pay_router = Router()


@crypto_pay_router.callback_query(F.data.startswith("cpay_"))
async def crypto_pay_invoice(callback: CallbackQuery, user: User, bot: Bot) -> None:
    tariff = await get_tariff_by_id(callback.data.removeprefix("cpay_"))
    if not tariff or not tariff.is_active:
        await callback.answer("Tarif topilmadi", show_alert=True)
        return
    await callback.answer("Invoice yaratilmoqda")
    try:
        payment = await create_invoice(user.id, tariff)
    except ValueError as exc:
        await callback.message.answer(str(exc))
        return
    await safe_edit(
        callback.message,
        f"<b>Crypto Pay orqali qulay to'lov</b>\n\nSumma: {tariff.price} USDT\n"
        f"{CRYPTO_PAY_GUIDE_TEXT}\n\n"
        "Tasdiqlangan to'lov server orqali tekshiriladi va obuna avtomatik faollashadi.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="Crypto Pay invoice ochish", url=payment.telegram_charge_id)],
            [InlineKeyboardButton(text="Orqaga", callback_data=(
                f"course_pay_method_{tariff.id}" if tariff.product_type == "course" else f"pay_method_{tariff.id}"
            ))],
        ]),
    )
