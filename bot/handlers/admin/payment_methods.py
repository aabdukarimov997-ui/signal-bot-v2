from aiogram import F, Router
from aiogram.types import CallbackQuery

from bot.services.settings_service import (
    PAYMENT_METHOD_KEYS,
    get_admin_ids,
    get_enabled_payment_methods,
    get_setting,
    is_crypto_auto_enabled,
    set_setting,
)
from bot.utils.helpers import safe_edit
from bot.utils.keyboards import admin_payment_methods_kb

admin_payment_methods_router = Router()


PAYMENT_METHOD_LABELS = {
    "visa": "💳 Visa",
    "card": "💳 UZCARD/HUMO",
    "tron": "🔗 TRON TRC20",
    "bnb": "🟡 BNB BEP20",
    "ton": "💎 TON",
    "stars": "⭐ Telegram Stars",
}


@admin_payment_methods_router.callback_query(F.data == "admin_payment_methods")
async def admin_payment_methods_handler(callback: CallbackQuery) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    enabled = await get_enabled_payment_methods()
    auto = await is_crypto_auto_enabled()
    text = "💰 <b>To'lov usullari</b>\n\n"
    for method, label in PAYMENT_METHOD_LABELS.items():
        status = "✅ Yoqilgan" if method in enabled else "❌ O'chirilgan"
        text += f"{label}: {status}\n"
    text += f"\n🤖 Blokcheyn avtomatik tekshiruvi: {'✅ Yoqilgan' if auto else '❌ O‘chirilgan'}"
    text += "\nTugmani bosib yoqishing/o'chirishing mumkin."

    await safe_edit(callback.message, text, reply_markup=admin_payment_methods_kb(enabled, auto))
    await callback.answer()


@admin_payment_methods_router.callback_query(F.data.startswith("toggle_pay_"))
async def toggle_payment_method_handler(callback: CallbackQuery) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    method = callback.data.replace("toggle_pay_", "")
    setting_key = PAYMENT_METHOD_KEYS.get(method)
    if not setting_key:
        await callback.answer("❌ Noto'g'ri metod", show_alert=True)
        return

    enabled = await get_enabled_payment_methods()
    if method in enabled:
        await set_setting(setting_key, "false")
        action = "O'chirilgan ❌"
    else:
        await set_setting(setting_key, "true")
        action = "Yoqilgan ✅"

    label = PAYMENT_METHOD_LABELS.get(method, method)
    await callback.answer(f"{label}: {action}", show_alert=True)

    enabled = await get_enabled_payment_methods()
    auto = await is_crypto_auto_enabled()
    text = "💰 <b>To'lov usullari</b>\n\n"
    for m, lbl in PAYMENT_METHOD_LABELS.items():
        status = "✅ Yoqilgan" if m in enabled else "❌ O'chirilgan"
        text += f"{lbl}: {status}\n"
    text += f"\n🤖 Blokcheyn avtomatik tekshiruvi: {'✅ Yoqilgan' if auto else '❌ O‘chirilgan'}"
    text += "\nTugmani bosib yoqishing/o'chirishing mumkin."

    await safe_edit(callback.message, text, reply_markup=admin_payment_methods_kb(enabled, auto))


@admin_payment_methods_router.callback_query(F.data == "toggle_crypto_auto")
async def toggle_crypto_auto_handler(callback: CallbackQuery) -> None:
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    current = await get_setting("crypto_auto_enabled")
    new_value = "false" if current != "false" else "true"
    await set_setting("crypto_auto_enabled", new_value)
    state = "Yoqilgan ✅" if new_value == "true" else "O'chirilgan ❌"
    await callback.answer(f"Blokcheyn avtomatik tekshiruvi: {state}", show_alert=True)

    enabled = await get_enabled_payment_methods()
    auto = await is_crypto_auto_enabled()
    text = "💰 <b>To'lov usullari</b>\n\n"
    for m, lbl in PAYMENT_METHOD_LABELS.items():
        status = "✅ Yoqilgan" if m in enabled else "❌ O'chirilgan"
        text += f"{lbl}: {status}\n"
    text += f"\n🤖 Blokcheyn avtomatik tekshiruvi: {'✅ Yoqilgan' if auto else '❌ O‘chirilgan'}"
    text += "\nTugmani bosib yoqishing/o'chirishing mumkin."

    await safe_edit(callback.message, text, reply_markup=admin_payment_methods_kb(enabled, auto))
