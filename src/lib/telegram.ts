import { getEnvVar } from '../utils/getEnvVar';

// src/lib/telegram.ts
export async function sendTelegramMessage(
  message: string,
  type: 'order' | 'message',
) {
  const token =
    type === 'order'
      ? getEnvVar('TELEGRAM_ORDER_BOT_TOKEN')
      : getEnvVar('TELEGRAM_MSG_BOT_TOKEN');

  const chatId =
    type === 'order'
      ? getEnvVar('TELEGRAM_ORDER_CHAT_ID')
      : getEnvVar('TELEGRAM_MSG_CHAT_ID');

  if (!token || !chatId) {
    console.error(`Telegram env vars for ${type} are missing`);
    return;
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  });
}
