import { query, TABLES } from './db';

const TOKEN = process.env.BOT_TOKEN || '';

async function tg(method: string, params: Record<string, unknown>): Promise<any> {
  if (!TOKEN) {
    console.error(`TG ${method}: BOT_TOKEN not set`);
    return null;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.ok) console.error(`TG ${method} error: ${data.description || data.error_code}`);
    return data;
  } catch (e) {
    console.error(`TG ${method} failed:`, e);
    return null;
  }
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const r = await query(`SELECT value FROM ${TABLES.settings} WHERE key = $1 LIMIT 1`, [key]);
    return r.rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function getAdminIds(): Promise<number[]> {
  const raw = await getSetting('admin_ids');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function methodLabel(method: string): string {
  const map: Record<string, string> = {
    visa: '💳 Visa karta',
    card: '💳 UZCARD/HUMO',
    uzcard: '💳 UZCARD/HUMO',
    humo: '💳 UZCARD/HUMO',
    tron: '🔗 TRON TRC20',
    tron_trc20: '🔗 TRON TRC20',
    bnb: '🟡 BNB BEP20',
    ton: '💎 TON (USDT)',
    toncoin: '💎 TON (USDT)',
    stars: '⭐ Stars',
    check: '💳 Karta/Check',
  };
  return map[method] || '💳 Karta/Check';
}

function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' });
}

/**
 * Yangi to'lov yaratilganda adminlarga Telegram'da xabar + tasdiqlash tugmalari.
 * Tugmalar callback_data bot'ning nativ approve_/reject_ handler'lariga mos —
 * admin tugmani bossa, BOT to'liq oqimni bajaradi (invite link + obuna + foydalanuvchiga xabar).
 */
export async function sendAdminPaymentNotification(
  payment: any,
  user: any,
  tariff: any
): Promise<void> {
  const admins = await getAdminIds();
  if (!admins.length) return;

  const text = [
    '💳 <b>Yangi to\'lov</b>',
    '',
    `🧾 ID: <code>#${payment.id}</code>`,
    `👤 Foydalanuvchi: ${user?.full_name || '—'}`,
    `🆔 Telegram: ${user?.telegram_id || '—'}`,
    `💰 Tarif: ${tariff?.label || tariff?.name || '—'}`,
    `💵 Summa: $${parseFloat(payment.amount || 0)}`,
    `🔗 Usul: ${methodLabel(payment.payment_method)}`,
    `📅 Vaqt: ${formatTime(payment.created_at)}`,
    '',
    'Quyidagi tugmalar orqali tasdiqlang yoki rad eting:',
  ].join('\n');

  const kb = {
    inline_keyboard: [
      [
        { text: '✅ Qabul qilindi', callback_data: `approve_${payment.id}` },
        { text: '❌ Pul tushmadi', callback_data: `reject_${payment.id}` },
      ],
    ],
  };

  for (const adminId of admins) {
    if (payment.photo_file_id) {
      await tg('sendPhoto', {
        chat_id: adminId,
        photo: payment.photo_file_id,
        caption: text,
        parse_mode: 'HTML',
        reply_markup: kb,
      });
    } else {
      await tg('sendMessage', {
        chat_id: adminId,
        text,
        parse_mode: 'HTML',
        reply_markup: kb,
      });
    }
  }
}

export async function getChannelId(tariff: any): Promise<string | null> {
  if (tariff?.channel_id) return tariff.channel_id;
  return getSetting('private_channel_id');
}

export async function createInviteLink(chatId: string): Promise<string | null> {
  const r = await tg('createChatInviteLink', { chat_id: chatId, member_limit: 1 });
  return r?.ok ? r.result?.invite_link ?? null : null;
}

export async function getInviteLink(chatId: string | null): Promise<string | null> {
  if (!chatId) return null;
  const link = await createInviteLink(chatId);
  if (link) return link;
  return getSetting('invite_link_url');
}

/**
 * To'lov tasdiqlanganda foydalanuvchiga Telegram'da xabar (invite link bilan).
 * Bot'ning PAYMENT_APPROVED_TEXT matni bilan mos.
 */
export async function notifyPaymentApproved(userTelegramId: string, inviteLink: string | null): Promise<void> {
  const text = inviteLink
    ? `✅ <b>To'lov tasdiqlandi!</b>\n\nObunangiz faollashtirildi. Signal kanaliga invite link:\n${inviteLink}\n\nOmad tilaymiz! 🚀`
    : `✅ <b>To'lov tasdiqlandi!</b>\n\nObunangiz faollashtirildi.\n\n❌ Link yaratilmadi`;
  await tg('sendMessage', {
    chat_id: userTelegramId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}

/**
 * To'lov rad etilganda foydalanuvchiga xabar.
 * Bot'ning PAYMENT_REJECTED_TEXT matni bilan mos.
 */
export async function notifyPaymentRejected(userTelegramId: string): Promise<void> {
  await tg('sendMessage', {
    chat_id: userTelegramId,
    text: `❌ <b>To'lov rad etildi.</b>\n\nPul tushmagan yoki chek noto'g'ri. Iltimos, qayta urinib ko'ring yoki admin bilan bog'laning.`,
    parse_mode: 'HTML',
  });
}
