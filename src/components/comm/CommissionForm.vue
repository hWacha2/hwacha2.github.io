<script setup>
import {computed, inject, onMounted, onUnmounted, reactive, ref, watch} from 'vue'
import {FORMATS, FORMAT_IDS, PRICING, calculateEstimate, getAddons} from '../../data/pricing'
import {BOOSTY_URL, COMMISSION_ENDPOINT, TELEGRAM_URL, TURNSTILE_SITE_KEY} from '../../data/config'
import {useFormDraft} from '../../composables/useFormDraft'

const t = inject('t')
const currentLang = inject('currentLang')

const emit = defineEmits(['estimate'])

// Юридические разделы открываем в новой вкладке, чтобы не потерять черновик
const consentLinks = {
  tos: `${import.meta.env.BASE_URL}commissions#tos`,
  privacy: `${import.meta.env.BASE_URL}privacy`
}

const MAX_CHARACTERS = 3
const MAX_DESCRIPTION = 1500

const defaults = {
  format: 'portrait',
  characters: 1,
  background: 'none',
  pose: false,
  prop: false,
  pet: false,
  description: '',
  refs: '',
  deadline: '',
  name: '',
  credit: '',
  contactMethod: 'email',
  contact: '',
  website: '' // honeypot
}

const {form, restored, clear: clearDraft} = useFormDraft('comm-draft-v2', defaults)

// Старый черновик мог сохранить способ связи, которого больше нет
if (!['telegram', 'discord', 'email', 'twitter', 'other'].includes(form.contactMethod)) {
  form.contactMethod = 'email'
  form.contact = ''
}

// ─── Надбавки текущего формата ───

const addonPrices = computed(() => Object.fromEntries(
    getAddons(form.format).map(addon => [addon.id, addon.price])
))

const availableAddons = computed(() =>
    getAddons(form.format).filter(addon => ['pose', 'prop', 'pet'].includes(addon.id))
)

const backgroundOptions = computed(() => [
  {id: 'none', labelKey: 'formBgNone', price: 0},
  {id: 'simple', labelKey: 'formBgSimple', price: addonPrices.value.simpleBg || 0},
  {id: 'detailed', labelKey: 'formBgDetailed', price: addonPrices.value.detailedBg || 0}
])

// В портрете нет позы и питомца — сбрасываем, чтобы в заявку не ушло лишнее
watch(() => form.format, () => {
  if (!('pose' in addonPrices.value)) form.pose = false
  if (!('pet' in addonPrices.value)) form.pet = false
  if (!('prop' in addonPrices.value)) form.prop = false
})

const estimate = computed(() => calculateEstimate(form, t))

function changeCharacters(delta) {
  form.characters = Math.min(MAX_CHARACTERS, Math.max(1, form.characters + delta))
}

const contactMethods = computed(() => [
  {id: 'discord', label: t('formContactDiscord'), prefix: '@', placeholder: 'username'},
  {id: 'email', label: t('formContactEmail'), prefix: '', placeholder: 'you@example.com'},
  {id: 'telegram', label: t('formContactTelegram'), prefix: 'https://t.me/', placeholder: 'username'},
  {id: 'twitter', label: t('formContactTwitter'), prefix: 'https://x.com/', placeholder: 'username'},
  {id: 'other', label: t('formContactOther')}
])

const contactMethod = computed(() =>
    contactMethods.value.find(method => method.id === form.contactMethod) || contactMethods.value[0]
)

const contactPrefix = computed(() => contactMethod.value?.prefix || '')
const contactPlaceholder = computed(() =>
    contactMethod.value?.placeholder || t('formContactPlaceholder')
)

