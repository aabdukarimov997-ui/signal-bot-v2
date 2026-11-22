# Har bir mijozga alohida kripto manzil (HD hamyon)

## Nima uchun kerak

Bitta umumiy hamyon ishlatilganda barcha mijozlar bir manzilga to'laydi. Bunda:

- To'lovni kim yuborganini faqat summa bo'yicha aniqlash mumkin (noyob summa hiylasi).
- Mijoz "bu mening manzilim" deb tekshira olmaydi.
- Bitta summa tasodifan mos tushsa, chalkashlik chiqadi.

HD (Hierarchical Deterministic) hamyon bilan **har bir mijoz o'z shaxsiy manzilini oladi**.
Manzillar bitta `xpub` dan deterministik hosil qilinadi, lekin serverda **private key yo'q**.

## Xavfsizlik modeli

| Saqlanadi | Saqlanmaydi |
|---|---|
| `xpub` (public kalit) | seed phrase |
| `hd_index` (mijoz raqami) | private key / `xprv` |

`xpub` dan faqat **yangi manzil** hosil qilish mumkin. Undan pul sarflab bo'lmaydi.
Shuning uchun xpub serverda saqlanishi xavfsiz. Seed phrase faqat sizning
qurilmangizda (Trust Wallet / Ledger) qoladi va u bilan istalgan payt mablag'ni
yechib olasiz.

> Muhim: **xprv** yoki seed phrase ni hech qachon serverga, botga yoki chatga
> yubormang. Bot faqat `xpub` ni qabul qiladi va `xprv` kiritilsa rad etadi.

## BIP44 yo'llari

| Tarmoq | Yo'l | Misol manzil |
|---|---|---|
| TRON (TRC20) | `m/44'/195'/0'/0/{index}` | `TUEZSdKsoDHQMeZwihtdoBiN46zxhGWYdH` |
| BNB (BEP20) | `m/44'/60'/0'/0/{index}` | `0x9858EfFD232B4033E47d90003D41EC4EcaEda94` |

`{index}` — mijozning doimiy raqami (`users.hd_index`). Bir marta ajratiladi va
o'zgarmaydi, shuning uchun mijoz har doim bir xil manzilni ko'radi.

## Qanday yoqiladi

1. Botda: `⚙️ Sozlamalar` → `📝 Sozlamalarni tahrirlash` → `📁 💳 To'lov`
2. `TRON HD xpub` maydoniga TRON account xpub'ini kiriting.
3. `BNB HD xpub` maydoni uchun BNB (BSC) account xpub'ini kiriting.
4. `💳 To'lov usullari` → `🩺 Hamyon sozlamalarini tekshirish` tugmasini bosing.
   U `HD rejim YOQILGAN` deb ko'rsatishi va 0-mijoz manzilini chiqarishi kerak.

xpub bo'sh bo'lsa tizim avtomatik ravishda **umumiy hamyon** rejimida ishlaydi
(orqaga moslik saqlanadi).

## xpub qanday olinadi

### Trust Wallet

Trust Wallet `xpub` ni to'g'ridan-to'g'ri ko'rsatmaydi. Variantlar:

1. **Trust Wallet + export** — ba'zi versiyalarda `Sozlamalar → Wallet → Back up`
   orqali faqat seed chiqadi, xpub chiqmaydi.
