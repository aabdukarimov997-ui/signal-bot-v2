from typing import Optional

from aiogram import Router, F
from aiogram.types import CallbackQuery, Message
from aiogram.fsm.context import FSMContext

from bot.config import settings
from bot.models.user import User
from bot.services.settings_service import get_admin_ids
from bot.services.subscription_service import get_all_tariffs, get_tariff_by_id
from bot.utils.keyboards import admin_tariffs_kb, skip_channel_kb
from bot.utils.texts import ADMIN_TARIFFS_TEXT
from bot.utils.states import AdminAddTariffStates, AdminEditTariffStates
from bot.utils.helpers import safe_edit

admin_tariffs_router = Router()


@admin_tariffs_router.callback_query(F.data == "admin_tariffs")
async def admin_tariffs_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    tariffs = await get_all_tariffs()
    await safe_edit(callback.message, ADMIN_TARIFFS_TEXT, reply_markup=admin_tariffs_kb(tariffs))
    await callback.answer()


@admin_tariffs_router.callback_query(F.data.startswith("admin_tariff_"))
async def admin_tariff_detail_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
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
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    await state.set_state(AdminAddTariffStates.waiting_name)
    await safe_edit(callback.message, "📝 <b>Yangi tarif nomini kiriting:</b>\nMasalan: 1 oy", reply_markup=None)
    await callback.answer()


