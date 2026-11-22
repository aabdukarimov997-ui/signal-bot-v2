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


@admin_payment_methods_router.callback_query(F.data == "crypto_diag")
async def crypto_diag_handler(callback: CallbackQuery) -> None:
    """Hamyon/kontrakt/xpub sozlamalarini tekshiradi va aniq xatoni ko'rsatadi."""
    if callback.from_user.id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return

    from bot.services.crypto_service import (
        _get_config,
        is_hd_enabled,
        is_wallet_configured,
        validate_hd_xpub,
    )
    from bot.services.hd_wallet import HDWalletError, derive_address, xpub_fingerprint
    from bot.utils.validators import (
        BNB_USDT_CONTRACT,
        TRON_USDT_CONTRACT,
        find_contract_in_wallet_field,
        is_evm_address,
        is_tron_address,
    )

    await callback.answer("🩺 Tekshirilmoqda...")

    lines = ["🩺 <b>Kripto sozlamalari tekshiruvi</b>", ""]

    for network, label, wallet_key in (
        ("tron", "TRON TRC20", "tron_wallet_address"),
        ("bnb", "BNB BEP20", "bnb_wallet_address"),
    ):
        cfg = await _get_config(network)
        address = (cfg.get("address") or "").strip()
        contract = (cfg.get("contract") or "").strip()
        xpub = (cfg.get("xpub") or "").strip()

        lines.append(f"<b>{label}</b>")

        if is_hd_enabled(cfg):
            error = validate_hd_xpub(network, xpub)
            if error:
                lines.append(f"  ❌ HD xpub noto'g'ri: {error}")
            else:
                try:
                    sample = derive_address(xpub, network, 0)
                    lines.append("  ✅ HD rejim YOQILGAN — har bir mijozga alohida manzil")
                    lines.append(f"  🔑 xpub izi: <code>{xpub_fingerprint(xpub)}</code>")
                    lines.append(f"  📍 0-mijoz manzili: <code>{sample}</code>")
                except HDWalletError as exc:
                    lines.append(f"  ❌ HD manzil hosil bo'lmadi: {exc}")
        else:
            if not address:
                lines.append("  ❌ Hamyon manzili kiritilmagan va HD xpub yo'q")
                lines.append("")
                continue
            problem = find_contract_in_wallet_field(wallet_key, address)
            if problem:
                lines.append(f"  ❌ {problem}")
            elif network == "tron" and not is_tron_address(address):
                lines.append("  ❌ Manzil TRON formatida emas")
            elif network == "bnb" and not is_evm_address(address):
                lines.append("  ❌ Manzil BEP20 (0x...) formatida emas")
            else:
                lines.append(f"  ✅ Umumiy hamyon: <code>{address}</code>")
                lines.append("  ℹ️ HD xpub kiritilmagan — barcha mijozlar bitta manzilga to'laydi")

        expected_contract = TRON_USDT_CONTRACT if network == "tron" else BNB_USDT_CONTRACT
        if contract.lower() != expected_contract.lower():
            lines.append(f"  ⚠️ USDT kontrakti odatdagidan farq qiladi: <code>{contract}</code>")
        else:
            lines.append("  ✅ USDT kontrakti to'g'ri")

        ok = is_wallet_configured(network, cfg)
        lines.append(f"  {'✅ Avtomatik tekshiruv ishlaydi' if ok else '❌ Avtomatik tekshiruv ISHLAMAYDI'}")
        lines.append("")

    lines.append(
        "<i>HD rejim uchun account darajasidagi xpub kerak (xprv/seed EMAS):\n"
        "TRON — m/44'/195'/0'  |  BNB — m/44'/60'/0'</i>"
    )

    await safe_edit(
        callback.message,
        "\n".join(lines),
        reply_markup=admin_payment_methods_kb(
            await get_enabled_payment_methods(), await is_crypto_auto_enabled()
        ),
    )


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