// Собираем полную ссылку из префикса и того, что ввёл человек.
// Если он вставил готовый URL или уже поставил @ — не дублируем.
function resolveContact() {
  const raw = form.contact.trim()
  const prefix = contactPrefix.value
  if (!raw) return ''
  if (!prefix) return raw
  const value = raw.replace(/^@+/, '')
  if (/^https?:\/\//i.test(value)) return value
  return prefix + value
}

// ─── Состояние отправки ───


const openedAt = Date.now()
const status = ref('idle') // idle | sending | success
const successId = ref('')
const submitError = ref('')
const copied = ref(false)
const fieldErrors = reactive({description: '', contact: ''})
const fallbackBox = ref(null)

const showFallback = computed(() => {
  // Если капча сломалась при загрузке — показываем запасной вариант СРАЗУ
  if (turnstileState.value === 'failed') return true

  // Если произошла ошибка отправки, требующая ручного копирования
  if (submitError.value && ['formCaptchaUnavailable', 'formCaptchaPending', 'formErrorCaptcha', 'formErrorRate', 'formErrorNetwork'].includes(submitError.value)) {
    return true
  }

  return false
})

// Итог показываем в шапке модалки — он всегда на виду, а не в конце формы
watch([estimate, status], () => {
  emit('estimate', status.value === 'success' ? null : {
    total: estimate.value.total,
    base: estimate.value.base,
    parts: estimate.value.parts
  })
}, {immediate: true})

const errorText = computed(() => submitError.value ? t(submitError.value) : '')

function validate() {
  fieldErrors.description = form.description.trim().length < 10
      ? t('formDescriptionTooShort')
      : ''

  const contact = form.contact.trim()
  if (contact.length < 2) {
    fieldErrors.contact = t('formContactRequired')
  } else if (form.contactMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
    fieldErrors.contact = t('formContactInvalid')
  } else {
    fieldErrors.contact = ''
  }

  return !fieldErrors.description && !fieldErrors.contact
}

// ─── Turnstile ───

const turnstileEl = ref(null)
const turnstileToken = ref('')
const turnstileState = ref('loading') // loading | ready | failed
let widgetId = null
let turnstileReady = null


function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (turnstileReady) return turnstileReady

  turnstileReady = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.turnstile)
    script.onerror = () => reject(new Error('turnstile script failed'))
    document.head.appendChild(script)
  })

  return turnstileReady
}

onMounted(async () => {
  try {
    const turnstile = await loadTurnstile()
    widgetId = turnstile.render(turnstileEl.value, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'dark',
      language: currentLang.value === 'en' ? 'en' : 'ru',
      callback: token => {
        turnstileToken.value = token
        turnstileState.value = 'ready'
        if (submitError.value === 'formCaptchaPending') submitError.value = ''
      },
      'expired-callback': () => {
        turnstileToken.value = ''
      },
      'error-callback': () => {
        turnstileState.value = 'failed'
      }
    })
    turnstileState.value = 'ready'
  } catch {
    turnstileState.value = 'failed'
  }
})

