<script setup>
import {RouterView, useRoute} from 'vue-router'
import {inject, provide, ref, watch} from 'vue'
import Star from './components/StarCanvas.vue'
import NavigationMenu from './components/NavigationMenu.vue'
import GalleryModal from './components/GalleryModal.vue'

//Это для языка
const currentLang = inject('currentLang')
const t = inject('t');

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

/* На таче и в мобильной вёрстке hover-эффекты отключены (они вынесены
   в @media (hover: hover)), а нажатие показываем лёгким утапливанием */
@media (hover: none), (max-width: 768px) {
  a,
  button,
  [role="button"] {
    -webkit-tap-highlight-color: transparent;
    transition: transform .1s ease;
  }

  a:active,
  button:active,
  [role="button"]:active {
    transform: scale(0.96);
  }
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