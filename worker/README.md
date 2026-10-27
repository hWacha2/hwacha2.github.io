# Worker для заявок

Отдельный Cloudflare Worker `ishwacha-comm`, который принимает форму с сайта, присылает
заявку в Telegram и управляет слотами через кнопки и команды бота.
Существующий `social-proxy` **не трогаем** — он продолжает кормить ленту постов на главной.

```
Сайт (GitHub Pages) --POST /submit----> Worker --Bot API--> ваш Telegram
Сайт (GitHub Pages) --GET /api/slots--> Worker <--Webhook-- Telegram (кнопки и команды)
```

**Актуальный файл — `worker/commission-bot-new.js`.** Старый `worker/commission-bot.js`
оставлен только как история и не содержит управления слотами; не деплойте его.

## Маршруты

| Метод | Путь | Назначение |
|---|---|---|
| `POST` | `/submit` | заявка с сайта |
| `POST` | `/webhook` | обновления от Telegram (команды и кнопки) |
| `GET` | `/api/slots` | статус слотов для сайта, кэш 60 секунд |
| `GET` | `/health` | проверка настроек |

## 1. Создать бота

1. В Telegram написать [@BotFather](https://t.me/BotFather) → `/newbot` → имя и username.
2. Сохранить токен вида `123456789:AA...` — это `BOT_TOKEN`.
3. Написать своему боту любое сообщение (иначе он не сможет первым написать вам).
4. Открыть `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найти `"chat":{"id":...}` — это `CHAT_ID`.
   Для группы id отрицательный, вида `-1001234567890`; бота нужно добавить в группу.
5. Придумать длинную случайную строку (например, 40+ символов) — это `WEBHOOK_SECRET`.
   Telegram разрешает в `secret_token` только латиницу, цифры, `_` и `-`.
   Она не нужна боту, только воркеру и Telegram: по ней воркер отличает настоящие
   обновления от чужих запросов.

## 2. Создать KV namespace

1. Cloudflare Dashboard → **Storage & Databases → KV** → **Create namespace**.
2. Имя: `ishwacha-comm-kv` (любое, важно только привязать его к воркеру).
3. В настройках воркера → **Bindings** → **KV namespace**:
   Variable name — `COMM_KV`, выбрать созданный namespace.

В одном namespace лежат и счётчики слотов, и антиспам:

| Ключ | Что это | Срок жизни |
|---|---|---|
| `comm_total` | всего мест | бессрочно |
| `comm_booked` | забронировано | бессрочно |
| `rl:<ip>` | число заявок с IP | 1 час |
| `dup:<hash>` | защита от повторной отправки | 10 минут |
| `app:<id>` | состояние заявки для кнопок | 180 дней |

Без `COMM_KV` воркер не падает: `/api/slots` вернёт «закрыто», команды слотов
сообщат об отсутствии биндинга, но заявки продолжат приходить (без лимита и антидубля).

## 3. Развернуть Worker

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Worker**.
2. Имя: `ishwacha-comm` (URL получится `https://ishwacha-comm.<ваш-поддомен>.workers.dev`).
3. **Edit code** → удалить шаблон → вставить содержимое `worker/commission-bot-new.js` → **Deploy**.
4. **Settings → Variables and Secrets**:

| Имя | Тип | Значение |
|---|---|---|
| `BOT_TOKEN` | Secret | токен из шага 1 |
| `CHAT_ID` | Secret | id чата из шага 1 |
| `WEBHOOK_SECRET` | Secret | случайная строка из шага 1 |
| `ALLOWED_ORIGINS` | Variable | `https://hwacha2.github.io,http://localhost:5173,http://localhost:4173` |
| `TURNSTILE_SECRET` | Secret (необязательно) | секрет Turnstile |

5. **Bindings** → **KV namespace** → `COMM_KV` (шаг 2).
6. После добавления переменных и биндинга — **Deploy** ещё раз.

## 4. Подключить вебхук

Вебхук ставится один раз (или после смены секрета). Подставьте токен, домен воркера
и тот же `WEBHOOK_SECRET`:

```
https://api.telegram.org/bot<ТОКЕН>/setWebhook?url=https://ishwacha-comm.<ваш-поддомен>.workers.dev/webhook&secret_token=<WEBHOOK_SECRET>
```

Проверить:

```
https://api.telegram.org/bot<ТОКЕН>/getWebhookInfo
```

Должны совпасть `url`, `pending_update_count: 0` и отсутствие `last_error_message`.
Если секрет не задан в переменных воркера, `/webhook` отвечает **503** — это защита,
а не поломка: добавьте `WEBHOOK_SECRET` и вызовите `setWebhook` ещё раз.

Удалить вебхук: `https://api.telegram.org/bot<ТОКЕН>/deleteWebhook`.

## 5. Проверить

```
https://ishwacha-comm.<ваш-поддомен>.workers.dev/health
```

Ожидаемый ответ:

```json
{"ok":true,"configured":{"botToken":true,"chatId":true,"webhookSecret":true,"turnstile":true,"kv":true}}
```

Тестовая заявка из PowerShell:

> Если `TURNSTILE_SECRET` уже задан, запрос без токена получит `captcha_failed`.
> Для ручного теста либо временно уберите `TURNSTILE_SECRET`, либо отправляйте
> заявку из браузера — виджет сам подставит токен.

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

Ожидаемый ответ: `{"ok":true,"id":"A7F3C1"}`, в Telegram — карточка заявки с оценкой **$355**.

## Команды бота

Команды выполняются только из чата, указанного в `CHAT_ID`; из чужого чата молча игнорируются.
Писать боту нужно в личный чат (или в ту группу, чей id стоит в `CHAT_ID`).

| Команда | Что делает |
|---|---|
| `/status` или `/slots` | показать total / booked / free |
| `/open N` | добавить N мест к вместимости |
| `/close N` | убрать N мест, но не ниже уже забронированных |
| `/book [N]` | вручную забронировать N мест (по умолчанию 1) |
| `/unbook [N]` | снять N ручных броней |
| `/reset` | обнулить оба счётчика |

`booked` никогда не превышает `total`, `total` не опускается ниже `booked` — даже если
команды пришли в неудобном порядке.

## Кнопки в карточке заявки

```
Новая заявка      → [✅ Забронировать] [❌ Отклонить]
Забронирована     → [✅ Завершить заказ] [🔄 Отменить бронь]
Завершена / отменена / отклонена → кнопок нет
```

Состояние заявки (`new → booked → done` / `cancelled`, либо `new → declined`) хранится
в KV под ключом `app:<id>`. Повторное нажатие кнопки (двойной тап, повторная доставка
update от Telegram) ничего не меняет: воркер отвечает «Уже обработано».
Счётчики обновляются только после успешного редактирования сообщения — если Telegram
не принял `editMessageText`, слот не спишется.

## Заявка: что присылает фронтенд

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
| `credit` | строка ≤ 80 | ник для кредитов (необязательно) |
| `contactMethod` | `telegram` / `discord` / `email` / `twitter` | куда отвечать (старые `boosty` / `other` тоже принимаются) |
| `contact` | строка 2–200 | сам контакт — уже с префиксом (`https://t.me/nick`) |
| `lang` | `ru` / `en` | язык клиента |
| `estimateTotal` | целое 1–10000 | итоговая сумма |
| `estimateBreakdown` | строка ≤ 400 | расшифровка: «база $100 + ...» |
| `elapsedMs` | число | сколько клиент заполнял форму |
| `website` | строка | honeypot, всегда пустая |
| `turnstileToken` | строка | токен Turnstile, если капча включена |

Сумма приходит с клиента, но деньги автоматически не списываются — вы всё равно
подтверждаете цену вручную. Если кто-то пришлёт странную сумму, вы это увидите в карточке.

## Ответы `/submit`

| `error` | HTTP | Что значит |
|---|---|---|
| `validation` | 400 | некорректные поля, список в `fields` |
| `rate_limited` | 429 | больше **3** заявок в час с одного IP |
| `captcha_failed` | 400 | Turnstile не прошёл или токен выдан для чужого домена |
| `delivery_failed` | 502 | Telegram не принял сообщение (проверьте `BOT_TOKEN`/`CHAT_ID`) |
| `not_configured` | 500 | не заданы `BOT_TOKEN` или `CHAT_ID` |
| `origin_not_allowed` | 403 | запрос с чужого домена |

Успешный ответ — `{"ok":true,"id":"A7F3C1"}`; повторная точно такая же заявка в течение
10 минут — `{"ok":true,"duplicate":true}`. Метка дубля ставится только после успешной
доставки, поэтому сбой Telegram не блокирует повторную отправку.

Фронтенд на любой `error`, кроме `validation`, должен показать запасной вариант:
«скопировать заявку и написать в Boosty/Telegram».

## `/api/slots`

```json
{"total":3,"booked":1,"available":2,"isOpen":true}
```

Ответ кэшируется на 60 секунд (`Cache-Control: public, max-age=60`) и отдаёт CORS-заголовки
для доменов из `ALLOWED_ORIGINS`. Фронтенд опрашивает его при загрузке страницы заказов
и раз в 5 минут, пока страница открыта.

## Безопасность

- `/webhook` без правильного `X-Telegram-Bot-Api-Secret-Token` → 403.
- Команды и кнопки принимаются только из `CHAT_ID`.
- Домены для `/submit` ограничены `ALLOWED_ORIGINS`.
- Turnstile токен проверяется вместе с `hostname` из ответа Cloudflare.
- Лимит запросов и проверка дублей работают через `COMM_KV`; лимит расходуется
  только после успешной отправки заявки.
- HTML в заявке экранируется перед вставкой в сообщение Telegram.

## Обновление цен

Цены живут **только во фронтенде** — в `src/data/pricing.js` и в прайсе на странице
заказов. Воркер их не знает: он показывает то, что прислал сайт. Меняете прайс —
redeploy воркера не нужен.

Воркер отвечает только за подписи формата, фона и способа связи. Их меняют, если
переименовываете формат или добавляете новый способ связи.

## Если что-то не работает

| Симптом | Куда смотреть |
|---|---|
| сайт показывает «Закрыто», хотя места есть | `/api/slots`, биндинг `COMM_KV`, ключи `comm_total` / `comm_booked` |
| `/webhook` отвечает 503 | не задан `WEBHOOK_SECRET` |
| `/webhook` отвечает 403 | `secret_token` в `setWebhook` не совпадает с `WEBHOOK_SECRET` |
| команды бота молчат | `getWebhookInfo`, совпадает ли `CHAT_ID` с чатом, откуда пишете |
| кнопки не меняют счётчик | смотрите логи Workers → Logs, ищите `editMessageText failed` |
| заявки не приходят | `/health`, `BOT_TOKEN`, `CHAT_ID`, `delivery_failed` в логах |
| все видят `captcha_failed` | hostnames в настройках Turnstile и `ALLOWED_ORIGINS` |
