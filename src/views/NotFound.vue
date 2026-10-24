<script setup>
import {inject} from 'vue'
import {RouterLink} from 'vue-router'

const t = inject('t')
</script>

<template>
  <div>
    <div class="page-scroller">
      <main id="main-content" tabindex="-1" class="container p-4 notfound-page">
        <div class="contglass p-4 p-md-5 text-center">
          <p class="notfound-code">404</p>
          <h1 class="h3 mb-3">{{ t('notFoundTitle') }}</h1>
          <p class="text-secondary mb-4">{{ t('notFoundText') }}</p>
          <RouterLink to="/" class="btn to-home-btn">{{ t('notFoundBack') }}</RouterLink>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.to-home-btn {
  display: inline-flex;
  align-items: center; /* Выравнивание по вертикали */
  justify-content: center;

  gap: .6rem;
  padding: .5rem .9rem;
  border-radius: 30px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  min-width: 190px;
  transition: transform .16s ease, box-shadow .16s ease;
  cursor: pointer;
  user-select: none;
  background: linear-gradient(90deg, #2289be, #1872ad);
}


.notfound-page {
  min-height: 80dvh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contglass {
  max-width: 560px;
  width: 100%;
}

.notfound-code {
  font-size: clamp(3rem, 12vw, 6rem);
  font-weight: 700;
  line-height: 1;
  margin: 0 0 1rem;
  color: #2AABEE;
  text-shadow: 0 6px 30px rgba(42, 171, 238, 0.35);
}
</style>
