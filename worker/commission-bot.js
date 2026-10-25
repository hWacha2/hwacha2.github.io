/**
 * Cloudflare Worker: приём заявок с сайта-портфолио и пересылка в Telegram.
 *
 * Отдельный воркер, НЕ трогает social-proxy (лента Telegram на главной).
 * Токен бота живёт только здесь, в переменных окружения Cloudflare.
 *
 * Маршруты:
 *   POST /submit  — принять заявку и отправить сообщение в Telegram
 *   GET  /health  — проверка, что воркер жив и переменные заданы
 *
 * Переменные окружения (Settings → Variables and Secrets):
 *   BOT_TOKEN          — токен бота от @BotFather (Secret)
 *   CHAT_ID            — куда присылать заявки: ваш user id или id группы (Secret)
 *   ALLOWED_ORIGINS    — список origin через запятую (Variable)
 *                        по умолчанию: https://hwacha2.github.io,http://localhost:5173,http://localhost:4173
 *   TURNSTILE_SECRET   — секрет Cloudflare Turnstile (необязательно; если не задан — проверка пропускается)
 *
 * Необязательный биндинг:
 *   COMM_KV            — KV namespace для антиспама (лимит по IP и защита от двойной отправки).
 *                        Без него воркер работает, просто без лимитов.
 */

// ─── Подписи форматов ───
// Цены здесь НЕ хранятся: сумму и расшифровку считает фронтенд из src/data/pricing.js
// и присылает готовыми (estimateTotal / estimateBreakdown). Так прайс меняется в одном месте.
const FORMATS = {
    portrait: {label: 'Портрет'},
    halfbody: {label: 'Полурост'},
    fullbody: {label: 'Полнорост'}
}

const CONTACT_LABELS = {
    telegram: 'Telegram',
    discord: 'Discord',
    email: 'Email',
    twitter: 'Twitter / X',
    // старые варианты — чтобы заявки с прежней версией формы не отбивались
    boosty: 'Boosty',
    other: 'Другое'
}

const BACKGROUND_LABELS = {
    none: 'без фона',
    simple: 'простой',
    detailed: 'сложный'
}

const LIMITS = {
    description: 1500,
    refs: 800,
    contact: 200,
    deadline: 120,
    name: 80,
    credit: 80,
    estimateBreakdown: 400,
    perHour: 5,          // заявок с одного IP в час
    minFillMs: 2500      // быстрее — почти наверняка бот
}

// ─── Утилиты ───

function json(body, status, headers) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {...headers, 'Content-Type': 'application/json; charset=utf-8'}
    })
}

function corsHeaders(request, env) {
    const allowed = allowedOrigins(env)
    const origin = request.headers.get('Origin') || ''
    return {
        'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    }
}

function allowedOrigins(env) {
    return (env.ALLOWED_ORIGINS ||
        'https://hwacha2.github.io,http://localhost:5173,http://localhost:4173')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
}

function originAllowed(request, env) {
    const origin = request.headers.get('Origin')
    // Запросы без Origin (curl, тесты) не блокируем — браузер всегда присылает Origin на POST
    return !origin || allowedOrigins(env).includes(origin)
}

function esc(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

function str(value, max) {
    return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function makeId() {
    const bytes = crypto.getRandomValues(new Uint8Array(2))
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function nowUtc() {
    const d = new Date()
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ` +
        `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
}

// ─── Валидация ───

function validate(body) {
    const errors = []

    const format = body.format
    if (!FORMATS[format]) errors.push('format')

    const characters = Number(body.characters)
    if (!Number.isInteger(characters) || characters < 1 || characters > 4) errors.push('characters')

    const background = body.background
    if (!['none', 'simple', 'detailed'].includes(background)) errors.push('background')

    const description = str(body.description, LIMITS.description)
    if (description.length < 10) errors.push('description')

    const contact = str(body.contact, LIMITS.contact)
    if (contact.length < 2) errors.push('contact')

    const contactMethod = body.contactMethod
    if (!CONTACT_LABELS[contactMethod]) errors.push('contactMethod')

    const name = str(body.name, LIMITS.name)
    const credit = str(body.credit, LIMITS.credit)
    const refs = str(body.refs, LIMITS.refs)
    const deadline = str(body.deadline, LIMITS.deadline)
    const lang = body.lang === 'en' ? 'en' : 'ru'

    // Оценку считает фронтенд из своего прайса; воркер только проверяет разумность
    const estimateTotal = Number(body.estimateTotal)
    if (!Number.isInteger(estimateTotal) || estimateTotal <= 0 || estimateTotal > 10000) {
        errors.push('estimateTotal')
    }
    const estimateBreakdown = str(body.estimateBreakdown, LIMITS.estimateBreakdown)

    return {
        errors,
        data: {
            format,
            characters,
            background,
            pose: body.pose === true,
            prop: body.prop === true,
            pet: body.pet === true,
            description,
            refs,
            deadline,
            name,
            credit,
            contact,
            contactMethod,
            lang,
            estimateTotal,
            estimateBreakdown
        }
    }
}

// ─── Сообщение в Telegram ───

function buildMessage(id, data) {
    const format = FORMATS[data.format]

    const flags = []
    if (data.pose) flags.push('сложная поза')
    if (data.prop) flags.push('реквизит')
    if (data.pet) flags.push('питомец')

    const lines = [
        `🧾 <b>Заявка #${id}</b> · ${nowUtc()}`,
        '',
        `<b>Формат:</b> ${format.label} · персонажей: ${data.characters}`,
        `<b>Фон:</b> ${BACKGROUND_LABELS[data.background]}`
    ]

    if (flags.length) lines.push(`<b>Дополнительно:</b> ${flags.join(' · ')}`)

    lines.push(
        `<b>Оценка:</b> $${data.estimateTotal}` +
        (data.estimateBreakdown ? ` (${esc(data.estimateBreakdown)})` : ''),
        ''
    )

    if (data.name) lines.push(`<b>Имя:</b> ${esc(data.name)}`)
    if (data.credit) lines.push(`<b>Кредиты:</b> ${esc(data.credit)}`)
    lines.push('<b>Описание</b>', esc(data.description), '')

    if (data.refs) lines.push(`<b>Референсы:</b> ${esc(data.refs)}`)
    if (data.deadline) lines.push(`<b>Дедлайн:</b> ${esc(data.deadline)}`)

    lines.push(
        '',
        `<b>Ответить:</b> ${CONTACT_LABELS[data.contactMethod]} — ${esc(data.contact)}`,
        `<b>Язык клиента:</b> ${data.lang === 'en' ? 'EN' : 'RU'}`
    )

    return lines.join('\n')
}

async function sendTelegram(env, text) {
    const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            chat_id: env.CHAT_ID,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        })
    })

    const result = await res.json().catch(() => ({}))
    if (!res.ok || !result.ok) {
        throw new Error(`Telegram API: ${result.description || res.status}`)
    }
}

