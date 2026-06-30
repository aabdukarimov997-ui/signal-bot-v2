from aiogram.filters import Command
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from bot.config import settings
from bot.services.settings_service import (
    is_setup_completed,
    set_setting,
    get_setting,
    WIZARD_KEYS,
    SETTINGS_KEYS,
)

setup_router = Router()


from aiogram.fsm.state import State, StatesGroup


class SetupWizardStates(StatesGroup):
    project_name = State()
    admin_username = State()
    support_username = State()
    private_channel_id = State()
    card_number = State()
    card_owner = State()
    price_1_month = State()
    price_3_month = State()
    price_6_month = State()
    stars_1_month = State()
    stars_3_month = State()
    stars_6_month = State()
    instagram_url = State()
    youtube_url = State()
    website_url = State()
    free_channel_url = State()
    course_channel_id = State()
    course_tariff_name = State()
    course_price_1_month = State()
    course_stars_1_month = State()


WIZARD_QUESTIONS = {
    "project_name": "📝 <b>1/20 — Loyiha nomi:</b>\nMasalan: Alpha Signal Pro",
    "admin_username": "👤 <b>2/20 — Admin username:</b>\nMasalan: @treder7090",
    "support_username": "📞 <b>3/20 — Support username:</b>\nMasalan: @treder7090",
    "private_channel_id": "📈 <b>4/20 — Private Signal kanal ID:</b>\nMasalan: -1002271613164\n(Kanal ID @username_infobot'dan oling)",
    "card_number": "💳 <b>5/20 — Karta raqami:</b>\nMasalan: 8600 2113 9408 0402\n(Bo'sh = Stars to'lov only)",
    "card_owner": "👤 <b>6/20 — Karta egasi:</b>\nMasalan: FALONCHAYEV FALONCHA\n(Bo'sh = karta to'lov yo'q)",
    "price_1_month": "💰 <b>7/20 — 1 oylik narx ($):</b>\nMasalan: 25",
    "price_3_month": "💰 <b>8/20 — 3 oylik narx ($):</b>\nMasalan: 50",
    "price_6_month": "💰 <b>9/20 — 6 oylik narx ($):</b>\nMasalan: 100",
    "stars_1_month": "⭐ <b>10/20 — 1 oylik Stars narxi:</b>\nMasalan: 1250",
    "stars_3_month": "⭐ <b>11/20 — 3 oylik Stars narxi:</b>\nMasalan: 2500",
    "stars_6_month": "⭐ <b>12/20 — 6 oylik Stars narxi:</b>\nMasalan: 5000",
    "instagram_url": "📷 <b>13/20 — Instagram URL:</b>\nMasalan: https://instagram.com/example\n(Bo'sh = ko'rsatilmaydi)",
    "youtube_url": "▶️ <b>14/20 — YouTube URL:</b>\nMasalan: https://youtube.com/@example\n(Bo'sh = ko'rsatilmaydi)",
    "website_url": "🌐 <b>15/20 — Website URL:</b>\nMasalan: https://example.com\n(Bo'sh = ko'rsatilmaydi)",
    "free_channel_url": "🆓 <b>16/20 — Bepul kanal URL:</b>\nMasalan: https://t.me/your_free_channel\n(Bo'sh = ko'rsatilmaydi)",
    "course_channel_id": "📚 <b>17/20 — Kurs kanal ID:</b>\nMasalan: -1002271613165\n(Bo'sh =kurs yo'q)",
    "course_tariff_name": "📚 <b>18/20 — Kurs nomi:</b>\nMasalan: Premium Trading Kurs\n(Standart: Kurs)",
    "course_price_1_month": "💰 <b>19/20 — Kurs narxi ($):</b>\nMasalan: 25",
    "course_stars_1_month": "⭐ <b>20/20 — Kurs Stars narxi:</b>\nMasalan: 1250",
}


async def start_wizard(message: Message, state: FSMContext) -> None:
    await state.set_state(SetupWizardStates.project_name)
    await state.update_data(wizard_step=0)
    await message.answer(
        "🛠 <b>SETUP WIZARD</b>\n\n"
        "Bot birinchi marta ishga tushdi!\n"
        "Sozlamalarni ketma-ket kiriting.\n\n"
        "⚠️ Barcha ma'lumotlar <b>database</b> ga saqlanadi.\n"
        "Keyin admin paneldan o'zgartirish mumkin.\n\n"
        "Bekor qilish: /cancel"
    )
    await message.answer(WIZARD_QUESTIONS["project_name"])


WIZARD_STATE_MAP = {key: key for key in WIZARD_KEYS}
# Map state strings to actual State objects
STATE_ORDER = [
    SetupWizardStates.project_name,
    SetupWizardStates.admin_username,
    SetupWizardStates.support_username,
    SetupWizardStates.private_channel_id,
    SetupWizardStates.card_number,
    SetupWizardStates.card_owner,
    SetupWizardStates.price_1_month,
    SetupWizardStates.price_3_month,
    SetupWizardStates.price_6_month,
    SetupWizardStates.stars_1_month,
    SetupWizardStates.stars_3_month,
    SetupWizardStates.stars_6_month,
    SetupWizardStates.instagram_url,
    SetupWizardStates.youtube_url,
    SetupWizardStates.website_url,
    SetupWizardStates.free_channel_url,
    SetupWizardStates.course_channel_id,
    SetupWizardStates.course_tariff_name,
    SetupWizardStates.course_price_1_month,
    SetupWizardStates.course_stars_1_month,
]

# Reverse map: State → key string
STATE_TO_KEY = {}
for state_obj in STATE_ORDER:
    state_str = state_obj.state  # e.g. "SetupWizardStates:project_name"
    key = state_str.split(":")[-1]
    STATE_TO_KEY[state_str] = key


# Register handlers for each wizard state
for _state in STATE_ORDER:
    @setup_router.message(_state)
    async def _wizard_step_handler(message: Message, state: FSMContext) -> None:
        current_state = await state.get_state()
        key = STATE_TO_KEY.get(current_state)
        if not key:
            return

        value = message.text.strip() if message.text else ""
        if value.lower() == "/cancel":
            await state.clear()
            await message.answer("❌ Setup Wizard bekor qilindi.\nQayta boshlash: /setup")
            return

        if value.lower() in ("skip", "-", "0", "yoq", "no"):
            value = ""

        await set_setting(key, value)

        current_idx = STATE_ORDER.index(current_state)
        next_idx = current_idx + 1

        if next_idx < len(STATE_ORDER):
            next_state = STATE_ORDER[next_idx]
            next_key = STATE_TO_KEY[next_state.state]
            await state.set_state(next_state)
            await message.answer(f"✅ Saqlandi!\n\n{WIZARD_QUESTIONS[next_key]}")
        else:
            await set_setting("setup_completed", "true")
            await state.clear()
            await message.answer(
                "🎉 <b>Setup Wizard tugadi!</b>\n\n"
                "Barcha sozlamalar database ga saqlandi.\n"
                "Bot endi to'liq ishlaydi!\n\n"
                "⚙️ Sozlamalarni o'zgartirish: /admin → Sozlamalar\n"
                "📦 Export/Import: Admin panel → Sozlamalar\n\n"
                "Bot endi /start buyrug'i bilan ishlaydi."
            )


@setup_router.message(Command("cancel"))
async def cancel_wizard(message: Message, state: FSMContext) -> None:
    current_state = await state.get_state()
    if current_state:
        await state.clear()
        await message.answer("❌ Setup Wizard bekor qilindi.")
