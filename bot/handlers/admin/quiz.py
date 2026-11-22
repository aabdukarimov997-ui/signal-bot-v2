"""🎯 VIKTORINA — Admin panel uchun viktorina boshqaruvi.

Admin bu yerdan:
  • Viktorinani yoqadi/o'chiradi (foydalanuvchilarda tugma paydo bo'ladi)
  • O'tish foizini o'zgartiradi
  • O'tganda beriladigan promo kodni belgilaydi
  • Statistika va oxirgi natijalarni ko'radi
"""

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message

from bot.models.user import User
from bot.services import quiz_service
from bot.services.settings_service import get_admin_ids, set_setting
from bot.utils.helpers import safe_edit
from bot.utils.keyboards import InlineKeyboardButton, InlineKeyboardMarkup

admin_quiz_router = Router()


class QuizAdminStates(StatesGroup):
    waiting_pass_percent = State()
    waiting_promo = State()


def _quiz_admin_kb(enabled: bool, pass_percent: int, promo: str | None) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=f"{'🟢 Yoqilgan' if enabled else '🔴 O‘chirilgan'} — bosib o‘zgartirish",
                    callback_data="admin_quiz_toggle",
                )
            ],
            [InlineKeyboardButton(text=f"🎯 O'tish foizi: {pass_percent}%", callback_data="admin_quiz_percent")],
            [
                InlineKeyboardButton(
                    text=f"🎁 Promo kod: {promo or 'belgilanmagan'}",
                    callback_data="admin_quiz_promo",
                )
            ],
            [InlineKeyboardButton(text="📊 Statistika", callback_data="admin_quiz_stats")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
        ]
    )


async def _render(callback: CallbackQuery) -> None:
    enabled = await quiz_service.is_quiz_enabled()
    pass_percent = await quiz_service.get_pass_percent()
    promo = await quiz_service.get_promo_on_pass()
    questions = await quiz_service.get_questions()
    stats = await quiz_service.get_quiz_stats()

    text = (
        "🎯 <b>Viktorina boshqaruvi</b>\n\n"
        f"📊 <b>Holat:</b> {'✅ Yoqilgan' if enabled else '❌ O‘chirilgan'}\n"
        f"❓ <b>Savollar:</b> {len(questions)} ta\n"
        f"🎯 <b>O'tish foizi:</b> {pass_percent}%\n"
        f"🎁 <b>Promo kod:</b> {promo or '—'}\n\n"
        f"👥 <b>Jami urinishlar:</b> {stats['total']}\n"
        f"✅ <b>O'tganlar:</b> {stats['passed']}\n"
        f"📈 <b>O'rtacha natija:</b> {stats['avg_percent']}%\n\n"
        "Pastdagi tugmalar orqali boshqaring:"
    )
    await safe_edit(callback.message, text, reply_markup=_quiz_admin_kb(enabled, pass_percent, promo))


@admin_quiz_router.callback_query(F.data == "admin_quiz")
async def admin_quiz_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    await _render(callback)
    await callback.answer()


@admin_quiz_router.callback_query(F.data == "admin_quiz_toggle")
async def admin_quiz_toggle_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    new_val = "false" if await quiz_service.is_quiz_enabled() else "true"
    await set_setting("quiz_enabled", new_val)
    await callback.answer("✅ Yoqildi" if new_val == "true" else "❌ O'chirildi", show_alert=True)
    await _render(callback)


@admin_quiz_router.callback_query(F.data == "admin_quiz_percent")
async def admin_quiz_percent_handler(callback: CallbackQuery, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    current = await quiz_service.get_pass_percent()
    await state.set_state(QuizAdminStates.waiting_pass_percent)
    await safe_edit(
        callback.message,
        f"🎯 <b>O'tish foizini kiriting</b>\n\n"
        f"Joriy: <b>{current}%</b>\n\n"
        "1 dan 100 gacha son yuboring (masalan: <code>70</code>).\n\n"
        "💡 Bekor qilish: /cancel",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[[InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_quiz")]]
        ),
    )
    await callback.answer()


@admin_quiz_router.message(QuizAdminStates.waiting_pass_percent)
async def admin_quiz_percent_save(message: Message, state: FSMContext) -> None:
    raw = (message.text or "").strip()
    if not raw.isdigit() or not (1 <= int(raw) <= 100):
        await message.answer("❌ 1 dan 100 gacha son kiriting.")
        return
    await set_setting("quiz_pass_percent", raw)
    await state.clear()
    await message.answer(f"✅ O'tish foizi <b>{raw}%</b> qilib saqlandi.")


@admin_quiz_router.callback_query(F.data == "admin_quiz_promo")
async def admin_quiz_promo_handler(callback: CallbackQuery, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    current = await quiz_service.get_promo_on_pass()
    await state.set_state(QuizAdminStates.waiting_promo)
    await safe_edit(
        callback.message,
        f"🎁 <b>Promo kodni kiriting</b>\n\n"
        f"Joriy: <code>{current or '—'}</code>\n\n"
        "O'tgan foydalanuvchiga shu kod ko'rsatiladi.\n"
        "O'chirish uchun <code>-</code> yuboring.\n\n"
        "💡 Bekor qilish: /cancel",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[[InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_quiz")]]
        ),
    )
    await callback.answer()


@admin_quiz_router.message(QuizAdminStates.waiting_promo)
async def admin_quiz_promo_save(message: Message, state: FSMContext) -> None:
    raw = (message.text or "").strip()
    if not raw:
        await message.answer("❌ Matn yuboring yoki /cancel bosing.")
        return
    await set_setting("quiz_promo_code", "" if raw == "-" else raw.upper())
    await state.clear()
    await message.answer("✅ Promo kod saqlandi." if raw != "-" else "✅ Promo kod o'chirildi.")


@admin_quiz_router.callback_query(F.data == "admin_quiz_stats")
async def admin_quiz_stats_handler(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    stats = await quiz_service.get_quiz_stats()
    text = (
        "📊 <b>Viktorina statistikasi</b>\n\n"
        f"👥 Jami urinishlar: <b>{stats['total']}</b>\n"
        f"✅ O'tganlar: <b>{stats['passed']}</b>\n"
        f"📈 O'rtacha natija: <b>{stats['avg_percent']}%</b>"
    )
    await safe_edit(
        callback.message,
        text,
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[[InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_quiz")]]
        ),
    )
    await callback.answer()
