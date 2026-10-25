import {onUnmounted, reactive, ref, watch} from 'vue'

/**
 * Автосохранение черновика формы в localStorage.
 *
 * Почему не cookies: лимит ~4 КБ и они уходят на сервер с каждым запросом.
 * localStorage переживает обновление страницы и закрытие вкладки.
 *
 * @param {string} storageKey — версионированный ключ, например 'comm-draft-v1'
 * @param {object} defaults — значения по умолчанию (определяют состав и типы полей)
 */
export function useFormDraft(storageKey, defaults) {
    const form = reactive({...defaults})
    const restored = ref(false)
    let saveTimer = null
    let cleared = false

    // Восстановление: неизвестные поля и мусор отбрасываем
    try {
        const raw = localStorage.getItem(storageKey)
        if (raw) {
            const parsed = JSON.parse(raw)
            const data = parsed?.data ?? parsed
            if (data && typeof data === 'object') {
                const restoredData = sanitize(data, defaults)
                Object.assign(form, restoredData)
                restored.value = isMeaningful(restoredData, defaults)
            }
        }
    } catch {
        // Битый или недоступный localStorage не должен ломать форму
    }

    watch(form, () => {
        clearTimeout(saveTimer)
        saveTimer = setTimeout(save, 400)
    }, {deep: true})

    function save() {
        try {
            localStorage.setItem(storageKey, JSON.stringify({v: 1, data: {...form}}))
        } catch {
            // Приватный режим / переполнение — молча продолжаем без сохранения
        }
    }

    function clear() {
        cleared = true
        clearTimeout(saveTimer)
        try {
            localStorage.removeItem(storageKey)
        } catch {
            // ignore
        }
        restored.value = false
    }

    onUnmounted(() => {
        clearTimeout(saveTimer)
        // Успешная отправка уже очистила черновик — не воскрешаем его при закрытии
        if (!cleared) save()
    })

    return {form, restored, clear}
}

function sanitize(raw, defaults) {
    const result = {}

    for (const [key, fallback] of Object.entries(defaults)) {
        if (!(key in raw)) continue

        const value = raw[key]

        if (typeof fallback === 'boolean') {
            result[key] = value === true
        } else if (typeof fallback === 'number') {
            const number = Number(value)
            result[key] = Number.isFinite(number) ? number : fallback
        } else if (typeof fallback === 'string') {
            result[key] = typeof value === 'string' ? value.slice(0, 2000) : fallback
        }
    }

    return result
}

function isMeaningful(data, defaults) {
    return Object.entries(data).some(([key, value]) => {
        const fallback = defaults[key]
        if (typeof value === 'string') return value.trim() !== '' && value !== fallback
        if (typeof value === 'boolean') return value !== fallback
        if (typeof value === 'number') return value !== fallback
        return false
    })
}
