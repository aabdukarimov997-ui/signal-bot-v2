# 🚀 SIGNAL BOT V2 — TO'LIQ ISHGA TUSHIRISH QO'LLANMASI

## 📋 TAYYORLANISH KERAK BO'LGAN NARSALAR

### 1️⃣ Telegram tomonidan (BotFather)

```
1. Telegram'da @BotFather'ga kirib yangi bot yaratish:
   /newbot → Bot nomi → Bot username (masalan: MySignalPro_bot)

2. Bot token olamiz (masalan: 7123456789:AAH...)

3. Stars payment yoqish:
   BotFather → /mybots → tanlang → Payments → Stars → Enable

4. Botga quyidagi huquqlar berish:
   BotFather → /mybots → tanlang → Bot Settings → Group Permissions
   ✅ Allow adding members to groups/channels
   ✅ Allow managing chat invite links
```

### 2️⃣ Private Signal Kanal yaratish

```
1. Telegram'da yangi PRIVATE kanal yaratish:
   → New Channel → "Signal Pro VIP" → Private

2. Kanalga botni ADMIN qilish:
   → Kanal info → Administrators → Add → Bot username
   ✅ Invite users via link
   ✅ Ban users

3. Kanal ID ni olish:
   → Kanal info → Share → nusxalash → @username_infobot'ga yuborish
   → Masalan: -1001234567890
```

### 3️⃣ Bepul kanal (ixtiyoriy)

```
1. Bepul kanal yaratish (PUBLIC) → "Signal Pro Free"
2. Kanal link: https://t.me/signal_pro_free
```

### 4️⃣ Sizning Telegram ID ni olish

```
→ @userinfobot'ga xabar yuboring → Sizning ID (masalan: 123456789)
```

---

## 💻 SERVER TOMONIDAN

### Variant A: Docker bilan (ENG OSON)

```bash
# 1. Proyektga kirish
cd /home/abdujalol/signal-bot-v2

# 2. .env fayl yaratish (quyida to'ldiring ↓)
cp .env.example .env
nano .env

# 3. Docker bilan ishga tushirish
docker-compose up -d

# 4. Log ko'rish
docker-compose logs -f bot
```

### Variant B: Lokal (serverda bebor Docker)

```bash
# 1. PostgreSQL o'rnatish
sudo apt install postgresql postgresql-contrib -y

# 2. Redis o'rnatish
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# 3. DB yaratish
sudo -u postgres psql
CREATE DATABASE signal_bot_v2;
CREATE USER botuser WITH PASSWORD 'botpass123';
GRANT ALL PRIVILEGES ON DATABASE signal_bot_v2 TO botuser;
\q

# 4. Proyekt o'rnatish
cd /home/abdujalol/signal-bot-v2
pip install -e .

# 5. .env to'ldirish
cp .env.example .env
nano .env

# 6. Botni ishga tushirish
python -m bot.main
```

---

## 📝 .ENV FAYL — TO'LIQ SHABLON

```env
# ═══════════════════════════════════════════
# 📱 BOT SOZLAMALARI
# ═══════════════════════════════════════════
BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BOT_USERNAME=MySignalPro_bot

# ═══════════════════════════════════════════
# 🗄 DATABASE (PostgreSQL)
# ═══════════════════════════════════════════
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=signal_bot_v2
DB_USER=botuser
DB_PASSWORD=botpass123

# ═══════════════════════════════════════════
# 🔴 REDIS
# ═══════════════════════════════════════════
REDIS_HOST=localhost
REDIS_PORT=6379

# ═══════════════════════════════════════════
# 📈 SIGNAL KANAL
# ═══════════════════════════════════════════
# Bot admin bo'lgan PRIVATE kanal ID
PRIVATE_CHANNEL_ID=-1001234567890

# Bepul (public) kanal link
FREE_CHANNEL_LINK=https://t.me/signal_pro_free

# ═══════════════════════════════════════════
# 💳 KARTA TO'LOV
# ═══════════════════════════════════════════
CARD_NUMBER=8600-5728-1234-5678
CARD_HOLDER=FAMILIYA ISM

# ═══════════════════════════════════════════
# 👮 ADMIN
# ═══════════════════════════════════════════
# Sizning Telegram ID (@userinfobot'dan oling)
ADMIN_IDS=[123456789]

# ═══════════════════════════════════════════
# 🌐 IJTIMOIY TARMOQLAR (ixtiyoriy, bo'sh = ko'rsatilmaydi)
# ═══════════════════════════════════════════
SOCIAL_INSTAGRAM=https://instagram.com/signal_pro
SOCIAL_TWITTER=https://twitter.com/signal_pro
SOCIAL_YOUTUBE=https://youtube.com/@signal_pro
SOCIAL_WEBSITE=https://signalpro.com
```

---

## 🔍 ISHGA TUSHIRISHDA TEKSHIRISH

### 1. Bot ishga tushganini tekshirish:

```bash
# Telegram'da botga /start yuboring → Menyu chiqishi kerak
```

### 2. Admin panel tekshirish:

```bash
# /admin yuboring → Admin menyu chiqishi kerak
```

### 3. Stars to'lov tekshirish:

```
1. 📈 Signal kanal → 1 oy → ⭐ Telegram Stars
2. Invoice chiqishi kerak → To'lov qiling
3. successful_payment → Obuna + invite link avtomatik yuboriladi
```

### 4. Karta+chek tekshirish:

```
1. 📈 Signal kanal → 1 oy → 💳 Karta orqali
2. Karta raqami ko'rsatiladi → 📤 Chek yuborish
3. Rasm yuboring → Admin ga photo + ✅/❌ tugmalar
4. Admin ✅ bosadi → Userga invite link yuboriladi
```

### 5. Private kanal tekshirish:

```
1. Invite link bosing → Kanalga kirish
2. Kanal content ko'rinadi
3. Obuna tugasa → User avtomatik chiqariladi
```

---

## ⚠️ MUHIM ESLATMALAR

| # | Eslatma |
|---|---|
| 1 | Bot **Stars payment** faqat Telegram'da test qilinadi — real Stars kerak |
| 2 | Private kanal ID **minus bilan** boshlanadi: `-100...` |
| 3 | ADMIN_IDS **JSON format** da: `[123456789]`, ko'p admin: `[123, 456]` |
| 4 | Bot kanalda **admin** bo'lishi SHART — invite link yaratolmaydi |
| 5 | Stars yoqish uchun **BotFather → Payments → Stars → Enable** |
| 6 | CARD_NUMBER **xonalar bilan**: `8600-xxxx-xxxx-xxxx` yoki `8600xxxxxxxxxxxx` |

---

## 🛠 XATO CHIQSA

### DB ulanish xatosi:
```bash
# PostgreSQL ishlayaptmi?
sudo systemctl status postgresql
# Redis ishlayaptmi?
sudo systemctl status redis-server
```

### Bot javob bermasa:
```bash
# Log ko'rish
docker-compose logs -f bot
# Yoki lokal:
python -m bot.main  # console'da log chiqadi
```

### "Invite link yaratilmadi":
```
→ Bot kanalda adminmi? Tekshiring!
→ Kanal ID to'g'rimi? @username_infobot'ga yuboring
```

### Stars to'lov ishlamasa:
```
→ BotFather'da Stars yoqilganmi?
→ provider_token="" bo'lishi kerak (Stars uchun bo'sh)
```
