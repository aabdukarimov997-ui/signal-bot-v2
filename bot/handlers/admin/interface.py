from html import escape

from aiogram import F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from bot.models.user import User
from bot.services.interface_service import interface_mode, miniapp_url, normalize_miniapp_url, validate_miniapp_url
from bot.services.settings_service import get_admin_ids, set_setting
from bot.utils.helpers import safe_edit

admin_interface_router = Router()
URL_STATE = "miniapp:waiting_url"


async def panel() -> tuple[str, InlineKeyboardMarkup]:
    mode = await interface_mode()
    url = await miniapp_url()
    text = (
        "📱 <b>Bot interfeysi</b>\n\n"
        f"Joriy rejim: <b>{'Mini App' if mode == 'miniapp' else 'Oldingi menyu'}</b>\n"
        f"Mini App: <code>{escape(url or 'Hali sozlanmagan')}</code>\n\n"
        "Almashtirish foydalanuvchi /start yoki /menu bosganida ko'rinadi.\n"
        "Obunalar, to'lovlar va tayyor veb-sayt o'zgarmaydi.\n\n"
        "Tekshirish: /miniapp buyrug'i. URL bot servisiga tegishli bo'lishi kerak, tayyor saytga emas."
    )
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🚀 Mini App rejimi", callback_data="interface_miniapp")],
            [InlineKeyboardButton(text="📱 Oldingi rejim", callback_data="interface_classic")],
            [InlineKeyboardButton(text="🔗 Mini App URL sozlash", callback_data="interface_url")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
        ]
    )
    if url:
        kb.inline_keyboard.insert(
            0, [InlineKeyboardButton(text="🔎 Mini App ni tekshirish", web_app=WebAppInfo(url=url + "/"))]
        )
        text += f"\nDiagnostika: <code>{escape(url)}/status</code>"
    return text, kb


@admin_interface_router.callback_query(
    F.data.in_(
        {
            "admin_interface",
            "interface_miniapp",
            "interface_classic",
            "interface_url",
        }
    )
)
async def interface_handler(callback: CallbackQuery, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    await state.clear()
    if callback.data == "interface_url":
        await state.set_state(URL_STATE)
        await callback.message.answer(
            "Bot xizmatining HTTPS domenini yoki /miniapp manzilini yuboring.\n"
            "Masalan: https://BOT-SERVICE.up.railway.app/miniapp\n\nBekor qilish: /cancel"
        )
    else:
        if callback.data == "interface_miniapp":
            if not validate_miniapp_url(await miniapp_url()):
                await callback.answer("Avval to'g'ri HTTPS Mini App URL sozlang.", show_alert=True)
                return
            await set_setting("interface_mode", "miniapp")
        elif callback.data == "interface_classic":
            await set_setting("interface_mode", "classic")
        text, kb = await panel()
        await safe_edit(callback.message, text, reply_markup=kb)
    await callback.answer()


@admin_interface_router.message(StateFilter(URL_STATE))
async def interface_url_handler(message: Message, user: User, state: FSMContext) -> None:
    if user.telegram_id not in await get_admin_ids():
        await state.clear()
        return
    url = normalize_miniapp_url(message.text or "")
    if not url:
        await message.answer(
            "❌ Bot servisining HTTPS domenini yoki /miniapp manzilini yuboring. Login, query yoki # ishlatmang."
        )
        return
    await set_setting("miniapp_url", url)
    await state.clear()
    text, kb = await panel()
    await message.answer(text, reply_markup=kb)
