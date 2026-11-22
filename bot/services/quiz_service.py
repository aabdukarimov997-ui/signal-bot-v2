"""Viktorina — savollar, natijalarni hisoblash va saqlash.

Viktorina admin panelda yoqiladi/o'chiriladi. Yoqilgan bo'lsa, foydalanuvchi
"🎯 Viktorina" tugmasi orqali savollarga javob beradi va o'tib ketsa promo kod
oladi (agar sozlangan bo'lsa).
"""

import json
import logging

from sqlalchemy import select

from bot.database.session import get_session
from bot.models.quiz_result import QuizResult
from bot.services.settings_service import get_setting

logger = logging.getLogger(__name__)

DEFAULT_PASS_PERCENT = 70

DEFAULT_QUESTIONS: list[dict] = [
    {
        "q": "Kripto bozorida 'bull market' nima degani?",
        "options": ["Narxlar tushishi", "Narxlar ko'tarilishi", "Bozor yopilishi", "Savdo to'xtashi"],
        "correct": 1,
    },
    {
        "q": "Stop-loss nima uchun kerak?",
        "options": [
            "Foydani oshirish uchun",
            "Zararni cheklash uchun",
            "Komissiyani kamaytirish uchun",
            "Leverage oshirish uchun",
        ],
        "correct": 1,
    },
    {
        "q": "Bitcoin qaysi blokcheynda ishlaydi?",
        "options": ["Ethereum", "Bitcoin", "Solana", "BNB Chain"],
        "correct": 1,
    },
    {
        "q": "USDT qanday turdagi aktiv?",
        "options": ["Aksiya", "Stablecoin", "Obligatsiya", "Tovar"],
        "correct": 1,
    },
    {
        "q": "Diversifikatsiya nima?",
        "options": [
            "Bitta aktivga hamma mablag'ni qo'yish",
            "Mablag'ni turli aktivlarga taqsimlash",
            "Faqat kripto sotib olish",
            "Qarz olish",
        ],
        "correct": 1,
    },
    {
        "q": "Texnik analizda 'support' darajasi nima?",
        "options": [
            "Narx tushishi mumkin bo'lgan yuqori chegara",
            "Narx ko'tarilishi mumkin bo'lgan pastki chegara",
            "O'rtacha narx",
            "Eng yuqori narx",
        ],
        "correct": 1,
    },
    {
        "q": "Paper trading nima?",
        "options": [
            "Real pul bilan savdo",
            "Simulyatsiya (demo) savdo",
            "Qog'oz valyuta ayirboshlash",
            "Bank o'tkazmasi",
        ],
        "correct": 1,
    },
    {
        "q": "Kripto hamyoning maxfiy kalitini (seed phrase) kimga berish mumkin?",
        "options": ["Do'stga", "Adminga", "Hech kimga", "Qo'llab-quvvatlash xizmatiga"],
        "correct": 2,
    },
    {
        "q": "FOMO nimani anglatadi?",
        "options": [
            "Imkoniyatni boy berish qo'rquvi",
            "Foyda olish qo'rquvi",
            "Bozordan chiqish strategiyasi",
            "Foiz stavkasi",
        ],
        "correct": 0,
    },
    {
        "q": "Riskni boshqarishda pozitsiya hajmi (position size) nimaga bog'liq?",
        "options": [
            "Faqat istakka",
            "Depozit hajmi va risk foiziga",
            "Bozor kayfiyatiga",
            "Tasodifga",
        ],
        "correct": 1,
    },
    {
        "q": "Limit buy order nima qiladi?",
        "options": [
            "Bozor narxida darhol sotib oladi",
            "Belgilangan narxga yetganda sotib oladi",
            "Hech qachon bajarilmaydi",
            "Faqat sotadi",
        ],
        "correct": 1,
    },
    {
        "q": "Kripto bozorida volatillik yuqori bo'lsa, bu nimani anglatadi?",
        "options": [
            "Narx barqaror",
            "Narx tez-tez va kuchli o'zgaradi",
            "Savdo yo'q",
            "Komissiya yo'q",
        ],
        "correct": 1,
    },
    {
        "q": "Spot savdo va futures savdo orasidagi asosiy farq nima?",
        "options": [
            "Spot — leverage bilan, futures — leverage'siz",
            "Spot — aktivni haqiqiy sotib olish, futures — kelajakdagi shartnoma",
            "Farqi yo'q",
            "Futures faqat aksiyalar uchun",
        ],
        "correct": 1,
    },
    {
        "q": "Take-profit nima?",
        "options": [
            "Zararni cheklash darajasi",
            "Foydani qayd etish darajasi",
            "Depozitni to'ldirish",
            "Savdo hajmi",
        ],
        "correct": 1,
    },
    {
        "q": "Kripto birjani tanlashda eng muhim narsa nima?",
        "options": ["Reklama", "Xavfsizlik va litsenziya", "Dizayn", "Ilova rangi"],
        "correct": 1,
    },
]


