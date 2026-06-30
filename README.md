# 📈 Signal Bot V2 — Telegram Premium Signal Channel Bot

Production-ready Telegram bot for selling paid Signal channel subscriptions with **Telegram Stars** (automatic) and **Card + Check** (admin approval) payment methods.

## ✅ Features

| Feature | Status |
|---|---|
| ⭐ Telegram Stars — auto payment | ✅ |
| 💳 Card + Check — admin approval | ✅ |
| 👮 Admin approval (inline buttons) | ✅ |
| 🔗 Private channel invite links | ✅ |
| ⏰ Subscription management | ✅ |
| 📅 Auto expiry + reminders (7/3/1 days) | ✅ |
| 👥 Referral system | ✅ |
| 🌐 Social media integration | ✅ |
| 🎟 Promo codes | ✅ |
| 📊 Admin panel (stats, tariffs, users) | ✅ |
| 🧹 Clean UI (safe_edit, inline keyboards) | ✅ |

## 🏗 Architecture

```
signal-bot-v2/
├── bot/
│   ├── config.py          — Pydantic settings
│   ├── main.py            — Entry point + bot startup
│   ├── database/           — Engine, session, Redis
│   ├── handlers/           — User + Admin handlers
│   │   ├── start.py        — /start, main menu
│   │   ├── signals.py      — Tariffs, Stars, Card/Check
│   │   ├── account.py      — Account info
│   │   ├── referral.py     — Referral links
│   │   ├── social.py       — Social media
│   │   ├── help.py         — Help/contact
│   │   └── admin/          — Admin panel (6 sub-handlers)
│   ├── models/             — 7 SQLAlchemy models
│   ├── services/           — Business logic (6 services)
│   ├── middlewares/         — Auth, throttling
│   ├── scheduler/          — APScheduler (expiry + reminders)
│   └── utils/              — Keyboards, texts, states, helpers
├── tests/                  — 31 pytest tests (SQLite)
├── docker-compose.yml
├── Dockerfile
├── seed.py
└── pyproject.toml
```

## 🚀 Quick Start

### 1. Setup environment

```bash
cp .env.example .env
# Edit .env with your bot token, channel IDs, card number, etc.
```

### 2. Run with Docker

```bash
docker-compose up -d
```

### 3. Run locally

```bash
pip install -e .
python -m bot.main
```

### 4. Run tests

```bash
pip install -e ".[dev]"
pytest tests/ -v
```

## 💎 Tariffs (Default)

| Tariff | Duration | Price |
|---|---|---|
| 🥉 1 oy | 1 month | $25 |
| 🥈 3 oy | 3 months | $50 |
| 🥇 6 oy | 6 months | $100 |

Tariffs are **dynamic** — managed from admin panel. No code changes needed.

## 💰 Payment Flow

### ⭐ Telegram Stars (Automatic)
1. User selects tariff → "⭐ Telegram Stars"
2. Stars invoice sent → User pays
3. `successful_payment` event → Auto subscription + invite link

### 💳 Card + Check (Admin Approval)
1. User selects tariff → "💳 Karta orqali"
2. Card number shown → User transfers money
3. User sends receipt screenshot
4. Bot sends photo to admin with ✅/❌ buttons
5. Admin approves → Subscription + invite link sent to user

## 👥 Referral System

- Link format: `https://t.me/BOT_USERNAME?start=USER_ID`
- Bonus: +3 days subscription per referral

## ⏰ Reminders

| Days Left | Message |
|---|---|
| 7 | Gentle reminder |
| 3 | Warning |
| 1 | Urgent reminder |

Expired users are automatically removed from channel.

## 📱 Admin Commands

- `/admin` — Open admin panel
- Admin panel sections:
  - 💳 Payments (pending checks)
  - 📊 Tariffs (manage/add)
  - 👥 Users (ban/unban)
  - 📈 Statistics
  - 🔗 Social media links

## 🛠 Tech Stack

- **aiogram 3.x** — Telegram Bot framework
- **SQLAlchemy 2.0** — Async ORM
- **PostgreSQL** — Production database
- **SQLite** — Test database
- **APScheduler** — Cron jobs
- **Docker** — Containerization