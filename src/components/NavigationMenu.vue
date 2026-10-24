<template>
  <div
      class="nav-menu-container"
      :class="{ 'is-open': isOpen, 'is-mobile': isMobile }"
      ref="menuContainer"
  > <!-- Круглая кнопка-гамбургер -->
    <button
        class="nav-menu-btn glass-btn"
        :class="{ 'is-mobile': isMobile }"
        @click="toggleMenu"
        aria-label="Открыть меню"
        :title="isOpen ? 'Закрыть меню' : 'Меню'"
    >
      <span class="hamburger-line line-1"></span>
      <span class="hamburger-line line-2"></span>
      <span class="hamburger-line line-3"></span>
    </button>

    <!-- Выпадающая панель (прямоугольник) -->
    <Transition name="menu-dropdown">
      <div v-if="isOpen" class="nav-menu-panel glass-panel">
        <RouterLink to="/" class="nav-menu-item" @click="closeMenu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>{{ t('menuHome') || 'Главная' }}</span>
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
          <span>{{ t('menuCommissions') || 'Заказать арт' }}</span>
        </RouterLink>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, inject} from 'vue'
import {RouterLink} from 'vue-router'

const t = inject('t')
const isMobile = inject('isMobile') // <-- Получаем глобальное значение

const isOpen = ref(false)
const menuContainer = ref(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

// Закрытие меню при клике вне его области
const handleClickOutside = (event) => {
  if (menuContainer.value && !menuContainer.value.contains(event.target)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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

.nav-menu-btn:hover {
  background: rgba(40, 40, 65, 0.95);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
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

.nav-menu-item:hover {
  background: rgba(34, 158, 217, 0.15); /* Легкий синий оттенок при наведении */
  color: #2AABEE;
  transform: translateX(4px);
}

.nav-menu-item svg {
  flex-shrink: 0;
  transition: stroke 0.2s ease;
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