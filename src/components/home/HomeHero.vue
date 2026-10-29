<script setup>
import {inject, onMounted, onUnmounted, ref} from 'vue'

const t = inject('t')
const isMobile = inject('isMobile')

const nickName = 'ishwacha'
const coverUrl = 'cover.webp'
const avatarUrl = 'ava.webp'

const coverLoaded = ref(false)
const avatarLoaded = ref(false)

let preloadLink = null

onMounted(() => {
  // Обложка — фон, поэтому её нужно загрузить вручную
  const img = new Image()
  img.src = coverUrl
  img.onload = () => (coverLoaded.value = true)
  img.onerror = () => (coverLoaded.value = true)
  if (img.complete && img.naturalWidth > 0) coverLoaded.value = true

  // Подсказываем браузеру про LCP-картинку, пока мы на главной
  preloadLink = document.createElement('link')
  preloadLink.rel = 'preload'
  preloadLink.as = 'image'
  preloadLink.href = `/${coverUrl}`
  preloadLink.fetchPriority = 'high'
  document.head.appendChild(preloadLink)
})

onUnmounted(() => {
  if (preloadLink) {
    document.head.removeChild(preloadLink)
    preloadLink = null
  }
})
</script>

<template>
  <div class="hero-cover-layout">
    <!-- плейсхолдер пока фон грузится -->
    <div v-if="!coverLoaded" class="hero-cover-skeleton"></div>
    <!-- фон -->
    <div class="hero-cover-bg" :style="{ backgroundImage: `url(${coverUrl})` }"
         :class="{ 'is-loaded': coverLoaded } "></div>
    <!-- аватар -->
    <div class="hero-content-overlay">
      <div :class="isMobile ? 'mb-1' : 'mt-2 mb-2'">
        <div class="avatar-holder" :class="{ 'is-loaded': avatarLoaded }">
          <img
              :src="avatarUrl"
              :alt="nickName"
              class="avatar"
              width="120"
              height="120"
              decoding="async"
              @load="avatarLoaded = true"
              @error="avatarLoaded = true"
          />
        </div>
      </div>
      <h1 class="h3 mb-2">{{ nickName }}</h1>
      <p class="mb-2" :class="{ 'fw-weight-bold': !isMobile }">{{ t('subtitle') }}</p>
    </div>
  </div>
</template>

<style scoped>
/* ═══ Аватар ═══ */
.avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(20, 20, 20, 0.9);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
}

.avatar-holder {
  position: relative;
  display: inline-block;
  overflow: hidden;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
}

.avatar-holder .avatar {
  opacity: 0;
  transition: opacity .4s ease;
  display: block;
}

.avatar-holder.is-loaded .avatar {
  opacity: 1;
}

.avatar-holder:not(.is-loaded)::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
  animation: avatar-shimmer 1.5s infinite;
}

@keyframes avatar-shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* ═══ Hero Cover ═══ */
.hero-cover-layout {
  position: relative;
  height: 350px;
  display: flex;
  padding: 0.5rem 0.5rem 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  /* Скругления рисует карточка-родитель: у неё overflow: hidden,
     поэтому обложка прилегает к её краям без собственного радиуса */
}

.hero-cover-skeleton {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
  z-index: -50;
  mask-image: linear-gradient(to bottom,
  rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 60%,
  rgba(0, 0, 0, 0) 90%, rgba(0, 0, 0, 0) 100%);
}

.hero-cover-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: cover-shimmer 1.6s infinite;
}

@keyframes cover-shimmer {
  100% {
    transform: translateX(100%);
  }
}

.hero-cover-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  border-radius: inherit;
  mask-image: linear-gradient(to bottom,
  rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 60%,
  rgba(0, 0, 0, 0) 90%, rgba(0, 0, 0, 0) 100%);
  z-index: -50;
  opacity: 0;
  transition: opacity .6s ease;
}

.hero-cover-bg.is-loaded {
  opacity: 1;
}

.hero-content-overlay {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.hero-cover-layout::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom,
  rgba(7, 16, 37, 0.1) 0%,
  rgba(7, 16, 37, 0.4) 70%,
  rgba(7, 16, 37, 0) 100%);
  z-index: 1;
  pointer-events: none;
  border-radius: inherit;
}

@media (max-width: 576px) {
  .hero-cover-layout {
    /* Высота подстраивается под экран: на низких телефонах обложка
       перестаёт съедать место, на высоких — растёт */
    height: clamp(216px, 36dvh, 330px);
    padding: 1rem;
  }

  .avatar {
    /* Аватар масштабируется от ширины экрана, а не фиксированные 70px */
    width: clamp(88px, 25vw, 116px);
    height: clamp(88px, 25vw, 116px);
  }

  h1.h3 {
    font-size: 1.1rem;
  }

  p {
    font-size: 0.9rem;
  }
}

/* Очень низкие экраны (например 320×568): обложка занимает меньше
   места, чтобы карточка целиком влезала в экран */
@media (max-width: 576px) and (max-height: 620px) {
  .hero-cover-layout {
    height: clamp(190px, 34dvh, 216px);
  }

  .avatar {
    width: clamp(80px, 25vw, 88px);
    height: clamp(80px, 25vw, 88px);
  }
}
</style>