onUnmounted(() => {
  try {
    if (widgetId !== null) window.turnstile?.remove(widgetId)
  } catch {
    // ignore
  }
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function ensureToken() {
  if (turnstileToken.value) return turnstileToken.value
  if (turnstileState.value === 'failed') return ''

  // Managed-виджет обычно выдаёт токен сам; если ещё не успел — просим и ждём
  try {
    window.turnstile?.execute(widgetId)
  } catch {
    // ignore
  }

  for (let i = 0; i < 24; i++) {
    await sleep(250)
    const token = turnstileToken.value || window.turnstile?.getResponse(widgetId) || ''
    if (token) {
      turnstileToken.value = token
      return token
    }
  }

  return ''
}

function resetTurnstile() {
  turnstileToken.value = ''
  try {
    if (widgetId !== null) window.turnstile?.reset(widgetId)
  } catch {
    // ignore
  }
}

// ─── Отправка ───

async function submit() {
  if (status.value === 'sending') return

  submitError.value = ''

  if (!validate()) {
    submitError.value = 'formErrorValidation'
    return
  }

  status.value = 'sending'

  try {
    const token = await ensureToken()

    if (!token) {
      status.value = 'idle'
      if (turnstileState.value === 'failed') {
        submitError.value = 'formCaptchaUnavailable'
        showFallback.value = true
      } else {
        // Виджет ждёт подтверждения «я не робот» — подсказываем и подводим к нему
        submitError.value = 'formCaptchaPending'
        turnstileEl.value?.scrollIntoView({block: 'center', behavior: 'smooth'})
      }
      return
    }

    const response = await fetch(COMMISSION_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        format: form.format,
        characters: form.characters,
        background: form.background,
        pose: form.pose,
        prop: form.prop,
        pet: form.pet,
        description: form.description.trim(),
        refs: form.refs.trim(),
        deadline: form.deadline.trim(),
        name: form.name.trim(),
        credit: form.credit.trim(),
        contactMethod: form.contactMethod,
        contact: resolveContact(),
        lang: currentLang.value,
        elapsedMs: Date.now() - openedAt,
        website: form.website,
        estimateTotal: estimate.value.total,
        estimateBreakdown: estimate.value.breakdown,
        turnstileToken: token
      })
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok && data.ok) {
      successId.value = data.id || ''
      clearDraft()
      status.value = 'success'
      return
    }

    status.value = 'idle'

    if (data.error === 'validation') {
      submitError.value = 'formErrorValidation'
    } else if (data.error === 'captcha_failed') {
      submitError.value = 'formErrorCaptcha'
      showFallback.value = true
      resetTurnstile()
    } else if (data.error === 'rate_limited') {
      submitError.value = 'formErrorRate'
      showFallback.value = true
    } else {
      submitError.value = 'formErrorNetwork'
      showFallback.value = true
    }
  } catch {
    status.value = 'idle'
    submitError.value = 'formErrorNetwork'
    showFallback.value = true
  }
}

// ─── Запасной вариант: скопировать заявку и написать напрямую ───
const contactLabel = computed(() =>
    contactMethods.value.find(method => method.id === form.contactMethod)?.label || form.contactMethod
)

const fallbackText = computed(() => {
  const background = backgroundOptions.value.find(option => option.id === form.background)
  const lines = [
    t('formFallbackHeader'),
    `${t('formFormat')}: ${t(FORMATS[form.format].shortKey)}`,
    `${t('formCharacters')}: ${form.characters}`,
    `${t('formBackground')}: ${background ? t(background.labelKey) : form.background}`,
    `${t('formEstimate')}: $${estimate.value.total}`
  ]

  for (const addon of availableAddons.value) {
    if (form[addon.id]) lines.push(`${t(addon.labelKey)}: +$${addon.price}`)
  }

  lines.push('', `${t('formDescription')}:`, form.description.trim())

  if (form.refs.trim()) lines.push('', `${t('formRefs')}: ${form.refs.trim()}`)
  if (form.deadline.trim()) lines.push(`${t('formDeadline')}: ${form.deadline.trim()}`)
  if (form.name.trim()) lines.push(`${t('formName')}: ${form.name.trim()}`)
  if (form.credit.trim()) lines.push(`${t('formCredit')}: ${form.credit.trim()}`)

  lines.push('', `${t('formContactMethod')}: ${contactLabel.value}`, `${t('formContact')}: ${resolveContact()}`)

  return lines.join('\n')
})

