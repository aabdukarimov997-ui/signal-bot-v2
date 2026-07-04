from aiogram import Router, F
from aiogram.types import Message, CallbackQuery

from bot.models.user import User
from bot.services.settings_service import get_admin_ids
from bot.utils.keyboards import InlineKeyboardMarkup, InlineKeyboardButton
from bot.utils.helpers import safe_edit

admin_help_router = Router()

# Admin qo'llanma matni
ADMIN_HELP_TEXT = """
🤖 <b>AT Analysis Bot — Admin qo'llanmasi</b>

1️⃣ <b>Admin panelga kirish</b>
• /admin yuboring yoki menyudan "🔐 Admin panel" tugmasini bosing.

2️⃣ <b>Admin panel menyusi</b>
• 💳 To'lovlar — kutilayotgan to'lovlarni tasdiqlash/rad etish
• 📊 Tariflar — tariflarni boshqarish
• 👥 Foydalanuvchilar — foydalanuvchilarni ban/qayta tiklash
• 📈 Statistika — bot statistikasi
• 🔗 Ijtimoiy tarmoqlar — havolalarni o'zgartirish
• ⚙️ Sozlamalar — barcha sozlamalar

3️⃣ <b>⚙️ Sozlamalar (muhim)</b>
• /set_welcome_video — welcome video o'rnatish
• /test_video — videoni tekshirish
• Faqat shu botga to'g'ridan-to'g'ri yuborilgan videodan file_id ishlaydi!

4️⃣ <b>💳 To'lovlarni tasdiqlash</b>
• Admin panel → 💳 To'lovlar → ✅ Tasdiqlash yoki ❌ Rad etish

5️⃣ <b>👥 Foydalanuvchilar boshqaruvi</b>
• Ban qilish/orqaga qaytarish

6️⃣ <b>📈 Statistika</b>
• Foydalanuvchilar, obunalar, daromad

7️⃣ <b>🔗 Ijtimoiy tarmoqlar</b>
• Instagram, Twitter, YouTube, Website havolalari

8️⃣ <b>Tez buyruqlar</b>
• /admin — Admin panel
• /setup — Setup Wizard
• /set_welcome_video — Welcome video
• /test_video — Videoni test qilish

9️⃣ <b>Xatolik yuz bersa</b>
• /test_video — videoni tekshiring
• Railway loglarini ko'ring: railway logs
"""

@admin_help_router.message(F.text == "❓ Yordam")
async def admin_help_handler(message: Message, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        return
    await message.answer(ADMIN_HELP_TEXT, reply_markup=InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")]
    ]))

@admin_help_router.callback_query(F.data == "admin_help")
async def admin_help_callback(callback: CallbackQuery, user: User) -> None:
    if user.telegram_id not in await get_admin_ids():
        await callback.answer("⛔ Ruxsat yo'q", show_alert=True)
        return
    await safe_edit(callback.message, ADMIN_HELP_TEXT, reply_markup=InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_back")]
    ]))
    await callback.answer()