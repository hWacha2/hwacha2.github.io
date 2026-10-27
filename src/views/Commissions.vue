<template>
  <div>
    <div class="page-scroller">
      <UnderConstructionOverlay v-model="showOverlay"/>
      <div class="container commissions-page" id="main-content" tabindex="-1">

        <!-- ═══ ШАПКА ═══ -->
        <header class="comm-header contglass">


          <div class="comm-status-badge" :class="slotsData.isOpen ? 'status-open' : 'status-closed'">
            <span class="status-dot"></span>

            <span v-if="slotsData.isOpen">
             {{ t('commStatusOpen') }} ({{ slotsData.booked }}/{{ slotsData.total }})
            </span>
            <span v-else>
              {{ slotsData.total === 0 ? t('commStatusClosedNoSlots') : t('commStatusClosedFull') }}
            </span>
          </div>

          <div class="ava-container">
            <div class="avatar-holder" :class="{ 'is-loaded': avatarLoaded} ">
              <img :src="avatarUrl" :alt="nickName" class="avatar" width="120" height="120" decoding="async"
                   @load="avatarLoaded = true" @error="avatarLoaded = true"/>
            </div>
          </div>
          <div class="h3 mb-2">{{ nickName }}</div>
          <h1 class="comm-title">{{ t('commTitle') }}</h1>
          <p class="comm-subtitle">{{ t('commSubtitle') }}</p>

          <!-- ═══ НАВИГАЦИЯ ПО СЕКЦИЯМ ═══ -->
          <nav class="comm-nav-row" :aria-label="t('commNavLabel')">
            <a
                v-for="link in sectionLinks"
                :key="link.id"
                :href="`#${link.id}`"
                class="social-btn btn-nav"
                @click="scrollToSection($event, link.id)"
            >
              {{ t(link.key) }}
            </a>
          </nav>


          <hr class="border-1 border-secondary my-3 "/>
          <p class="comm-price-update-date">{{ t('commPriceUpdateDate', {date: formatDate(PRICES_UPDATED_AT)}) }}</p>
        </header>

        <!-- ═══ ОБЕРТКА ДЛЯ ПРОКРУЧИВАЕМОГО КОНТЕНТА ═══ -->
        <div class="comm-content-wrapper contglass p-3">

          <!-- ═══ ЦЕНЫ И ФОРМАТЫ (Стиль Jaykart: Категория -> Примеры -> Цена) ═══ -->
          <section id="pricing" class="comm-section">
            <h2 class="comm-section-title">{{ t('commPricing') }}</h2>
            <div class="comm-pricing-categories">
              <template v-for="(cat, idx) in pricingCategories" :key="idx">
                <div class="comm-price-category-card">
                  <h3 class="comm-category-title">{{ cat.title }}</h3>

                  <div class="comm-category-examples">
                    <div
                        v-for="(imgObj, i) in cat.examples"
                        :key="i"
                        class="gallery-item"
                    >
                      <a href="#" class="thumbnail" @click.prevent="handleClick(imgObj.full)">
            <span class="frame">
              <img :src="imgObj.thumb" :alt="cat.title" loading="lazy" decoding="async" width="300" height="400"/>
            </span>
                      </a>
                    </div>
                  </div>

                  <p class="comm-category-desc">{{ cat.description }}</p>

                  <div class="comm-price-line">
                    <span class="comm-price-label">{{ cat.baseLabel }}</span>
                    <span class="comm-price-value">– ${{ cat.basePrice }}</span>
                  </div>

                  <div v-if="cat.addons.length" class="comm-addons">
                    <div class="comm-addons-title">{{ t('priceAddonsTitle') }}</div>
                    <ul class="comm-addons-list">
                      <li v-for="addon in cat.addons" :key="addon.label" class="comm-addon-row">
                        <span class="comm-addon-name">{{ addon.label }}</span>
                        <span class="comm-addon-price">+${{ addon.price }}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- разделитель после каждой категории, кроме последней -->
                <hr
                    v-if="idx < pricingCategories.length - 1"
                    class="border-1 border-secondary my-3"
                />
              </template>
            </div>
          </section>
          <section id="will-wont" class="comm-section">
            <h2 class="comm-section-title">{{ t('commWillWont') }}</h2>
            <div class="comm-grid-2">
              <div class="comm-card comm-card--do">
                <h3 class="comm-card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4fae4e" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  {{ t('commLoveDraw') }}
                </h3>
                <ul class="comm-list">
                  <li v-for="(item, i) in loveDraw" :key="i">{{ item }}</li>
                </ul>
              </div>
              <div class="comm-card comm-card--dont">
                <h3 class="comm-card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e03131" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {{ t('commDontDraw') }}
                </h3>
                <ul class="comm-list">
                  <li v-for="(item, i) in dontDraw" :key="i">{{ item }}</li>
                </ul>
              </div>
            </div>

          </section>


          <!-- ═══ КАК ЗАКАЗАТЬ ═══ -->
          <section id="how-to" class="comm-section ">
            <h2 class="comm-section-title">{{ t('commHowTo') }}</h2>
            <div class="comm-how-to">
              <ol class="comm-steps">
                <li>{{ t('commStep1') }}</li>
                <li>{{ t('commStep2') }}</li>
                <li>{{ t('commStep3') }}</li>
                <li>{{ t('commStep4') }}</li>
              </ol>
              <div class="comm-howto-actions">
                <button type="button" class="comm-order-btn"
                        :disabled="!slotsData.isOpen"
                        @click="isFormOpen = true"
                        :class="{ 'is-disabled': !slotsData.isOpen }"
                >
                  {{ t('formOpen') }}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </button>
                <a
                    :href="contactLink"
                    target="_blank"
                    rel="noopener"
                    class="social-btn btn-telegram comm-cta-btn comm-howto-alt"
                    :class="{ 'is-disabled': !slotsData.isOpen }"
                    :tabindex="slotsData.isOpen ? 0 : -1"
                    :aria-disabled="!slotsData.isOpen"
                >
                  {{ t('formOrTelegram') }}
                </a>
              </div>
            </div>
          </section>

          <!-- ═══ ВЫПОЛНЕННЫЕ КОМИШКИ ═══ -->
          <section id="completed" class="comm-section">
            <h2 class="comm-section-title">{{ t('commCompleted') }}</h2>
            <div class="comm-completed-grid">
              <div v-for="(work, idx) in completedWorks" :key="idx" class="comm-work-card">
                <div class="comm-work-img-wrapper">
                  <img :src="work.thumb" :alt="work.client" @click="handleClick(work.full)" style="cursor: pointer;"
                       loading="lazy" decoding="async" width="600" height="600"/>
                </div>
                <div class="comm-work-info">
                  <a class="comm-work-client" :href="work.clientUrl" target="_blank" rel="noopener">@{{
                      work.client
                    }}</a>
                  <div class="comm-work-desc">{{ t(work.desc) }}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- ═══  Terms of Service ═══ -->
          <section id="tos" class="comm-section">
            <h2 class="comm-section-title">{{ t('commTermsOfService') }}</h2>

            <div class="comm-tos">
              <section
                  v-for="(section, i) in tosSections"
                  :key="section.title"
                  class="comm-tos-section"
              >
                <h4 class="comm-tos-section-title">{{ section.title }}</h4>
                <ul class="comm-rules-list">
                  <li v-for="(rule, j) in section.items" :key="j">{{ rule }}</li>
                </ul>
              </section>
            </div>

            <p class="comm-tos-note">
              {{ t('tosPrivacyNote') }}
              <RouterLink :to="{name: 'Privacy'}" target="_blank" rel="noopener">{{ t('tosPrivacyLink') }}</RouterLink>.
            </p>
          </section>

        </div> <!-- Конец comm-content-wrapper -->

      </div>
      <footer>
        <div class="container">
          <div class="small text">
            {{ t('footer') }}
            ·
            <RouterLink :to="{name: 'Privacy'}" class="comm-footer-link">{{ t('footerPrivacy') }}</RouterLink>
          </div>
        </div>
      </footer>
    </div>


    <CommissionModal v-if="isFormOpen" @close="isFormOpen = false"/>
  </div>
