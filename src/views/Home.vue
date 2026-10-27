<script setup>
import {inject, nextTick, onMounted, onUnmounted, watch} from "vue";
import HomeHero from '../components/home/HomeHero.vue'
import HomeSocials from '../components/home/HomeSocials.vue'
import HomeGallery from '../components/home/HomeGallery.vue'
import HomeTelegram from '../components/home/HomeTelegram.vue'
import HomeMods from '../components/home/HomeMods.vue'
import {artsDesktop, artsMobile, mods, socials, support} from '../data/homeData'

const t = inject('t');
const isMobile = inject('isMobile')

// ═══ Точки навигации в мобильной версии ═══
let cleanupMobileSwiper = null;
let unlockScrollTimer = null;

function setupMobileSwiper() {
  const wrapper = document.querySelector('.mobile-swiper-wrapper');
  const indicator = document.querySelector('.swiper-dots-indicator');
  const sections = Array.from(document.querySelectorAll('.mobile-section'));
  const dots = Array.from(document.querySelectorAll('.swiper-dots .dot'));

  if (!wrapper || !indicator || sections.length === 0 || dots.length === 0) {
    return null;
  }

  // Один контроллер отменяет сразу все слушатели при размонтировании/resize
  const controller = new AbortController();
  const {signal} = controller;
  const dotsById = new Map(dots.map(dot => [dot.dataset.target, dot]));
  let isManualScroll = false;

  // Длинная секция (моды): снап нужен, чтобы в неё попасть,
  // но внутри неё он превращает прокрутку в рывки — там отключаем
  const tallSection = sections.find(section => section.classList.contains('big-section'));
  const SNAP_UNLOCK_OFFSET = 24;

  const updateSnapMode = () => {
    if (!tallSection) return;
    // Верх длинной секции относительно верха контейнера: как только он ушёл
    // выше на SNAP_UNLOCK_OFFSET, мы уже внутри — снап не нужен
    const wrapperTop = wrapper.getBoundingClientRect().top;
    const tallTop = tallSection.getBoundingClientRect().top - wrapperTop;
    wrapper.classList.toggle('is-free-scroll', tallTop < -SNAP_UNLOCK_OFFSET);
  };

  const moveIndicator = (dot) => {
    indicator.style.transform = `translateY(${dot.offsetTop}px)`;
  };

  const getActiveSectionId = () => {
    const viewportMiddle = wrapper.scrollTop + wrapper.clientHeight / 2;

    for (const section of sections) {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      if (viewportMiddle >= sectionTop && viewportMiddle < sectionBottom) {
        return section.id;
      }
    }

    // Если середина экрана ниже последней секции — считаем активной последнюю
    return sections[sections.length - 1].id;
  };

  const handleScroll = () => {
    if (isManualScroll) return;

    const activeDot = dotsById.get(getActiveSectionId());
    if (activeDot) moveIndicator(activeDot);
  };

  wrapper.addEventListener('scroll', handleScroll, {passive: true, signal});
  wrapper.addEventListener('scroll', updateSnapMode, {passive: true, signal});
  window.addEventListener('resize', handleScroll, {passive: true, signal});

  dots.forEach(dot => {
    dot.addEventListener('click', (event) => {
      event.preventDefault();

      const targetSection = document.getElementById(dot.dataset.target);
      if (!targetSection) return;

      moveIndicator(dot);
      isManualScroll = true;
      targetSection.scrollIntoView({behavior: 'smooth'});

      // Снимаем блокировку после завершения плавного скролла (~600 мс)
      clearTimeout(unlockScrollTimer);
      unlockScrollTimer = setTimeout(() => {
        isManualScroll = false;
        handleScroll();
      }, 600);
    }, {signal});
  });

  // Первичная синхронизация после отрисовки
  const rafId = requestAnimationFrame(() => {
    handleScroll();
    updateSnapMode();
  });

  return () => {
    cancelAnimationFrame(rafId);
    controller.abort();
    clearTimeout(unlockScrollTimer);
    wrapper.classList.remove('is-free-scroll');
  };
}

async function refreshMobileSwiper() {
  cleanupMobileSwiper?.();
  cleanupMobileSwiper = null;

  if (!isMobile.value) return;

  await nextTick();
  if (isMobile.value) {
    cleanupMobileSwiper = setupMobileSwiper();
  }
}

onMounted(async () => {
  await nextTick();
  refreshMobileSwiper();
});

// Перестраиваем навигацию при переходе между мобильной и десктопной вёрсткой
watch(isMobile, refreshMobileSwiper);

