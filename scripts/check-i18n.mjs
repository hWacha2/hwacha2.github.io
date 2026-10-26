// Проверка переводов: наборы ключей RU/EN, пустые значения, дубли и использование в коде.
// Запуск: npm run check:i18n (--strict — падать ещё и на неиспользуемых ключах)
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'src')
const LOCALES = path.join(SRC, 'locales')
const BASE_LANG = 'en'
const STRICT = process.argv.includes('--strict')

const walk = dir => fs.readdirSync(dir, {withFileTypes: true})
    .flatMap(entry => entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)])

const relative = file => path.relative(ROOT, file).replace(/\\/g, '/')

// ─── Словари ───
const langFiles = fs.readdirSync(LOCALES).filter(name => name.endsWith('.json'))
if (!langFiles.length) {
    console.error('Нет файлов словарей в src/locales')
    process.exit(1)
}

const dictionaries = {}
const problems = []

for (const name of langFiles) {
    const lang = path.basename(name, '.json')
    const file = path.join(LOCALES, name)
    const raw = fs.readFileSync(file, 'utf8')

    let dict
    try {
        dict = JSON.parse(raw)
    } catch (error) {
        problems.push(`${relative(file)}: невалидный JSON — ${error.message}`)
        continue
    }
    dictionaries[lang] = dict

    // дубли ключей JSON.parse молча съедает, поэтому смотрим в текст
    const keyLines = raw.split(/\r?\n/)
        .map(line => line.match(/^(\s*)"((?:[^"\\]|\\.)+)"\s*:/))
        .filter(Boolean)
    if (keyLines.length) {
        const indent = Math.min(...keyLines.map(m => m[1].length))
        const seen = new Set()
        keyLines.filter(m => m[1].length === indent).forEach(m => {
            if (seen.has(m[2])) problems.push(`${relative(file)}: дубль ключа "${m[2]}"`)
            seen.add(m[2])
        })
    }

    for (const [key, value] of Object.entries(dict)) {
        if (typeof value !== 'string') {
            problems.push(`${relative(file)}: "${key}" — не строка`)
        } else if (!value.trim()) {
            problems.push(`${relative(file)}: "${key}" — пустое значение`)
        }
    }
}

const languages = Object.keys(dictionaries)
const baseKeys = Object.keys(dictionaries[BASE_LANG] || {})

