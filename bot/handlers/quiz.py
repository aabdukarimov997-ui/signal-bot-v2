"""🎯 Viktorina — foydalanuvchi uchun test.

Admin panelda viktorina yoqilgan bo'lsa, bosh menyuda "🎯 Viktorina" tugmasi
paydo bo'ladi. Foydalanuvchi savollarga birma-bir javob beradi, oxirida natija
va (agar o'tgan bo'lsa) promo kod ko'rsatiladi.
"""

import html
import logging

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message

from bot.models.user import User
from bot.services import quiz_service
from bot.utils.helpers import safe_edit
from bot.utils.states import QuizStates

logger = logging.getLogger(__name__)

quiz_router = Router()

LETTERS = ["A", "B", "C", "D", "E", "F"]


def _question_kb(index: int, options: list[str]) -> InlineKeyboardMarkup:
    buttons = [
        [InlineKeyboardButton(text=f"{LETTERS[i]}) {opt}", callback_data=f"quiz_ans_{index}_{i}")]
        for i, opt in enumerate(options)
    ]
    buttons.append([InlineKeyboardButton(text="❌ Bekor qilish", callback_data="back_main")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


async def send_quiz_intro(
    message: Message, user: User, edit: bool = False, callback: CallbackQuery | None = None
) -> None:
    if not await quiz_service.is_quiz_enabled():
        text = "🎯 Viktorina hozircha o'chirilgan."
        if callback:
            await callback.answer(text, show_alert=True)
        else:
            await message.answer(text)
        return

    questions = await quiz_service.get_questions()
    pass_percent = await quiz_service.get_pass_percent()

    text = (
        "🎯 <b>Viktorina</b>\n\n"
        f"Savollar soni: <b>{len(questions)}</b>\n"
        f"O'tish uchun: <b>{pass_percent}%</b> to'g'ri javob\n\n"
        "Har bir savolga bitta javob tanlang. Natija oxirida ko'rsatiladi."
    )
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="▶️ Boshlash", callback_data="quiz_start")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main")],
        ]
    )
    if edit and callback:
        await safe_edit(callback.message, text, reply_markup=kb)
    else:
        await message.answer(text, reply_markup=kb)


@quiz_router.message(F.text == "🎯 Viktorina")
async def quiz_entry_handler(message: Message, user: User) -> None:
    await send_quiz_intro(message, user)


@quiz_router.callback_query(F.data == "quiz_start")
async def quiz_start_handler(callback: CallbackQuery, state: FSMContext, user: User) -> None:
    if not await quiz_service.is_quiz_enabled():
        await callback.answer("Viktorina o'chirilgan", show_alert=True)
        return

    questions = await quiz_service.get_questions()
    await state.set_state(QuizStates.answering)
    await state.update_data(quiz_index=0, quiz_score=0, quiz_total=len(questions))

    q = questions[0]
    text = (
        f"<b>Savol 1/{len(questions)}</b>\n\n"
        f"{html.escape(q['q'])}"
    )
    await safe_edit(callback.message, text, reply_markup=_question_kb(0, q["options"]))
    await callback.answer()


@quiz_router.callback_query(QuizStates.answering, F.data.startswith("quiz_ans_"))
async def quiz_answer_handler(callback: CallbackQuery, state: FSMContext, user: User) -> None:
    data = await state.get_data()
    index = data.get("quiz_index", 0)
    score = data.get("quiz_score", 0)
    total = data.get("quiz_total", 0)

    try:
        _, _, idx_s, opt_s = callback.data.split("_")
        idx = int(idx_s)
        chosen = int(opt_s)
    except (ValueError, AttributeError):
        await callback.answer("Xatolik", show_alert=True)
        return

    if idx != index:
        await callback.answer("Bu savol allaqachon javoblangan", show_alert=True)
        return

    questions = await quiz_service.get_questions()
    if idx >= len(questions):
        await state.clear()
        await callback.answer("Viktorina tugadi", show_alert=True)
        return

    correct = questions[idx]["correct"]
    if chosen == correct:
        score += 1

    next_index = idx + 1
    if next_index < total:
        await state.update_data(quiz_index=next_index, quiz_score=score)
        q = questions[next_index]
        text = f"<b>Savol {next_index + 1}/{total}</b>\n\n{html.escape(q['q'])}"
        await safe_edit(callback.message, text, reply_markup=_question_kb(next_index, q["options"]))
        await callback.answer("✅ To'g'ri" if chosen == correct else "❌ Noto'g'ri")
        return

    # Viktorina tugadi — natijani saqlaymiz
    await state.clear()
    promo = await quiz_service.get_promo_on_pass()
    result = await quiz_service.save_result(
        user_id=user.id,
        telegram_id=user.telegram_id,
        full_name=user.full_name or str(user.telegram_id),
        score=score,
        total=total,
        promo_code=promo,
    )

    if result.passed:
        text = (
            "🎉 <b>Tabriklaymiz, o'tdingiz!</b>\n\n"
            f"Natija: <b>{score}/{total}</b> ({result.percent}%)\n"
            f"O'tish chegarasi: {await quiz_service.get_pass_percent()}%\n"
        )
        if promo:
            text += f"\n🎁 <b>Sizning promo kodingiz:</b>\n<code>{html.escape(promo)}</code>\n"
        else:
            text += "\nAdmin bilan bog'lanib sovg'angizni oling."
    else:
        text = (
            "😔 <b>Afsus, o'tmadingiz.</b>\n\n"
            f"Natija: <b>{score}/{total}</b> ({result.percent}%)\n"
            f"O'tish uchun kamida {await quiz_service.get_pass_percent()}% kerak.\n\n"
            "Qayta urinib ko'rishingiz mumkin."
        )

    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🔄 Qayta urinish", callback_data="quiz_start")],
            [InlineKeyboardButton(text="🏠 Bosh menyu", callback_data="back_main")],
        ]
    )
    await safe_edit(callback.message, text, reply_markup=kb)
    await callback.answer()