</template>

<script setup>
import {onMounted, onUnmounted, computed, inject, ref} from 'vue';

const t = inject('t');
const formatDate = inject('formatDate');
const nickName = 'ishwacha';
const avatarUrl = 'ava.webp';
const avatarLoaded = ref(false);
import UnderConstructionOverlay from '../components/UnderConstructionOverlay.vue'
import CommissionModal from '../components/comm/CommissionModal.vue'
import {FORMATS, FORMAT_IDS, PRICING} from '../data/pricing'
import {PRICES_UPDATED_AT} from '../data/dates'
import {TELEGRAM_URL} from '../data/config'

const contactLink = TELEGRAM_URL;

const showOverlay = ref(false)

const isFormOpen = ref(false)

const slotsData = ref({total: 0, booked: 0, available: 0, isOpen: false});
let slotsTimer = null;

const fetchSlotsStatus = async () => {
  try {
    // Замените на реальный URL вашего воркера
    const response = await fetch('https://ishwacha-comm.gbaranovskaa76.workers.dev/api/slots');
    const data = await response.json();
    slotsData.value = data;
  } catch (e) {
    console.error('Failed to fetch slots', e);
  }
};
onMounted(() => {
  fetchSlotsStatus();
  // Обновляем статус слотов, пока страница открыта
  slotsTimer = setInterval(fetchSlotsStatus, 300000);

  // Прямая ссылка вида /commissions#tos (например, из формы в новой вкладке)
  const id = window.location.hash.slice(1);
  if (id) {
    setTimeout(() => scrollToSection(null, id, {smooth: false, focus: false}), 60);
  }
});

