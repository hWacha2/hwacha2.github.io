/**
 * Cloudflare Worker: Приём заявок + Управление слотами через Telegram
 *
 * Маршруты:
 *   POST /submit    — принять заявку с сайта и отправить в Telegram с кнопками
 *   POST /webhook   — принять обновления от Telegram Bot API (команды и кнопки)
 *   GET  /api/slots — отдать фронтенду текущий статус слотов
 *   GET  /health    — проверка работоспособности
 *
 * Переменные окружения (Settings → Variables and Secrets):
 *   BOT_TOKEN          — токен бота (Secret)
 *   CHAT_ID            — ваш chat_id (Secret)
 *   ALLOWED_ORIGINS    — список origin через запятую (Variable)
 *   TURNSTILE_SECRET   — секрет Cloudflare Turnstile (Secret, опционально)
 *
 * Биндинги (Settings → Variables → KV Namespace Bindings):
 *   COMM_KV            — KV namespace (используется и для антиспама, и для слотов)
 */

// ─── Конфигурация ───
const FORMATS = {
    portrait: {label: 'Портрет'},
    halfbody: {label: 'Полурост'},
    fullbody: {label: 'Полнорост'}
}

const CONTACT_LABELS = {
    telegram: 'Telegram', discord: 'Discord', email: 'Email', twitter: 'Twitter / X',
    boosty: 'Boosty', other: 'Другое'
}

const BACKGROUND_LABELS = { none: 'без фона', simple: 'простой', detailed: 'сложный' }

const LIMITS = {
    description: 1500,
    refs: 800,
    contact: 200,
    deadline: 120,
    name: 80,
    credit: 80,
    estimateBreakdown: 400,
    perHour: 3,          // заявок с одного IP в час
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
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', // Добавлен GET для /api/slots
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    }
}

function allowedOrigins(env) {
    return (env.ALLOWED_ORIGINS || 'https://hwacha2.github.io,http://localhost:5173,http://localhost:4173')
        .split(',').map(s => s.trim()).filter(Boolean)
}

function originAllowed(request, env) {
    const origin = request.headers.get('Origin')
    return !origin || allowedOrigins(env).includes(origin)
}

function esc(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
    return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
}

// ─── Управление слотами (через COMM_KV) ───
async function getSlots(env) {
    const total = parseInt(await env.COMM_KV.get('comm_total') || '0', 10)
    const booked = parseInt(await env.COMM_KV.get('comm_booked') || '0', 10)
    return {
        total,
        booked,
        available: Math.max(0, total - booked),
        isOpen: total > booked
    }
}

async function addSlots(env, n) {
    let total = parseInt(await env.COMM_KV.get('comm_total') || '0', 10)
    total += n
    await env.COMM_KV.put('comm_total', String(total))
    return total
}

async function removeSlots(env, n) {
    let total = parseInt(await env.COMM_KV.get('comm_total') || '0', 10)
    total = Math.max(0, total - n)
    await env.COMM_KV.put('comm_total', String(total))
    return total
}

async function changeBooked(env, delta) {
    let booked = parseInt(await env.COMM_KV.get('comm_booked') || '0', 10)
    booked = Math.max(0, booked + delta)
    await env.COMM_KV.put('comm_booked', String(booked))
    return booked
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

    const estimateTotal = Number(body.estimateTotal)
    if (!Number.isInteger(estimateTotal) || estimateTotal <= 0 || estimateTotal > 10000) {
        errors.push('estimateTotal')
    }
    const estimateBreakdown = str(body.estimateBreakdown, LIMITS.estimateBreakdown)

    return {
        errors,
        data: { format, characters, background, pose: body.pose === true, prop: body.prop === true, pet: body.pet === true, description, refs, deadline, name, credit, contact, contactMethod, lang, estimateTotal, estimateBreakdown }
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
        `🧾 <b>Заявка #${id}</b> · ${nowUtc()}`, '',
        `<b>Формат:</b> ${format.label} · персонажей: ${data.characters}`,
        `<b>Фон:</b> ${BACKGROUND_LABELS[data.background]}`
    ]
    if (flags.length) lines.push(`<b>Дополнительно:</b> ${flags.join(' · ')}`)

    lines.push(
        `<b>Оценка:</b> $${data.estimateTotal}` + (data.estimateBreakdown ? ` (${esc(data.estimateBreakdown)})` : ''), ''
    )
    if (data.name) lines.push(`<b>Имя:</b> ${esc(data.name)}`)
    if (data.credit) lines.push(`<b>Кредиты:</b> ${esc(data.credit)}`)
    lines.push('<b>Описание</b>', esc(data.description), '')
    if (data.refs) lines.push(`<b>Референсы:</b> ${esc(data.refs)}`)
    if (data.deadline) lines.push(`<b>Дедлайн:</b> ${esc(data.deadline)}`)

    lines.push('', `<b>Ответить:</b> ${CONTACT_LABELS[data.contactMethod]} — ${esc(data.contact)}`, `<b>Язык клиента:</b> ${data.lang === 'en' ? 'EN' : 'RU'}`)
    return lines.join('\n')
}

