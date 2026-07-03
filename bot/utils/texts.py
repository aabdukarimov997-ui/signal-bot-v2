# ─── Bot Text Strings (Uzbek) ─────────────────────────────────────────

# Main
START_TEXT = (
    "👋 <b>Signal kanal botiga xush kelibsiz!</b>\n\n"
    "Bu bot orqali siz professional signal kanaliga obuna bo'lishingiz "
    "va savdo signallarini olishingiz mumkin.\n\n"
    "Quyidagi menyudan kerakli bo'limni tanlang:"
)

# Signal
SIGNAL_TEXT = "📈 <b>Signal kanal</b>\n\nO'zingizga mos tarifni tanlang:"

# Course
COURSE_TEXT = "📚 <b>Darslar</b>\n\nO'zingizga mos tarifni tanlang:"

# Payment Method
PAYMENT_METHOD_TEXT = "💳 <b>To'lov usulini tanlang:</b>"

# Stars Payment
STARS_PAYMENT_TEXT = (
    "⭐ <b>Telegram Stars orqali to'lov</b>\n\n"
    "To'lovni amalga oshirish uchun quyidagi tugmani bosing.\n"
    "To'lov avtomatik tarzda tasdiqlanadi!"
)

STARS_SUCCESS_TEXT = (
    "✅ <b>To'lov muvaffaqiyatli amalga oshirildi!</b>\n\n"
    "Obunangiz faollashtirildi. Signal kanaliga invite link yuborildi."
)

STARS_SUCCESS_COURSE_TEXT = (
    "✅ <b>To'lov muvaffaqiyatli amalga oshirildi!</b>\n\n"
    "Obunangiz faollashtirildi. Darslar kanaliga invite link yuborildi."
)

PAYMENT_APPROVED_COURSE_TEXT = (
    "✅ <b>To'lov tasdiqlandi!</b>\n\n"
    "Obunangiz faollashtirildi. Darslar kanaliga invite link:\n"
    "{invite_link}\n\n"
    "Omad tilaymiz! 🚀"
)

# Visa Payment
VISA_PAYMENT_TEXT = (
    "💳 <b>Visa karta orqali to'lov</b>\n\n"
    "Pul o'tkazish uchun quyidagi karta raqamiga to'lov qiling:\n\n"
    "<code>{card_number}</code>\n"
    "Qabul qiluvchi: <b>{card_holder}</b>\n\n"
    "To'lovni amalga oshirgach, pastdagi tugma orqali skrinshot yuboring."
)

VISA_UPLOAD_TEXT = (
    "📤 <b>Skrinshot yuboring</b>\n\n"
    "Visa karta to'lov skrinshotini yuboring.\n"
    "Admin tekshirib, tasdiqlaydi."
)

VISA_RECEIVED_TEXT = (
    "✅ <b>Skrinshot qabul qilindi!</b>\n\n"
    "Admin tekshiruvidan so'ng sizga xabar beramiz.\n"
    "Bu jarayon bir necha daqiqa olishi mumkin."
)

# Card Payment
CARD_PAYMENT_TEXT = (
    "💳 <b>Karta orqali to'lov</b>\n\n"
    "Pul o'tkazish uchun quyidagi karta raqamiga to'lov qiling:\n\n"
    "<code>{card_number}</code>\n"
    "Qabul qiluvchi: <b>{card_holder}</b>\n\n"
    "To'lovni amalga oshirgach, pastdagi tugma orqali chek rasmini yuboring."
)

CHECK_UPLOAD_TEXT = (
    "📤 <b>Chek rasmini yuboring</b>\n\n"
    "Bank ilovasidagi to'lov chekining skrinshotini yuboring.\n"
    "Admin tekshirib, tasdiqlaydi."
)

CHECK_RECEIVED_TEXT = (
    "✅ <b>Chek qabul qilindi!</b>\n\n"
    "Admin tekshiruvidan so'ng sizga xabar beramiz.\n"
    "Bu jarayon bir necha daqiqa olishi mumkin."
)

