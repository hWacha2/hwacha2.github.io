<script setup>
import {inject} from 'vue'
import GalleryItem from '../GalleryItem.vue'

defineProps({
  arts: {type: Array, required: true}
})

const t = inject('t')
const isMobile = inject('isMobile')
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 :class="isMobile ? 'h3 mb-0' : 'h5 mb-0'">
      {{ t('galleryTitle') }}
    </h2>
    <small class="text-secondary" style="text-align: right; display: block;">{{ t('gallerySubtitle') }}</small>
  </div>

  <!-- Masonry галерея -->
  <div class="masonry-gallery">
    <GalleryItem
        v-for="art in arts"
        :key="art.full"
        :thumb="art.thumb"
        :full="art.full"
    />
  </div>
</template>

<style scoped>
/* ═══ Masonry галерея ═══ */
.masonry-gallery {
  column-count: 2;
  column-gap: 1rem;
}

@media (min-width: 576px) {
  .masonry-gallery {
    column-count: 3;
  }
}

@media (min-width: 768px) {
  .masonry-gallery {
    column-count: 4;
  }
}

@media (max-width: 576px) {
  h2.h3 {
    font-size: 1.1rem;
  }
}
</style>