async function sendTelegram(env, text, replyMarkup = null, targetChatId = null) {
    const body = {
        // Если targetChatId не передан, используем CHAT_ID из настроек (для заявок)
        chat_id: targetChatId || env.CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
    }
    if (replyMarkup) body.reply_markup = replyMarkup

    const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    const result = await res.json().catch(() => ({}))
    if (!res.ok || !result.ok) throw new Error(`Telegram API: ${result.description || res.status}`)
}

// ─── Антиспам ───
async function isRateLimited(env, ip) {
    if (!env.COMM_KV) return false
    try {
        const key = `rl:${ip}`
        const current = parseInt(await env.COMM_KV.get(key) || '0', 10)
        if (current >= LIMITS.perHour) return true
        await env.COMM_KV.put(key, String(current + 1), {expirationTtl: 3600})
    } catch {}
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
    } catch {}
    return false
}

async function verifyTurnstile(env, token, ip) {
    if (!env.TURNSTILE_SECRET) return true
    if (!token) return false
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip })
    })
    const result = await res.json().catch(() => ({}))
    return result.success === true
}

// ─── Обработка команд бота ───
// ─── Обработка команд бота ───
async function handleBotCommand(env, chatId, text) {
    const cmd = text.trim().toLowerCase()

    if (cmd === '/status' || cmd === '/slots') {
        const s = await getSlots(env)
        const statusEmoji = s.isOpen ? '🟢 Открыт' : '🔴 Закрыт'
        const msg = `📊 <b>Статистика слотов:</b>\n\nВсего мест: ${s.total}\nЗабронировано: ${s.booked}\nСвободно: ${s.available}\n\nСтатус на сайте: ${statusEmoji}`
        await sendTelegram(env, msg, null, chatId)
        return true
    }

    // /open N - добавить N слотов к общей вместимости
    const openMatch = cmd.match(/^\/open\s+(\d+)$/)
    if (openMatch) {
        const n = parseInt(openMatch[1], 10)
        const newTotal = await addSlots(env, n)
        await sendTelegram(env, `✅ Добавлено ${n} слотов. Теперь общая вместимость: ${newTotal}.`, null, chatId)
        return true
    }

    // /close N - убрать N слотов из общей вместимости
    const closeMatch = cmd.match(/^\/close\s+(\d+)$/)
    if (closeMatch) {
        const n = parseInt(closeMatch[1], 10)
        const newTotal = await removeSlots(env, n)
        await sendTelegram(env, `➖ Убрано ${n} слотов. Теперь общая вместимость: ${newTotal}.`, null, chatId)
        return true
    }

    // /book [N] - забронировать N слотов вручную (по умолчанию 1)
    const bookMatch = cmd.match(/^\/book(?:\s+(\d+))?$/)
    if (bookMatch) {
        const n = bookMatch[1] ? parseInt(bookMatch[1], 10) : 1
        const newBooked = await changeBooked(env, n)
        const slots = await getSlots(env)
        await sendTelegram(env, `🔒 Забронировано ${n} слот(ов) вручную.\nТеперь забронировано: ${newBooked}/${slots.total}\nСвободно: ${slots.available}`, null, chatId)
        return true
    }

    // /unbook [N] - отменить N ручных броней (по умолчанию 1)
    const unbookMatch = cmd.match(/^\/unbook(?:\s+(\d+))?$/)
    if (unbookMatch) {
        const n = unbookMatch[1] ? parseInt(unbookMatch[1], 10) : 1
        const newBooked = await changeBooked(env, -n)
        const slots = await getSlots(env)
        await sendTelegram(env, `🔄 Отменено ${n} бронь(ей).\nТеперь забронировано: ${newBooked}/${slots.total}\nСвободно: ${slots.available}`, null, chatId)
        return true
    }

    // /reset - сбросить всё в 0
    if (cmd === '/reset') {
        await env.COMM_KV.put('comm_total', '0')
        await env.COMM_KV.put('comm_booked', '0')
        await sendTelegram(env, '🔄 Счетчики слотов сброшены в 0.', null, chatId)
        return true
    }

    return false
}

