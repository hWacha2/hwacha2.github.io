# ishwacha

Мой личный сайт-визитка и одновременно место для баловства и экспериментов.

Сайт не претендует на роль серьёзного продукта —
это витрина и песочница в одном флаконе.

**Сайт:** https://hwacha2.github.io

> A personal portfolio and a playground: art gallery, commission info, and a
> place to try out web experiments. Russian is the main language, the site is
> also available in English.

## Что внутри

| Страница | Что там |
|---|---|
| `/` | Главная: приветствие, ссылки на соцсети, галерея работ, лента из Telegram, моды |
| `/commissions` | Прайс, статус слотов, правила и форма брифа |
| `/privacy` | Политика конфиденциальности и обработки данных |
| любой другой адрес | Симпатичная 404 вместо пустого экрана |


## Стек

- **Vue 3** (`<script setup>`) + **Vite**
- **vue-router** с ленивой загрузкой страниц
- Чистый CSS, без UI-фреймворков; из Bootstrap подключён только CSS-сброс
- Своя микро-i18n: RU / EN, переключение в меню навигации
- Хостинг — **GitHub Pages**, деплой через GitHub Actions
- Статус слотов — **Cloudflare Worker** (см. `worker/`)

## Как запустить

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # сборка в dist/
npm run preview    # посмотреть собранное
```

Полезные проверки:

```bash
npm run check:i18n   # ключи ru/en совпадают, мёртвых нет
npm run images       # пересобрать картинки из masters/ в public/ (Python + Pillow)
```

## Структура

```
src/
  views/          страницы (Home, Commissions, Privacy, NotFound)
  components/     галерея, модалки, меню, лента Telegram, форма брифа
  composables/    язык, черновик формы, брейкпоинты
  data/           контент и настройки: pricing.js, config.js, homeData.js
  locales/        ru.json / en.json
  assets/         стили и кнопки соцсетей
worker/           Cloudflare Worker: /api/slots, вебхук Telegram
masters/          исходники изображений (не отдаются в сборку)
public/           оптимизированные webp, шрифты, favicon
scripts/          check-i18n, optimize-images, spa-fallback
```

## Деплой

Пуш в `main` запускает `.github/workflows/deploy.yml`: сборка → GitHub Pages.
Ничего вручную заливать не нужно. `npm run deploy` — старый локальный способ
через `git subtree`, оставлен на всякий случай.


## Лицензия

Код — мой, пользуйтесь как примером (ISC). Картинки, персонажи и тексты —
мои работы, выкладывать их от своего имени или использовать в коммерческих
целях нельзя.
