# 🚀 Signal Bot V2 — Railway Deploy Qo'llanmasi

## 📋 UMUMIY MA'LUMOT

Bu bot quyidagi to'lov usullarini qo'llab-quvvatlaydi:
- ⭐ Telegram Stars (avtomatik tasdiqlash)
- 💳 Karta orqali (admin tasdiqlash)
- 🔗 TRON TRC20 (USDT, admin tasdiqlash)
- 🟡 BNB BEP20 (USDT, admin tasdiqlash)

**Muhim:** Shaxsiy ma'lumotlar (wallet, karta, kanal ID) **bot admin panel** orqali sozlanadi.
`.env` faylida faqat **BOT_TOKEN** va **ADMIN_IDS** kiritiladi.

---

## 🔹 BOSQICH 1: GitHub Repo Yaratish

1. Brauzeringizda **https://github.com/new** oching
2. **Repository name:** `signal-bot-v2`
3. **Public** tanlang
4. **Create repository** bosing
5. Sahifa ochilgandan so'ng:
   - **"uploading an existing file"** tugmasini bosing
   - `/home/abdujalol/signal-bot-deploy/` papkasidan **barcha fayllarni** yuklang
   - **`.env` faylini YUKMANG!** (maxfiy ma'lumotlar)
   - **`.env.example` faylini yuklang** (shablon)
   - **Commit changes** bosing

---

## 🔹 BOSQICH 2: Railway Deploy

1. **https://railway.com** → yangi account bilan kiriting
2. **"New Project"** bosing
3. **"Deploy from GitHub"** tanlang
4. GitHub'ni Railway'ga ulash (Authorize)
5. **signal-bot-v2** repo'ni tanlang
6. Deploy avtomatik boshlanadi

---

## 🔹 BOSQICH 3: PostgreSQL Qo'shish

1. Railway loyiha sahifasida → **"New"** → **"Database"** → **"Add PostgreSQL"**
2. PostgreSQL servis yaratiladi
3. `DATABASE_URL` avtomatik Variables'ga qo'shiladi

---

## 🔹 BOSQICH 4: Environment Variables Sozlash

1. Railway loyiha → **Settings** → **Variables** bo'limiga o'ting
2. Quyidagi o'zgaruvchilarni qo'shing:

### ⚡ MINIMUM — Bot ishga tushishi uchun:

| Variable | Qiymat | Tavsif |
|----------|---------|--------|
| `BOT_TOKEN` | `8740499418:AAHcuM8agvh0PtBxXsNa56UTOrWy_N2bhuM` | BotFather'dan oling |
| `ADMIN_IDS` | `[651248882, 8539763294]` | Admin Telegram ID (JSON ro'yxat) |
| `ADMIN_LINK` | `@abdulloh1997ka` | Admin Telegram username |
| `DATABASE_URL` | *(Railway PostgreSQL avtomatik beradi)* | Avtomatik, kiritish shart emas |

### 💳 QO'SHIMCHA — To'lov usullari uchun (bot admin panel orqali ham sozlanadi):

| Variable | Qiymat | Tavsif |
|----------|---------|--------|
| `CARD_NUMBER` | `8600 2113 9408 0402` | Karta raqami |
| `CARD_HOLDER` | `FALONCHAYEV FALONCHA` | Karta egasi |
| `TON_WALLET_ADDRESS` | `T...` | TRON TRC20 wallet |
| `BNB_WALLET_ADDRESS` | `bnb1...` | BNB BEP20 wallet |
| `PRIVATE_CHANNEL_ID` | `-100...` | Signal kanal ID |
| `FREE_CHANNEL_LINK` | `https://t.me/...` | Bepul kanal link |
| `SOCIAL_INSTAGRAM` | `https://instagram.com/...` | Instagram |
| `SOCIAL_TWITTER` | `https://twitter.com/...` | Twitter |
| `SOCIAL_YOUTUBE` | `https://youtube.com/...` | YouTube |
| `SOCIAL_WEBSITE` | `https://...` | Website |

> **Eslatma:** Wallet, karta, kanal ma'lumotlari **bot admin panel → Sozlamalar** orqali ham sozlanadi.
> Railway Variables'ga kiritish shart emas — admin panel ichidan o'zgartirish mumkin.

3. **Save** bosing

---

## 🔹 BOSQICH 5: Redeploy

1. Variables qo'shilgandan so'ng → **Deploy** → **Redeploy** bosing
2. Loglarda quyidagi ko'rinadi:

```
🔄 Running Alembic migrations...
🚀 Starting bot...
INFO:root:Bot started!
INFO:aiogram.dispatcher:Start polling
```

---

## 🔹 BOSQICH 6: Botni Sinab Ko'rish

1. Telegram'da botga `/start` yuboring
2. Menyu chiqadi: 📈 Signal kanal, 📚 Darslar, 👤 Hisobim, 👥 Referal, ☎️ Yordam
3. **Admin panel** → `/admin` (faqat ADMIN_IDS ro'yxatidagi foydalanuvchilar)
4. Admin panel → **Sozlamalar** → wallet, karta, kanal va QR kodlarni sozlang

---

## 🔹 BOSQICH 7: QR Kod Sozlash (Admin Panel Orqali)

1. Bot admin panel → **Sozlamalar** → **TRON TRC20 wallet QR code**
2. QR kod rasmni Telegram'ga yuboring
3. Rasmning `file_id` ko'rinadi — uni sozlamalar qatoriga kiriting
4. Xuddi shu **BNB BEP20 wallet QR code** uchun ham bajaring

> **QR kod yaratish:** https://qr-code-generator.com yoki boshqa QR generator'da wallet address'ni QR kodga aylantiring,
> rasmni Telegram'ga yuboring, file_id'ni admin sozlamalariga kiriting.

---

## 🔹 XATOLARNI TUZATISH

| Muammo | Log | Yechim |
|--------|-----|--------|
| Bot token yo'q | `BOT_TOKEN is required` | Railway Variables → `BOT_TOKEN` qo'shing |
| DB ulanish xatosi | `could not connect to server` | PostgreSQL servis qo'shing, `DATABASE_URL` tekshiring |
| Admin ID noto'g'ri | `json.loads error` | `ADMIN_IDS` ni JSON formatda kiriting: `[651248882, 8539763294]` |
| Import xatosi | `ModuleNotFoundError` | `requirements.txt` tekshiring, Redeploy |
| Bot ishlamaydi | `TelegramConflictError` | Boshqa bot instance'ni o'chirib, Redeploy |

---

## 📌 FAYLLAR TARKIBI

```
signal-bot-deploy/
├── .env.example          ← Shablon (shaxsiy ma'lumotlar yo'q)
├── .gitignore            ← .env, __pycache__, .aider* yashirilgan
├── Dockerfile            ← Railway avtomatik quradi
├── entrypoint.sh         ← Migratsiya + bot ishga tushirish
├── pyproject.toml        ← Kutubxonalar (aiogram, sqlalchemy, asyncpg...)
├── alembic.ini           ← DB migratsiya sozlamalari
├── bot/
│   ├── main.py           ← Bot kirish nuqtasi
│   ├── config.py         ← DATABASE_URL + BOT_TOKEN + admin sozlamalar
│   ├── handlers/
│   │   ├── signals.py    ← Signal kanal + to'lov handlerlari
│   │   ├── course.py     ← Darslar kanal + to'lov handlerlari
│   │   ├── admin/
│   │   │   ├── settings.py  ← Admin sozlamalar UI (wallet, QR, karta)
│   │   │   ├── payments.py  ← To'lov tasdiqlash/rad etish
│   │   │   └── ...
│   ├── services/
│   │   ├── settings_service.py ← DB orqali sozlamalar (wallet, QR, karta)
│   │   ├── subscription_service.py
│   │   ├── payment_service.py
│   ├── utils/
│   │   ├── keyboards.py  ← BNB, TRON, Stars, Karta tugmalari
│   │   ├── texts.py      ← Uzbek matnlari
│   │   ├── states.py     ← FSM holatlar
│   │   ├── helpers.py    ← safe_edit va boshqa yordamchi
│   ├── models/
│   │   ├── user.py, tariff.py, payment.py, project_settings.py
│   ├── database/
│   │   ├── engine.py, session.py
│   ├── alembic/          ← Migratsiya fayllari
```

---

## 💡 QO'SHIMCHA MA'LUMOT

- **Bot admin panel** orqali barcha sozlamalarni o'zgartirish mumkin (wallet, karta, kanal, QR kod)
- **Referal tizimi** mavjud — foydalanuvchilar do'stlarini taklif qilishlari mumkin
- **Obuna eslatmalar** — 7, 3, 1 kun oldin va tugash haqida xabar yuboradi
- **Stars to'lov** — Telegram Stars orqali avtomatik tasdiqlash
- **Screenshot to'lov** — TRON, BNB, Karta skrinshotlarni admin tasdiqlaydi
