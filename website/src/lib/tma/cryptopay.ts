const MAINNET_API = 'https://pay.crypt.bot/api';
const TESTNET_API = 'https://testnet-pay.crypt.bot/api';

type CryptoPayResponse<T> = {
  ok: boolean;
  result?: T;
};

export type CryptoPayInvoice = {
  invoice_id: number;
  bot_invoice_url: string;
  status: string;
};

function getApiUrl() {
  return process.env.PROJECT_CRYPTO_PAY_TESTNET === 'true' ? TESTNET_API : MAINNET_API;
}

function getToken() {
  return process.env.PROJECT_CRYPTO_PAY_TOKEN;
}

export function isCryptoPayAvailable() {
  return Boolean(getToken());
}

export function isValidCryptoPayUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 't.me' || url.hostname.endsWith('.crypt.bot'));
  } catch {
    return false;
  }
}

export async function createCryptoPayInvoice(amount: string, payload: string): Promise<CryptoPayInvoice> {
  const token = getToken();
  if (!token) throw new Error('Crypto Pay is not configured');

  const response = await fetch(`${getApiUrl()}/createInvoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Crypto-Pay-API-Token': token,
    },
    body: JSON.stringify({
      currency_type: 'crypto',
      asset: 'USDT',
      amount,
      payload,
      expires_in: 3600,
      allow_comments: false,
      allow_anonymous: false,
    }),
    signal: AbortSignal.timeout(10000),
  });

  const data = (await response.json().catch(() => null)) as CryptoPayResponse<CryptoPayInvoice> | null;
  if (!response.ok || !data?.ok || !data.result?.invoice_id || !data.result.bot_invoice_url || !isValidCryptoPayUrl(data.result.bot_invoice_url)) {
    throw new Error('Crypto Pay invoice creation failed');
  }
  return data.result;
}