async function copyFallback() {
  try {
    await navigator.clipboard.writeText(fallbackText.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    fallbackBox.value?.focus()
    fallbackBox.value?.select()
  }
}

function clearDraftAndReset() {
  Object.assign(form, defaults)
  clearDraft()
  fieldErrors.description = ''
  fieldErrors.contact = ''
  submitError.value = ''
  showFallback.value = false
}
</script>

<template>
  <div class="comm-form">
    <!-- ═══ Успех ═══ -->
    <div v-if="status === 'success'" class="comm-form-success" role="status">
      <div class="comm-form-success-icon" aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h3 class="comm-form-success-title">{{ t('formSuccessTitle') }}</h3>
      <p v-if="successId" class="comm-form-success-id">
        {{ t('formSuccessId') }} <b>#{{ successId }}</b>
      </p>
      <p class="comm-hint">{{ t('formSuccessHint') }}</p>

    </div>

    <template v-else>
      <p class="comm-form-subtitle">{{ t('formSubtitle') }}</p>

      <div v-if="restored" class="comm-draft-note">
        <span>{{ t('formDraftRestored') }}</span>
        <button type="button" class="comm-link-btn" @click="clearDraftAndReset">
          {{ t('formDraftClear') }}
        </button>
      </div>

      <!-- ═══ Формат ═══ -->
      <div class="comm-field" role="group" :aria-label="t('formFormat')">
        <span class="comm-label">{{ t('formFormat') }}</span>
        <div class="comm-choice-row">
          <button
              v-for="formatId in FORMAT_IDS"
              :key="formatId"
              type="button"
              class="comm-choice"
              :class="{ 'is-selected': form.format === formatId }"
              :aria-pressed="form.format === formatId"
              @click="form.format = formatId"
          >
            {{ t(FORMATS[formatId].shortKey) }}
            <span class="comm-choice-price">${{ PRICING[formatId].base }}</span>
          </button>
        </div>
      </div>

      <!-- ═══ Персонажи и фон ═══ -->
      <div class="comm-field-grid">
        <div class="comm-field" role="group" :aria-label="t('formCharacters')">
          <span class="comm-label">{{ t('formCharacters') }}</span>
          <div class="comm-stepper">
            <button type="button" class="comm-stepper-btn" :disabled="form.characters <= 1"
                    :aria-label="t('formCharsDecrease')" @click="changeCharacters(-1)">−
            </button>
            <span class="comm-stepper-value">{{ form.characters }}</span>
            <button type="button" class="comm-stepper-btn" :disabled="form.characters >= MAX_CHARACTERS"
                    :aria-label="t('formCharsIncrease')" @click="changeCharacters(1)">+
            </button>
          </div>
          <span v-if="addonPrices.extraChar" class="comm-hint">
            {{ t('formExtraCharHint') }} +${{ addonPrices.extraChar }}
          </span>
        </div>

        <div class="comm-field" role="group" :aria-label="t('formBackground')">
          <span class="comm-label">{{ t('formBackground') }}</span>
          <div class="comm-choice-row comm-choice-row--wrap">
            <button
                v-for="option in backgroundOptions"
                :key="option.id"
                type="button"
                class="comm-choice comm-choice--small"
                :class="{ 'is-selected': form.background === option.id }"
                :aria-pressed="form.background === option.id"
                @click="form.background = option.id"
            >
              {{ t(option.labelKey) }}
              <span v-if="option.price" class="comm-choice-price">+${{ option.price }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ Дополнительно ═══ -->
      <div v-if="availableAddons.length" class="comm-field" role="group" :aria-label="t('formAddons')">
        <span class="comm-label">{{ t('formAddons') }}</span>
        <div class="comm-checkbox-row">
          <label v-for="addon in availableAddons" :key="addon.id" class="comm-check">
            <input v-model="form[addon.id]" type="checkbox"/>
            <span>{{ t(addon.labelKey) }}</span>
            <span class="comm-check-price">+${{ addon.price }}</span>
          </label>
        </div>
      </div>

      <!-- ═══ Срок ═══ -->
      <label class="comm-field">
        <span class="comm-label">{{ t('formDeadline') }}</span>
        <input
            v-model="form.deadline"
            type="text"
            class="comm-input"
            maxlength="120"
            :placeholder="t('formDeadlinePlaceholder')"
        />
      </label>

      <!-- ═══ Описание ═══ -->
      <label class="comm-field">
        <span class="comm-label">{{ t('formDescription') }} <span class="comm-req" aria-hidden="true">*</span></span>
        <textarea
            v-model="form.description"
            class="comm-input comm-textarea"
            rows="5"
            :maxlength="MAX_DESCRIPTION"
            :placeholder="t('formDescriptionPlaceholder')"
            :aria-invalid="Boolean(fieldErrors.description)"
        ></textarea>
        <span v-if="fieldErrors.description" class="comm-error">{{ fieldErrors.description }}</span>
        <span class="comm-hint comm-counter">{{ form.description.length }}/{{ MAX_DESCRIPTION }}</span>
      </label>

      <!-- ═══ Референсы ═══ -->
      <label class="comm-field">
        <span class="comm-label">{{ t('formRefs') }}</span>
        <input
            v-model="form.refs"
            type="text"
            class="comm-input"
            maxlength="800"
            :placeholder="t('formRefsPlaceholder')"
        />
        <span class="comm-hint">{{ t('formRefsHint') }}</span>
      </label>

      <!-- ═══ Имя ═══ -->
      <div class="comm-field-grid">
        <label class="comm-field">
          <span class="comm-label">{{ t('formName') }}</span>
          <input
              v-model="form.name"
              type="text"
              class="comm-input"
              maxlength="80"
              :placeholder="t('formNamePlaceholder')"
          />
        </label>

        <label class="comm-field">
          <span class="comm-label">{{ t('formCredit') }}</span>
          <input
              v-model="form.credit"
              type="text"
              class="comm-input"
              maxlength="80"
              :placeholder="t('formCreditPlaceholder')"
          />
          <span class="comm-hint">{{ t('formCreditHint') }}</span>
        </label>
      </div>

      <!-- ═══ Контакт ═══ -->
      <div class="comm-field-grid">
        <label class="comm-field">
          <span class="comm-label">{{ t('formContactMethod') }}</span>
          <select v-model="form.contactMethod" class="comm-input">
            <option v-for="method in contactMethods" :key="method.id" :value="method.id">
              {{ method.label }}
            </option>
          </select>
        </label>

        <label class="comm-field">
          <span class="comm-label">{{ t('formContact') }} <span class="comm-req" aria-hidden="true">*</span></span>
          <span class="comm-input comm-prefixed" :class="{ 'is-invalid': fieldErrors.contact }">
            <span v-if="contactPrefix" class="comm-prefix">{{ contactPrefix }}</span>
            <input
                v-model="form.contact"
                :type="form.contactMethod === 'email' ? 'email' : 'text'"
                class="comm-prefixed-input"
                maxlength="200"
                :placeholder="contactPlaceholder"
                :aria-invalid="Boolean(fieldErrors.contact)"
                autocomplete="off"
                spellcheck="false"
            />
          </span>
        </label>
      </div>
      <p v-if="fieldErrors.contact" class="comm-error">{{ fieldErrors.contact }}</p>
      <p class="comm-hint">{{ t('formPrivacyNote') }}</p>
      <p class="comm-consent">
        {{ t('formConsent') }}
        <a :href="consentLinks.tos" target="_blank" rel="noopener">{{ t('formConsentTos') }}</a>
        ·
        <a :href="consentLinks.privacy" target="_blank" rel="noopener">{{ t('formConsentPrivacy') }}</a>.
      </p>

      <!-- honeypot: люди его не видят, боты заполняют -->
      <div class="comm-honeypot" aria-hidden="true">
        <label>Website <input v-model="form.website" type="text" tabindex="-1" autocomplete="off"/></label>
      </div>

      <!-- ═══ Проверка ═══ -->
      <div ref="turnstileEl" class="comm-turnstile"></div>

      <!-- Сообщение об ошибке капчи -->
      <p v-if="turnstileState === 'failed'" class="comm-error comm-error--captcha">
        {{ t('formCaptchaUnavailable') }}
      </p>


      <!-- ═══ Отправка ═══ -->
      <div class="comm-form-footer">
        <button
            type="button"
            class="comm-submit"
            :disabled="status === 'sending' || turnstileState === 'failed'"
            @click="submit"
        >
          {{ status === 'sending' ? t('formSending') : t('formSubmit') }}
        </button>
      </div>

      <p v-if="errorText" class="comm-error comm-error--submit" role="alert">{{ errorText }}</p>

      <!-- ═══ Запасной вариант ═══ -->
      <div v-if="showFallback" class="comm-fallback">
        <p class="comm-label">{{ t('formFallbackText') }}</p>
        <div class="comm-fallback-actions">
          <button type="button" class="comm-secondary" @click="copyFallback">
            {{ copied ? t('formCopied') : t('formCopy') }}
          </button>
          <a :href="TELEGRAM_URL" target="_blank" rel="noopener noreferrer" class="comm-secondary">
            {{ t('formWriteTelegram') }}
          </a>
          <a :href="BOOSTY_URL" target="_blank" rel="noopener noreferrer" class="comm-secondary">
            {{ t('formWriteBoosty') }}
          </a>
        </div>
        <textarea
            ref="fallbackBox"
            class="comm-input comm-textarea"
            rows="6"
            readonly
            :value="fallbackText"
            @focus="$event.target.select()"
        ></textarea>
      </div>
    </template>
  </div>
</template>

<style scoped>
.comm-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comm-form-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, .62);
  font-size: .9rem;
}

