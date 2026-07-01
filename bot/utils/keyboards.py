from typing import Optional, Union

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton

from bot.models.tariff import SignalTariff


# ─── Main Menu (Reply Keyboard) ───────────────────────────────────────

def main_menu_kb(is_admin: bool = False) -> ReplyKeyboardMarkup:
    keyboard = [
        [KeyboardButton(text="📈 Signal kanal"), KeyboardButton(text="📚 Darslar")],
        [KeyboardButton(text="👤 Hisobim"), KeyboardButton(text="👥 Referal")],
        [KeyboardButton(text="📢 E'lon"), KeyboardButton(text="☎️ Yordam")],
        [KeyboardButton(text="🌐 Ijtimoiy tarmoqlar")],
    ]
    if is_admin:
        keyboard.append([KeyboardButton(text="🔐 Admin panel")])
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


# ─── Signal Tariffs (Inline) ──────────────────────────────────────────

def tariff_selection_kb(tariffs: list[SignalTariff]) -> InlineKeyboardMarkup:
    buttons = [
        [InlineKeyboardButton(
            text=f"{t.label} — ${float(t.price):.0f}",
            callback_data=f"tariff_{t.id}",
        )]
        for t in tariffs
    ]
    buttons.append([InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


# ─── Payment Method Selection ─────────────────────────────────────────

def payment_method_kb(tariff_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="⭐ Telegram Stars", callback_data=f"stars_{tariff_id}")],
            [InlineKeyboardButton(text="💳 Karta orqali", callback_data=f"card_{tariff_id}")],
            [InlineKeyboardButton(text="🔗 TRON TRC20 (USDT)", callback_data=f"tron_{tariff_id}")],
            [InlineKeyboardButton(text="🟡 BNB BEP20 (USDT)", callback_data=f"bnb_{tariff_id}")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_tariffs")],
        ]
    )


# ─── Stars Invoice ────────────────────────────────────────────────────

def stars_invoice_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_tariffs")],
        ]
    )


# ─── Card Payment ────────────────────────────────────────────────────

def card_payment_kb(tariff_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="📤 Chek yuborish", callback_data=f"upload_check_{tariff_id}")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data=f"pay_method_{tariff_id}")],
        ]
    )


# ─── TRON TRC20 Payment ──────────────────────────────────────────────

def tron_payment_kb(tariff_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="📤 Skrinshot yuborish", callback_data=f"upload_tron_{tariff_id}")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data=f"pay_method_{tariff_id}")],
        ]
    )


# ─── BNB BEP20 Payment ───────────────────────────────────────────────

def bnb_payment_kb(tariff_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="📤 Skrinshot yuborish", callback_data=f"upload_bnb_{tariff_id}")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data=f"pay_method_{tariff_id}")],
        ]
    )


# ─── Check Uploaded ──────────────────────────────────────────────────

def check_uploaded_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main")],
        ]
    )

# ─── Cancel Upload (for FSM receipt states) ──────────────────────────

def cancel_upload_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="❌ Bekor qilish", callback_data="cancel_upload")],
        ]
    )


# ─── Admin Approval Buttons ──────────────────────────────────────────

def admin_approval_kb(payment_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✅ Qabul qilindi", callback_data=f"approve_{payment_id}"),
                InlineKeyboardButton(text="❌ Pul tushmadi", callback_data=f"reject_{payment_id}"),
            ],
        ]
    )


# ─── Social Media ────────────────────────────────────────────────────

def social_kb(
    instagram: str = "",
    twitter: str = "",
    youtube: str = "",
    website: str = "",
    free_channel: str = "",
) -> InlineKeyboardMarkup:
    def ensure_url(val: str) -> str:
        if not val:
            return ""
        if val.startswith("@"):
            return f"https://t.me/{val[1:]}"
        if val.startswith("http://") or val.startswith("https://"):
            return val
        if val.startswith("/") or "." not in val:
            return ""
        return f"https://{val}"

    buttons = []
    if instagram and ensure_url(instagram):
        buttons.append([InlineKeyboardButton(text="📷 Instagram", url=ensure_url(instagram))])
    if twitter and ensure_url(twitter):
        buttons.append([InlineKeyboardButton(text="🐦 Twitter (X)", url=ensure_url(twitter))])
    if youtube and ensure_url(youtube):
        buttons.append([InlineKeyboardButton(text="▶️ YouTube", url=ensure_url(youtube))])
    if website and ensure_url(website):
        buttons.append([InlineKeyboardButton(text="🌐 Website", url=ensure_url(website))])
    if free_channel and ensure_url(free_channel):
        buttons.append([InlineKeyboardButton(text="🆓 Bepul kanal", url=ensure_url(free_channel))])
    buttons.append([InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


# ─── Admin Panel ─────────────────────────────────────────────────────

def admin_menu_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="💳 To'lovlar", callback_data="admin_payments")],
            [InlineKeyboardButton(text="📊 Tariflar", callback_data="admin_tariffs")],
            [InlineKeyboardButton(text="📋 Obunalar", callback_data="admin_subs")],
            [InlineKeyboardButton(text="👥 Foydalanuvchilar", callback_data="admin_users")],
            [InlineKeyboardButton(text="📈 Statistika", callback_data="admin_stats")],
            [InlineKeyboardButton(text="🔗 Ijtimoiy tarmoqlar", callback_data="admin_social")],
            [InlineKeyboardButton(text="⚙️ Sozlamalar", callback_data="admin_settings")],
            [InlineKeyboardButton(text="⬅️ Chiqish", callback_data="back_main")],
        ]
    )


