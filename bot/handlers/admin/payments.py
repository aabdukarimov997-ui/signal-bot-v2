from aiogram import F, Router
from aiogram.types import CallbackQuery

from bot.models.user import User
from bot.services.payment_service import get_pending_payments
from bot.services.settings_service import get_admin_ids
from bot.utils.helpers import format_date, safe_edit
from bot.utils.keyboards import InlineKeyboardButton, InlineKeyboardMarkup, admin_approval_kb
from bot.utils.texts import ADMIN_PAYMENT_NOTIFICATION, ADMIN_PAYMENTS_EMPTY

admin_payments_router = Router()


@admin_payments_router.callback_query(F.data == "admin_payments")
async def admin_payments_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    payments = await get_pending_payments()
    if not payments:
        await safe_edit(
            callback.message,
            ADMIN_PAYMENTS_EMPTY,
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
                ]
            ),
        )
        await callback.answer()
        return

    for payment in payments:
        from sqlalchemy import select

        from bot.database.session import get_session
        from bot.models.tariff import SignalTariff
        from bot.models.user import User as UserModel

        async with get_session() as session:
            u_result = await session.execute(select(UserModel).where(UserModel.id == payment.user_id))
            target_user = u_result.scalar_one_or_none()
            t_result = await session.execute(select(SignalTariff).where(SignalTariff.id == payment.product_id))
            tariff = t_result.scalar_one_or_none()

        if not target_user or not tariff:
            continue

        method_label = (
            "🔗 TRON TRC20"
            if payment.payment_method == "tron_trc20"
            else ("⭐ Stars" if payment.payment_method == "stars" else "💳 Karta/Check")
        )
        text = ADMIN_PAYMENT_NOTIFICATION.format(
            invoice_id=payment.invoice_id or "???",
            full_name=target_user.full_name,
            telegram_id=target_user.telegram_id,
            tariff_name=tariff.label,
            amount=float(payment.amount),
            payment_method=method_label,
            time=format_date(payment.created_at),
        )

        if payment.photo_file_id:
            await callback.message.bot.send_photo(
                chat_id=callback.message.chat.id,
                photo=payment.photo_file_id,
                caption=text,
                reply_markup=admin_approval_kb(payment.id),
            )

    await callback.answer()