# TRON TRC20 Payment
TRON_PAYMENT_TEXT = (
    "🔗 <b>TRON TRC20 (USDT) orqali to'lov</b>\n\n"
    "USDT o'tkazish uchun quyidagi wallet addressga pul yuboring:\n\n"
    "<code>{wallet_address}</code>\n\n"
    "⚠️ <b>Muhim:</b> Faqat TRC20 (TRON) network orqali yuboring!\n\n"
    "To'lovni amalga oshirgach, pastdagi tugma orqali skrinshot yuboring."
)

TRON_UPLOAD_TEXT = (
    "📤 <b>Skrinshot yuboring</b>\n\n"
    "TRON wallet ilovasidagi to'lov skrinshotini yuboring.\n"
    "Admin tekshirib, tasdiqlaydi."
)

TRON_RECEIVED_TEXT = (
    "✅ <b>Skrinshot qabul qilindi!</b>\n\n"
    "Admin tekshiruvidan so'ng sizga xabar beramiz.\n"
    "Bu jarayon bir necha daqiqa olishi mumkin."
)

# BNB BEP20 Payment
BNB_PAYMENT_TEXT = (
    "🟡 <b>BNB BEP20 (USDT) orqali to'lov</b>\n\n"
    "USDT o'tkazish uchun quyidagi wallet addressga pul yuboring:\n\n"
    "<code>{wallet_address}</code>\n\n"
    "⚠️ <b>Muhim:</b> Faqat BEP20 (BSC) network orqali yuboring!\n\n"
    "To'lovni amalga oshirgach, pastdagi tugma orqali skrinshot yuboring."
)

BNB_UPLOAD_TEXT = (
    "📤 <b>Skrinshot yuboring</b>\n\n"
    "BNB wallet ilovasidagi to'lov skrinshotini yuboring.\n"
    "Admin tekshirib, tasdiqlaydi."
)

BNB_RECEIVED_TEXT = (
    "✅ <b>Skrinshot qabul qilindi!</b>\n\n"
    "Admin tekshiruvidan so'ng sizga xabar beramiz.\n"
    "Bu jarayon bir necha daqiqa olishi mumkin."
)

# Payment Approved
PAYMENT_APPROVED_TEXT = (
    "✅ <b>To'lov tasdiqlandi!</b>\n\n"
    "Obunangiz faollashtirildi. Signal kanaliga invite link:\n"
    "{invite_link}\n\n"
    "Omad tilaymiz! 🚀"
)

# Payment Rejected
PAYMENT_REJECTED_TEXT = (
    "❌ <b>To'lov rad etildi.</b>\n\n"
    "Pul tushmagan yoki chek noto'g'ri. Iltimos, qayta urinib ko'ring "
    "yoki admin bilan bog'laning."
)

# Admin Notification
ADMIN_PAYMENT_NOTIFICATION = (
    "💳 <b>Yangi to'lov</b>\n\n"
    "👤 Foydalanuvchi: {full_name}\n"
    "🆔 ID: {telegram_id}\n"
    "💰 Tarif: {tariff_name}\n"
    "💵 Summa: ${amount}\n"
    "🔗 Usul: {payment_method}\n"
    "📅 Vaqt: {time}\n\n"
    "Quyidagi tugmalar orqali tasdiqlang yoki rad eting:"
)

# Account
ACCOUNT_TEXT = (
    "👤 <b>Hisobim</b>\n\n"
    "🆔 ID: <code>{telegram_id}</code>\n"
    "📛 Ism: {full_name}\n"
    "📊 Obuna: {subscription_status}\n"
    "📅 Muddat: {expiry_date}\n"
    "👥 Referallar: {referral_count}"
)

NO_SUBSCRIPTION = "Obuna yo'q"
FREE_CHANNEL_TEXT = "🆓 <b>Bepul kanal</b>\n\nQuyidagi havola orqali bepul kanalga qo'shiling:"

# Referral
REFERRAL_TEXT = (
    "👥 <b>Referal tizimi</b>\n\n"
    "Do'stlaringizni taklif qiling va bonuslarga ega bo'ling!\n\n"
    "Sizning referal linkingiz:\n"
    "<code>{link}</code>\n\n"
    "Taklif qilinganlar: <b>{count}</b>"
)