.comm-field {
  display: flex;
  flex-direction: column;
  gap: .4rem;
  min-width: 0;
}

.comm-field-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
}

.comm-label {
  font-size: .85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, .86);
}

.comm-req {
  color: #2AABEE;
}

.comm-hint {
  font-size: .78rem;
  color: rgba(255, 255, 255, .5);
  line-height: 1.4;
}

.comm-consent {
  margin: 0;
  font-size: .78rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, .5);
}

.comm-consent a {
  color: #229ED9;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.comm-consent a:hover {
  color: #4fb8ea;
}

.comm-counter {
  align-self: flex-end;
}

.comm-input {
  width: 100%;
  padding: .6rem .75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, .14);
  background: rgba(255, 255, 255, .05);
  color: #fff;
  font: inherit;
  font-size: .9rem;
  transition: border-color .15s ease, background .15s ease;
}

.comm-input::placeholder {
  color: rgba(255, 255, 255, .35);
}

.comm-input:focus {
  outline: none;
  border-color: #2AABEE;
  background: rgba(255, 255, 255, .08);
}

.comm-textarea {
  resize: vertical;
  min-height: 110px;
}

/* Поле с несъёмным префиксом: https://t.me/ + ник */
.comm-prefixed {
  display: flex;
  align-items: center;
  padding-left: .75rem;
  cursor: text;
}

