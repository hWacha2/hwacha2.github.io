<template>
  <div
      class="nav-menu-container"
      :class="{ 'is-open': isOpen, 'is-mobile': isMobile }"
      ref="menuContainer"
  > <!-- Круглая кнопка-гамбургер -->
    <button
        ref="menuButton"
        class="nav-menu-btn glass-btn"
        :class="{ 'is-mobile': isMobile }"
        @click="toggleMenu"
        aria-haspopup="true"
        aria-controls="nav-menu-panel"
        :aria-expanded="isOpen"
        :aria-label="isOpen ? t('menuClose') : t('menuOpen')"
        :title="isOpen ? t('menuClose') : t('menuOpen')"
    >
      <span class="hamburger-line line-1"></span>
      <span class="hamburger-line line-2"></span>
      <span class="hamburger-line line-3"></span>
    </button>

    <!-- Выпадающая панель (прямоугольник) -->
    <Transition name="menu-dropdown">
      <div v-if="isOpen" id="nav-menu-panel" class="nav-menu-panel glass-panel">
        <RouterLink to="/" class="nav-menu-item" @click="closeMenu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>{{ t('menuHome') }}</span>
        </RouterLink>

        <div class="nav-menu-divider"></div>

        <RouterLink to="/commissions" class="nav-menu-item" @click="closeMenu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
            <path d="M2 2l7.586 7.586"></path>
            <circle cx="11" cy="11" r="2"></circle>
          </svg>
          <span>{{ t('menuCommissions') }}</span>
        </RouterLink>

        <div class="nav-menu-divider nav-menu-divider-strong"></div>

        <!-- Смена языка: редко нужна, поэтому живёт в меню отдельным блоком -->
        <p class="nav-menu-caption">{{ t('menuLangLabel') }}</p>
        <button
            type="button"
            class="nav-menu-item nav-menu-lang"
            @click="switchLang"
            :title="currentLang === 'en' ? t('langSwitchToRu') : t('langSwitchToEn')"
            :aria-label="currentLang === 'en' ? t('langSwitchToRu') : t('langSwitchToEn')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"
               aria-hidden="true">
            <path
                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7.02 7.02 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49a7 7 0 0 0 .656 2.5zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.02 7.02 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/>
          </svg>
          <span>{{ currentLang === 'en' ? t('menuLangRu') : t('menuLangEn') }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, inject} from 'vue'
import {RouterLink} from 'vue-router'

const t = inject('t')
const isMobile = inject('isMobile') // <-- Получаем глобальное значение
const currentLang = inject('currentLang')
const toggleLang = inject('toggleLang')

const isOpen = ref(false)
const menuContainer = ref(null)
const menuButton = ref(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

// Переключаем язык и сразу закрываем меню
const switchLang = () => {
  toggleLang()
  closeMenu()
}

// Закрытие меню при клике вне его области
const handleClickOutside = (event) => {
  if (menuContainer.value && !menuContainer.value.contains(event.target)) {
    closeMenu()
  }
}

// Escape закрывает меню и возвращает фокус на кнопку
const handleKeydown = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeMenu()
    menuButton.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>

.nav-menu-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

}

.nav-menu-btn {
  position: relative;
  width: 44px; /* Стандартный размер для десктопа */
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(20, 20, 35, 0.50);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  /* Добавляем плавность для изменения размера при ресайзе окна */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  z-index: 2;
}

/* === МОБИЛЬНАЯ АДАПТАЦИЯ КНОПКИ === */
.nav-menu-btn.is-mobile {
  width: 38px; /* Чуть меньше на телефоне */
  height: 38px;

}

.nav-menu-container.is-mobile {
  top: 0.5rem;
  right: 0.5rem;
  transition: top 0.28s cubic-bezier(0.4, 0, 0.2, 1), right 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Когда на /commissions видна мобильная плашка, кнопка меню
   встаёт по её центру и читается как часть плашки */
body.comm-bar-visible .nav-menu-container.is-mobile {
  top: 16px;
  right: 16px;
}

/* На планшетной ширине кнопка больше (44px) — центрируем так же */
@media (max-width: 768px) {
  body.comm-bar-visible .nav-menu-container {
    top: 13px;
  }

  body.comm-bar-visible .nav-menu-container.is-mobile {
    top: 16px;
    right: 16px;
  }
}

.nav-menu-btn.is-mobile .hamburger-line {
  width: 18px; /* Линии тоже чуть короче */
  height: 2px;
}

/* Анимация превращения в крестик (адаптирована под is-mobile) */
.nav-menu-container.is-open .line-1 {
  transform: translateY(6px) rotate(45deg);
}

.nav-menu-container.is-open .line-2 {
  opacity: 0;
  transform: scaleX(0);
}

.nav-menu-container.is-open .line-3 {
  transform: translateY(-6px) rotate(-45deg);
}

/* Адаптация панели для мобильных */
.nav-menu-panel.is-mobile {
  width: 180px; /* Чуть уже на телефоне */
}

.nav-menu-panel.is-mobile .nav-menu-item {
  padding: 10px 14px;
  font-size: 0.9rem;
}

@media (hover: hover) {
  .nav-menu-btn:hover {
    background: rgba(40, 40, 65, 0.95);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
}

.nav-menu-btn:active {
  transform: scale(0.95);
}

/* Линии гамбургера */
.hamburger-line {
  display: block;
  width: 20px;
  height: 2px;
  background-color: #e9eef8;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

/* Анимация превращения в крестик */
.nav-menu-container.is-open .line-1 {
  transform: translateY(7px) rotate(45deg);
}

.nav-menu-container.is-open .line-2 {
  opacity: 0;
  transform: scaleX(0);
}

.nav-menu-container.is-open .line-3 {
  transform: translateY(-7px) rotate(-45deg);
}

/* Выпадающая панель */
.nav-menu-panel {
  margin-top: 12px;
  width: 200px;
  background: rgba(15, 23, 36, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #e9eef8;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: 10px;
  transition: all 0.2s ease;
}

@media (hover: hover) {
  .nav-menu-item:hover {
    background: rgba(34, 158, 217, 0.15);
    /* Легкий синий оттенок при наведении */
    color: #2AABEE;
    transform: translateX(4px);
  }
}

.nav-menu-item svg {
  flex-shrink: 0;
  transition: stroke 0.2s ease;
}

/* Язык — это <button>, поэтому сбрасываем стили кнопки.
   Делаем пункт тише, чем навигацию: это утилита, а не вкладка. */
.nav-menu-lang {
  width: 100%;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.9rem;
  color: rgba(233, 238, 248, 0.72);
  text-align: left;
  cursor: pointer;
}

@media (hover: hover) {
  .nav-menu-lang:hover {
    background: rgba(34, 158, 217, 0.15);
    color: #2AABEE;
    transform: translateX(4px);
  }
}

/* Более заметный разделитель перед блоком языка */
.nav-menu-divider-strong {
  height: 1px;
  margin: 10px 4px;
  background: rgba(255, 255, 255, 0.22);
}

.nav-menu-caption {
  margin: 0;
  padding: 4px 16px 2px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(233, 238, 248, 0.5);
}

.nav-menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 4px 12px;
}

/* Анимация появления панели */
.menu-dropdown-enter-active,
.menu-dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-dropdown-enter-from,
.menu-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  transform-origin: top right;
}
</style>