def admin_tariffs_kb(tariffs: list[SignalTariff]) -> InlineKeyboardMarkup:
    buttons = []
    for t in tariffs:
        row = [
            InlineKeyboardButton(
                text=f"{'✅' if t.is_active else '❌'} {t.label} — ${float(t.price):.0f}",
                callback_data=f"admin_tariff_{t.id}",
            ),
            InlineKeyboardButton(
                text="✏️",
                callback_data=f"edit_tariff_{t.id}",
            ),
        ]
        buttons.append(row)
    buttons.append([InlineKeyboardButton(text="➕ Yangi tarif", callback_data="admin_add_tariff")])
    buttons.append([InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def admin_social_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="📷 Instagram", callback_data="admin_social_instagram")],
            [InlineKeyboardButton(text="🐦 Twitter (X)", callback_data="admin_social_twitter")],
            [InlineKeyboardButton(text="▶️ YouTube", callback_data="admin_social_youtube")],
            [InlineKeyboardButton(text="🌐 Website", callback_data="admin_social_website")],
            [InlineKeyboardButton(text="🆓 Bepul kanal", callback_data="admin_social_free")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
        ]
    )


# ─── Course Tariffs (Inline) ─────────────────────────────────────────

def course_tariff_selection_kb(tariffs: list[SignalTariff]) -> InlineKeyboardMarkup:
    buttons = [
        [InlineKeyboardButton(
            text=f"{t.name} — ${float(t.price):.0f}",
            callback_data=f"course_tariff_{t.id}",
        )]
        for t in tariffs
    ]
    buttons.append([InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_main")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def course_payment_method_kb(tariff_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="⭐ Telegram Stars", callback_data=f"course_stars_{tariff_id}")],
            [InlineKeyboardButton(text="💳 Karta orqali", callback_data=f"course_card_{tariff_id}")],
            [InlineKeyboardButton(text="🔗 TRON TRC20 (USDT)", callback_data=f"course_tron_{tariff_id}")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="back_course_tariffs")],
        ]
    )


def course_card_payment_kb(tariff_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="📤 Chek yuborish", callback_data=f"course_upload_check_{tariff_id}")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data=f"course_pay_method_{tariff_id}")],
        ]
    )


def course_tron_payment_kb(tariff_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="📤 Skrinshot yuborish", callback_data=f"course_upload_tron_{tariff_id}")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data=f"course_pay_method_{tariff_id}")],
        ]
    )


def course_bnb_payment_kb(tariff_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="📤 Skrinshot yuborish", callback_data=f"course_upload_bnb_{tariff_id}")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data=f"course_pay_method_{tariff_id}")],
        ]
    )


# ─── Admin Subscriptions ─────────────────────────────────────────────

def admin_subs_menu_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="➕ Signal obuna qo'shish", callback_data="admin_add_signal_sub")],
            [InlineKeyboardButton(text="📚 Kurs obuna qo'shish", callback_data="admin_add_course_sub")],
            [InlineKeyboardButton(text="✅ Faol obunalar", callback_data="admin_list_active_subs")],
            [InlineKeyboardButton(text="⏰ Tugagan obunalar", callback_data="admin_list_expired_subs")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")],
        ]
    )


def admin_sub_confirm_kb(product_type: str) -> InlineKeyboardMarkup:
    confirm_data = f"admin_confirm_sub_{product_type}"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="✅ Tasdiqlash", callback_data=confirm_data)],
            [InlineKeyboardButton(text="❌ Bekor qilish", callback_data="admin_cancel_sub")],
        ]
    )


def admin_subs_back_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="❌ Bekor qilish", callback_data="admin_cancel_sub")],
        ]
    )


def admin_subs_list_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="✅ Faol obunalar", callback_data="admin_list_active_subs")],
            [InlineKeyboardButton(text="⏰ Tugagan obunalar", callback_data="admin_list_expired_subs")],
            [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_subs")],
        ]
    )