.comm-prefix {
  flex: 0 0 auto;
  color: rgba(255, 255, 255, .62);
  font-size: .9rem;
  white-space: nowrap;
  user-select: none;
}

.comm-prefixed-input {
  flex: 1 1 auto;
  min-width: 0;
  padding: .6rem .75rem .6rem 0;
  border: none;
  background: transparent;
  color: #fff;
  font: inherit;
  font-size: .9rem;
}

.comm-prefixed-input:focus {
  outline: none;
}

.comm-prefixed-input::placeholder {
  color: rgba(255, 255, 255, .35);
}

.comm-prefixed:focus-within {
  border-color: #2AABEE;
  background: rgba(255, 255, 255, .08);
}

.comm-prefixed.is-invalid {
  border-color: rgba(255, 90, 90, .6);
}

select.comm-input {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, rgba(255, 255, 255, .6) 50%),
  linear-gradient(135deg, rgba(255, 255, 255, .6) 50%, transparent 50%);
  background-position: calc(100% - 18px) calc(50% + 2px), calc(100% - 13px) calc(50% + 2px);
  background-size: 5px 5px;
  background-repeat: no-repeat;
}

select.comm-input option {
  background: #161d29;
  color: #fff;
}

.comm-choice-row {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
}

.comm-choice {
  flex: 1 1 0;
  min-width: 110px;
  display: flex;
  flex-direction: column;
  gap: .15rem;
  padding: .55rem .7rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, .14);
  background: rgba(255, 255, 255, .04);
  color: #fff;
  font-size: .88rem;
  font-weight: 600;
  text-align: left;
  transition: border-color .15s ease, background .15s ease;
}

