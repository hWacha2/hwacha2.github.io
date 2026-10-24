<script setup>
import { inject, defineProps, ref, onMounted } from 'vue'

const openModal = inject('openGalleryModal')
const t = inject('t')

const props = defineProps({
  thumb: { type: String, required: true },   // путь к превью WebP
  full: { type: String, required: true },    // путь к полной версии
  alt: { type: String, default: '' }         // описание для скринридеров
})

const isLoading = ref(true)
const aspectRatio = ref('4/3')

onMounted(() => {
  // Загружаем метадаты из превью (оно лёгкое, загрузится быстро)
  const tempImg = new Image()

  tempImg.onload = () => {
    if (tempImg.naturalWidth && tempImg.naturalHeight) {
      aspectRatio.value = `${tempImg.naturalWidth} / ${tempImg.naturalHeight}`
    }
    isLoading.value = false
  }

  tempImg.onerror = () => {
    isLoading.value = false
  }

  tempImg.src = props.thumb
})

const handleClick = () => {
  if (openModal) {
    openModal(props.full)
  }
}
</script>

<template>
  <div class="masonry-item">
    <div
      class="card-glass gallery-item p-1"
      style="overflow: hidden; cursor: pointer;"
      @click="handleClick"
      @keydown.enter.prevent="handleClick"
      @keydown.space.prevent="handleClick"
      role="button"
      tabindex="0"
      :aria-label="t('openImage')"
    >
      <!-- ═══ СКЕЛЕТОН С АВТО-ПРОПОРЦИЯМИ ═══ -->
      <div v-if="isLoading" class="skeleton-wrapper" :style="{ aspectRatio: aspectRatio }">
        <div class="skeleton-shimmer"></div>
      </div>

      <!-- ═══ ПРЕВЬЮ (WebP) ═══ -->
      <img
        v-else
        :src="thumb"
        :alt="alt || t('artAlt')"
        class="gallery-img"
        :style="{ aspectRatio: aspectRatio }"
        loading="lazy"
        decoding="async"
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

/* Клавиатурный фокус: виден, но не мешает мышке */
.gallery-item:focus-visible {
  outline: 2px solid #2AABEE;
  outline-offset: 3px;
}
</style>