onUnmounted(() => {
  cleanupMobileSwiper?.();
  cleanupMobileSwiper = null;
  clearTimeout(unlockScrollTimer);
});
</script>

<template>
  <div>
    <!-- ═══ МОБИЛЬНАЯ ВЕРСИЯ: секции-слайды со scroll-snap ═══ -->
    <div v-if="isMobile" id="main-content" tabindex="-1" class="mobile-swiper-wrapper">
      <section id="mob-links" class="mobile-section">
        <div class="contglass p-4 mx-4 my-2">
          <HomeHero/>
          <HomeSocials :support="support" :socials="socials"/>
        </div>
      </section>

      <section id="mob-gallery" class="mobile-section">
        <div class="contglass p-3 m-4">
          <HomeGallery :arts="artsMobile"/>
        </div>
      </section>

      <section id="mob-tgslider" class="mobile-section">
        <div class="contglass fullsection p-4 m-4">
          <HomeTelegram/>
        </div>
      </section>

      <section id="mob-mods" class="mobile-section big-section">
        <div class="contglass p-4 m-4">
          <HomeMods :mods="mods"/>
        </div>
        <footer>
          <div class="container">
            <div class="small text">
            {{ t('footer') }}
            ·
            <RouterLink :to="{name: 'Privacy'}" class="footer-privacy-link">{{ t('footerPrivacy') }}</RouterLink>
          </div>
          </div>
        </footer>
      </section>
    </div>

    <!-- ═══ ДЕСКТОПНАЯ ВЕРСИЯ ═══ -->
    <main v-else id="main-content" tabindex="-1" class="container p-4 desktop-layout">
      <div class="page-scroller">
        <section id="links" class="contglass p-4 mt-4 mb-4">
          <HomeHero/>
          <HomeSocials :support="support" :socials="socials"/>
        </section>

        <section id="gallery" class="contglass p-4 mt-4 mb-4">
          <HomeGallery :arts="artsDesktop"/>
        </section>

        <section id="tgslider" class="contglass p-4 mt-4 mb-4">
          <HomeTelegram/>
        </section>

        <section id="mods" class="contglass p-4 mt-4">
          <HomeMods :mods="mods"/>
        </section>
      </div>
      <footer>
        <div class="container">
          <div class="small text">
            {{ t('footer') }}
            ·
            <RouterLink :to="{name: 'Privacy'}" class="footer-privacy-link">{{ t('footerPrivacy') }}</RouterLink>
          </div>
        </div>
      </footer>
    </main>

    <!-- ═══ ТОЧКИ НАВИГАЦИИ (только мобильная версия) ═══ -->
    <nav v-if="isMobile" class="swiper-dots">
      <div class="swiper-dots-indicator"></div>

      <a href="#mob-links" class="dot" data-target="mob-links"></a>
      <a href="#mob-gallery" class="dot" data-target="mob-gallery"></a>
      <a href="#mob-tgslider" class="dot" data-target="mob-tgslider"></a>
      <a href="#mob-mods" class="dot" data-target="mob-mods"></a>
    </nav>
  </div>
</template>

<style scoped>
/* ═══ Точки навигации (мобильные) ═══ */
.swiper-dots {
  position: fixed;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 999;
}

.swiper-dots .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: background 0.3s ease;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

.swiper-dots-indicator {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2AABEE;
  box-shadow: 0 0 10px rgba(42, 171, 238, 0.6);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
  left: 0;
  top: 0;
}

/* ═══ ДЕСКТОП ═══ */
.desktop-layout { /* Пустой, оставляем для совместимости */
}

/* ═══ МОБИЛЬНАЯ ВЕРСИЯ ═══ */
@media (max-width: 576px) {
  .mobile-swiper-wrapper {
    width: 100%;
    height: 100dvh;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .mobile-swiper-wrapper::-webkit-scrollbar {
    display: none;
  }

  .mobile-section {
    height: 100dvh;
    width: 100%;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
  }

  .big-section {
    height: auto;
    min-height: 100dvh !important;
    scroll-snap-align: start;
    /* Вход в секцию — как у остальных: один свайп = верх секции */
    scroll-snap-stop: always;
  }

  /* Внутри длинной секции — обычная прокрутка без снапа.
     Выше неё (на 24px) снап включается снова, чтобы свайп вверх
     возвращал к предыдущей секции. */
  .mobile-swiper-wrapper.is-free-scroll {
    scroll-snap-type: none;
  }
}

@media (max-width: 576px) {
  footer {
    padding: 1.5rem 0.5rem;
  }
}

.footer-privacy-link {
  color: #229ED9;
  text-decoration: none;
}

.footer-privacy-link:hover {
  text-decoration: underline;
}
</style>
