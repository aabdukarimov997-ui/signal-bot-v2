# 📱 SIGNAL BOT V2 — QO'LLAMA

Telegram Premium Signal Bot — to'liq production-ready bot.
Pullik signal kanal obunalarini sotish, Telegram Stars + Karta to'lov, referal tizim, admin panel va **multi-tenant/reseller** imkoniyatlari.

---

## 🚀 BIRINCHI ISHGA TUSHIRISH

### 1. Talablar

| Komponent | Versiya |
|-----------|---------|
| Python | 3.12+ |
| PostgreSQL | 14+ |
| pip | so'nggi |

### 2. O'rnatish

```bash
# 1. Repunit klonlash
cd /home/abdujalol
git clone <repo-url> signal-bot-v2
cd signal-bot-v2

# 2. Dependencies
pip install -r requirements.txt

# 3. .env faylini sozlash
cp .env.example .env
nano .env
```

### 3. `.env` fayli (MANDATORY)

```env
# ── Bot ──
BOT_TOKEN=8578002085:AAGXiYliV972bPc8S0QToZ_u-YdmVYp3X9Q
BOT_USERNAME=Udkjdbdbb_bot

# ── Database ──
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=signal_bot_v2
DB_USER=postgres
DB_PASSWORD=3329090a

# ── Admin ──
ADMIN_IDS=[6194170580]
ADMIN_LINK=@treder7090

# ── Signal Kanal ──
PRIVATE_CHANNEL_ID=-1002271613164
FREE_CHANNEL_LINK=https://t.me/Mexc_Kucoin_Bitget

# ── Karta To'lov ──
CARD_NUMBER=8600 2113 9408 0402
CARD_HOLDER=FALONCHAYEV FALONCHA

# ── Ijtimoiy Tarmoqlar ──
SOCIAL_INSTAGRAM=
SOCIAL_TWITTER=
SOCIAL_YOUTUBE=
SOCIAL_WEBSITE=
```

