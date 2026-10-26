import {ref} from 'vue';
import en from '../locales/en.json';
import ru from '../locales/ru.json';

const supportedLangs = ['en', 'ru'];

// Тексты лежат в src/locales/*.json. Имена ключей — те же, что были в JS.
const translations = {en, ru};

// Локаль для Intl: en-GB даёт привычный для английского порядок «день/месяц/год»
const dateLocales = {en: 'en-GB', ru: 'ru-RU'};

const interpolate = (value, vars) => vars
    ? value.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match))
    : value;

export function useLanguage() {
    // Инициализация с проверкой localStorage или браузера
    const saved = localStorage.getItem('lang');
    const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase().slice(0, 2);
    const initialLang = (saved && supportedLangs.includes(saved)) ? saved : (supportedLangs.includes(browserLang) ? browserLang : 'en');

    const currentLang = ref(initialLang);

    // t('ключ') или t('ключ', {date: '...'}) — плейсхолдеры вида {date}
    const t = (key, vars) => {
        const lang = currentLang.value;
        const value = translations[lang]?.[key] ?? translations.en[key];

        if (value === undefined) {
            // В сборке молча показываем ключ, в разработке — ещё и предупреждаем
            if (import.meta.env.DEV) console.warn(`[i18n] нет ключа "${key}" (${lang})`);
            return key;
        }

        return interpolate(value, vars);
    };

    // Дата из ISO-строки ('2026-10-23') в формате текущего языка
    const formatDate = (iso) => {
        const date = new Date(`${iso}T00:00:00`);
        if (Number.isNaN(date.getTime())) return iso;

        return new Intl.DateTimeFormat(dateLocales[currentLang.value] || dateLocales.en, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    };

    const toggleLang = () => {
        const idx = supportedLangs.indexOf(currentLang.value);
        currentLang.value = supportedLangs[(idx + 1) % supportedLangs.length];
        localStorage.setItem('lang', currentLang.value);
    };

    return {
        currentLang,
        t,
        formatDate,
        toggleLang
    };
}
