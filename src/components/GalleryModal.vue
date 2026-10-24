<template>
  <div
    class="modal fade"
    id="galleryModal"
    tabindex="-1"
    aria-hidden="true"
    ref="modalRoot"
  >
    <div class="modal-dialog modal-dialog-centered modal-fullscreen">
      <div class="modal-content gallery-modal-content">
        <div class="modal-header border-0 p-2">
          <button type="button" class="btn-close btn-close-white ms-auto mb-2" data-bs-dismiss="modal" aria-label="Закрыть"></button>
        </div>
        <div class="modal-body p-0 d-flex justify-content-center align-items-center">
          <!-- Просто показываем картинку, если она есть -->
          <img
            v-if="currentImage"
            :src="currentImage"
            alt="Gallery Art"
            class="gallery-modal-img"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Принимаем картинку от родителя (App.vue)
const props = defineProps({
  currentImage: {
    type: String,
    default: ''
  }
})
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