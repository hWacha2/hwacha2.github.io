<script setup>
import { inject, defineProps, ref, onMounted } from 'vue'
const openModal = inject('openGalleryModal')

const props = defineProps({
  img: { type: String, required: true }
})

const isLoading = ref(true)
const aspectRatio = ref('4/3') // Дефолт на случай, если метаданные не успели загрузиться

onMounted(() => {
  // Создаём невидимое изображение в памяти для чтения метаданных
  const tempImg = new Image()

  tempImg.onload = () => {
    // Как только браузер прочитал метаданные — вычисляем пропорции
    if (tempImg.naturalWidth && tempImg.naturalHeight) {
      aspectRatio.value = `${tempImg.naturalWidth} / ${tempImg.naturalHeight}`
    }
    // Картинка уже в кэше браузера, поэтому реальная <img> загрузится мгновенно
    isLoading.value = false
  }

  tempImg.onerror = () => {
    // Если картинка битая — убираем скелетон
    isLoading.value = false
  }

  tempImg.src = props.img
})

const handleClick = () => {
  // Просто вызываем функцию, не используя emit
  if (openModal) {
    openModal(props.img)
  }
}
</script>

<template>
  <div class="masonry-item">
    <div
      class="card-glass gallery-item p-2"
      style="overflow: hidden; cursor: pointer;"
       @click="handleClick"
      role="button"
      aria-label="Открыть изображение"
    >
      <!-- ═══ СКЕЛЕТОН С АВТО-ПРОПОРЦИЯМИ ═══ -->
      <div v-if="isLoading" class="skeleton-wrapper" :style="{ aspectRatio: aspectRatio }">
        <div class="skeleton-shimmer"></div>
      </div>

      <!-- ═══ КАРТИНКА ═══ -->
      <img
        v-else
        :src="img"
        alt="art"
        class="gallery-img"
        :style="{ aspectRatio: aspectRatio }"
      />
    </div>
  </div>
</template>

<style scoped>
.masonry-item {
  break-inside: avoid;
  margin-bottom: 1rem;
}

.card-glass {
  background: linear-gradient(210deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
}

/* ═══ Стили скелетона ═══ */
.skeleton-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-shimmer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.skeleton-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  animation: shimmer 1.8s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* ═══ Стили картинки ═══ */
.gallery-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  object-fit: cover;

  /* Плавное появление */
  opacity: 0;
  animation: fadeIn 0.4s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.gallery-item {
  cursor: pointer;
}

.gallery-item:hover .gallery-img {
  transform: scale(1.03);
  filter: brightness(1.02);
  transition: transform 0.18s ease, filter 0.18s ease;
}
</style>