2. **Ionut / MetaMask usuli** — BNB uchun MetaMask'da `Account details → Show
   private key` emas, balki hardware wallet ulab xpub olish mumkin.
3. **Eng oson: xpub hisoblagich** — seed phrase'ni **oflayn** (internetsiz)
   kompyuterda `iancoleman.io/bip39` ga kiritib, `BIP32 Derivation Path` ni
   `m/44'/195'/0'` (TRON) yoki `m/44'/60'/0'` (BNB) qilib, `BIP32 Extended
   Public Key` ni nusxalang.

> `iancoleman.io/bip39` ni faqat **oflayn** ishlatish kerak: sahifani yuklab
> oling, internetni uzing, keyin seed kiriting. Onlayn holatda seed'ni kiritish
> xavfli.

### Muhim tekshiruv

xpub kiritgandan so'ng, `🩺 Hamyon sozlamalarini tekshirish` chiqargan
`0-mijoz manzili` ni Trust Wallet'dagi birinchi manzil bilan solishtiring.
Ular **bir xil bo'lishi shart**. Mos kelmasa — noto'g'ri yo'l yoki boshqa
account ishlatilgan.

## To'lov qanday tekshiriladi

1. Mijoz TRON/BNB tugmasini bosadi → unga **shaxsiy manzil** va noyob summa
   ko'rsatiladi (masalan `25.0137 USDT`).
2. Mijoz o'sha manzilga o'sha summani yuboradi.
3. `check_crypto_payments_job` har 60 soniyada ishlaydi va **faqat shu invoice
   manziliga** kelgan transferlarni tekshiradi.
4. Summa mos kelsa — to'lov avtomatik tasdiqlanadi va obuna faollashadi.

Noyob summa ham saqlanadi: bir manzilga ikki marta to'lov kelsa ham, qaysi
invoice'ga tegishli ekani aniq bo'ladi.

## Mablag'ni yechib olish

Barcha manzillar bitta seed'dan hosil bo'ladi. Trust Wallet'da:

- USDT (TRC20) qoldiqlarini ko'rish uchun `Receive → TRON` manzilini qo'shing
  yoki har bir manzilni "Watch address" qilib kuzating.
- Mablag'ni yig'ish uchun seed'ni import qilgan hamyondan istalgan hosil
  qilingan manzilga kirib (masalan, MetaMask'da HD account qo'shib) o'tkazma
  qilish mumkin.

### Amaliy eslatmalar

- **TRON**: USDT TRC20 qabul qilish uchun manzil "aktivlashtirilgan" bo'lishi
  shart emas (token balansi kontraktda saqlanadi). Lekin o'sha manzildan
  mablag'ni **yuborish** uchun manzilda TRX (energy/bandwidth uchun) bo'lishi
  kerak. Shuning uchun yig'ishda avval kichik miqdorda TRX yuboriladi.
- **BNB**: BEP20 qabul qilish va yuborish uchun manzilda BNB (gas) kerak.
- Har bir mijoz alohida manzilga to'lagani uchun mablag' ko'p manzilga
  tarqaladi. Yig'ish (sweep) uchun skript yozish mumkin, lekin u private
  kalit talab qiladi — bu **serverda emas**, xavfsiz muhitda bajarilishi kerak.

## Sozlamalar kalitlari

| Kalit | Ma'nosi |
|---|---|
| `tron_hd_xpub` | TRON account xpub (bo'sh bo'lsa HD o'chiq) |
| `bnb_hd_xpub` | BNB/BSC account xpub (bo'sh bo'lsa HD o'chiq) |
| `tron_wallet_address` | Umumiy hamyon (HD o'chiq bo'lganda ishlatiladi) |
| `bnb_wallet_address` | Umumiy hamyon (HD o'chiq bo'lganda ishlatiladi) |
| `tron_usdt_contract` | USDT TRC20 kontrakti |
| `bnb_usdt_contract` | USDT BEP20 kontrakti |

## Migratsiya

`003_add_hd_index_to_users.py` — `users.hd_index` ustunini qo'shadi (unique).
Mavjud foydalanuvchilarda `hd_index = NULL` bo'ladi; ular birinchi marta kripto
to'lov boshlaganda indeks oladi.

## Testlar

```bash
BOT_TOKEN=test DB_TYPE=sqlite DB_NAME=test_db.sqlite python3 -m pytest tests/test_hd_wallet.py -q
```

Testlar `bip_utils` bilan mustaqil tekshirilgan vektorlardan foydalanadi:
`tests/test_hd_wallet.py` dagi `TRON_ADDRESSES` va `EVM_ADDRESSES`.
