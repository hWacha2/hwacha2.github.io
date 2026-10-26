<script setup>
import {RouterView, useRoute} from 'vue-router'
import {inject, provide, ref, watch} from 'vue'
import Star from './components/StarCanvas.vue'
import NavigationMenu from './components/NavigationMenu.vue'
import GalleryModal from './components/GalleryModal.vue'

//Это для языка
const currentLang = inject('currentLang')
const t = inject('t');
const toggleLang = inject('toggleLang')

//Смена оформления для моб устройств
const isMobile = inject('isMobile')

// Заголовок вкладки и lang у <html> следуют за роутом и языком
const route = useRoute()

watch([() => route.meta?.title, currentLang], () => {
  const key = route.meta?.title
  document.title = key ? `${t(key)} — ishwacha` : 'ishwacha'
  document.documentElement.lang = currentLang.value
}, {immediate: true})

//модалка для любой картинки
const currentImage = ref('');
const isModalOpen = ref(false)
const closeGalleryModal = () => {
  isModalOpen.value = false
  setTimeout(() => { if (!isModalOpen.value) currentImage.value = '' }, 300)
}
const openGalleryModal = async (imgSrc) => {
  currentImage.value = imgSrc

  const modalEl = document.getElementById('galleryModal')
  if (!modalEl) return

  // Запоминаем, откуда открыли: после закрытия вернём туда фокус
  const trigger = document.activeElement

  // Bootstrap нужен только здесь, поэтому грузим его отдельным чанком при первом клике
  const {Modal} = await import('bootstrap')

  const restoreFocus = () => {
    modalEl.removeEventListener('hidden.bs.modal', restoreFocus)
    if (trigger && trigger !== document.body && document.contains(trigger)) {
      trigger.focus()
    }
  }
  modalEl.addEventListener('hidden.bs.modal', restoreFocus)

  setTimeout(() => {
    Modal.getOrCreateInstance(modalEl).show()
  }, 50)
}
provide('openGalleryModal', openGalleryModal)

</script>

<template>
  <div class="app">
    <!-- Пропуск навигации для клавиатуры и скринридеров -->
    <a href="#main-content" class="skip-link">{{ t('skipToContent') }}</a>

    <!-- Глобальный фон -->
    <Star class="star-background"/>

    <!-- Глобальная кнопка языка (видна на всех страницах) -->
    <button class="lang-switcher" @click="toggleLang"
            :class="{ 'is-mobile': isMobile }"
            :title="currentLang === 'en' ? t('langSwitchToRu') : t('langSwitchToEn')"
            :aria-label="currentLang === 'en' ? t('langSwitchToRu') : t('langSwitchToEn')">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path
            d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7.02 7.02 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49a7 7 0 0 0 .656 2.5zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.02 7.02 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/>
      </svg>
      <span class="lang-label">{{ currentLang.toUpperCase() }}</span>
    </button>
    <NavigationMenu/>

    <!-- Сюда Vue Router будет подставлять Home.vue или Commissions.vue -->
    <RouterView v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path"/>
      </transition>
    </RouterView>

     <GalleryModal
      :is-open="isModalOpen"
      :current-image="currentImage"
      @close="closeGalleryModal"
    />


  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

/* ═══ Клавиатурная доступность ═══ */
.skip-link {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 2000;
  padding: .5rem 1rem;
  border-radius: 8px;
  background: #2AABEE;
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transform: translateY(-200%);
  transition: transform .15s ease;
}

.skip-link:focus {
  transform: translateY(0);
}

a:focus-visible,
button:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid #2AABEE;
  outline-offset: 2px;
}

/* Уважаем системную настройку «меньше движения» */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
}

:root {
  --bs-body-color: #e9eef8;
  --bs-heading-color: #e9eef8;
  --bs-body-bg: transparent;
  --muted: rgba(200, 200, 200, 1);
  --card-bg: #0f1724;
  --glass: rgba(255, 255, 255, 0.04);
}

html {
  font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background: #121821;
  color: #e9eef8;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;

}

.app {
  width: 100%;
  min-height: 100dvh;
  position: relative;
  font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
}

/* ═══ Анимация переходов между страницами (RouterView) ═══ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


/* ===== LANGUAGE SWITCHER (Глобальный элемент) ===== */
.lang-switcher {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 999;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.75rem;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(20, 20, 35, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #e9eef8;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.lang-switcher:hover {
  background: rgba(40, 40, 65, 0.95);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.5);
}

.lang-switcher:active {
  transform: scale(0.96);
}

.lang-label {
  letter-spacing: 1px;
}

.lang-switcher.is-mobile {
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.35rem 0.6rem;
  font-size: 0.75rem;
}


/* ═══ Стеклянные контейнеры ═══ */
.contglass {
  color: white;
  position: relative;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}


.contglass::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(20, 25, 35, 0.90);
  z-index: -200;
}

.contglass::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -201;
  pointer-events: none;
  background: linear-gradient(210deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));
}

/* ═══ Стеклянные контейнеры ═══ */
.contglass.fullsection {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.contglass.fullsection > *:last-child {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  /* 1. Полностью отключаем скролл у корневых элементов */
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden !important; /* Ключевой момент: body не скроллится */
  }

  /* 2. Заставляем скроллиться только элементы с этим классом */
  .page-scroller {
    height: 100dvh; /* 100% динамической высоты видимой области (учитывает адресную строку) */
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch; /* Плавный инерционный скролл на iOS */
    box-sizing: border-box;
  }

  /* Скрываем скроллбар для красоты (опционально) */
  .page-scroller::-webkit-scrollbar {
    display: none;
  }

  .page-scroller {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
}

/* ═══ Футер ═══ */
footer {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--muted);
}

.social-btn {
  display: inline-flex;
  align-items: center;
  text-align: center;
  gap: .6rem;
  padding: .5rem .9rem;
  border-radius: 30px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  min-width: 130px;
  transition: transform .16s ease, box-shadow .16s ease;
  cursor: pointer;
  user-select: none;
}



</style>