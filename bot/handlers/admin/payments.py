from aiogram import Router, F
from aiogram.types import CallbackQuery, Message
from aiogram.fsm.context import FSMContext

from bot.config import settings
from bot.models.user import User
from bot.services.settings_service import get_admin_ids
from bot.services.payment_service import get_pending_payments
from bot.utils.keyboards import admin_approval_kb
from bot.utils.texts import ADMIN_PAYMENTS_EMPTY, ADMIN_PAYMENT_NOTIFICATION
from bot.utils.helpers import safe_edit, format_date

admin_payments_router = Router()


@admin_payments_router.callback_query(F.data == "admin_payments")
async def admin_payments_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    payments = await get_pending_payments()
    if not payments:
        await safe_edit(callback.message, ADMIN_PAYMENTS_EMPTY, reply_markup=None)
        await callback.answer()
        return

    for payment in payments:
        from bot.database.session import get_session
        from sqlalchemy import select
        from bot.models.user import User as UserModel
        from bot.models.tariff import SignalTariff

        async with get_session() as session:
            u_result = await session.execute(select(UserModel).where(UserModel.id == payment.user_id))
            target_user = u_result.scalar_one_or_none()
            t_result = await session.execute(select(SignalTariff).where(SignalTariff.id == payment.product_id))
            tariff = t_result.scalar_one_or_none()

        if not target_user or not tariff:
            continue

        text = ADMIN_PAYMENT_NOTIFICATION.format(
            full_name=target_user.full_name,
            telegram_id=target_user.telegram_id,
            tariff_name=tariff.label,
            amount=float(payment.amount),
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