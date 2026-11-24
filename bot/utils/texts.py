# ─── Bot Text Strings (Uzbek) ─────────────────────────────────────────

# Main
START_TEXT = (
    "👋 <b>Signal kanal botiga xush kelibsiz!</b>\n\n"
    "Bu bot orqali siz professional signal kanaliga obuna bo'lishingiz "
    "va savdo signallarini olishingiz mumkin.\n\n"
    "Quyidagi menyudan kerakli bo'limni tanlang:"
)

# Signal
SIGNAL_TEXT = (
    "🚀 <b>VIP KRIPTO SIGNALLAR</b>\n\n"
    "💰 <b>1 OY — $25</b>\n\n"
    "🔥 <b>3 OY — $50</b> (33% chegirma)\n\n"
    "👑 <b>6 OY — $100</b> (33% chegirma)\n\n"
    "🎁 <b>6 oylik obuna olganlarga 1 OY Telegram Premium BEPUL!</b>\n\n"
    "📈 Aniq signallar • Risk boshqaruvi • Tezkor xabarlar\n\n"
    "<b>Hoziroq VIP kanalga qo'shiling!</b>"
)

ALREADY_SUBSCRIBED_TEXT = "✅ <b>Sizda faol obuna bor!</b>\n\nSignal kanali sizda mavjud. Kanalga kirishingiz mumkin."

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
    "Obunangiz faollashtirildi. Darslar kanallariga invite linklar:\n\n"
    "{invite_links}\n\n"
    "Omad tilaymiz! 🚀"
)

COURSE_ALREADY_SUBSCRIBED_TEXT = (
    "✅ <b>Sizda darslar obunasi bor!</b>\n\nDarslar kanallari sizda mavjud. Kanallarga kirishingiz mumkin."
)

# Faol obunasi borlarga chegirma bildirishnomasi
ACTIVE_SUB_DISCOUNT_NOTICE_TEXT = (
    "✅ <b>Sizda faol obuna bor!</b>\n\n"
    "Obunangizni uzaytirganda sizga <b>{discount}% chegirma</b> taqdim etiladi."
)

COURSE_ACTIVE_SUB_DISCOUNT_NOTICE_TEXT = (
    "✅ <b>Sizda darslar obunasi bor!</b>\n\n"
    "Darslarni uzaytirganda sizga <b>{discount}% chegirma</b> taqdim etiladi."
)

# Chegirma bilan narx satri
DISCOUNTED_PRICE_LINE_TEXT = "💰 <b>Narx:</b> {price}  ({saved} tejaysiz)"
ORIGINAL_PRICE_LINE_TEXT = "🏷 Asl narx: {price}"

# Visa Payment
VISA_PAYMENT_TEXT = (
    "💳 <b>Visa karta orqali to'lov</b>\n\n"
    "Pul o'tkazish uchun quyidagi karta raqamiga to'lov qiling:\n\n"
    "<code>{card_number}</code>\n"
    "Qabul qiluvchi: <b>{card_holder}</b>\n\n"
    "💰 <b>To'lov summasi:</b>\n"
    "💵 {usd_amount}  ➡️  🇺🇿 <b>{uzs_amount}</b>\n"
    "💱 Kurs: 1 USD = {exchange_rate} UZS\n\n"
    "To'lovni amalga oshirgach, pastdagi tugma orqali skrinshot yuboring."
)

VISA_UPLOAD_TEXT = (
    "📤 <b>Skrinshot yuboring</b>\n\nVisa karta to'lov skrinshotini yuboring.\nAdmin tekshirib, tasdiqlaydi."
)

VISA_RECEIVED_TEXT = (
    "✅ <b>Skrinshot qabul qilindi!</b>\n\n"
    "Admin tekshiruvidan so'ng sizga xabar beramiz.\n"
    "Bu jarayon bir necha daqiqa olishi mumkin."
)

