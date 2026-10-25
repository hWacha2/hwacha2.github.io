<script setup>
import {inject, nextTick, onMounted, onUnmounted, ref} from 'vue'
import CommissionForm from './CommissionForm.vue'

const emit = defineEmits(['close'])
const t = inject('t')

const estimate = ref(null)

const dialog = ref(null)
const trigger = document.activeElement
let previousOverflow = ''
let previousPaddingRight = ''

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function focusableItems() {
    if (!dialog.value) return []
    return [...dialog.value.querySelectorAll(FOCUSABLE)]
        .filter(element => element.offsetParent !== null && !element.disabled)
}

function handleKeydown(event) {
    if (event.key === 'Escape') {
        event.preventDefault()
        emit('close')
        return
    }

    if (event.key !== 'Tab') return

    const items = focusableItems()
    if (!items.length) return

    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement

    if (!dialog.value.contains(active)) {
        event.preventDefault()
        first.focus()
    } else if (event.shiftKey && (active === first || active === dialog.value)) {
        event.preventDefault()
        last.focus()
    } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown)

    // Блокируем прокрутку страницы под модалкой, компенсируя ширину скроллбара
    previousOverflow = document.body.style.overflow
    previousPaddingRight = document.body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`

    nextTick(() => dialog.value?.focus())
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = previousOverflow
    document.body.style.paddingRight = previousPaddingRight

    if (trigger && trigger !== document.body && document.contains(trigger)) {
        trigger.focus()
    }
})
</script>

<template>
  <Teleport to="body">
    <div class="comm-modal-overlay" @mousedown.self="emit('close')">
      <div
          ref="dialog"
          class="comm-modal-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="comm-form-title"
          tabindex="-1"
      >
        <header class="comm-modal-head">
          <div>
            <h2 id="comm-form-title" class="comm-modal-title">{{ t('formTitle') }}</h2>
            <p class="comm-modal-sub">{{ t('formModalSubtitle') }}</p>
          </div>
          <button type="button" class="comm-modal-close" :aria-label="t('formClose')" @click="emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round">
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
        </header>

        <div v-if="estimate" class="comm-modal-estimate">
          <div class="comm-modal-estimate-main">
            <span class="comm-modal-estimate-label">{{ t('formEstimate') }}</span>
            <span class="comm-modal-estimate-value">${{ estimate.total }}</span>
            <span class="comm-modal-estimate-note">{{ t('formEstimateNote') }}</span>
          </div>
          <details class="comm-modal-estimate-details">
            <summary>{{ t('formEstimateDetails') }}</summary>
            <ul>
              <li>{{ t('formBase') }} — ${{ estimate.base }}</li>
              <li v-for="part in estimate.parts" :key="part.id">
                {{ part.label }}<template v-if="part.count > 1"> ×{{ part.count }}</template> — +${{ part.sum }}
              </li>
            </ul>
          </details>
        </div>

        <div class="comm-modal-body">
          <CommissionForm @estimate="estimate = $event"/>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.comm-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(4, 8, 14, .72);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  animation: comm-overlay-in .18s ease-out;
}

.comm-modal-dialog {
  display: flex;
  flex-direction: column;
  width: min(720px, 100%);
  max-height: min(90dvh, 940px);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, .12);
  background: linear-gradient(200deg, rgba(32, 42, 58, .98), rgba(16, 22, 32, .99));
  box-shadow: 0 30px 80px rgba(0, 0, 0, .55);
  color: #fff;
  overflow: hidden;
  animation: comm-dialog-in .2s ease-out;
}

.comm-modal-dialog:focus {
  outline: none;
}

.comm-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.25rem .9rem;
  border-bottom: 1px solid rgba(255, 255, 255, .08);
}

.comm-modal-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.comm-modal-sub {
  margin: .15rem 0 0;
  font-size: .8rem;
  color: rgba(255, 255, 255, .5);
}

.comm-modal-close {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, .14);
  background: rgba(255, 255, 255, .05);
  color: #fff;
}

.comm-modal-close:hover {
  border-color: rgba(42, 171, 238, .6);
}

/* Итог закреплён под шапкой: не уезжает при прокрутке формы */
.comm-modal-estimate {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .35rem 1rem;
  flex-wrap: wrap;
  padding: .65rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, .08);
  background: rgba(42, 171, 238, .1);
}

.comm-modal-estimate-main {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: .1rem .5rem;
  min-width: 0;
}

.comm-modal-estimate-label {
  font-size: .72rem;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: rgba(255, 255, 255, .6);
}

.comm-modal-estimate-value {
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1;
  color: #fff;
}

.comm-modal-estimate-note {
  font-size: .72rem;
  color: rgba(255, 255, 255, .45);
}

.comm-modal-estimate-details {
  font-size: .76rem;
  color: rgba(255, 255, 255, .65);
}

.comm-modal-estimate-details summary {
  cursor: pointer;
}

.comm-modal-estimate-details ul {
  margin: .35rem 0 0;
  padding-left: 1.1rem;
}

.comm-modal-body {
  padding: 1.1rem 1.25rem 1.4rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(42, 171, 238, .45) transparent;
}

/* Кастомный скроллбар под цвет акцента (Chrome/Edge/Safari) */
.comm-modal-body::-webkit-scrollbar {
  width: 10px;
}

.comm-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.comm-modal-body::-webkit-scrollbar-thumb {
  background: rgba(42, 171, 238, .35);
  border: 3px solid transparent;
  border-radius: 999px;
  background-clip: content-box;
}

.comm-modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(42, 171, 238, .6);
  border: 3px solid transparent;
  background-clip: content-box;
}

@keyframes comm-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes comm-dialog-in {
  from { opacity: 0; transform: translateY(12px) scale(.98); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 576px) {
  .comm-modal-overlay {
    padding: 0;
  }

  .comm-modal-dialog {
    width: 100%;
    max-height: 94dvh;
    border-radius: 18px;
    border-bottom: none;
  }

  .comm-modal-head {
    padding: .9rem 1rem .75rem;
  }

  .comm-modal-estimate {
    padding: .55rem 1rem;
  }

  .comm-modal-estimate-note {
    display: none;
  }

  .comm-modal-body {
    padding: .9rem 1rem 1.2rem;
  }
}
</style>