# Social
SOCIAL_TEXT = "🌐 <b>Ijtimoiy tarmoqlar</b>\n\nQuyidagi havolalar orqali bizni kuzatishingiz mumkin:"

# Help
HELP_TEXT = (
    "☎️ <b>Yordam</b>\n\n"
    "Savollaringiz bo'lsa, admin bilan bog'laning:\n"
    "📩 {admin_link}\n\n"
    "<b>Qoidalar:</b>\n"
    "• Kanal linklarini tarqatish mumkin emas\n"
    "• Faqat admin contact"
)

# Admin
ADMIN_WELCOME = "👋 <b>Admin panelga xush kelibsiz!</b>"

ADMIN_PAYMENTS_EMPTY = "📭 Hozircha kutilayotgan to'lovlar yo'q."

ADMIN_STATS_TEXT = (
    "📈 <b>Statistika</b>\n\n"
    "👥 Foydalanuvchilar: <b>{users}</b>\n"
    "✅ Aktiv obunalar: <b>{subscriptions}</b>\n"
    "💰 Umumiy daromad: <b>${revenue}</b>\n"
    "📅 Bugungi daromad: <b>${today_revenue}</b>"
)

ADMIN_TARIFFS_TEXT = "📊 <b>Tariflar boshqaruvi</b>\n\nQuyidagi tariflarni tahrirlashingiz mumkin:"

ADMIN_SOCIAL_TEXT = (
    "🔗 <b>Ijtimoiy tarmoq havolalari</b>\n\n"
    "Quyidagi havolalarni o'zgartirish uchun tugmani bosing."
)

# Errors / Generic
ERROR_OCCURRED = "❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
NOT_ADMIN = "⛔ Bu buyruq faqat adminlar uchun!"
BANNED_USER = "⛔ Siz bloklangansiz. Admin bilan bog'laning: @treder7090"

# Subscription expiry reminders
REMINDER_7_DAYS = (
    "⏳ <b>Eslatma!</b>\n\n"
    "Signal kanaliga obunangiz <b>7 kundan</b> keyin tugaydi.\n"
    "Obunani uzaytirish uchun 📈 Signal kanal bo'limiga o'ting."
)

REMINDER_3_DAYS = (
    "⏳ <b>Eslatma!</b>\n\n"
    "Signal kanaliga obunangiz <b>3 kundan</b> keyin tugaydi.\n"
    "Obunani uzaytirishni unutmang!"
)

REMINDER_1_DAY = (
    "⏳ <b>Eslatma!</b>\n\n"
    "Signal kanaliga obunangiz <b>1 kundan</b> keyin tugaydi!\n"
    "Obunani uzaytirish uchun 📈 Signal kanal bo'limiga o'ting."
)

SUBSCRIPTION_EXPIRED = (
    "❌ <b>Obunangiz tugadi.</b>\n\n"
    "Signal kanaliga kirish huquqi yopildi.\n"
    "Qayta obuna bo'lish uchun 📈 Signal kanal bo'limiga o'ting."
)

# Course subscription expiry reminders
REMINDER_7_DAYS_COURSE = (
    "⏳ <b>Eslatma!</b>\n\n"
    "Darslar kanaliga obunangiz <b>7 kundan</b> keyin tugaydi.\n"
    "Obunani uzaytirish uchun 📚 Darslar bo'limiga o'ting."
)

REMINDER_3_DAYS_COURSE = (
    "⏳ <b>Eslatma!</b>\n\n"
    "Darslar kanaliga obunangiz <b>3 kundan</b> keyin tugaydi.\n"
    "Obunani uzaytirishni unutmang!"
)

REMINDER_1_DAY_COURSE = (
    "⏳ <b>Eslatma!</b>\n\n"
    "Darslar kanaliga obunangiz <b>1 kundan</b> keyin tugaydi!\n"
    "Obunani uzaytirish uchun 📚 Darslar bo'limiga o'ting."
)

SUBSCRIPTION_EXPIRED_COURSE = (
    "❌ <b>Darslar obunangiz tugadi.</b>\n\n"
    "Darslar kanaliga kirish huquqi yopildi.\n"
    "Qayta obuna bo'lish uchun 📚 Darslar bo'limiga o'ting."
)