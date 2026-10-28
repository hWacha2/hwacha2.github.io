<script setup>
import {computed, inject, nextTick, reactive, ref, watch} from 'vue'
import {FORMATS, FORMAT_IDS, PRICING, calculateEstimate, getAddons} from '../../data/pricing'
import {DISCORD_URL, TELEGRAM_URL} from '../../data/config'
import {useFormDraft} from '../../composables/useFormDraft'

const t = inject('t')

const emit = defineEmits(['estimate'])

// Политика открывается в новой вкладке, чтобы не потерять черновик
const privacyLink = `${import.meta.env.BASE_URL}privacy`

const MAX_CHARACTERS = 3
const MAX_DESCRIPTION = 1500
const MAX_REFS = 6

const defaults = {
  format: 'portrait',
  characters: 1,
  background: 'none',
  pose: false,
  prop: false,
  pet: false,
  description: '',
  refs: [{url: '', note: ''}],
  deadline: '',
  credit: ''
}

const {form, restored, clear: clearDraft} = useFormDraft('comm-draft-v2', defaults)

// Старый черновик мог хранить ссылки строкой — тогда остаётся одна пустая строка.
// Копируем массив, чтобы правки не меняли defaults и сброс работал предсказуемо.
form.refs = form.refs.map(ref => ({url: ref.url || '', note: ref.note || ''}))
if (!form.refs.length) form.refs.push({url: '', note: ''})

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

function addRef() {
  if (form.refs.length >= MAX_REFS) return
  form.refs.push({url: '', note: ''})
}

function removeRef(index) {
  form.refs.splice(index, 1)
  if (!form.refs.length) form.refs.push({url: '', note: ''})
}

// ─── Сборка брифа ───

const fieldErrors = reactive({description: ''})
const copied = ref(false)
const copyFailed = ref(false)
// Подтверждение после перехода в Telegram не скрываем по таймеру:
// человек возвращается из чата и должен видеть, что делать дальше.
const briefConfirmShown = ref(false)
const briefOpen = ref(false)
const briefBox = ref(null)
const descriptionEl = ref(null)

// Любая правка делает старый скопированный текст неактуальным
watch(form, () => {
  if (!briefConfirmShown.value) return
  briefConfirmShown.value = false
  copied.value = false
  copyFailed.value = false
}, {deep: true})

// Итог показываем в шапке модалки — он всегда на виду, а не в конце формы
watch(estimate, () => {
  emit('estimate', {
    total: estimate.value.total,
    base: estimate.value.base,
    parts: estimate.value.parts
  })
}, {immediate: true})

const briefText = computed(() => {
  const background = backgroundOptions.value.find(option => option.id === form.background)
  const lines = [
    t('formBriefGreeting'),
    '',
    `${t('formBriefHeader')}:`,
    '',
    `${t('formFormat')}: ${t(FORMATS[form.format].shortKey)}`,
    `${t('formCharacters')}: ${form.characters}`,
    `${t('formBackground')}: ${background ? t(background.labelKey) : form.background}`,
    `${t('formEstimate')}: $${estimate.value.total}`
  ]

  for (const addon of availableAddons.value) {
    if (form[addon.id]) lines.push(`${t(addon.labelKey)}: +$${addon.price}`)
  }

  lines.push('', `${t('formDescription')}:`, form.description.trim())

  const refs = form.refs.filter(ref => ref.url.trim())
  if (refs.length) {
    lines.push('', `${t('formRefs')}:`)
    for (const ref of refs) {
      const note = ref.note.trim()
      lines.push(note ? `- ${ref.url.trim()} — ${note}` : `- ${ref.url.trim()}`)
    }
  }

  if (form.deadline.trim()) lines.push('', `${t('formDeadline')}: ${form.deadline.trim()}`)
  if (form.credit.trim()) lines.push(`${t('formCredit')}: ${form.credit.trim()}`)

  return lines.join('\n')
})

// Telegram поддерживает подстановку текста в поле ввода: t.me/username?text=...
// Слишком длинный URL браузер или клиент могут обрезать — тогда остаётся буфер.
const TELEGRAM_URL_LIMIT = 3000
const telegramPayload = computed(() => `${TELEGRAM_URL}?text=${encodeURIComponent(briefText.value)}`)
const telegramPrefilled = computed(() => telegramPayload.value.length <= TELEGRAM_URL_LIMIT)
const telegramHref = computed(() => telegramPrefilled.value ? telegramPayload.value : TELEGRAM_URL)

function validate() {
  fieldErrors.description = form.description.trim().length < 10
      ? t('formDescriptionTooShort')
      : ''

  if (fieldErrors.description) {
    nextTick(() => {
      descriptionEl.value?.scrollIntoView({block: 'center', behavior: 'smooth'})
      descriptionEl.value?.focus()
    })
  }

  return !fieldErrors.description
}

async function copyBrief() {
  try {
    await navigator.clipboard.writeText(briefText.value)
    copied.value = true
    copyFailed.value = false
    briefConfirmShown.value = true
    // Кнопка возвращается к обычному виду, а подтверждение остаётся на месте
    window.setTimeout(() => {
      copied.value = false
    }, 4000)
  } catch {
    copyFailed.value = true
    briefConfirmShown.value = true
    briefOpen.value = true
    await nextTick()
    briefBox.value?.focus()
    briefBox.value?.select()
  }
}

function copyAndOpen(event) {
  if (!validate()) {
    event?.preventDefault()
    return
  }
  // Копируем в момент клика; переход по ссылке браузер откроет сам, без блокировки попапов
  copyBrief()
}

function clearDraftAndReset() {
  Object.assign(form, {...defaults, refs: defaults.refs.map(ref => ({...ref}))})
  clearDraft()
  fieldErrors.description = ''
  copyFailed.value = false
  copied.value = false
  briefConfirmShown.value = false
  briefOpen.value = false
}