@admin_tariffs_router.message(AdminAddTariffStates.waiting_name)
async def admin_add_tariff_name(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, matn yuboring.")
        return
    await state.update_data(name=message.text.strip() or "—")
    await state.set_state(AdminAddTariffStates.waiting_duration)
    await message.answer("📅 <b>Tarif muddatini kiriting (oylarda):</b>\nMasalan: 1, 3, 6")


@admin_tariffs_router.message(AdminAddTariffStates.waiting_duration)
async def admin_add_tariff_duration(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, son kiriting.")
        return
    try:
        months = int(message.text.strip())
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
    if message.text is None:
        await message.answer("❌ Iltimos, narx kiriting.")
        return
    try:
        price = float(message.text.strip())
        if price <= 0:
            raise ValueError
    except ValueError:
        await message.answer("❌ Iltimos, to'g'ri narx kiriting")
        return

    await state.update_data(price=price)
    await state.set_state(AdminAddTariffStates.waiting_channel)

    channel_text = (
        "🔗 <b>Maxfiy kanal ID (ixtiyoriy):</b>\n\n"
        "Agar ushbu tarif o'zining alohida maxfiy kanaliga ega bo'lishi kerak bo'lsa, "
        "kanal ID sini yuboring.\n\n"
        "Masalan: <code>-1002271613164</code>\n"
        "(ID @username_infobot'dan oling)\n\n"
        "⚠️ <b>Bo'sh yuborsangiz</b> — umumiy kanal (private_channel_id) ishlatiladi.\n\n"
        "Yoki pastdagi ➡️ O'tkazib yuborish tugmasini bosing:"
    )
    await message.answer(channel_text, reply_markup=skip_channel_kb())


@admin_tariffs_router.message(AdminAddTariffStates.waiting_channel)
async def admin_add_tariff_channel(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, kanal ID yoki bo'sh qoldirish uchun pastdagi tugmani bosing.")
        return

    channel_id = message.text.strip() or None
    await _save_new_tariff(state, channel_id, message)


@admin_tariffs_router.callback_query(F.data == "skip_tariff_channel", AdminAddTariffStates.waiting_channel)
async def admin_add_tariff_channel_skip(callback: CallbackQuery, state: FSMContext) -> None:
    await callback.answer()
    await _save_new_tariff(state, None, callback.message)


async def _save_new_tariff(state: FSMContext, channel_id: Optional[str], msg: Message) -> None:
    data = await state.get_data()
    name = data.get("name", f"{data.get('duration', 1)} oy")
    duration = data.get("duration", 1)
    price = data.get("price", 0)

    from bot.database.session import get_session
    from bot.models.tariff import SignalTariff
    from sqlalchemy import select, func

    async with get_session() as session:
        result = await session.execute(select(func.max(SignalTariff.sort_order)))
        max_order = (result.scalar() or 0) + 1

        tariff = SignalTariff(
            name=name,
            duration_months=duration,
            price=price,
            sort_order=max_order,
            channel_id=channel_id,
        )
        session.add(tariff)

    await state.clear()

    channel_info = f"\n🔗 Kanal: <code>{channel_id}</code>" if channel_id else ""
    await msg.answer(
        f"✅ <b>Tarif qo'shildi!</b>\n\n"
        f"📛 Nomi: {name}\n"
        f"💰 Narx: ${price:.0f}\n"
        f"📅 Muddat: {duration} oy{channel_info}"
    )

    # Show updated tariffs
    tariffs = await get_all_tariffs()
    await msg.answer(ADMIN_TARIFFS_TEXT, reply_markup=admin_tariffs_kb(tariffs))


# ─── Edit Tariff ─────────────────────────────────────────────────────

@admin_tariffs_router.callback_query(F.data.startswith("edit_tariff_"))
async def admin_edit_tariff_start(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    tariff_id = callback.data.replace("edit_tariff_", "")
    tariff = await get_tariff_by_id(tariff_id)
    if not tariff:
        await callback.answer("❌ Tarif topilmadi", show_alert=True)
        return

    await state.update_data(tariff_id=tariff_id)
    await state.set_state(AdminEditTariffStates.waiting_field)

    text = (
        f"✏️ <b>Tarifni tahrirlash: {tariff.label}</b>\n\n"
        f"Hozirgi: {tariff.label} — ${float(tariff.price):.0f} / {tariff.duration_months} oy\n"
        f"Kanal: {tariff.channel_id or 'umumiy (private_channel_id)'}\n\n"
        f"Qaysi maydonni o'zgartirmoqchisiz?\n"
        f"1️⃣ — Nomi\n"
        f"2️⃣ — Narx\n"
        f"3️⃣ — Muddat (oy)\n"
        f"4️⃣ — Maxfiy kanal ID"
    )
    await safe_edit(callback.message, text, reply_markup=None)
    await callback.answer()


@admin_tariffs_router.message(AdminEditTariffStates.waiting_field)
async def admin_edit_tariff_field(message: Message, state: FSMContext) -> None:
    if message.text is None:
        await message.answer("❌ Iltimos, 1, 2, 3 yoki 4 kiriting.")
        return
    field_map = {"1": "name", "2": "price", "3": "duration", "4": "channel"}
    field = field_map.get(message.text.strip())
    if not field:
        await message.answer("❌ Iltimos, 1, 2, 3 yoki 4 kiriting")
        return

    await state.update_data(field=field)

    prompts = {
        "name": "📝 <b>Yangi tarif nomini kiriting:</b>\nMasalan: 1 oy",
        "price": "💰 <b>Yangi narxni kiriting ($):</b>\nMasalan: 30",
        "duration": "📅 <b>Yangi muddatni kiriting (oylarda):</b>\nMasalan: 1, 3, 6",
        "channel": "🔗 <b>Maxfiy kanal ID kiriting:</b>\nMasalan: -1002271613164\n(Kanal ID @username_infobot'dan oling)\n\n⚠️ Bo'sh yuborsangiz — umumiy kanal (private_channel_id) ishlatiladi",
    }
    await state.set_state(AdminEditTariffStates.waiting_value)
    await message.answer(prompts[field])


@admin_tariffs_router.message(AdminEditTariffStates.waiting_value)
async def admin_edit_tariff_value(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    tariff_id = data.get("tariff_id")
    field = data.get("field")

    if not tariff_id or not field:
        await message.answer("❌ Xatolik. Qayta urinib ko'ring.")
        await state.clear()
        return

    if message.text is None:
        await message.answer("❌ Iltimos, matn yuboring.")
        return

    # Parse value based on field
    if field == "name":
        new_value = message.text.strip()
    elif field == "price":
        try:
            new_value = float(message.text.strip())
            if new_value <= 0:
                raise ValueError
        except ValueError:
            await message.answer("❌ Iltimos, to'g'ri narx kiriting")
            return
    elif field == "duration":
        try:
            new_value = int(message.text.strip())
            if new_value < 1:
                raise ValueError
        except ValueError:
            await message.answer("❌ Iltimos, to'g'ri son kiriting (1, 3, 6 va h.k.)")
            return
    elif field == "channel":
        new_value = message.text.strip() or None  # Empty → None (use global channel)
    else:
        await message.answer("❌ Noto'g'ri maydon")
        await state.clear()
        return

    from bot.database.session import get_session
    from sqlalchemy import select
    from bot.models.tariff import SignalTariff

    async with get_session() as session:
        result = await session.execute(select(SignalTariff).where(SignalTariff.id == tariff_id))
        tariff = result.scalar_one_or_none()
        if not tariff:
            await message.answer("❌ Tarif topilmadi")
            await state.clear()
            return

        # Update the field
        if field == "name":
            tariff.name = new_value
        elif field == "price":
            tariff.price = new_value
        elif field == "duration":
            tariff.duration_months = new_value
        elif field == "channel":
            tariff.channel_id = new_value

    field_names = {"name": "nomi", "price": "narx", "duration": "muddat", "channel": "kanal"}
    await message.answer(f"✅ Tarif {field_names[field]}i yangilandi!")

    # Show updated tariffs — eski narx qoldiqlari qolmaydi
    tariffs = await get_all_tariffs()
    await message.answer(ADMIN_TARIFFS_TEXT, reply_markup=admin_tariffs_kb(tariffs))
    await state.clear()