# Card Payment
CARD_PAYMENT_TEXT = (
    "💳 <b>UZCARD / HUMO orqali to'lov</b>\n\n"
    "Pul o'tkazish uchun quyidagi karta raqamiga to'lov qiling:\n\n"
    "<code>{card_number}</code>\n"
    "Qabul qiluvchi: <b>{card_holder}</b>\n\n"
    "💰 <b>To'lov summasi:</b>\n"
    "💵 {usd_amount}  ➡️  🇺🇿 <b>{uzs_amount}</b>\n"
    "💱 Kurs: 1 USD = {exchange_rate} UZS\n\n"
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

# TRON TRC20 Payment (avtomatik)
TRON_PAYMENT_TEXT = (
    "<b>Bevosita USDT: provayder komissiyasiz</b>\n"
    "Tarmoq haqi saqlanadi. Tezlik blokcheyn tasdig'iga bog'liq.\n\n"
    "🔗 <b>TRON TRC20 (USDT) orqali to'lov</b>\n\n"
    "Quyidagi <b>sizning shaxsiy manzilingizga</b> to'lovni yuboring:\n\n"
    "💰 Summa: <b>{amount} USDT</b>\n"
    "👛 Sizning manzilingiz: <code>{wallet_address}</code>\n\n"
    "⚠️ <b>Muhim:</b> Faqat TRC20 (TRON) network orqali yuboring!\n"
    "⚠️ Bu manzil faqat siz uchun — boshqa birovga yubormang.\n\n"
    "<b>To'lov qo'llanmasi:</b>\n"
    "1. Wallet ilovasida Send/Jo'natish bo'limini oching.\n"
    "2. Wallet manzilini nusxalab kiriting.\n"
    "3. Network sifatida faqat TRON/TRC20 ni tanlang.\n"
    "4. Summani kiriting va tranzaksiyani tasdiqlang.\n"
    "5. Tranzaksiya yuborilgach, botdagi «To'lovni tekshirish» tugmasini bosing.\n\n"
    "Rasmiy walletlar: <a href='https://www.tronlink.org/'>TronLink</a> yoki "
    "<a href='https://trustwallet.com/'>Trust Wallet</a>.\n"
    "Tranzaksiyani <a href='https://tronscan.org/'>TronScan</a> orqali tekshirishingiz mumkin.\n\n"
    "<b>Qonuniylik eslatmasi:</b> O'zbekiston Respublikasidagi amaldagi qonunlar, "
    "soliq va valyuta qoidalariga rioya qiling. Faqat rasmiy/litsenziyalangan "
    "xizmatlardan foydalaning va to'lov tasdiqlarini saqlang. Bu yuridik maslahat emas.\n\n"
    "✅ To'lov blokcheyndagi tranzaksiya orqali avtomatik tasdiqlanadi "
    "(odatda 1-2 daqiqa)."
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

# BNB BEP20 Payment (avtomatik)
BNB_PAYMENT_TEXT = (
    "<b>Bevosita USDT: provayder komissiyasiz</b>\n"
    "Tarmoq haqi saqlanadi. Tezlik blokcheyn tasdig'iga bog'liq.\n\n"
    "🟡 <b>BNB BEP20 (USDT) orqali to'lov</b>\n\n"
    "Quyidagi <b>sizning shaxsiy manzilingizga</b> to'lovni yuboring:\n\n"
    "💰 Summa: <b>{amount} USDT</b>\n"
    "👛 Sizning manzilingiz: <code>{wallet_address}</code>\n\n"
    "⚠️ <b>Muhim:</b> Faqat BEP20 (BSC) network orqali yuboring!\n"
    "⚠️ Bu manzil faqat siz uchun — boshqa birovga yubormang.\n\n"
    "<b>To'lov qo'llanmasi:</b>\n"
    "1. Wallet ilovasida Send/Jo'natish bo'limini oching.\n"
    "2. Wallet manzilini nusxalab kiriting.\n"
    "3. Network sifatida faqat BNB Smart Chain/BEP20 ni tanlang.\n"
    "4. Summani kiriting va tranzaksiyani tasdiqlang.\n"
    "5. Tranzaksiya yuborilgach, botdagi «To'lovni tekshirish» tugmasini bosing.\n\n"
    "Rasmiy walletlar: <a href='https://trustwallet.com/'>Trust Wallet</a> yoki "
    "<a href='https://metamask.io/'>MetaMask</a>.\n"
    "Tranzaksiyani <a href='https://bscscan.com/'>BscScan</a> orqali tekshirishingiz mumkin.\n\n"
    "<b>Qonuniylik eslatmasi:</b> O'zbekiston Respublikasidagi amaldagi qonunlar, "
    "soliq va valyuta qoidalariga rioya qiling. Faqat rasmiy/litsenziyalangan "
    "xizmatlardan foydalaning va to'lov tasdiqlarini saqlang. Bu yuridik maslahat emas.\n\n"
    "✅ To'lov blokcheyndagi tranzaksiya orqali avtomatik tasdiqlanadi "
    "(odatda 1-2 daqiqa)."
)

CRYPTO_PAY_GUIDE_TEXT = (
    "<b>Crypto Pay to'lov qo'llanmasi</b>\n\n"
    "1. «Crypto Pay invoice ochish» tugmasini bosing.\n"
    "2. Faqat ochilgan rasmiy invoice oynasidagi summani tekshiring.\n"
    "3. CryptoBot ichida USDT va mavjud networkni tanlang.\n"
    "4. To'lovni tasdiqlang va invoice oynasini yopmang.\n"
    "5. Obuna faqat server to'lovni «paid» deb tekshirgandan keyin faollashadi.\n\n"
    "Crypto Pay balansi loyiha uchun alohida provider balansiga tushadi; "
    "provayderning amaldagi komissiyasi va network haqi invoice tasdiqlanishidan oldin ko'rsatilishi mumkin.\n\n"
    "Rasmiy xizmat: <a href='https://t.me/CryptoBot'>CryptoBot</a>.\n"
    "<b>Qonuniylik eslatmasi:</b> O'zbekistondagi amaldagi qonunlar, "
    "soliq va valyuta qoidalariga rioya qiling. Faqat rasmiy/litsenziyalangan "
    "xizmatlardan foydalaning. Bu yuridik maslahat emas."
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

# TON Payment
TON_PAYMENT_TEXT = (
    "💎 <b>TON (The Open Network) orqali to'lov</b>\n\n"
    "USDT o'tkazish uchun quyidagi wallet addressga pul yuboring:\n\n"
    "<code>{wallet_address}</code>\n\n"
    "⚠️ <b>Muhim:</b> Faqat TON network orqali yuboring! TON manziliga TRC20/BEP20 yubormang.\n\n"
    "<b>To'lov qo'llanmasi:</b> TON walletda Send bo'limini oching, manzilni nusxalang, "
    "faqat TON networkni tanlang va tranzaksiya skrinshotini yuboring.\n"
    "Rasmiy wallet: <a href='https://tonkeeper.com/'>Tonkeeper</a>. "
    "Tranzaksiyani <a href='https://tonviewer.com/'>TON Viewer</a> orqali tekshiring.\n\n"
    "<b>Qonuniylik eslatmasi:</b> O'zbekistondagi amaldagi qonun, soliq va valyuta talablariga rioya qiling; "
    "faqat rasmiy/litsenziyalangan xizmatlardan foydalaning. Bu yuridik maslahat emas.\n\n"
    "To'lovni amalga oshirgach, pastdagi tugma orqali skrinshot yuboring."
)

TON_UPLOAD_TEXT = (
    "📤 <b>Skrinshot yuboring</b>\n\n"
    "TON wallet ilovasidagi to'lov skrinshotini yuboring.\n"
    "Admin tekshirib, tasdiqlaydi."
)

TON_RECEIVED_TEXT = (
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
    "🧾 ID: <code>#{invoice_id}</code>\n"
    "👤 Foydalanuvchi: {full_name}\n"
    "🆔 Telegram: {telegram_id}\n"
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

SUBSCRIPTION_HISTORY_TEXT = (
    "📜 <b>Obunalar tarixi</b>\n\n"
    "{rows}\n\n"
    "Jami: <b>{total}</b> ta obuna"
)

SUBSCRIPTION_HISTORY_EMPTY = "📜 <b>Obunalar tarixi</b>\n\nHozircha obunalar yo'q."

SUBSCRIPTION_HISTORY_ROW = "{icon} <b>{tariff}</b> — {status}\n    📅 {start} → {end}\n"

NO_SUBSCRIPTION = "Obuna yo'q"
FREE_CHANNEL_TEXT = "🆓 <b>Bepul kanal</b>\n\nQuyidagi havola orqali bepul kanalga qo'shiling:"

# Referral
REFERRAL_TEXT = (
    "👥 <b>Referal tizimi</b>\n\n"
    "Do'stlaringizni taklif qiling va bonuslarga ega bo'ling!\n\n"
    "🔗 <b>Sizning referal linkingiz:</b>\n"
    "<code>{link}</code>\n\n"
    "👤 <b>Taklif qilinganlar:</b> {count}\n\n"
    "💎 <b>Maxsus bonus:</b>\n"
    "Agar referallaringizdan <b>5 nafari VIP signal kanaliga obuna sotib olsa</b>, "
    "sizga <b>1 OYLIK VIP Signal kanal obunasi BEPUL</b> taqdim etiladi! 🎁\n\n"
    "📊 <b>Bonus uchun kerak:</b> {active_count} / 5 ta faol obuna"
)

# Social
SOCIAL_TEXT = "🌐 <b>Ijtimoiy tarmoqlar</b>\n\nQuyidagi havolalar orqali bizni kuzatishingiz mumkin:"

# Help
HELP_TEXT = (
    "☎️ <b>Yordam</b>\n\n"
    "Savollaringiz bo'lsa, admin bilan bog'laning:\n"
    "📩 {admin_link}\n\n"
    "Yoki pastdagi tugma orqali bot orqali xabar yuboring. "
    "Admin javob beradi!\n\n"
    "<b>Qoidalar:</b>\n"
    "• Kanal linklarini tarqatish mumkin emas\n"
    "• Faqat admin contact"
)

CONTACT_START_TEXT = (
    "💬 <b>Xabar yuborish</b>\n\n"
    "Quyidagi xabaringizni yozing yoki rasm yuboring.\n"
    "Admin tez orada javob beradi!\n\n"
    "<i>Bekor qilish uchun ❌ tugmasini bosing.</i>"
)

CONTACT_RECEIVED_TEXT = (
    "✅ <b>Xabaringiz qabul qilindi!</b>\n\nAdmin tez orada siz bilan bog'lanadi.\nIltimos, kutib turing.⏳"
)

# Admin
ADMIN_WELCOME = "👋 <b>Admin panelga xush kelibsiz!</b>"

ADMIN_PAYMENTS_EMPTY = "📭 Hozircha kutilayotgan to'lovlar yo'q."

ADMIN_STATS_TEXT = (
    "📈 <b>Statistika</b>\n\n"
    "👥 Foydalanuvchilar: <b>{users}</b>\n"
    "✅ Aktiv obunalar: <b>{subscriptions}</b>\n"
    "🔐 Kanal a'zolari: <b>{channel_members}</b>\n"
    "💰 Umumiy daromad: <b>${revenue}</b>\n"
    "📅 Bugungi daromad: <b>${today_revenue}</b>"
)

ADMIN_TARIFFS_TEXT = "📊 <b>Tariflar boshqaruvi</b>\n\nQuyidagi tariflarni tahrirlashingiz mumkin:"

ADMIN_SOCIAL_TEXT = "🔗 <b>Ijtimoiy tarmoq havolalari</b>\n\nQuyidagi havolalarni o'zgartirish uchun tugmani bosing."

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
    "⏳ <b>Eslatma!</b>\n\nSignal kanaliga obunangiz <b>3 kundan</b> keyin tugaydi.\nObunani uzaytirishni unutmang!"
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
    "⏳ <b>Eslatma!</b>\n\nDarslar kanaliga obunangiz <b>3 kundan</b> keyin tugaydi.\nObunani uzaytirishni unutmang!"
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
