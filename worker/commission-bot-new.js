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
 *   WEBHOOK_SECRET     — случайная строка для проверки запросов от Telegram (Secret, обязательна)
 *   ALLOWED_ORIGINS    — список origin через запятую (Variable)
 *   TURNSTILE_SECRET   — секрет Cloudflare Turnstile (Secret, опционально)
 *
 * Биндинги (Settings → Variables → KV Namespace Bindings):
 *   COMM_KV            — KV namespace (используется и для антиспама, и для слотов)
 *
 * Без WEBHOOK_SECRET маршрут /webhook отвечает 503: иначе любой, кто узнал адрес
 * воркера, может управлять слотами и нажимать кнопки за вас.
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
    const bytes = crypto.getRandomValues(new Uint8Array(3))
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function nowUtc() {
    const d = new Date()
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
}

// ─── Управление слотами (через COMM_KV) ───
async function getSlots(env) {
    if (!env.COMM_KV) {
        // Биндинг не настроен: лучше показать «закрыто», чем упасть с 500
        return {total: 0, booked: 0, available: 0, isOpen: false}
    }
    const total = Math.max(0, parseInt(await env.COMM_KV.get('comm_total') || '0', 10) || 0)
    const booked = Math.min(
        total,
        Math.max(0, parseInt(await env.COMM_KV.get('comm_booked') || '0', 10) || 0)
    )
    return {
        total,
        booked,
        available: Math.max(0, total - booked),
        isOpen: total > booked
    }
}

async function setSlots(env, total, booked) {
    if (!env.COMM_KV) return
    await env.COMM_KV.put('comm_total', String(Math.max(0, total)))
    await env.COMM_KV.put('comm_booked', String(Math.max(0, booked)))
}

async function addSlots(env, n) {
    if (!env.COMM_KV) return 0
    let total = parseInt(await env.COMM_KV.get('comm_total') || '0', 10) || 0
    total = Math.max(0, total + n)
    await env.COMM_KV.put('comm_total', String(total))
    return total
}

// Уменьшаем вместимость, но никогда ниже уже забронированного
async function removeSlots(env, n) {
    if (!env.COMM_KV) return 0
    const booked = parseInt(await env.COMM_KV.get('comm_booked') || '0', 10) || 0
    let total = parseInt(await env.COMM_KV.get('comm_total') || '0', 10) || 0
    total = Math.max(booked, total - n, 0)
    await env.COMM_KV.put('comm_total', String(total))
    return total
}

// Меняем число броней, не выходя за пределы 0…total
async function changeBooked(env, delta) {
    if (!env.COMM_KV) return 0
    const total = Math.max(0, parseInt(await env.COMM_KV.get('comm_total') || '0', 10) || 0)
    let booked = Math.max(0, parseInt(await env.COMM_KV.get('comm_booked') || '0', 10) || 0)
    booked = Math.min(total, Math.max(0, booked + delta))
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
// Проверка ничего не пишет: счётчик увеличивается только после успешной отправки,
// иначе опечатки в форме съедают лимит на час.
async function isRateLimited(env, ip) {
    if (!env.COMM_KV) return false
    try {
        const current = parseInt(await env.COMM_KV.get(`rl:${ip}`) || '0', 10) || 0
        return current >= LIMITS.perHour
    } catch {
        return false
    }
}

async function bumpRateLimit(env, ip) {
    if (!env.COMM_KV) return
    try {
        const key = `rl:${ip}`
        const current = parseInt(await env.COMM_KV.get(key) || '0', 10) || 0
        await env.COMM_KV.put(key, String(current + 1), {expirationTtl: 3600})
    } catch {}
}

async function duplicateKey(data) {
    const raw = `${data.contact}|${data.description.slice(0, 80)}`
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
    const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
    return `dup:${hash.slice(0, 32)}`
}

// Только проверяем. Метку ставим после успешной отправки,
// иначе неудачная доставка заблокирует повтор на 10 минут.
async function isDuplicate(env, data) {
    if (!env.COMM_KV) return false
    try {
        return Boolean(await env.COMM_KV.get(await duplicateKey(data)))
    } catch {
        return false
    }
}

async function markDuplicate(env, data) {
    if (!env.COMM_KV) return
    try {
        await env.COMM_KV.put(await duplicateKey(data), '1', {expirationTtl: 600})
    } catch {}
}

function allowedHostnames(env) {
    return allowedOrigins(env)
        .map(origin => {
            try {
                return new URL(origin).hostname
            } catch {
                return null
            }
        })
        .filter(Boolean)
}

async function verifyTurnstile(env, token, ip) {
    if (!env.TURNSTILE_SECRET) return true
    if (!token) return false
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({secret: env.TURNSTILE_SECRET, response: token, remoteip: ip})
    })
    const result = await res.json().catch(() => ({}))
    if (result.success !== true) return false

    // Токен должен быть выдан для одного из наших доменов.
    // Если Turnstile не вернул hostname (например, тестовые ключи) — не мешаем.
    const hosts = allowedHostnames(env)
    if (result.hostname && hosts.length && !hosts.includes(result.hostname)) {
        console.warn('turnstile hostname mismatch:', result.hostname)
        return false
    }
    return true
}