onUnmounted(() => {
  clearInterval(slotsTimer);
});

// ─── Быстрая навигация по секциям ───
const sectionLinks = [
  {id: 'pricing', key: 'navPricing'},
  {id: 'will-wont', key: 'navWillWont'},
  {id: 'how-to', key: 'navHowTo'},
  {id: 'completed', key: 'navCompleted'},
  {id: 'tos', key: 'navTos'}
]

// На мобилке прокручивается .page-scroller, на ПК — окно
function getScrollParent(element) {
  let node = element.parentElement

  while (node && node !== document.body) {
    const style = getComputedStyle(node)
    const scrollable = /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight
    if (scrollable) return node
    node = node.parentElement
  }

  return null
}

// Верх секции ставим на треть экрана от верха
// event === null — вызов не из клика (например, переход по ссылке с хэшем)
function scrollToSection(event, id, options = {}) {
  const target = document.getElementById(id)
  if (!target) return

  event?.preventDefault()

  const {smooth = true, focus = true} = options
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const behavior = smooth && !reduceMotion ? 'smooth' : 'auto'
  const scroller = getScrollParent(target)

  if (scroller) {
    const scrollerTop = scroller.getBoundingClientRect().top
    const targetTop = target.getBoundingClientRect().top - scrollerTop + scroller.scrollTop
    const offset = Math.max(0, targetTop - scroller.clientHeight / 4)
    scroller.scrollTo({top: offset, behavior})
  } else {
    const targetTop = target.getBoundingClientRect().top + window.scrollY
    const offset = Math.max(0, targetTop - window.innerHeight / 4)
    window.scrollTo({top: offset, behavior})
  }

  // Адрес меняем без второго прыжка
  history.replaceState(history.state, '', `#${id}`)

  // Фокус на заголовок секции: полезно для клавиатуры и скринридеров
  if (focus) {
    const heading = target.querySelector('h2')
    if (heading) {
      heading.setAttribute('tabindex', '-1')
      heading.focus({preventScroll: true})
    }
  }
}

const openGalleryModal = inject('openGalleryModal');

const handleClick = (imgSrc) => {
  if (openGalleryModal) {
    openGalleryModal(imgSrc);
  }
}

// ═══ Превью и полные версии работ ═══
const thumbModules = import.meta.glob('/public/commgallery/**/thumbs/*.webp', {
  eager: true,
  query: '?url',
  import: 'default'
});
const fullModules = import.meta.glob('/public/commgallery/*/*.webp', {eager: true, query: '?url', import: 'default'});

const matchFullImage = (thumbPath) => {
  const expectedFullPath = thumbPath.replace('/thumbs/', '/');
  return fullModules[expectedFullPath] || null;
};

const getExamples = (folder) => Object.keys(thumbModules)
    .filter(path => path.includes(`/${folder}/`))
    .map(thumbPath => ({
      thumb: thumbModules[thumbPath],
      full: matchFullImage(thumbPath) || thumbModules[thumbPath]
    }));


const examples = {
  portrets: getExamples('portrets'),
  halfbody: getExamples('halfbody'),
  fullbody: getExamples('fullbody')
};

