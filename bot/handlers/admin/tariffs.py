from aiogram import Router, F
from aiogram.types import CallbackQuery, Message
from aiogram.fsm.context import FSMContext

from bot.config import settings
from bot.models.user import User
from bot.services.subscription_service import get_all_tariffs, get_tariff_by_id
from bot.utils.keyboards import admin_tariffs_kb
from bot.utils.texts import ADMIN_TARIFFS_TEXT
from bot.utils.states import AdminAddTariffStates
from bot.utils.helpers import safe_edit

admin_tariffs_router = Router()


@admin_tariffs_router.callback_query(F.data == "admin_tariffs")
async def admin_tariffs_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in settings.admin_ids:
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    tariffs = await get_all_tariffs()
    await safe_edit(callback.message, ADMIN_TARIFFS_TEXT, reply_markup=admin_tariffs_kb(tariffs))
    await callback.answer()


@admin_tariffs_router.callback_query(F.data.startswith("admin_tariff_"))
async def admin_tariff_detail_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in settings.admin_ids:
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    tariff_id = callback.data.replace("admin_tariff_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    from bot.database.session import get_session
    from sqlalchemy import select, update

    # Toggle active status
    async with get_session() as session:
        result = await session.execute(
            select(type(tariff)).where(type(tariff).id == tariff_id)
        )
        t = result.scalar_one_or_none()
        if t:
            t.is_active = not t.is_active

    tariffs = await get_all_tariffs()
    await safe_edit(callback.message, ADMIN_TARIFFS_TEXT, reply_markup=admin_tariffs_kb(tariffs))
    await callback.answer(f"✅ Tarif holati o'zgartirildi" if tariff.is_active else "❌ Tarif o'chirildi")


@admin_tariffs_router.callback_query(F.data == "admin_add_tariff")
async def admin_add_tariff_start(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in settings.admin_ids:
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    await state.set_state(AdminAddTariffStates.waiting_name)
    await safe_edit(callback.message, "📝 <b>Yangi tarif nomini kiriting:</b>\nMasalan: 1 oy", reply_markup=None)
    await callback.answer()


@admin_tariffs_router.message(AdminAddTariffStates.waiting_name)
async def admin_add_tariff_name(message: Message, state: FSMContext) -> None:
    await state.update_data(name=message.text)
    await state.set_state(AdminAddTariffStates.waiting_duration)
    await message.answer("📅 <b>Tarif muddatini kiriting (oylarda):</b>\nMasalan: 1, 3, 6")


@admin_tariffs_router.message(AdminAddTariffStates.waiting_duration)
async def admin_add_tariff_duration(message: Message, state: FSMContext) -> None:
    try:
        months = int(message.text)
        if months < 1:
            raise ValueError
    except ValueError:
        await message.answer("❌ Iltimos, to'g'ri son kiriting (1, 3, 6 va h.k.)")
        return
    await state.update_data(duration=months)
    await state.set_state(AdminAddTariffStates.waiting_price)
    await message.answer("💰 <b>Tarif narxini kiriting ($):</b>\nMasalan: 25")


@admin_tariffs_router.message(AdminAddTariffStates.waiting_price)
async def admin_add_tariff_price(message: Message, state: FSMContext) -> None:
    try:
        price = float(message.text)
        if price <= 0:
            raise ValueError
    except ValueError:
        await message.answer("❌ Iltimos, to'g'ri narx kiriting")
        return

    data = await state.get_data()
    name = data.get("name", f"{data['duration']} oy")
    duration = data["duration"]

    from bot.database.session import get_session
    from bot.models.tariff import SignalTariff

    async with get_session() as session:
        max_order = 0
        from sqlalchemy import select, func
        result = await session.execute(select(func.max(SignalTariff.sort_order)))
        max_order = (result.scalar() or 0) + 1

        tariff = SignalTariff(
            name=name,
            duration_months=duration,
            price=price,
            sort_order=max_order,
        )
        session.add(tariff)

    await state.clear()
    await message.answer(f"✅ Tarif qo'shildi: {name} — ${price:.0f} / {duration} oy")

    # Show updated tariffs
    tariffs = await get_all_tariffs()
    await message.answer(ADMIN_TARIFFS_TEXT, reply_markup=admin_tariffs_kb(tariffs))