.comm-choice:hover {
  border-color: rgba(42, 171, 238, .55);
}

.comm-choice.is-selected {
  border-color: #2AABEE;
  background: rgba(42, 171, 238, .16);
  box-shadow: 0 0 0 1px rgba(42, 171, 238, .35) inset;
}

.comm-choice--small {
  flex: 1 1 auto;
  align-items: flex-start;
}

.comm-choice-price {
  font-size: .78rem;
  font-weight: 500;
  color: rgba(255, 255, 255, .55);
}

.comm-stepper {
  display: inline-flex;
  align-items: center;
  gap: .75rem;
  align-self: flex-start;
  padding: .3rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, .14);
  background: rgba(255, 255, 255, .04);
}

.comm-stepper-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, .08);
  color: #fff;
  font-size: 1.1rem;
  line-height: 1;
}

.comm-stepper-btn:disabled {
  opacity: .35;
  cursor: default;
}

.comm-stepper-value {
  min-width: 1.4rem;
  text-align: center;
  font-weight: 600;
}

.comm-checkbox-row {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem .75rem;
}

.comm-check {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  padding: .45rem .7rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, .12);
  background: rgba(255, 255, 255, .03);
  font-size: .85rem;
  cursor: pointer;
}

.comm-check input {
  accent-color: #2AABEE;
  width: 16px;
  height: 16px;
}

.comm-check-price {
  color: rgba(255, 255, 255, .5);
  font-size: .78rem;
}

.comm-error {
  margin: 0;
  font-size: .82rem;
  color: #ff8a8a;
}

.comm-error--submit {
  padding: .6rem .75rem;
  border-radius: 10px;
  background: rgba(255, 90, 90, .1);
  border: 1px solid rgba(255, 90, 90, .3);
}

.comm-honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.comm-turnstile {
  min-height: 65px;
}

.comm-form-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: .75rem;
  border-top: 1px solid rgba(255, 255, 255, .1);
}

.comm-submit {
  padding: .7rem 1.4rem;
  border-radius: 10px;
  border: none;
  background: #2AABEE;
  color: #06121c;
  font-weight: 700;
  font-size: .95rem;
  white-space: nowrap;
  transition: background .15s ease, transform .1s ease;
}

.comm-submit:hover:not(:disabled) {
  background: #4bbcf5;
}

.comm-submit:disabled {
  opacity: .6;
  cursor: default;
}

.comm-secondary {
  padding: .5rem .9rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, .18);
  background: rgba(255, 255, 255, .05);
  color: #fff;
  font-size: .85rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.comm-secondary:hover {
  border-color: rgba(42, 171, 238, .6);
}

.comm-fallback {
  display: flex;
  flex-direction: column;
  gap: .6rem;
  padding: .9rem;
  border-radius: 12px;
  background: rgba(42, 171, 238, .08);
  border: 1px solid rgba(42, 171, 238, .28);
}

.comm-fallback-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}

.comm-draft-note {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .75rem;
  padding: .5rem .75rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, .06);
  font-size: .82rem;
  color: rgba(255, 255, 255, .75);
}

.comm-link-btn {
  border: none;
  background: none;
  color: #2AABEE;
  font-size: .82rem;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.comm-form-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: .6rem;
  padding: 2rem 1rem;
}

.comm-form-success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(79, 174, 78, .18);
  border: 1px solid rgba(79, 174, 78, .45);
  color: #7ddc7b;
}

.comm-form-success-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.comm-form-success-id {
  margin: 0;
  color: rgba(255, 255, 255, .7);
}

.comm-form-success a {
  margin-top: .5rem;
}

@media (max-width: 640px) {
  .comm-field-grid {
    grid-template-columns: 1fr;
  }

  .comm-submit {
    width: 100%;
  }
}
</style>