// ─── Обработка нажатий кнопок (Callback) ───
async function handleCallback(env, callbackQuery) {
    const data = callbackQuery.data
    const chatId = callbackQuery.from.id
    const messageId = callbackQuery.message.message_id
    const originalText = callbackQuery.message.text

    const [action, id] = data.split(':')
    const apiUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}`

    if (action === 'book') {
        const booked = await changeBooked(env, 1)
        const slots = await getSlots(env)
        const newText = originalText.replace('🧾 <b>Заявка', '🔒 <b>ЗАБРОНИРОВАНО: Заявка') +
                        `\n\n<i>Слот занят. Забронировано: ${booked}/${slots.total}</i>`

        const newKeyboard = {
            inline_keyboard: [
                [{ text: "✅ Завершить заказ", callback_data: `complete:${id}` }],
                [{ text: "🔄 Отменить бронь", callback_data: `cancel:${id}` }]
            ]
        }

        // Обновляем текст и устанавливаем новые кнопки одним запросом
        await fetch(`${apiUrl}/editMessageText`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: newText,
                parse_mode: 'HTML',
                reply_markup: newKeyboard
            })
        })

        await fetch(`${apiUrl}/answerCallbackQuery`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ callback_query_id: callbackQuery.id, text: 'Слот забронирован!' })
        })
    }
    else if (action === 'decline') {
        const newText = originalText.replace('🧾 <b>Заявка', '❌ <b>ОТКЛОНЕНО: Заявка')

        // Убираем кнопки, передавая пустой объект {}
        await fetch(`${apiUrl}/editMessageText`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: newText,
                parse_mode: 'HTML',
                reply_markup: {}
            })
        })

        await fetch(`${apiUrl}/answerCallbackQuery`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ callback_query_id: callbackQuery.id, text: 'Заявка отклонена.' })
        })
    }
    else if (action === 'complete' || action === 'cancel') {
        const booked = await changeBooked(env, -1)
        const slots = await getSlots(env)
        const actionText = action === 'complete' ? '🎉 ВЫПОЛНЕНО' : '🔄 БРОНЬ СНЯТА'

        const newText = originalText + `\n\n<i>⚠️ ${actionText}. Слот освобожден. (Забронировано: ${booked}/${slots.total})</i>`

        // Убираем кнопки, передавая пустой объект {}
        await fetch(`${apiUrl}/editMessageText`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: newText,
                parse_mode: 'HTML',
                reply_markup: {} // <-- ЭТО УДАЛЯЕТ КНОПКИ
            })
        })

        await fetch(`${apiUrl}/answerCallbackQuery`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ callback_query_id: callbackQuery.id, text: action === 'complete' ? 'Заказ завершен!' : 'Бронь отменена!' })
        })
    }
}

// ─── Обработчик заявки с сайта ───
async function handleSubmit(request, env, cors) {
    if (!env.BOT_TOKEN || !env.CHAT_ID) return json({ok: false, error: 'not_configured'}, 500, cors)

    let body
    try { body = await request.json() } catch { return json({ok: false, error: 'bad_json'}, 400, cors) }
    if (typeof body !== 'object' || body === null) return json({ok: false, error: 'bad_json'}, 400, cors)

    if (str(body.website, 100)) return json({ok: true, id: makeId()}, 200, cors) // Honeypot

    const elapsed = Number(body.elapsedMs)
    if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < LIMITS.minFillMs) {
        return json({ok: true, id: makeId()}, 200, cors)
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    if (await isRateLimited(env, ip)) return json({ok: false, error: 'rate_limited'}, 429, cors)
    if (!(await verifyTurnstile(env, body.turnstileToken, ip))) return json({ok: false, error: 'captcha_failed'}, 400, cors)

    const {errors, data} = validate(body)
    if (errors.length) return json({ok: false, error: 'validation', fields: errors}, 400, cors)
    if (await isDuplicate(env, data)) return json({ok: true, id: makeId(), duplicate: true}, 200, cors)

    try {
        const id = makeId()
        const text = buildMessage(id, data)
        // Добавляем кнопки к новому сообщению
        const keyboard = {
            inline_keyboard: [
                [{ text: "✅ Забронировать", callback_data: `book:${id}` }],
                [{ text: "❌ Отклонить", callback_data: `decline:${id}` }]
            ]
        }
        await sendTelegram(env, text, keyboard)
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

        // 1. Webhook от Telegram
        if (url.pathname === '/webhook' && request.method === 'POST') {
            const update = await request.json()
            if (update.message && update.message.text) {
                await handleBotCommand(env, update.message.chat.id, update.message.text)
            }
            if (update.callback_query) {
                await handleCallback(env, update.callback_query)
            }
            return new Response('ok', { status: 200 })
        }

        // 2. API для сайта: Получить статус слотов
        if (url.pathname === '/api/slots' && request.method === 'GET') {
            const slots = await getSlots(env)
            return json(slots, 200, cors)
        }

        // 3. Отправка заявки с сайта
        if (url.pathname === '/submit') {
            if (request.method !== 'POST') return json({ok: false, error: 'method_not_allowed'}, 405, cors)
            if (!originAllowed(request, env)) return json({ok: false, error: 'origin_not_allowed'}, 403, cors)
            return handleSubmit(request, env, cors)
        }

        // 4. Health check
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