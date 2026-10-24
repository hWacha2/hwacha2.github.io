<template>
  <div
    class="modal fade"
    id="galleryModal"
    tabindex="-1"
    aria-hidden="true"
    :aria-label="t('galleryModalLabel')"
    role="dialog"
    ref="modalRoot"
  >
    <div class="modal-dialog modal-dialog-centered modal-fullscreen">
      <div class="modal-content gallery-modal-content">
        <div class="modal-header border-0 p-2">
          <button type="button" class="btn-close btn-close-white ms-auto mb-2" data-bs-dismiss="modal" :aria-label="t('closeModal')"></button>
        </div>
        <div class="modal-body p-0 d-flex justify-content-center align-items-center">
          <!-- Просто показываем картинку, если она есть -->
          <img
            v-if="currentImage"
            :src="currentImage"
            :alt="t('artAlt')"
            class="gallery-modal-img"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue'

const t = inject('t')

// Принимаем картинку от родителя (App.vue)
const props = defineProps({
  currentImage: {
    type: String,
    default: ''
  }
})

const modalRoot = ref(null)

// Bootstrap держит фокус только на границах, а если фокус ушёл на body — Escape перестаёт работать.
// Поэтому ведём ловушку фокуса и Escape сами, на уровне документа.
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

const handleKeydown = (event) => {
  const modal = modalRoot.value
  if (!modal || !modal.classList.contains('show')) return

  if (event.key === 'Escape') {
    const closeBtn = modal.querySelector('[data-bs-dismiss="modal"]')
    if (closeBtn) {
      event.preventDefault()
      closeBtn.click()
    }
    return
  }

  if (event.key !== 'Tab') return

  const items = [...modal.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null)
  if (!items.length) return

  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement

  if (!modal.contains(active)) {
    event.preventDefault()
    first.focus()
  } else if (event.shiftKey && (active === first || active === modal)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
/* ═══ Модалка галереи ═══ */
#galleryModal .modal-content {
  padding: 10px;
  background: rgba(20, 25, 35, 0.90) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 16px !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  height: min-content;
  width: min-content;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

#galleryModal .modal-dialog {
  justify-content: center;
  align-items: center;
}

#galleryModal .modal-body {
  padding: 0 !important;
  display: flex !important;
  justify-content: center;
  align-items: center;
  min-height: 20vh;
}

.gallery-modal-img {
  max-width: 90vw;
  max-height: 85vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  display: block;
  animation: modal-img-fade-in 0.3s ease-out;
}

@keyframes modal-img-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>