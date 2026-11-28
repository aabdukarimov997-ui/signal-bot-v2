# Telegram Mini App — 3D interfeys

Mini App bot xizmatining **`/miniapp/`** yo‘lida ishlaydi. `website/` ichidagi tayyor
Next.js saytga tegilmaydi: uning deploy, sahifa, baza va admin paneli mustaqil qoladi.
Rejim almashtirish **Telegram botning `/admin` paneliga** qo‘shilgan.

## Ishga tushirish

1. Bot xizmatini odatdagidek deploy qiling (`entrypoint.sh` yoki `python -m bot.main`).
   Endi HTTP server, polling va Mini App bitta jarayonda ishlaydi. `PORT` avtomatik
   o‘qiladi; bind manzili `0.0.0.0`. `/health`, `/ready` va production `/` health
   endpointlari saqlangan. Alohida `python -m bot.healthcheck` jarayonini production
   bot bilan bir portda ishga tushirmang.
2. Bot xizmatiga **public HTTPS domen** bering. Tayyor sayt domeni emas, bot
   xizmatining domeni kerak. Telegram API va odatdagi to‘lov provayderlariga
   outbound ulanish production serverda ochiq bo‘lishi kerak.
3. Botda `/admin` → **📱 Mini App / Oldingi rejim** → **🔗 Mini App URL sozlash**.
   To‘liq manzil yuboring, masalan:
   `https://BOT-SERVICE.up.railway.app/miniapp`.
   Muqobil: `.env` ichida `MINIAPP_URL` sozlang. DB orqali saqlangan URL ustun turadi.
4. Shu panelda **🚀 Mini App rejimi** tugmasini bosing.
5. Foydalanuvchi botning **shaxsiy chatida** `/start` yoki `/menu` yuboradi va
   **🚀 Mini App ochish** tugmasini bosadi. Guruhda Web App keyboard ishlamaydi.
   Agar BotFather orqali Main Mini App / menu button ham sozlasangiz, aynan shu
   HTTPS URLdan foydalaning; buni dastur majburiy yoki avtomatik o‘zgartirmaydi.

Default rejim **classic**. URL noto‘g‘ri yoki bo‘sh bo‘lsa Mini App rejimini yoqib
bo‘lmaydi, menyu eski ko‘rinishga xavfsiz qaytadi. Admin Mini App o‘chirilganida ham
uni tekshirishi mumkin, oddiy foydalanuvchi APIga kira olmaydi.

## Oldingi rejimga qaytish

`/admin` → **📱 Mini App / Oldingi rejim** → **📱 Oldingi rejim**.

Almashtirish DBdagi `project_settings.interface_mode` qiymatida saqlanadi, restartda
saqlanib qoladi. Foydalanuvchilar `/start` yoki `/menu` bosganidan keyin yangilangan
keyboardni ko‘radi. Allaqachon yuborilgan Telegram keyboardni orqadan o‘zgartirish
imkoni yo‘q. Mini App menyusidagi **📱 Oldingi menyu** tugmasi bitta foydalanuvchiga
eski keyboardni ochadi, global rejimni o‘zgartirmaydi. `/admin` har doim ishlaydi.
Obuna, balans, bonus, to‘lov va sayt ma’lumotlari o‘zgarmaydi.

## Funksiyalar va ishlash usuli

- CSS 3D tanga, perspektiva, yoritilgan kartalar; desktop sidebar va mobil bottom nav.
- Bosh sahifa: haqiqiy tariflar, mavjud loyalty chegirmasi, obuna holati va referal bonuslar.
- Hisob: obunalar va oxirgi 10 ta to‘lov, DBdagi aynan shu foydalanuvchi bo‘yicha.
- Referal: haqiqiy shaxsiy havola, nusxalash, Telegram orqali ulashish, statistika.
- Signal/darslar, tariflar, barcha yoqilgan to‘lov usullari, promo, viktorina,
  hisob/obuna boshqaruvi, ijtimoiy havolalar, support va admin bo‘limlari bir xil
  **mavjud aiogram Dispatcher/handler/service** orqali ishlaydi. Bot logikasi
  qaytadan yozilmagan, narx yoki tasdiqlash mexanizmi front-endga ko‘chirilmagan.