def _parse_questions(raw: str | None) -> list[dict]:
    if not raw:
        return DEFAULT_QUESTIONS
    try:
        data = json.loads(raw)
        if isinstance(data, list) and data:
            valid = [
                q
                for q in data
                if isinstance(q, dict)
                and "q" in q
                and isinstance(q.get("options"), list)
                and len(q["options"]) >= 2
                and isinstance(q.get("correct"), int)
                and 0 <= q["correct"] < len(q["options"])
            ]
            return valid or DEFAULT_QUESTIONS
    except json.JSONDecodeError:
        logger.warning("quiz_questions sozlamasi buzilgan JSON — standart savollar ishlatiladi")
    return DEFAULT_QUESTIONS


async def is_quiz_enabled() -> bool:
    return (await get_setting("quiz_enabled") or "false") == "true"


async def get_questions() -> list[dict]:
    return _parse_questions(await get_setting("quiz_questions"))


async def get_pass_percent() -> int:
    raw = await get_setting("quiz_pass_percent") or str(DEFAULT_PASS_PERCENT)
    try:
        val = int(raw)
    except ValueError:
        return DEFAULT_PASS_PERCENT
    return min(max(val, 1), 100)


async def get_promo_on_pass() -> str | None:
    code = (await get_setting("quiz_promo_code") or "").strip()
    return code or None


async def save_result(
    user_id: str,
    telegram_id: int,
    full_name: str,
    score: int,
    total: int,
    promo_code: str | None = None,
) -> QuizResult:
    percent = int(round(score * 100 / total)) if total else 0
    passed = percent >= await get_pass_percent()

    result = QuizResult(
        user_id=user_id,
        telegram_id=telegram_id,
        full_name=full_name,
        score=score,
        total=total,
        percent=percent,
        passed=passed,
        promo_code=promo_code if passed else None,
    )
    async with get_session() as session:
        session.add(result)
        await session.commit()
        await session.refresh(result)
    return result


async def get_user_results(user_id: str, limit: int = 5) -> list[QuizResult]:
    async with get_session() as session:
        res = await session.execute(
            select(QuizResult)
            .where(QuizResult.user_id == user_id)
            .order_by(QuizResult.created_at.desc())
            .limit(limit)
        )
        return list(res.scalars().all())


async def get_quiz_stats() -> dict:
    from sqlalchemy import func

    async with get_session() as session:
        total = (await session.execute(select(func.count(QuizResult.id)))).scalar() or 0
        passed = (
            await session.execute(select(func.count(QuizResult.id)).where(QuizResult.passed.is_(True)))
        ).scalar() or 0
        avg = (await session.execute(select(func.avg(QuizResult.percent)))).scalar() or 0
    return {"total": total, "passed": passed, "avg_percent": round(float(avg), 1)}