> **⚠️ Muhim:** `.env` faqat birinchi startda seed (boshlang'ich) qiymatlar uchun ishlatiladi.
> Keyin barcha sozlamalar **database** orqali boshqariladi — kodni o'zgartirish shart emas!

### 4. Database yaratish

```bash
# PostgreSQL da database yaratish
sudo -u postgres psql -c "CREATE DATABASE signal_bot_v2;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE signal_bot_v2 TO postgres;"
```

Bot avtomatik ravishda barcha tabeljalarni yaratadi (main.py da `Base.metadata.create_all`).

### 5. Botni ishga tushirish

```bash
cd /home/abdujalol/signal-bot-v2
python -m bot.main
```

Log output:
```
INFO:apscheduler.scheduler:Scheduler started
INFO:root:⚠️ Setup wizard needed — first admin will configure the bot
INFO:root:Bot started!
INFO:aiogram.dispatcher:Start polling
```

### 6. Telegram kanalga botni admin qilish

**⚠️ BU QADAM MAJBURIY — aks holda invite link yaratilmaydi!**

1. Private signal kanalingizga kirish → Settings → Administrators
2. Botni (@Udkjdbdbb_bot) qo'shing → **Admin** huquqi bering
3. Quyidagi huquqlarni yoqing:
   - ✅ Invite links (invite link yaratish)
   - ✅ Ban users (obuna tugaganda kick qilish)

---

## 🛠 SETUP WIZARD (16 qadam)

Birinchi startda admin `/setup` buyrug'ini yuborishi kerak.
Wizard 16 qadamda barcha sozlamalarni so'raydi:

| # | Sozlash | Misol | Majburiy? |
|---|---------|-------|-----------|
| 1/16 | Loyiha nomi | `Alpha Signal Pro` | ✅ |
| 2/16 | Admin username | `@treder7090` | ✅ |
| 3/16 | Support username | `@treder7090` | ✅ |
| 4/16 | Private kanal ID | `-1002271613164` | ✅ |
| 5/16 | Karta raqami | `8600 2113 9408 0402` | ❌ (skip → Stars only) |
| 6/16 | Karta egasi | `FALONCHAYEV FALONCHA` | ❌ (skip → karta yo'q) |
| 7/16 | 1 oy narx ($) | `25` | ✅ |
| 8/16 | 3 oy narx ($) | `50` | ✅ |
| 9/16 | 6 oy narx ($) | `100` | ✅ |
| 10/16 | 1 oy Stars narxi | `1250` | ✅ |
| 11/16 | 3 oy Stars narxi | `2500` | ✅ |
| 12/16 | 6 oy Stars narxi | `5000` | ✅ |
| 13/16 | Instagram URL | `https://instagram.com/example` | ❌ |
| 14/16 | YouTube URL | `https://youtube.com/@example` | ❌ |
| 15/16 | Website URL | `https://example.com` | ❌ |
| 16/16 | Bepul kanal URL | `https://t.me/free_channel` | ❌ |

**Skip qilish:** `skip`, `-`, `0`, `yoq`, `no` yuboring → bo'sh qiymat saqlanadi.

**Bekor qilish:** `/cancel` yuboring → wizard to'xtaydi, `/setup` bilan davom etish mumkin.

Wizard tugagandan so'ng:
```
🎉 Setup Wizard tugadi!
Barcha sozlamalar database ga saqlandi.
Bot endi to'liq ishlaydi!
```

---

## 👤 Foydalanuvchi Qo'llanmasi

### Asosiy menyu (Reply Keyboard)

| Tugma | Vazifasi |
|-------|----------|
| 📈 Signal kanal | Tarif tanlash → to'lov → obuna |
| 👤 Hisobim | Obuna holati, muddat, referallar |
| 👥 Referal | Referal link + taklif qilinganlar soni |
| 🌐 Ijtimoiy tarmoqlar | Instagram, YouTube, Website linklari |
| ☎️ Yordam | Admin bilan bog'lanish |

### 📈 Obuna olish jarayoni

```
📈 Signal kanal
   → Tarif tanlang (1 oy — $25 | 3 oy — $50 | 6 oy — $100)
   → To'lov usuli tanlang (⭐ Stars | 💳 Karta)
   → To'lovni amalga oshiring
   → ✅ Obuna faollashtirildi + 🔗 Kanalga kirish link
```

### ⭐ Telegram Stars to'lov

- aiogram `send_invoice` orqali Telegram Stars (XTR currency)
- `provider_token=""` (Stars uchun bo'sh)
- Stars narxlari database dan olinadi:
  - 1 oy: **1250 Stars** ($25 ≈ 1250)
  - 3 oy: **2500 Stars** ($50 ≈ 2500)
  - 6 oy: **5000 Stars** ($100 ≈ 5000)
- To'lov avtomatik tasdiqlanadi (`pre_checkout_query → ok=True`)
- Obuna darhol faollashtiriladi + invite link beriladi

### 💳 Karta orqali to'lov

```
💳 Karta orqali to'lov
   Karta raqami: {card_number}
   Qabul qiluvchi: {card_holder}
   
   → 📤 Chek yuborish (skrinshot)
   → ✅ Chek qabul qilindi! Admin kutilmoqda...
   → Admin: ✅ Qabul qilindi / ❌ Pul tushmadi
   → Foydalanuvchi: ✅ Tasdiqlandi + invite link
                    ❌ Rad etildi
```

### 📅 Invite Link

- Har bir obuna uchun **yangi invite link** yaratiladi
- **3 soat** muddat bilan (expire_date = now + 3h)
- **member_limit = 1** (faqat 1 kishi kirishi mumkin)
- Obuna tugaganda foydalanuvchi kanaldan **ban** qilinadi (`only_if_banned=True`)

### 👥 Referal tizimi

- Har bir foydalanuvchi o'ziga xos referal link oladi:
  `https://t.me/{bot_username}?start={telegram_id}`
- Yangi foydalanuvchi referal link orqali kirsa:
  - **Referer (taklif qilgan)** → **3 kun bonus** obuna muddatiga
  - Bonuslar `referral_bonus_days` da saqlanadi, obuna faollashtirilganda qo'shiladi

### ⏳ Obuna eslatmalar (Avtomatik)

Scheduler har kuni **09:00 (Toshkent vaqti)** eslatmalar yuboradi:

| Muddat | Xabar |
|--------|-------|
| 7 kun qoldi | `⏳ Signal kanaliga obunangiz 7 kundan keyin tugaydi.` |
| 3 kun qoldi | `⏳ Signal kanaliga obunangiz 3 kundan keyin tugaydi.` |
| 1 kun qoldi | `⏳ Signal kanaliga obunangiz 1 kundan keyin tugaydi!` |

Obuna tugaganda (**00:00** har kuni):
- `❌ Obunangiz tugadi. Signal kanaliga kirish huquqi yopildi.`
- Foydalanuvchi kanaldan kick/ban qilinadi

---

## 👮 Admin Qo'llanmasi

### Kirish: `/admin`

```
👋 Admin panelga xush kelibsiz!

┌─────────────────────────────────────┐
│ 💳 To'lovlar                        │
│ 📊 Tariflar                         │
│ 👥 Foydalanuvchilar                 │
│ 📈 Statistika                       │
│ 🔗 Ijtimoiy tarmoqlar              │
│ ⚙️ Sozlamalar                       │
│ ⬅️ Chiqish                          │
└─────────────────────────────────────┘
```

### 💳 To'lovlar

- Kutilayotgan to'lovlar ro'yxati (skrinshot + ma'lumotlar)
- Har bir to'lov uchun: `✅ Qabul qilindi` / `❌ Pul tushmadi`
- Approve → obuna faollashtiriladi + invite link yaratiladi + foydalanuvchiga xabar
- Reject → foydalanuvchiga rad etilganlik xabari

### 📊 Tariflar

- Mavjud tariflar ro'yxati (✅/❌ aktiv holat)
- **Toggle** — tarif aktiv/inaktiv o'zgartirish (bosing → toggle)
- **➕ Yangi tarif** — FSM orqali:
  1. Nomi kiriting
  2. Muddati (oylarda)
  3. Narxi ($)
- Tariflar DB dan olinadi — hardcode yo'q!

### 👥 Foydalanuvchilar

- Ro'yxat (max 20 ta): `✅/🚫 Ism — telegram_id`
- Ban holat ko'rsatiladi

### 📈 Statistika

```
📈 Statistika

👥 Foydalanuvchilar: {count}
✅ Aktiv obunalar: {count}
💰 Umumiy daromad: ${total}
📅 Bugungi daromad: ${today}
```

### 🔗 Ijtimoiy tarmoqlar (Admin)

Har bir linkni tahrirlash:
- 📷 Instagram, 🐦 Twitter, ▶️ YouTube, 🌐 Website, 🆓 Bepul kanal
- Joriy qiymat ko'rsatiladi → yangi qiymat kiriting
- Saqlash DB ga (`set_setting()`) — **.env o'zgartirish shart emas!**

### ⚙️ Sozlamalar (NEW — Multi-tenant)

```
⚙️ Sozlamalar

Loyiha nomi: Alpha Signal Pro
Admin username: @treder7090
...
admin_ids: [6194170580]

┌─────────────────────────────────────┐
│ 📝 Sozlamalarni tahrirlash          │
│ 📦 Export (JSON)                    │
│ 📥 Import (JSON)                   │
│ 🔄 Setup Wizard                     │
│ ⬅️ Orqaga                           │
└─────────────────────────────────────┘
```

#### 📝 Tahrirlash

- Har bir sozlamani bosib yangi qiymat kiriting
- 21 ta sozlamalar mavjud (jadval quyida)

#### 📦 Export (JSON)

Barcha sozlamalarni JSON formatda chiqarish:
```json
{
  "project_name": "Alpha Signal Pro",
  "private_channel_id": "-1002271613164",
  "stars_1_month": "1250",
  ...
}
```

**Reseller uchun:** bu JSON ni yangi botga Import qilish → bot darhol ishga tushadi!

#### 📥 Import (JSON)

JSON yuboring → barcha sozlamalar yangilanadi.
**White-label deployment:** yangi bot token + DB yaratish → Import JSON → bot tayyor!

#### 🔄 Setup Wizard

Qayta setup → barcha sozlamalarni qayta kirish (16 qadam)

---

## 🏪 RESELLER / MULTI-TENANT QO'LLANMASI

### Konsepsiya

Barcha business-logic sozlamalari **database** da saqlanadi:
- ❌ Kod ichida hech qanday kanal ID, admin username, karta raqami, Stars narxlari hardcode yo'q
- ✅ Yangi bot sotish = yangi DB + yangi token + Import JSON

### Yangi bot deployment (5 qadam)

```bash
# 1. Yangi database yaratish
sudo -u postgres psql -c "CREATE DATABASE signal_bot_client1;"

# 2. Yangi .env fayli
BOT_TOKEN=<yangi_bot_token>
BOT_USERNAME=<yangi_bot_username>
DB_NAME=signal_bot_client1
ADMIN_IDS=[<client_admin_id>]

# 3. Botni ishga tushirish
python -m bot.main

# 4. /setup — Setup Wizard orqali sozlash
# YOKI: admin panel → 📥 Import JSON

# 5. Tayyor! 🎉
```

### Sozlamalar jadvali (ProjectSettings)

| Key | Tavsif | Misol |
|-----|--------|-------|
| `project_name` | Loyiha nomi | `Alpha Signal Pro` |
| `logo_url` | Logo URL | `https://...` |
| `admin_username` | Admin username | `@treder7090` |
| `support_username` | Support username | `@treder7090` |
| `private_channel_id` | Private kanal ID | `-1002271613164` |
| `free_channel_url` | Bepul kanal URL | `https://t.me/free` |
| `instagram_url` | Instagram URL | `https://instagram.com/...` |
| `twitter_url` | Twitter URL | `https://x.com/...` |
| `youtube_url` | YouTube URL | `https://youtube.com/...` |
| `website_url` | Website URL | `https://example.com` |
| `card_number` | Karta raqami | `8600 2113 9408 0402` |
| `card_owner` | Karta egasi | `FALONCHAYEV FALONCHA` |
| `stars_1_month` | 1 oy Stars narxi | `1250` |
| `stars_3_month` | 3 oy Stars narxi | `2500` |
| `stars_6_month` | 6 oy Stars narxi | `5000` |
| `price_1_month` | 1 oy USD narxi | `25` |
| `price_3_month` | 3 oy USD narxi | `50` |
| `price_6_month` | 6 oy USD narxi | `100` |
| `welcome_message` | Welcome message | `👋 Xush kelibsiz!` |
| `admin_ids` | Admin Telegram IDs | `[6194170580]` |
| `setup_completed` | Setup holati | `true` / `false` |

### DB → Env Fallback Pattern

```python
# Har bir sozlama uchun pattern:
value = await get_setting("private_channel_id") or settings.PRIVATE_CHANNEL_ID
# 1. DB dan o'qish
# 2. Agar DB da yo'q → .env dan fallback
```

**Infrastructure sozlamalar (faqat env, DB ga yo'q):**
- `BOT_TOKEN` — bot token (infrastructure)
- `DB_TYPE/DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` — DB connection

---

## ⏰ SCHEDULER

| Job | Vaqt | Vazifasi |
|-----|------|----------|
| `expire_job` | 00:00 (har kuni) | Tugagan obunalarni expired qilish + kanaldan kick |
| `reminder_job` | 09:00 (har kuni) | 7/3/1 kun eslatmalar yuborish |

Timezone: **Asia/Tashkent**

---

## 🗂 DATABASE MODELLARI

### Users
| Field | Type | Tavsif |
|-------|------|--------|
| telegram_id | BigInteger | Telegram ID (int32 max dan katta!) |
| full_name | String(256) | Ism-familiya |
| is_banned | Boolean | Bloklangan? |
| referred_by | String | Referal kodi |
| referral_bonus_days | Integer | Bonus kunlar |

### SignalTariff
| Field | Type | Tavsif |
|-------|------|--------|
| name | String(64) | Tarif nomi |
| duration_months | Integer | Muddat (oy) |
| price | Numeric(10,2) | Narx ($) |
| is_active | Boolean | Aktiv? |
| sort_order | Integer | Tartib |

### Subscription
| Field | Type | Tavsif |
|-------|------|--------|
| status | String | active/expired/cancelled |
| start_date | DateTime | Boshlanish |
| end_date | DateTime | Tugash |
| invite_link | Text | Kanal link |

### Payment
| Field | Type | Tavsif |
|-------|------|--------|
| amount | Numeric(10,2) | Summa |
| currency | String | USD/XTR |
| payment_method | String | stars/check |
| status | String | pending/approved/rejected |
| photo_file_id | Text | Chek skrinshot |

### ProjectSettings
| Field | Type | Tavsif |
|-------|------|--------|
| key | String(64) | Sozlama nomi (unique) |
| value | Text | Qiymat |
| description | String(256) | Tavsif |

---

## 🔧 TEXNIK DETALLAR

### Stars Payment Flow

```
User → ⭐ Stars tugma
    → bot.send_invoice(currency=XTR, provider_token="")
    → Telegram Stars payment dialog
    → pre_checkout_query → ok=True
    → successful_payment handler
    → create_invite_link (3h expire, limit=1)
    → create_subscription
    → create_payment (status=approved)
    → User: ✅ To'lov muvaffaqiyatli! + invite link
```

### Card Payment Flow

```
User → 💳 Karta tugma
    → Card number/holder ko'rsatiladi
    → 📤 Chek yuborish (photo)
    → Payment (status=pending) saqlanadi
    → Admin: photo + ma'lumotlar + ✅/❌ tugmalar
    → Admin approve:
        → create_invite_link
        → create_subscription
        → User: ✅ Tasdiqlandi + invite link
    → Admin reject:
        → User: ❌ Rad etildi
```

### BigInteger muhim!

Telegram ID lar **2,147,483,647** (PostgreSQL int32 max) dan katta bo'lishi mumkin.
Masalan: `6194170580` → int32 overflow → **DataError**.

**Yechim:** `telegram_id` va `reviewed_by` uchun `BigInteger` ishlatiladi.

### safe_edit helper

```python
# Photo message → edit_caption
# Text message → edit_text
# "message is not modified" → ignore (user same button twice)
```

---

## 📋 BUYRUQLAR

| Buyruq | Kim | Vazifasi |
|--------|-----|----------|
| `/start` | Hamma | Asosiy menyu |
| `/start {id}` | Hamma | Referal link orqali kirish |
| `/setup` | Admin | Setup Wizard (faqat setup_completed=false) |
| `/admin` | Admin | Admin panel |
| `/cancel` | Hamma | FSM/Wizard bekor qilish |

---

## ❗ MUHIM ESLATMALAR

1. **Botni kanalga ADMIN qilish** — invite link yaratish uchun MAJBURIY
2. **Setup Wizard** — birinchi startda `/setup` yuborish MAJBURIY
3. **Stars to'lov** — `provider_token=""` bo'sh bo'lishi kerak (Telegram Stars uchun)
4. **Obuna tugaganda** — foydalanuvchi kanaldan ban qilinadi, qayta obuna bo'lsa qayta kirishi mumkin (`only_if_banned=True`)
5. **Multi-tenant** — barcha sozlamalar DB da, yangi bot = yangi DB + Import JSON
6. **BigInteger** — telegram_id uchun Integer ishlatmaslik!

---

## 🔄 BOTNI RESTART QILISH

```bash
# 1. Prosesni o'chirish
pkill -f "python.*bot.main"

# 2. Pending updates tozalash
curl -s "https://api.telegram.org/bot<TOKEN>/deleteWebhook?drop_pending_updates=true"

# 3. Qayta ishga tushirish
cd /home/abdujalol/signal-bot-v2
python -m bot.main
```
