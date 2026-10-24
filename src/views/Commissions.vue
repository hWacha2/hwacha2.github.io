<template>
  <div class="page-scroller">
    <div class="container commissions-page">

      <!-- ═══ ШАПКА ═══ -->
      <header class="comm-header contglass">
        <div class="comm-status-badge" :class="isOpen ? 'status-open' : 'status-closed'">
          <span class="status-dot"></span>
          {{ isOpen ? t('commStatusOpen') : t('commStatusClosed') }}
        </div>
        <div class="ava-container">
          <div class="avatar-holder" :class="{ 'is-loaded': avatarLoaded} ">
            <img :src="avatarUrl" alt="avatar" class="avatar" width="120" height="120" decoding="async"
                 @load="avatarLoaded = true" @error="avatarLoaded = true"/>
          </div>
        </div>
        <h1 class="h3 mb-2">{{ nickName }}</h1>
        <h1 class="comm-title">{{ t('commTitle') }}</h1>
        <p class="comm-subtitle">{{ t('commSubtitle') }}</p>

        <a :href="contactLink" target="_blank" rel="noopener" class="social-btn btn-telegram comm-cta-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
                d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.03-1.82 8.57c-.13.6-.5.75-.99.46l-2.78-2.04-1.34 1.29c-.15.15-.27.27-.56.27l.2-2.84 5.18-4.68c.22-.2-.05-.3-.35-.12L9.04 12.8l-2.75-.86c-.6-.19-.61-.6.12-.89l10.76-4.15c.5-.19.93.12.77.93z"/>
          </svg>
          {{ t('commContactBtn') }}
        </a>
        <hr class="border-1 border-secondary my-3 "/>
        <p class="comm-price-update-date">{{ t('commPriceUpdateDate') }}</p>
      </header>

      <!-- ═══ ОБЕРТКА ДЛЯ ПРОКРУЧИВАЕМОГО КОНТЕНТА ═══ -->
      <div class="comm-content-wrapper contglass p-3">

        <!-- ═══ ЦЕНЫ И ФОРМАТЫ (Стиль Jaykart: Категория -> Примеры -> Цена) ═══ -->
        <section class="comm-section">
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
              <img :src="imgObj.thumb" :alt="cat.title" loading="lazy" decoding="async"/>
            </span>
                    </a>
                  </div>
                </div>

                <p class="comm-category-desc">{{ cat.description }}</p>

                <div class="comm-price-line">
                  <span class="comm-price-label">{{ cat.baseLabel }}</span>
                  <span class="comm-price-value">— ${{ cat.basePrice }}</span>
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

        <!-- ═══ ЧТО Я РИСУЮ / НЕ РИСУЮ + ПРАВИЛА ═══ -->
        <section class="comm-section">
          <h2 class="comm-section-title">{{ t('commTermsOfService') }}</h2>

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

          <!-- НОВЫЙ БЛОК: ПРАВИЛА -->
          <div class="comm-rules-card">
            <h3 class="comm-rules-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {{ t('commRulesTitle') }}
            </h3>
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
          </div>
        </section>


        <!-- ═══ КАК ЗАКАЗАТЬ ═══ -->
        <section class="comm-section comm-how-to">
          <h2 class="comm-section-title">{{ t('commHowTo') }}</h2>
          <ol class="comm-steps">
            <li>{{ t('commStep1') }}</li>
            <li>{{ t('commStep2') }}</li>
            <li>{{ t('commStep3') }}</li>
            <li>{{ t('commStep4') }}</li>
          </ol>
          <a :href="contactLink" target="_blank" rel="noopener"
             class="social-btn btn-telegram comm-cta-btn comm-cta-btn--large">
            {{ t('commContactBtn') }}
          </a>
        </section>

        <!-- ═══ ВЫПОЛНЕННЫЕ КОМИШКИ ═══ -->
        <section class="comm-section">
          <h2 class="comm-section-title">{{ t('commCompleted') }}</h2>
          <div class="comm-completed-grid">
            <div v-for="(work, idx) in completedWorks" :key="idx" class="comm-work-card">
              <div class="comm-work-img-wrapper">
                <img :src="work.thumb" :alt="work.client" @click="handleClick(work.full)" style="cursor: pointer;"
                     loading="lazy" decoding="async"/>
              </div>
              <div class="comm-work-info">
                <a class="comm-work-client" :href="work.clientUrl" target="_blank" rel="noopener">@{{ work.client }}</a>
                <div class="comm-work-desc">{{ work.desc }}</div>
              </div>
            </div>
          </div>
        </section>

      </div> <!-- Конец comm-content-wrapper -->
    </div>
  </div>
</template>

<script setup>
import {computed, inject, ref} from 'vue';

const t = inject('t');
const nickName = 'ishwacha';
const avatarUrl = 'ava.webp';
const avatarLoaded = ref(false);
const contactLink = 'https://t.me/ishwacha';
const isOpen = ref(false); // Переключайте на true, если заказы открыты

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
// Заглушки: замени '00' на реальные суммы — они подставятся в прайс.
// У каждой категории свой набор надбавок и своя цена на каждую надбавку.
const PRICING = {
  portrait: {
    base: '00',
    addons: [
      {key: 'addonBg', price: '00'},

      {key: 'addonDetail', price: '00'}
    ]
  },
  halfbody: {
    base: '00',
    addons: [
      {key: 'addonBg', price: '00'},
      {key: 'addonExtraChar', price: '00'},
      {key: 'addonPose', price: '00'}
    ]
  },
  fullbody: {
    base: '00',
    addons: [
      {key: 'addonBg', price: '00'},
      {key: 'addonExtraChar', price: '00'},
      {key: 'addonProp', price: '00'},
      {key: 'addonDetail', price: '00'}
    ]
  }
};

const createCategory = (pricingKey, titleKey, descKey, folder) => {
  const pricing = PRICING[pricingKey];

  return {
    title: t(titleKey),
    description: t(descKey),
    baseLabel: t('priceBaseLabel'),
    basePrice: pricing.base,
    examples: examples[folder],
    addons: pricing.addons.map(addon => ({
      label: t(addon.key),
      price: addon.price
    }))
  };
};

const pricingCategories = computed(() => [
  createCategory('portrait', 'pricePortraitName', 'pricePortraitDesc', 'portrets'),
  createCategory('halfbody', 'priceHalfName', 'priceHalfDesc', 'halfbody'),
  createCategory('fullbody', 'priceFullName', 'priceFullDesc', 'fullbody')
]);

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
  {
    title: 'tosOrderTitle',
    items: ['tosOrder1', 'tosOrder2', 'tosOrder3', 'tosOrder4']
  }
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
    desc: 'Fullbody art with bg 250$'
  },

]);
</script>
<style scoped>
/* ═══ ОСНОВНОЙ КОНТЕЙНЕР ═══ */
.commissions-page {
  margin: 0 auto;
  padding: 24px 16px 60px;
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

.comm-card {
  background: #182533;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.comm-card--do {
  border-left: 3px solid #4fae4e;
}

.comm-card--dont {
  border-left: 3px solid #e03131;
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
  font-weight: 600;
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

  /* min-height: 140px убран — aspect-ratio сам считает высоту */
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

/* Адаптация для мобильных */
@media (max-width: 480px) {

  .comm-section-title {
    font-size: 22px;

  }
  .comm-category-title
  {
    font-size: 22px;
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

/* ═══ КАК ЗАКАЗАТЬ ═══ */
.comm-how-to {
  background: rgba(34, 158, 217, 0.05);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid rgba(34, 158, 217, 0.15);
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


</style>