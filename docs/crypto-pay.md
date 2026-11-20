# Crypto Pay

The bot and website TMA support Crypto Pay invoices for USDT payments. Supply the same app token and network in both deployment environments. The token stays server-only:

```env
PROJECT_CRYPTO_PAY_TOKEN=your-crypto-pay-token
PROJECT_CRYPTO_PAY_TESTNET=false
```

Set `PROJECT_CRYPTO_PAY_TESTNET=true` only for Crypto Pay testnet usage. The public TMA settings response exposes only `cryptoPayAvailable`; it never returns the token.

Crypto Pay invoices use the tariff price in USD as a crypto invoice amount, with `asset=USDT`, a one-hour expiration, and the local payment UUID as the provider payload. The website stores the provider invoice ID in `provider_charge_id` and the provider URL in `telegram_charge_id`.

The website leaves these payments pending. The running Python bot scheduler verifies invoices through `getInvoices`, including the invoice ID, paid status, USDT asset, amount, and local payload. Expired provider invoices are closed. Client redirects and invoice page visits do not approve payments. Approval and subscription activation commit in one database transaction; repeat checks do not extend the subscription twice.

The scheduler checks at the configured `crypto_poll_seconds` interval (60 seconds by default). This integration does not promise instant payments or automatic recurring debits. No additional surcharge is added by this application; provider fees and network fees follow the provider's current terms. Crypto Pay funds go to the project's provider app balance, not directly to the project's own wallet.

The direct USDT alternative remains available for TRON and BNB Chain. It has no provider commission but still requires network fees. Configure the project wallet addresses separately. Keep the bot service running for both automatic payment options. Never enter wallet private keys or seed phrases in the application.

User-facing payment instructions include official wallet and explorer links, the exact-network warning, and a reminder to follow Uzbekistan's current tax, currency, and other applicable requirements. The notices are general information, not legal advice; review current official requirements or consult a qualified local adviser before operating the service.
