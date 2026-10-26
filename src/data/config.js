// Публичные настройки фронтенда.
// Site key Turnstile публичный — его видно в бандле, это нормально.
// Секрет Turnstile лежит только в Cloudflare Worker.

export const COMMISSION_ENDPOINT = import.meta.env.VITE_COMMISSION_ENDPOINT ||
    'https://ishwacha-comm.gbaranovskaa76.workers.dev/submit'

export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ||
    '0x4AAAAAAFlUgxQNbnfkn0ue'

export const BOOSTY_URL = 'https://boosty.to/ishwacha'
export const TELEGRAM_URL = 'https://t.me/ishwacha?direct'