for (const lang of languages) {
    if (lang === BASE_LANG) continue
    const keys = Object.keys(dictionaries[lang])
    const missing = baseKeys.filter(key => !keys.includes(key))
    const extra = keys.filter(key => !baseKeys.includes(key))
    if (missing.length) problems.push(`${lang}: нет ключей из ${BASE_LANG}: ${missing.join(', ')}`)
    if (extra.length) problems.push(`${lang}: лишние ключи (нет в ${BASE_LANG}): ${extra.join(', ')}`)

    // плейсхолдеры {date} должны совпадать во всех языках
    for (const key of baseKeys.filter(key => keys.includes(key))) {
        const placeholders = value => [...String(value).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(', ')
        const base = placeholders(dictionaries[BASE_LANG][key])
        const other = placeholders(dictionaries[lang][key])
        if (base !== other) {
            problems.push(`${lang}: у "${key}" плейсхолдеры [${other}], а в ${BASE_LANG} [${base}]`)
        }
    }
}

// ─── Использование в коде ───
const codeFiles = walk(SRC).filter(file =>
    /\.(vue|js|mjs|ts)$/.test(file) && !file.startsWith(LOCALES))

const literals = new Set()
const directKeys = new Set()
const patterns = []
const unresolved = new Set()

const isQuote = ch => ch === '"' || ch === "'" || ch === '`'

// Возвращает аргумент t(...) целиком, учитывая вложенные скобки и строки
function readCallArgument(text, from) {
    let i = from
    let depth = 1
    while (i < text.length && depth > 0) {
        const ch = text[i]
        if (isQuote(ch)) {
            const quote = ch
            i++
            while (i < text.length) {
                if (text[i] === '\\') {
                    i += 2
                    continue
                }
                if (text[i] === quote) {
                    i++
                    break
                }
                i++
            }
            continue
        }
        if (ch === '(') depth++
        else if (ch === ')') depth--
        i++
    }
    return text.slice(from, i - 1)
}

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Убираем комментарии, чтобы примеры вроде t('ключ') в пояснениях не считались кодом
function stripComments(text) {
    let out = ''
    let i = 0

    while (i < text.length) {
        const ch = text[i]

        if (ch === '/' && text[i + 1] === '/') {
            while (i < text.length && text[i] !== '\n') i++
            continue
        }
        if (ch === '/' && text[i + 1] === '*') {
            const end = text.indexOf('*/', i + 2)
            i = end === -1 ? text.length : end + 2
            out += ' '
            continue
        }
        if (ch === '<' && text.startsWith('<!--', i)) {
            const end = text.indexOf('-->', i + 4)
            i = end === -1 ? text.length : end + 3
            out += ' '
            continue
        }
        if (isQuote(ch)) {
            const quote = ch
            out += ch
            i++
            while (i < text.length) {
                out += text[i]
                if (text[i] === '\\') {
                    i++
                    if (i < text.length) out += text[i]
                    i++
                    continue
                }
                if (text[i] === quote) {
                    i++
                    break
                }
                i++
            }
            continue
        }

        out += ch
        i++
    }

    return out
}

// 'formError' + code → /^formError/, `price${id}Name` → /^price.*Name$/
function argumentToPattern(argument) {
    const parts = []
    let i = 0

    while (i < argument.length) {
        const ch = argument[i]

        if (ch === '"' || ch === "'") {
            let value = ''
            i++
            while (i < argument.length && argument[i] !== ch) {
                if (argument[i] === '\\') {
                    value += argument[i + 1] ?? ''
                    i += 2
                    continue
                }
                value += argument[i]
                i++
            }
            i++
            parts.push({type: 'lit', value})
            continue
        }

        if (ch === '`') {
            let value = ''
            i++
            while (i < argument.length && argument[i] !== '`') {
                if (argument[i] === '\\') {
                    value += argument[i + 1] ?? ''
                    i += 2
                    continue
                }
                if (argument[i] === '$' && argument[i + 1] === '{') {
                    if (value) parts.push({type: 'lit', value})
                    value = ''
                    let depth = 1
                    i += 2
                    while (i < argument.length && depth > 0) {
                        if (argument[i] === '{') depth++
                        else if (argument[i] === '}') depth--
                        i++
                    }
                    parts.push({type: 'var'})
                    continue
                }
                value += argument[i]
                i++
            }
            i++
            if (value) parts.push({type: 'lit', value})
            continue
        }

        if (/[\s+]/.test(ch)) {
            i++
            continue
        }

        // переменная или свойство: забираем путь целиком
        const start = i
        while (i < argument.length && /[A-Za-z0-9_$.[\]]/.test(argument[i])) i++
        if (i === start) i++
        parts.push({type: 'var'})
    }

    if (!parts.some(part => part.type === 'lit')) return null
    const source = parts
        .map(part => part.type === 'lit' ? escapeRegex(part.value) : '.*')
        .join('')
    const start = parts[0].type === 'lit' ? '^' : ''
    const end = parts[parts.length - 1].type === 'lit' ? '$' : ''
    return new RegExp(start + source + end)
}

for (const file of codeFiles) {
    const text = stripComments(fs.readFileSync(file, 'utf8'))

    // все строковые литералы файла: ключи часто лежат в данных (labelKey, meta.title и т.п.).
    // Три прохода по типам кавычек, чтобы не потерять 'ключ' внутри атрибута "t('ключ')"
    for (const pattern of [
        /'(?:\\.|[^'\\])*'/g,
        /"(?:\\.|[^"\\])*"/g,
        /`(?:\\.|[^`\\])*`/g
    ]) {
        for (const match of text.matchAll(pattern)) {
            literals.add(match[0].slice(1, -1))
        }
    }

    const call = /\bt\s*\(/g
    let match
    while ((match = call.exec(text))) {
        const argument = readCallArgument(text, call.lastIndex).trim()
        call.lastIndex += argument.length + 1

        // t('ключ') и t('ключ', {vars}) — ключ первым аргументом
        const first = argument.match(/^(['"])((?:\\.|(?!\1)[^\\])*)\1\s*(?:,|$)/)
        if (first) {
            directKeys.add(first[2])
            continue
        }

        const pattern = argumentToPattern(argument)
        if (pattern) patterns.push(pattern)
        else unresolved.add(argument)
    }
}

const allKeys = new Set(languages.flatMap(lang => Object.keys(dictionaries[lang])))

for (const key of directKeys) {
    if (!allKeys.has(key)) problems.push(`ключ "${key}" вызывается через t(), но отсутствует в словарях`)
}

const unused = [...allKeys].filter(key =>
    !directKeys.has(key) && !literals.has(key) && !patterns.some(pattern => pattern.test(key)))

// ─── Отчёт ───
console.log(`Словари: ${languages.map(lang => `${lang} (${Object.keys(dictionaries[lang]).length})`).join(', ')}`)
console.log(`Ключей всего: ${allKeys.size}`)
console.log(`Прямых вызовов t('...'): ${directKeys.size}`)
console.log(`Динамических шаблонов: ${patterns.length}`)

if (unresolved.size) {
    console.log('\nДинамические вызовы без строковой части (проверить вручную):')
    ;[...unresolved].sort().forEach(argument => console.log(`  t(${argument})`))
}

if (unused.length) {
    console.log(`\nНе используются (${unused.length}):`)
    unused.sort().forEach(key => console.log(`  ${key}`))
}

if (problems.length) {
    console.log(`\nПроблемы (${problems.length}):`)
    problems.forEach(problem => console.log(`  ${problem}`))
    process.exit(1)
}

if (!unused.length) console.log('\nВсё чисто: ключи совпадают, мёртвых нет')

if (STRICT && unused.length) process.exit(1)