// ─── Обработка команд бота ───
async function handleBotCommand(env, chatId, text) {
    // Команды принимаем только из личного чата владельца
    if (env.CHAT_ID && String(chatId) !== String(env.CHAT_ID)) {
        console.warn('command from foreign chat ignored:', chatId)
        return false
    }

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
        if (!env.COMM_KV) {
            await sendTelegram(env, '⚠️ KV namespace не подключён — сбрасывать нечего.', null, chatId)
            return true
        }
        await env.COMM_KV.put('comm_total', '0')
        await env.COMM_KV.put('comm_booked', '0')
        await sendTelegram(env, '🔄 Счетчики слотов сброшены в 0.', null, chatId)
        return true
    }

    return false
}

// ─── Обработка нажатий кнопок (Callback) ───

// Состояние заявки живёт в KV. Кнопки приходят повторно (двойной тап или retry
// от Telegram) — переход делаем только из ожидаемого состояния.
const APP_STATE_TTL = 60 * 60 * 24 * 180 // 180 дней

function appStateKey(id) {
    return `app:${id}`
}

async function getAppState(env, id, text) {
    if (env.COMM_KV) {
        try {
            const stored = await env.COMM_KV.get(appStateKey(id))
            if (stored) return stored
        } catch {}
    }
    // Старые сообщения (до появления KV-состояния) узнаём по маркеру в тексте
    if (text.startsWith('🔒')) return 'booked'
    if (text.startsWith('❌')) return 'declined'
    if (text.startsWith('🎉')) return 'done'
    if (text.startsWith('🔄')) return 'cancelled'
    return 'new'
}

async function setAppState(env, id, state) {
    if (!env.COMM_KV) return
    try {
        await env.COMM_KV.put(appStateKey(id), state, {expirationTtl: APP_STATE_TTL})
    } catch {}
}

async function editMessage(env, chatId, messageId, text, replyMarkup) {
    const body = {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML'
    }
    // {} — убрать кнопки, отсутствие поля — оставить как есть
    if (replyMarkup !== undefined) body.reply_markup = replyMarkup

    const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/editMessageText`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    const result = await res.json().catch(() => ({}))
    if (!res.ok || !result.ok) {
        console.error('editMessageText failed:', result.description || res.status)
        return false
    }
    return true
}

async function answerCallback(env, callbackQueryId, text) {
    try {
        await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/answerCallbackQuery`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({callback_query_id: callbackQueryId, text})
        })
    } catch {}
}

function replaceStatus(text, from, to) {
    // Меняем только заголовок, тело заявки не трогаем
    return text.includes(from) ? text.replace(from, to) : text
}