// ═══ Тексты — computed, чтобы смена языка сразу обновляла страницу ═══
const loveDraw = computed(() => [
  t('commLove1'),
  t('commLove2'),
  t('commLove3'),
  t('commLove4')
]);

const dontDraw = computed(() => [
  t('commDont1'),
  t('commDont2'),
  t('commDont3'),
  t('commDont4')
]);

// ═══ Цены ═══
// Цены живут в src/data/pricing.js — оттуда же считается форма заявки.
const createCategory = (formatId) => {
  const pricing = PRICING[formatId];
  const meta = FORMATS[formatId];

  return {
    title: t(meta.nameKey),
    description: t(meta.descKey),
    baseLabel: t('priceBaseOneChar'),
    basePrice: pricing.base,
    examples: examples[meta.examples],
    addons: pricing.addons.map(addon => ({
      label: t(addon.labelKey),
      price: addon.price
    }))
  };
};

const pricingCategories = computed(() => FORMAT_IDS.map(createCategory));

// ═══ Условия использования: структура → тексты из переводов ═══
const TOS_STRUCTURE = [
  {
    title: 'tosPaymentTitle',
    items: ['tosPayment1', 'tosPayment2', 'tosPayment3']
  },
  {
    title: 'tosDeadlineTitle',
    items: ['tosDeadline1', 'tosDeadline2', 'tosDeadline3']
  },
  {
    title: 'tosRevisionsTitle',
    items: ['tosRevisions1', 'tosRevisions2', 'tosRevisions3']
  },
  {
    title: 'tosRightsTitle',
    items: ['tosRights1', 'tosRights2', 'tosRights3', 'tosRights4', 'tosRights5']
  },
  {
    title: 'tosCancelTitle',
    items: ['tosCancel1', 'tosCancel2', 'tosCancel3']
  },

];

const tosSections = computed(() => TOS_STRUCTURE.map(section => ({
  title: t(section.title),
  items: section.items.map(key => t(key))
})));


const completedWorks = ref([
  {
    thumb: 'commishionsart/thumbs/commish1.webp',
    full: 'commishionsart/commish1.webp',
    client: 'theamberstar.space (bsky)',
    clientUrl: "https://bsky.app/profile/theamberstar.space",
    desc: 'commCompletedDesc1'
  },

]);
</script>
<style scoped>
/* ═══ ОСНОВНОЙ КОНТЕЙНЕР ═══ */
.commissions-page {
  margin: 0 auto;
  padding: 20px 12px 20px;
  color: #fff;
  font-family: inherit;
}

/* ═══ ШАПКА ═══ */
.comm-header {
  text-align: center;
  align-items: center;
  margin-bottom: 40px;
  padding: 32px 20px;
}

.comm-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.comm-status-badge.status-open {
  background: rgba(79, 174, 78, 0.15);
  color: #4fae4e;
  border: 1px solid rgba(79, 174, 78, 0.3);
}

.comm-status-badge.status-closed {
  background: rgba(224, 49, 49, 0.15);
  color: #e03131;
  border: 1px solid rgba(224, 49, 49, 0.3);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.comm-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #fff;
}

.comm-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24px;
  line-height: 1.5;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.comm-price-update-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
  max-width: 600px;

}

.comm-cta-btn {
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
}

.comm-cta-btn--large {
  margin-top: 24px;
  padding: 16px 40px;
  font-size: 18px;
}


/* ═══ СЕКЦИИ ═══ */
.comm-section {
  margin-bottom: 48px;
}


.comm-section-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}


/* ═══ DO'S AND DON'TS ═══ */
.comm-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}


.comm-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #fff;
}

.comm-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comm-list li {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  padding-left: 20px;
  position: relative;
  line-height: 1.4;
}

.comm-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #229ED9;
  font-weight: bold;
}

/* ═══ ЦЕНЫ ═══ */


.comm-price-header h3 {
  font-size: 18px;
  margin: 0 0 8px;
  color: #229ED9;
}


/* ═══ НОВЫЕ СТИЛИ ДЛЯ ЦЕН (Стиль Jaykart) ═══ */
.comm-pricing-categories {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.comm-price-category-card {
  text-align: center;

}


.comm-category-title {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 8px;
}

.comm-category-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
  line-height: 1.5;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.comm-price-line {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.3px;
  margin-bottom: 18px;
}

.comm-price-value {
  color: #229ED9;
  font-weight: 700;
}

.comm-addons {
  max-width: 420px;
  margin: 0 auto;
  text-align: left;
}

.comm-addons-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}