</script>

<template>
  <div class="comm-form">
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
            ref="descriptionEl"
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
      <div class="comm-field">
        <span class="comm-label">{{ t('formRefs') }}</span>

        <div class="comm-refs">
          <div v-for="(ref, index) in form.refs" :key="index" class="comm-ref-row">
            <input
                v-model="ref.url"
                type="url"
                class="comm-input"
                maxlength="500"
                :placeholder="t('formRefsUrlPlaceholder')"
                :aria-label="t('formRefsUrl')"
                spellcheck="false"
            />
            <input
                v-model="ref.note"
                type="text"
                class="comm-input"
                maxlength="120"
                :placeholder="t('formRefsNotePlaceholder')"
                :aria-label="t('formRefsNote')"
            />
            <button
                type="button"
                class="comm-ref-remove"
                :aria-label="t('formRefsRemove')"
                :title="t('formRefsRemove')"
                @click="removeRef(index)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <button
            type="button"
            class="comm-ref-add"
            :disabled="form.refs.length >= MAX_REFS"
            @click="addRef"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          {{ t('formRefsAdd') }}
        </button>

        <p class="comm-callout">{{ t('formRefsFilesNote') }}</p>
      </div>

      <!-- ═══ Ник для кредитов ═══ -->
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

      <p class="comm-hint">{{ t('formBriefNote') }}</p>
      <p class="comm-consent">
        {{ t('formBriefConsent') }}
        <a :href="privacyLink" target="_blank" rel="noopener">{{ t('formConsentPrivacy') }}</a>.
      </p>

      <!-- ═══ Копирование и переход в Telegram ═══ -->
      <div class="comm-form-footer">
        <a
            :href="telegramHref"
            target="_blank"
            rel="noopener noreferrer"
            class="comm-submit"
            @click="copyAndOpen"
        >
          {{ copied
            ? t('formBriefCopied')
            : telegramPrefilled ? t('formBriefSubmit') : t('formBriefSubmitCopy') }}
        </a>
      </div>

      <div v-if="briefConfirmShown" class="comm-fallback" role="status">
        <p class="comm-label">
          {{ copyFailed
            ? t('formBriefCopyFailed')
            : telegramPrefilled ? t('formBriefCopiedHint') : t('formBriefNoPrefill') }}
        </p>
        <div class="comm-fallback-actions">
          <button type="button" class="comm-secondary" @click="copyBrief">
            {{ copied ? t('formCopyAgain') : t('formCopy') }}
          </button>
          <a :href="telegramHref" target="_blank" rel="noopener noreferrer" class="comm-secondary">
            {{ t('formOpenTelegram') }}
          </a>
          <a :href="DISCORD_URL" target="_blank" rel="noopener noreferrer" class="comm-secondary">
            {{ t('formOpenDiscord') }}
          </a>
        </div>
      </div>

      <details class="comm-preview" :open="briefOpen" @toggle="briefOpen = $event.target.open">
        <summary>{{ t('formBriefPreview') }}</summary>
        <textarea
            ref="briefBox"
            class="comm-input comm-textarea"
            rows="8"
            readonly
            :value="briefText"
            @focus="$event.target.select()"
        ></textarea>
      </details>
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

/* Ссылки на референсы: строка = ссылка + пояснение + удалить */
.comm-refs {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.comm-ref-row {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) auto;
  gap: .5rem;
  align-items: center;
}

.comm-ref-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, .14);
  background: rgba(255, 255, 255, .04);
  color: rgba(255, 255, 255, .55);
  transition: color .15s ease, border-color .15s ease, background .15s ease;
}

.comm-ref-remove:hover {
  color: #ff8a8a;
  border-color: rgba(255, 90, 90, .45);
  background: rgba(255, 90, 90, .1);
}

.comm-ref-add {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  align-self: flex-start;
  padding: .45rem .75rem;
  border-radius: 9px;
  border: 1px dashed rgba(42, 171, 238, .5);
  background: rgba(42, 171, 238, .07);
  color: #6cc8f5;
  font-size: .82rem;
  font-weight: 600;
  transition: background .15s ease, border-color .15s ease;
}

.comm-ref-add:hover:not(:disabled) {
  background: rgba(42, 171, 238, .14);
  border-color: #2AABEE;
}

.comm-ref-add:disabled {
  opacity: .45;
  cursor: default;
}

/* Заметка, которую не должны пропустить: файлы можно прислать лично */
.comm-callout {
  margin: 0;
  padding: .55rem .7rem;
  border-radius: 8px;
  border-left: 3px solid #2AABEE;
  background: rgba(42, 171, 238, .1);
  color: rgba(255, 255, 255, .8);
  font-size: .8rem;
  line-height: 1.45;
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

.comm-form-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: .75rem;
  border-top: 1px solid rgba(255, 255, 255, .1);
}

.comm-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: .7rem 1.4rem;
  border-radius: 10px;
  border: none;
  background: #2AABEE;
  color: #06121c;
  font-weight: 700;
  font-size: .95rem;
  text-decoration: none;
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

.comm-preview {
  font-size: .82rem;
  color: rgba(255, 255, 255, .7);
}

.comm-preview summary {
  cursor: pointer;
  user-select: none;
}

.comm-preview textarea {
  margin-top: .5rem;
  font-size: .82rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, .8);
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

@media (max-width: 640px) {
  .comm-field-grid {
    grid-template-columns: 1fr;
  }

  .comm-ref-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .comm-ref-row .comm-input:first-child {
    grid-column: 1 / -1;
  }

  .comm-submit {
    width: 100%;
  }
}
</style>