async function handleCallback(env, callbackQuery) {
    const message = callbackQuery.message
    const data = callbackQuery.data || ''

    // В группе редактировать надо чат сообщения, а не автора нажатия
    const chatId = message?.chat?.id ?? callbackQuery.from?.id
    const messageId = message?.message_id
    const originalText = message?.text || ''

    if (!messageId || !chatId) {
        await answerCallback(env, callbackQuery.id, 'Сообщение недоступно')
        return
    }

    if (env.CHAT_ID && String(chatId) !== String(env.CHAT_ID)) {
        await answerCallback(env, callbackQuery.id, 'Нет доступа')
        return
    }

    const [action, id] = data.split(':')
    if (!action || !id) {
        await answerCallback(env, callbackQuery.id, 'Неизвестная кнопка')
        return
    }

    const state = await getAppState(env, id, originalText)

    if (action === 'book') {
        if (state !== 'new') return answerCallback(env, callbackQuery.id, 'Уже обработано')

        const slots = await getSlots(env)
        const booked = Math.min(slots.total, slots.booked + 1)
        const newText = replaceStatus(originalText, '🧾 <b>Заявка', '🔒 <b>ЗАБРОНИРОВАНО: Заявка') +
            `\n\n<i>Слот занят. Забронировано: ${booked}/${slots.total}</i>`

        const keyboard = {
            inline_keyboard: [
                [{text: '✅ Завершить заказ', callback_data: `complete:${id}`}],
                [{text: '🔄 Отменить бронь', callback_data: `cancel:${id}`}]
            ]
        }

        if (!(await editMessage(env, chatId, messageId, newText, keyboard))) {
            return answerCallback(env, callbackQuery.id, 'Не удалось обновить сообщение')
        }

        // Счётчики и состояние меняем только после успешного редактирования
        await setSlots(env, slots.total, booked)
        await setAppState(env, id, 'booked')
        await answerCallback(env, callbackQuery.id, 'Слот забронирован!')
        return
    }

    if (action === 'decline') {
        if (state !== 'new') return answerCallback(env, callbackQuery.id, 'Уже обработано')

        const newText = replaceStatus(originalText, '🧾 <b>Заявка', '❌ <b>ОТКЛОНЕНО: Заявка')
        if (!(await editMessage(env, chatId, messageId, newText, {}))) {
            return answerCallback(env, callbackQuery.id, 'Не удалось обновить сообщение')
        }

        await setAppState(env, id, 'declined')
        await answerCallback(env, callbackQuery.id, 'Заявка отклонена.')
        return
    }

    if (action === 'complete' || action === 'cancel') {
        if (state !== 'booked') return answerCallback(env, callbackQuery.id, 'Уже обработано')

        const slots = await getSlots(env)
        const booked = Math.max(0, slots.booked - 1)
        const isComplete = action === 'complete'
        const title = isComplete ? '🎉 <b>ВЫПОЛНЕНО: Заявка' : '🔄 <b>БРОНЬ СНЯТА: Заявка'
        const note = isComplete ? '🎉 ВЫПОЛНЕНО' : '🔄 БРОНЬ СНЯТА'

        // Убираем старую пометку о брони, чтобы не копилась при переходах
        const baseText = originalText
            .replace(/\n\n<i>Слот занят\.[\s\S]*$/, '')
            .replace('🔒 <b>ЗАБРОНИРОВАНО: Заявка', title)
            // запасной вариант, если текст сообщения почему-то остался исходным
            .replace('🧾 <b>Заявка', title)

        const newText = baseText +
            `\n\n<i>⚠️ ${note}. Слот освобождён. (Забронировано: ${booked}/${slots.total})</i>`

        if (!(await editMessage(env, chatId, messageId, newText, {}))) {
            return answerCallback(env, callbackQuery.id, 'Не удалось обновить сообщение')
        }

        await setSlots(env, slots.total, booked)
        await setAppState(env, id, isComplete ? 'done' : 'cancelled')
        await answerCallback(env, callbackQuery.id, isComplete ? 'Заказ завершён!' : 'Бронь отменена!')
        return
    }

    await answerCallback(env, callbackQuery.id, 'Неизвестное действие')
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

    // Сначала проверяем данные, потом капчу, и только потом лимит:
    // опечатки в форме не должны съедать квоту на час.
    const {errors, data} = validate(body)
    if (errors.length) return json({ok: false, error: 'validation', fields: errors}, 400, cors)

    if (!(await verifyTurnstile(env, body.turnstileToken, ip))) {
        return json({ok: false, error: 'captcha_failed'}, 400, cors)
    }

    if (await isRateLimited(env, ip)) return json({ok: false, error: 'rate_limited'}, 429, cors)
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

        // Метку дубля и лимит пишем только после успешной доставки:
        // иначе неудачная отправка блокировала бы повтор
        await markDuplicate(env, data)
        await bumpRateLimit(env, ip)

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
            // Без секрета маршрут открыт любому, кто узнал адрес воркера.
            // Лучше явно не работать, чем молча разрешать чужие команды.
            if (!env.WEBHOOK_SECRET) {
                console.error('WEBHOOK_SECRET не задан: /webhook отключён')
                return new Response('webhook secret is not configured', {status: 503})
            }
            if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) {
                return new Response('forbidden', {status: 403})
            }

            let update
            try {
                update = await request.json()
            } catch {
                return new Response('bad request', {status: 400})
            }

            // Отвечаем Telegram 200 даже при сбое внутри: иначе он будет
            // повторять один и тот же update и снова дёргать счётчики.
            try {
                if (update.message && update.message.text) {
                    await handleBotCommand(env, update.message.chat.id, update.message.text)
                }
                if (update.callback_query) {
                    await handleCallback(env, update.callback_query)
                }
            } catch (error) {
                console.error('webhook failed:', error)
            }

            return new Response('ok', {status: 200})
        }

        // 2. API для сайта: Получить статус слотов
        if (url.pathname === '/api/slots' && request.method === 'GET') {
            const slots = await getSlots(env)
            // 60 секунд кэша: снимает лишние чтения KV при каждом заходе
            return json(slots, 200, {...cors, 'Cache-Control': 'public, max-age=60'})
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
                    webhookSecret: Boolean(env.WEBHOOK_SECRET),
                    turnstile: Boolean(env.TURNSTILE_SECRET),
                    kv: Boolean(env.COMM_KV)
                }
            }, 200, cors)
        }

        return json({ok: false, error: 'not_found'}, 404, cors)
    }
}