.comm-addons-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.comm-addon-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
  font-size: 14px;
  line-height: 1.4;
}

.comm-addon-row:last-child {
  border-bottom: none;
}

.comm-addon-name {
  color: rgba(255, 255, 255, 0.8);
}

.comm-addon-price {
  margin-left: auto;
  flex-shrink: 0;
  color: #fff;
  font-weight: 400;
  white-space: nowrap;
}


.comm-category-examples {
  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 200px));
  justify-content: center; /* два элемента будут по центру, а не слева */
  gap: 12px;
  margin-bottom: 24px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.gallery-item {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4; /* высота = ширина * 4/3, потолок задан шириной */
  min-width: 0;
}

.thumbnail {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  background: #0e1621;
}

.frame {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}

.frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.4s ease;
}

.thumbnail:hover {
  border-color: rgba(34, 158, 217, 0.6);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.thumbnail:hover .frame img {
  transform: scale(1.05);
}

@media (max-width: 480px) {
  .comm-category-examples {
    /* 100px вместо 80px — иначе превью совсем крошечные */
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 120px), 1fr));
    gap: 8px;

  }

}


/* ═══ НОВЫЕ СТИЛИ ДЛЯ ПРАВИЛ ═══ */
.comm-rules-card {
  background: rgba(34, 158, 217, 0.05);
  border: 1px solid rgba(34, 158, 217, 0.15);
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
}

.comm-rules-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #229ED9;
}

.comm-tos {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.comm-tos-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 10px;
}

.comm-tos-section-title::before {
  content: '';
  display: block;
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: #229ED9;
}

.comm-rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comm-rules-list li {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  padding-left: 24px;
  position: relative;
  line-height: 1.5;
}

.comm-rules-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: #229ED9;
  font-weight: bold;
  font-size: 20px;
  line-height: 1.1;
}

/* ═══ Политика конфиденциальности ═══ */
.comm-tos-note {
  margin: 20px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
}

.comm-tos-note a,
.comm-footer-link {
  color: #229ED9;
  text-decoration: none;
}

.comm-tos-note a:hover,
.comm-footer-link:hover {
  text-decoration: underline;
}

/* Адаптация для мобильных */
@media (max-width: 480px) {

  .comm-section-title {
    font-size: 24px;

  }

  .comm-category-title {
    font-size: 22px;
  }

  .comm-price-label {
    font-size: 20px;
  }

  .comm-price-line {
    font-size: 22px;
  }

  .comm-addon-row {
    font-size: 13px;
  }
}

.comm-gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.comm-gallery-item:hover img {
  transform: scale(1.05);
}


.comm-gallery-overlay span {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

/* ═══ ВЫПОЛНЕННЫЕ РАБОТЫ ═══ */
.comm-completed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.comm-work-card {
  background: #182533;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.comm-work-img-wrapper {

  background: #0e1621;
}

.comm-work-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comm-work-info {
  padding: 16px;
}

.comm-work-client {
  font-size: 14px;
  font-weight: 700;
  color: #229ED9;
  margin-bottom: 6px;
}

.comm-work-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

.comm-card {
  background: rgba(32, 42, 58, 0.6);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);

}

.comm-card--do {
  border-left: 3px solid #4fae4e;
}

.comm-card--dont {
  border-left: 3px solid #e03131;
}


