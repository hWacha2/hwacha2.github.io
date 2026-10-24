<script setup>
import {inject} from 'vue'
import TelegramVerticalList from '../TelegramVerticalList.vue'

const t = inject('t')
const isMobile = inject('isMobile')
</script>

<template>
  <div class="d-flex justify-content-between align-items-center">
    <component :is="isMobile ? 'h1' : 'h2'" :class="isMobile ? 'h3 mb-3' : 'h5 mb-3'">
      {{ t('lastWorks') }}
    </component>
  </div>
  <TelegramVerticalList/>
</template>

<style scoped>
@media (max-width: 576px) {
  h1.h3 {
    font-size: 1.1rem;
  }
}
</style>