- Botning matni va inline tugmalari Mini App ichida aks ettiriladi. Matn/promo
  kiritish hamda JPG/PNG/WEBP chek yuklash (8 MBgacha) qo‘llanadi. Avval bot oqimida
  chek yuborish tugmasini tanlash kerak. FSM polling bilan bir xil jarayonda.
- Javoblar Telegram chatiga ham yuboriladi. **Telegram Stars native invoice**,
  rasm/QR ko‘rish, video, hujjat va katta fayl yuborish bot chatida davom etadi;
  Mini App buni alohida belgi va «Ochish» havolasi bilan ko‘rsatadi. Mini App ichida
  video/document uploader yoki alohida to‘lov dvigateli yo‘q. Chatda tugallangan
  to‘lovlar va admin tasdiqlari hisobni yangilaganda ko‘rinadi.
- Admin panelning barcha mavjud inline bo‘limlari adapter orqali ham ochiladi;
  yangi rejim sozlamasi bot admin panelida joylashgan, tayyor sayt adminida emas.

## Xavfsizlik

- Har bir API so‘rovida `X-Telegram-Init-Data` imzosi bot tokeni bilan HMAC-SHA256
  orqali tekshiriladi. `initDataUnsafe` va brauzerdan yuborilgan user IDga ishonilmaydi.
- Imzo muddati 1 soat; seans tugaganda Mini App’ni qayta ochish kerak. Browserda
  token, payment secret yoki Telegram bot tokeni saqlanmaydi.
- Bloklanganlar uchun API yopiq. Callback faqat shu userning shaxsiy chatiga server
  yuborgan, hozirgi keyboarddagi tugmadan qabul qilinadi. Boshqa user/admin callback
  payloadini taxmin qilib yuborish mumkin emas. Admin huquqi olib tashlansa eski
  admin sessiyasi va FSM holati bekor qilinadi.
- Parallel HTTP amallari bloklanadi; polling va Mini App FSM amallari bir user
  uchun `SimpleEventIsolation` orqali ketma-ket bajariladi.
- Javoblar task-local kontekstda faqat egasining chatidan olinadi. Boshqa
  foydalanuvchi/adminlarga yuborilgan bildirishnomalar javobga aralashmaydi.
- HTML cheklangan teglar bilan DOM orqali tozalanadi; tashqi havola protokollari
  tekshiriladi. Rasm formati va hajmi serverda tekshiriladi. API javoblari keshlanmaydi.
- Adapter oxirgi 60 ta bot xabarini, 1 soat faol sessiyani, ko‘pi bilan 1000 userni
  xotirada ushlab turadi. Restartdan keyin bo‘limni qayta ochish kerak. Bitta bot
  tokeni uchun bitta polling replica ishlating (mavjud MemoryStorage cheklovi).

## Namoyish va tekshirish

`python -m bot.healthcheck` — botni polling qilmasdan static dizayn namoyishi;
`/` → `/miniapp/`. Env uchun oddiy bot config talab qilinadi, API esa botsiz 503
qaytaradi. Telegram `initData` bo‘lmagan oddiy brauzerda aniq belgilangan **namuna
ma’lumotlari** ko‘rsatiladi; hech qanday haqiqiy hisob/to‘lov amali bajarilmaydi.

```bash
pip install -e '.[dev]'
pytest -q
```

`tests/test_miniapp.py` imzo/expiry/tampering, rejim/fallback, ban, haqiqiy DB tariflari,
callback ownership, admin huquqi bekor qilinishi, FSM va rasm upload oqimini Telegramga
ulanmasdan tekshiradi. Production Telegram to‘lovini haqiqiy bot va test hisobi bilan
alohida smoke-test qiling.
