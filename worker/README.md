# Worker для заявок (вариант A)

Отдельный Cloudflare Worker, который принимает форму с сайта и присылает заявку в Telegram.
Существующий `social-proxy` **не трогаем** — он продолжает кормить ленту постов на главной.

```
Сайт (GitHub Pages) --POST /submit--> Worker --Bot API--> ваш Telegram
```

## 1. Создать бота

1. В Telegram написать [@BotFather](https://t.me/BotFather) → `/newbot` → имя и username.
2. Сохранить токен вида `123456789:AA...` — это `BOT_TOKEN`.
3. Написать своему боту любое сообщение (иначе он не сможет первым написать вам).
4. Открыть `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найти `"chat":{"id":...}` — это `CHAT_ID`.
   Для группы id отрицательный, вида `-1001234567890`; бота нужно добавить в группу.

## 2. Развернуть Worker

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Worker**.
2. Имя: `ishwacha-comm` (URL получится `https://ishwacha-comm.<ваш-поддомен>.workers.dev`).
3. **Edit code** → удалить шаблон → вставить содержимое `worker/commission-bot.js` → **Deploy**.
4. **Settings → Variables and Secrets**:

| Имя | Тип | Значение |
|---|---|---|
| `BOT_TOKEN` | Secret | токен из шага 1 |
| `CHAT_ID` | Secret | id чата из шага 1 |
| `ALLOWED_ORIGINS` | Variable | `https://hwacha2.github.io,http://localhost:5173,http://localhost:4173` |
| `TURNSTILE_SECRET` | Secret (необязательно) | секрет Turnstile |

5. После добавления переменных — **Deploy** ещё раз.

### Антиспам (необязательно, но желательно)

1. **Workers & Pages → KV** → создать namespace `comm-rate-limit`.
2. В настройках воркера → **Bindings** → **KV namespace** → Variable name: `COMM_KV`, выбрать созданный namespace.
3. Redeploy.

Без KV воркер работает, но без лимита 5 заявок в час с одного IP и без защиты от двойной отправки.

### Turnstile (необязательно)

1. Cloudflare Dashboard → **Turnstile** → **Add site**: домен `hwacha2.github.io`, widget mode — **Managed** (показывает галочку только при подозрении).
2. В настройках виджета → **Hostnames** добавить `localhost` — тогда тот же site key работает и на `npm run dev`, и на превью. Отдельный тестовый виджет не нужен.
3. Site key пойдёт во фронтенд, Secret key — в `TURNSTILE_SECRET` воркера.
4. Пока `TURNSTILE_SECRET` не задан, проверка капчи пропускается — форму можно тестировать без неё.

## 3. Проверить

Открыть в браузере:

```
https://ishwacha-comm.<ваш-поддомен>.workers.dev/health
```

Должно вернуться:

```json
{"ok":true,"configured":{"botToken":true,"chatId":true,"turnstile":false,"kv":true}}
```

Тестовая заявка из PowerShell:

> Если `TURNSTILE_SECRET` уже задан, curl/Invoke-RestMethod без токена получит `captcha_failed`.
> Для ручного теста либо временно уберите `TURNSTILE_SECRET` из настроек воркера, либо
> отправляйте заявку из браузера — виджет сам подставит токен.

```powershell
$body = @{
  format        = 'fullbody'
  characters    = 2
  background    = 'detailed'
  pose          = $true
  prop          = $true
  pet           = $false
  description   = 'Тестовая заявка: два персонажа, вода и трава на фоне.'
  refs          = 'https://example.com/refs'
  deadline      = 'до конца ноября'
  name          = 'Тест'
  credit        = '@test_nick'
  contactMethod = 'telegram'
  contact       = 'https://t.me/test_nick'
  lang          = 'ru'
  elapsedMs     = 9000
  website       = ''
  estimateTotal = 355
  estimateBreakdown = 'база $100 + сложный фон +$100 + сложная поза +$50 + доп. персонажи ×1 +$75 + реквизит +$30'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'https://ishwacha-comm.<ваш-поддомен>.workers.dev/submit' `
  -Method Post -ContentType 'application/json; charset=utf-8' `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
```

Ожидаемый ответ: `{"ok":true,"id":"A7F3"}`, в Telegram — карточка заявки с оценкой **$355**.

Проверка вашего реального заказа «полнорост + сложная поза + сложный фон»: 100 + 50 + 100 = **$250**.

## Что присылает фронтенд

Воркер не считает цену — он получает готовые поля:

| Поле | Тип | Описание |
|---|---|---|
| `format` | `portrait` / `halfbody` / `fullbody` | формат |
| `characters` | 1–4 | всего персонажей |
| `background` | `none` / `simple` / `detailed` | фон |
| `pose`, `prop`, `pet` | boolean | надбавки |
| `description` | строка 10–1500 | описание заказа |
| `refs` | строка ≤ 800 | ссылки на референсы |
| `deadline` | строка ≤ 120 | желаемый срок |
| `name` | строка ≤ 80 | имя (необязательно) |
| `credit` | строка ≤ 80 | ник для упоминания в кредитах (необязательно) |
| `contactMethod` | `telegram` / `discord` / `email` / `twitter` | куда отвечать (старые `boosty` / `other` тоже принимаются) |
| `contact` | строка 2–200 | сам контакт — уже с префиксом (`https://t.me/nick`) |
| `lang` | `ru` / `en` | язык клиента |
| `estimateTotal` | целое 1–10000 | итоговая сумма |
| `estimateBreakdown` | строка ≤ 400 | расшифровка: «база $100 + ...» |
| `elapsedMs` | число | сколько клиент заполнял форму |
| `website` | строка | honeypot, всегда пустая |

Сумма приходит с клиента, но деньги автоматически не списываются — вы всё равно подтверждаете цену вручную. Если кто-то пришлёт странную сумму, вы это увидите в карточке.

## Ответы, которые возвращает воркер

| `error` | Что значит |
|---|---|
| `validation` | не заполнены/некорректны поля, в `fields` список |
| `rate_limited` | больше 5 заявок в час с одного IP |
| `captcha_failed` | Turnstile не прошёл |
| `delivery_failed` | Telegram не принял сообщение (проверьте `BOT_TOKEN`/`CHAT_ID`) |
| `not_configured` | не заданы `BOT_TOKEN` или `CHAT_ID` |
| `origin_not_allowed` | запрос с чужого домена |

Фронтенд на любой `error`, кроме `validation`, должен показать запасной вариант: «скопировать заявку и написать в Boosty/Telegram».

## Обновление цен

Цены живут **только во фронтенде** — в `src/data/pricing.js` (после следующего шага) и в прайсе на странице заказов. Воркер их не знает: он показывает то, что прислал сайт. Меняете прайс — redeploy воркера не нужен.

Воркер отвечает только за подписи формата, фона и способа связи. Их меняют, если переименовываете формат или добавляете новый способ связи.
