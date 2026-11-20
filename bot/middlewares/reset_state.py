"""FSM holatini tiklovchi middleware.

Foydalanuvchi biror oqimda (promo kod, chek yuborish, kontakt) qotib qolsa,
asosiy menyu tugmalarini bosganda holatni avtomatik tozalaydi. Shunda hech
qachon "orqaga qaytish yo'qligi" holati yuzaga kelmaydi.
"""

from collections.abc import Awaitable, Callable
from typing import Any

from aiogram import BaseMiddleware
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message, TelegramObject

# Asosiy menyu tugmalari — bosilganda qotib qolgan holat bekor qilinadi
MENU_BUTTON_TEXTS = {
    "📈 Signal kanal",
    "📚 Darslar",
    "👤 Hisobim",
    "👥 Referal",
    "☎️ Yordam",
    "🌐 Ijtimoiy tarmoqlar",
    "🚀 Start",
    "📢 E'lon",
    "🔐 Admin panel",
    "🏠 Bosh menyu",
    "❌ Bekor qilish",
    "⬅️ Orqaga",
}

MENU_CALLBACK_DATA = {
    "back_main",
    "menu_cancel",
    "cancel_state",
    "cancel_promo",
    "promo_cancel",
    "cancel_promo_code",
    "promo_code_cancel",
}


class ResetStateMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: dict[str, Any],
    ) -> Any:
        state: FSMContext | None = data.get("state")
        if state is None:
            return await handler(event, data)

        text: str | None = None
        callback_data: str | None = None

        if isinstance(event, Message):
            text = event.text
        elif isinstance(event, CallbackQuery):
            callback_data = event.data

        is_menu = text in MENU_BUTTON_TEXTS or callback_data in MENU_CALLBACK_DATA

        # Faqat holat aktiv bo'lganda tozalaymiz (aks holda ortiqcha ish)
        if is_menu and await state.get_state() is not None:
            await state.clear()

        return await handler(event, data)