// ─── Антиспам ───

async function isRateLimited(env, ip) {
    if (!env.COMM_KV) return false
    try {
        const key = `rl:${ip}`
        const current = parseInt(await env.COMM_KV.get(key) || '0', 10)
        if (current >= LIMITS.perHour) return true
        await env.COMM_KV.put(key, String(current + 1), {expirationTtl: 3600})
    } catch {
        // KV недоступен — не блокируем заявку из-за инфраструктуры
    }
    return false
}

async function isDuplicate(env, data) {
    if (!env.COMM_KV) return false
    try {
        const raw = `${data.contact}|${data.description.slice(0, 80)}`
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
        const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
        const key = `dup:${hash.slice(0, 32)}`
        if (await env.COMM_KV.get(key)) return true
        await env.COMM_KV.put(key, '1', {expirationTtl: 600})
    } catch {
        // см. выше
    }
    return false
}

async function verifyTurnstile(env, token, ip) {
    if (!env.TURNSTILE_SECRET) return true
    if (!token) return false

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            secret: env.TURNSTILE_SECRET,
            response: token,
            remoteip: ip
        })
    })
    const result = await res.json().catch(() => ({}))
    return result.success === true
}

// ─── Обработчик заявки ───

async function handleSubmit(request, env, cors) {
    if (!env.BOT_TOKEN || !env.CHAT_ID) {
        return json({ok: false, error: 'not_configured'}, 500, cors)
    }

    let body
    try {
        body = await request.json()
    } catch {
        return json({ok: false, error: 'bad_json'}, 400, cors)
    }

    if (typeof body !== 'object' || body === null) {
        return json({ok: false, error: 'bad_json'}, 400, cors)
    }

    // Honeypot: скрытое поле должны заполнять только боты
    if (str(body.website, 100)) {
        return json({ok: true, id: makeId()}, 200, cors)
    }

    // Слишком быстрая отправка — тихо «принимаем», чтобы не подсказывать боту
    const elapsed = Number(body.elapsedMs)
    if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < LIMITS.minFillMs) {
        return json({ok: true, id: makeId()}, 200, cors)
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'

    if (await isRateLimited(env, ip)) {
        return json({ok: false, error: 'rate_limited'}, 429, cors)
    }

    if (!(await verifyTurnstile(env, body.turnstileToken, ip))) {
        return json({ok: false, error: 'captcha_failed'}, 400, cors)
    }

    const {errors, data} = validate(body)
    if (errors.length) {
        return json({ok: false, error: 'validation', fields: errors}, 400, cors)
    }

    if (await isDuplicate(env, data)) {
        return json({ok: true, id: makeId(), duplicate: true}, 200, cors)
    }

    try {
        const id = makeId()
        await sendTelegram(env, buildMessage(id, data))
        return json({ok: true, id}, 200, cors)
    } catch (error) {
        console.error('send failed:', error)
        return json({ok: false, error: 'delivery_failed'}, 502, cors)
    }
}

// ─── Роутер ───

export default {
    async fetch(request, env) {
        const url = new URL(request.url)
        const cors = corsHeaders(request, env)

        if (request.method === 'OPTIONS') {
            return new Response(null, {status: 204, headers: cors})
        }

        if (url.pathname === '/submit') {
            if (request.method !== 'POST') {
                return json({ok: false, error: 'method_not_allowed'}, 405, cors)
            }
            if (!originAllowed(request, env)) {
                return json({ok: false, error: 'origin_not_allowed'}, 403, cors)
            }
            return handleSubmit(request, env, cors)
        }

        if (url.pathname === '/health') {
            return json({
                ok: true,
                configured: {
                    botToken: Boolean(env.BOT_TOKEN),
                    chatId: Boolean(env.CHAT_ID),
                    turnstile: Boolean(env.TURNSTILE_SECRET),
                    kv: Boolean(env.COMM_KV)
                }
            }, 200, cors)
        }

        return json({ok: false, error: 'not_found'}, 404, cors)
    }
}
