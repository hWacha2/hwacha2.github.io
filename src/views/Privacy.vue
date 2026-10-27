<script setup>
import {computed, inject} from 'vue'
import {PRIVACY_UPDATED_AT} from '../data/dates'

const t = inject('t')
const formatDate = inject('formatDate')

const PRIVACY_STRUCTURE = [
  {
    title: 'privacyDataTitle',
    items: ['privacyData1', 'privacyData2', 'privacyData3']
  },
  {
    title: 'privacyWhyTitle',
    items: ['privacyWhy1', 'privacyWhy2', 'privacyWhy3']
  },
  {
    title: 'privacyWhereTitle',
    items: ['privacyWhere1', 'privacyWhere2', 'privacyWhere3']
  },
  {
    title: 'privacyThirdTitle',
    items: ['privacyThird1', 'privacyThird2', 'privacyThird3', 'privacyThird4', 'privacyThird5']
  },
  {
    title: 'privacyCookiesTitle',
    items: ['privacyCookies1', 'privacyCookies2']
  },
  {
    title: 'privacyRetentionTitle',
    items: ['privacyRetention1', 'privacyRetention2', 'privacyRetention3']
  },
  {
    title: 'privacyRightsTitle',
    items: ['privacyRights1', 'privacyRights2']
  },
  {
    title: 'privacyChangesTitle',
    items: ['privacyChanges1']
  }
]

const privacySections = computed(() => PRIVACY_STRUCTURE.map(section => ({
  title: t(section.title),
  items: section.items.map(key => t(key))
})))
</script>

<template>
  <div>
    <div class="page-scroller">
      <main id="main-content" tabindex="-1" class="container privacy-page">
        <article class="contglass privacy-card">

          <header class="privacy-head">
            <RouterLink :to="{name: 'Commissions'}" class="privacy-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M19 12H5M11 18l-6-6 6-6"/>
              </svg>
              {{ t('privacyBackToCommissions') }}
            </RouterLink>

            <h1 class="privacy-title">{{ t('privacyPageTitle') }}</h1>
            <p class="privacy-intro">{{ t('privacyIntro') }}</p>
          </header>

          <div class="privacy-body">
            <section
                v-for="block in privacySections"
                :key="block.title"
                class="privacy-block"
            >
              <h2 class="privacy-block-title">{{ block.title }}</h2>
              <ul class="privacy-list">
                <li v-for="(item, j) in block.items" :key="j">{{ item }}</li>
              </ul>
            </section>

            <p class="privacy-contact">
              {{ t('privacyContact') }}
              <a href="https://t.me/ishwacha" target="_blank" rel="noopener">@ishwacha</a>
            </p>

            <p class="privacy-updated">
              {{ t('privacyUpdated', {date: formatDate(PRIVACY_UPDATED_AT)}) }}
            </p>
          </div>

        </article>
      </main>
    </div>
  </div>
</template>

<style scoped>
.privacy-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 100px 1rem 3rem;
}

.privacy-card {
  padding: 2rem;
}

.privacy-head {
  margin-bottom: 28px;
}

.privacy-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #229ED9;
  text-decoration: none;
}

.privacy-back:hover {
  text-decoration: underline;
}

.privacy-title {
  margin: 0 0 12px;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: #fff;
}

.privacy-intro {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
}

.privacy-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.privacy-block-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.privacy-block-title::before {
  content: '';
  display: block;
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: #229ED9;
}

.privacy-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.privacy-list li {
  position: relative;
  padding-left: 24px;
  font-size: 14px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.85);
}

.privacy-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: #229ED9;
  font-weight: bold;
  font-size: 20px;
  line-height: 1.1;
}

.privacy-contact {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
}

.privacy-contact a {
  color: #229ED9;
  text-decoration: none;
}

.privacy-contact a:hover {
  text-decoration: underline;
}

.privacy-updated {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .privacy-page {
    padding: 72px 12px 24px;
  }

  .privacy-card {
    padding: 1.25rem;
  }
}
</style>