/* ═══ КАК ЗАКАЗАТЬ ═══ */
.comm-how-to {
  background: linear-gradient(200deg, rgba(32, 42, 58, .80), rgba(32, 42, 58, .4));
  border-radius: 16px;
  padding: 28px;
  /*border: 1px solid rgba(34, 158, 217, 0.15);*/
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.comm-steps {
  text-align: left;
  max-width: 600px;
  margin: 0 auto 24px;
  padding-left: 20px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
}

.comm-steps li {
  margin-bottom: 12px;
  font-size: 15px;
}

.comm-steps li::marker {
  color: #229ED9;
  font-weight: bold;
}

.comm-howto-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.comm-order-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 30px;
  border: none;
  border-radius: 50rem;
  background: linear-gradient(135deg, #2AABEE, #229ED9);
  color: #06121c;
  font-size: 17px;
  font-weight: 700;
  box-shadow: 0 5px 10px rgba(42, 171, 238, 0.28);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.comm-order-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 34px rgba(42, 171, 238, 0.4);
}

.comm-howto-alt {
  padding: 11px 20px;
  font-size: 14px;
}

/* ═══ АДАПТИВНОСТЬ ═══ */
@media (max-width: 768px) {
  .comm-grid-2 {
    grid-template-columns: 1fr;
  }

  .comm-title {
    font-size: 24px;
  }


}

@media (max-width: 480px) {


  .comm-how-to {
    padding: 20px 16px;
  }

  .comm-steps {
    padding-left: 16px;
    font-size: 14px;
  }
}

/* ═══ АДАПТИВНОСТЬ: БОКОВАЯ ПАНЕЛЬ НА ПК ═══ */
@media (min-width: 992px) {
  .comm-section {
    margin-bottom: 0;
  }

  .commissions-page {
    display: grid;
    /* Левая колонка 320px для шапки, правая занимает всё остальное место */
    grid-template-columns: 320px 1fr;
    gap: 48px;
    /* ВАЖНО: align-items: start необходим, чтобы sticky работал корректно в grid */
    align-items: start;
  }

  .comm-header {
    position: sticky;
    top: 80px;
    z-index: 10;
    margin-bottom: 0; /* Убираем нижний отступ, так как теперь он сбоку */
  }

  .comm-subtitle {
    margin-left: 0; /* Сбрасываем центрирование для боковой панели */
    margin-right: 0;
  }

  .comm-content-wrapper {
    display: flex;
    flex-direction: column;
    margin-top: 60px;
    gap: 48px; /* Расстояние между прокручиваемыми секциями */
    min-width: 0; /* Предотвращает переполнение grid-ячейки */
  }

  /* Немного улучшаем сетку Do/Don't для боковой панели, если нужно,
     но 2 колонки внутри секции и так хорошо впишутся в правую часть */
  .comm-how-to {
    text-align: left; /* Выравниваем шаги по левому краю на ПК */
  }

  .comm-steps {
    margin: 0 0 24px 0; /* Сбрасываем auto-центровку */
  }
}

/* ═══ МОБИЛЬНАЯ АДАПТАЦИЯ (Оставляем как было, но немного чистим) ═══ */
@media (max-width: 768px) {
  .comm-grid-2 {
    grid-template-columns: 1fr;
  }

  .comm-title {
    font-size: 24px;
  }


}

@media (max-width: 480px) {


  .comm-how-to {
    padding: 20px 16px;
  }

  .comm-steps {
    padding-left: 16px;
    font-size: 14px;
  }
}


/* ═══ Аватар ═══ */
.ava-container {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  display: flex;

}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(20, 20, 20, 0.9);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
}

.avatar-holder {
  position: relative;
  display: inline-block;
  width: min-content;
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

/* ═══ НАВИГАЦИЯ В ШАПКЕ ═══ */
/* По умолчанию (mobile first): в строку, с переносом */
.comm-nav-row {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  margin-top: 16px;
}

/* Стиль кнопок: наследуем .social-btn, но делаем компактнее */
.btn-nav {
  justify-content: center;
  gap: .45rem;
  padding: .45rem 1rem;
  min-width: 0;
  font-size: .9rem;
  color: rgba(255, 255, 255, .85);
  background: rgba(255, 255, 255, .05);
  border: 1px solid rgba(255, 255, 255, .12);
  transition: transform .16s ease, background .16s ease, border-color .16s ease, color .16s ease;
}

.btn-nav:hover {
  background: rgba(34, 158, 217, .16);
  border-color: rgba(34, 158, 217, .45);
  color: #fff;
  transform: translateY(-1px);
}

/* На ПК — в столбик на всю ширину сайдбара */
@media (min-width: 992px) {
  .comm-nav-row {
    flex-direction: column;
    align-items: stretch;
    max-width: 280px;
    margin-left: auto;
    margin-right: auto;
  }
}

/* ═══ СТИЛИ ДЛЯ НЕАКТИВНОЙ КНОПКИ ЗАЯВКИ ═══ */
.comm-order-btn.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(100%);
  box-shadow: none;
  transform: none !important;
}

/* НОВЫЙ стиль для ссылки Telegram */
.comm-howto-alt.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(100%);
  pointer-events: none; /* Запрещает клики по ссылке */
  transform: none !important;
  box-shadow: none !important;
  text-decoration: none !important;
}


</style>