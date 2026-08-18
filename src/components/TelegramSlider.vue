<template>
  <section id="telegram-gallery">


    <div v-if="loading" class="tg-slider d-flex overflow-x-auto gap-3 pb-3 pt-3">
      <div
          v-for="n in 4"
          :key="n"
          class="tg-card card-glass p-2 flex-shrink-0"
          style="width: 320px;"
      >
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton skeleton-line mt-2" style="width: 80%;"></div>
        <div class="skeleton skeleton-line mt-2" style="width: 45%;"></div>
      </div>
    </div>
    <div v-else-if="error" class="text-center py-4">
      <p class="text-secondary mb-2">Не удалось загрузить посты автоматически</p>
      <a href="https://t.me/ishwacha" target="_blank" rel="noopener" class="btn btn-outline-primary btn-sm">
        Открыть канал →
      </a>
    </div>

    <!-- Слайдер -->
    <div
        v-else
        class="tg-slider d-flex overflow-x-auto gap-3 pb-3 pt-3"
        style="scroll-snap-type: x mandatory;"
    >
      <!-- Карточки постов -->
      <article
          v-for="(post, idx) in posts"
          :key="idx"
          class="tg-card card-glass gallery-item p-2 flex-shrink-0"
          style="width: 320px; scroll-snap-align: start; overflow: hidden; cursor: pointer;"
          role="button"
          data-bs-toggle="modal"
          data-bs-target="#tgPostModal"
          @click="selectedPost = post"
      >
        <div v-if="post.images.length > 0" class="tg-image-wrap position-relative">
          <!-- Размытый тёмный фон (только внутри этого div) -->
          <img :src="post.images[0]" class="gallery-img-blur" aria-hidden="true"/>
          <!-- Чёткая картинка поверх -->
          <img
              :src="post.images[0]"
              :alt="post.title"
              class="gallery-img"
              loading="lazy"
              @error="$event.target.style.display = 'none'"
          />
          <!-- Бейдж "+N" для альбомов -->
          <div v-if="post.images.length > 1" class="tg-multi-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M8 3v18M3 8h18"/>
            </svg>
            +{{ post.images.length - 1 }}
          </div>
        </div>

        <!-- ═══ БЛОК БЕЗ КАРТИНКИ (текстовая карточка) ═══ -->
        <div v-else class="tg-card-noimage">
          <div class="tg-noimage-icon mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
              <path
                  d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
          <div class="tg-noimage-text">{{ post.fullText }}</div>
        </div>

        <!-- ═══ БЛОК ТЕКСТА/ПОДПИСИ (отдельно от картинки, без blur) ═══ -->
        <div class="tg-card-footer mt-2">
          <strong v-if="post.images.length > 0" class="d-block small tg-card-title">{{ post.title }}</strong>
          <div class="d-flex justify-content-between align-items-center mt-1">
            <small class="text-secondary">{{ post.date }}</small>
            <span v-if="post.images.length > 1" class="tg-mini-badge">{{ post.images.length }} фото</span>
          </div>
        </div>
      </article>

      <!-- CTA карточка -->
      <a
          href="https://t.me/ishwacha"
          target="_blank"
          rel="noopener"
          class="tg-card tg-card-cta flex-shrink-0 d-flex flex-column justify-content-center align-items-center text-center p-4"
          style="width: 260px; scroll-snap-align: start; text-decoration: none;"
      >
        <div class="tg-cta-icon mb-3">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path
                d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </div>
        <h3 class="h6 mb-2 text-white">Больше постов в Telegram</h3>
        <p class="small text-white-50 mb-3">Все новости, арты и обновления в канале</p>
        <span class="btn btn-sm btn-primary rounded-pill px-4">Подписаться →</span>
      </a>
    </div>

    <!-- Модалка -->
    <div
        class="modal fade"
        id="tgPostModal"
        tabindex="-1"
        aria-hidden="true"
    >

      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content card-glass "
             style="background: rgba(30, 30, 40, 0.95); border: 1px solid rgba(255,255,255,0.1);">
          <div class="modal-header p-0 mb-3 border-0">
            <h5 class="modal-title text-white">{{ t("postTg") }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                    aria-label="Закрыть"></button>
          </div>

          <div class="modal-body" v-if="selectedPost">
            <!-- Галерея картинок -->
            <div v-if="selectedPost.images.length > 0" class="mb-3">
              <img
                  v-for="(img, i) in selectedPost.images"
                  :key="i"
                  :src="img"
                  class="w-100 rounded mb-2"
                  style="max-height: 350px; object-fit: cover;"
                  @error="$event.target.style.display = 'none'"
              />
            </div>
            <!-- Цитата, если пост — ответ -->
            <div v-if="selectedPost.quotedText" class="tg-quote mb-3">
              {{ selectedPost.quotedText }}
            </div>

            <!-- Полный текст с сохранением форматирования -->
            <div class="tg-modal-text text-white mb-2">
              {{ selectedPost.fullText }}
            </div>

            <small class="text-secondary d-block">{{ selectedPost.date }}</small>
          </div>

          <div class="modal-footer border-0 mt-0">
            <a
                v-if="selectedPost"
                :href="selectedPost.link"
                target="_blank"
                rel="noopener"
                class="social-btn btn-to-tg"
            >
              {{ t("toPost") }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {ref, onMounted, inject, watch} from 'vue';

const t = inject('t');
const currentLang = inject('currentLang', ref('en')); // язык из App.vue


const posts = ref([]);
const loading = ref(true);
const error = ref(false);
const selectedPost = ref(null);

const CHANNEL = 'ishwacha';
const PROXY_BASE = 'https://social-proxy.gbaranovskaa76.workers.dev/?url=';
const POSTS_LIMIT = 10;

async function fetchTelegram() {
  const targetUrl = `https://t.me/s/${CHANNEL}`;
  const urlsToTry = [
    targetUrl,
    `${PROXY_BASE}${encodeURIComponent(targetUrl)}`,
  ];

  let html = null;
  for (const url of urlsToTry) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        html = await res.text();
        break;
      }
    } catch {
      continue;
    }
  }

  if (!html) throw new Error('Не удалось получить HTML');

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const messages = doc.querySelectorAll('.tgme_widget_message_wrap');

  const parsed = [];
  messages.forEach(wrap => {
    const msg = wrap.querySelector('.tgme_widget_message');
    if (!msg) return;

    // ── Пропускаем сервисные сообщения: у них нет счётчика просмотров ──
    if (!msg.querySelector('.tgme_widget_message_views')) return;
    // страховка по классу
    if ((msg.getAttribute('class') || '').includes('service') || msg.querySelector('[class*="service"]')) return;

    // ── Текст: берём ПОСЛЕДНИЙ .tgme_widget_message_text, не лежащий внутри цитаты ──
    // (цитата ответа тоже имеет этот класс и идёт первой в DOM)
    const allTexts = Array.from(msg.querySelectorAll('.tgme_widget_message_text'));
    const textEl = allTexts.filter(el => !el.closest('[class*="reply"]')).pop() || allTexts.pop();
    if (!textEl) return;

    const fullText = (textEl.textContent || '').trim();
    if (!fullText) return;

    // ── Цитата (если пост — ответ на другой) ──
    let quotedText = '';
    const replyWrap = msg.querySelector('[class*="reply"]');
    if (replyWrap) {
      const name = replyWrap.querySelector('[class*="name"]')?.textContent?.trim() || '';
      const quote = replyWrap.querySelector('[class*="text"]')?.textContent?.trim() || '';
      quotedText = [name, quote].filter(Boolean).join('\n');
    }

    const linkEl = msg.querySelector('a.tgme_widget_message_date');
    const link = linkEl?.href || `https://t.me/${CHANNEL}`;

    // Все картинки
    const images = [];
    msg.querySelectorAll('.tgme_widget_message_photo_wrap').forEach(pw => {
      const style = pw.getAttribute('style') || '';
      const match = style.match(/url\(['"]?([^'")]+)['"]?\)/);
      if (match) images.push(match[1]);
    });

    // Видео-превью если нет картинок
    if (images.length === 0) {
      const videoWrap = msg.querySelector('.tgme_widget_message_video_player');
      if (videoWrap) {
        const style = videoWrap.getAttribute('style') || '';
        const match = style.match(/url\(['"]?([^'")]+)['"]?\)/);
        if (match) images.push(match[1]);
      }
    }

    const timeEl = msg.querySelector('time[datetime]');
    const isoDate = timeEl?.getAttribute('datetime') || '';

    parsed.push({
      title: fullText.substring(0, 60) + (fullText.length > 60 ? '...' : ''),
      fullText,
      originalText: fullText,        // ← сразу сохраняем оригинал
      quotedText,
      originalQuoted: quotedText,    // ← и оригинал цитаты
      link,
      images,
      date: formatDate(isoDate),
      timestamp: isoDate ? new Date(isoDate).getTime() : 0,
    });
  });

  return parsed
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, POSTS_LIMIT);
}


function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  return h.toString(36);
}

async function fetchJsonVia(url) {
  // Сначала через ваш воркер, потом напрямую
  const attempts = [`${PROXY_BASE}${encodeURIComponent(url)}`, url];
  for (const u of attempts) {
    try {
      const r = await fetch(u);
      if (r.ok) return await r.json();
    } catch {
      continue;
    }
  }
  return null;
}

async function translateText(text, tl) {
  if (!text || text.length > 4000) return text;

  // Кэш в localStorage — пост переводится один раз
  const key = `tgtr_${tl}_${hashStr(text)}`;
  try {
    const cached = localStorage.getItem(key);
    if (cached) return cached;
  } catch {
  }

  let result = null;

  // 1) Google (бесплатно, без ключа)
  const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  const gData = await fetchJsonVia(gUrl);
  if (gData && Array.isArray(gData[0])) {
    result = gData[0].map(s => s[0]).join('');
  }

  // 2) Фолбэк MyMemory
  if (!result) {
    const mUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|${tl}`;
    const mData = await fetchJsonVia(mUrl);
    const tr = mData?.responseData?.translatedText;
    if (tr && !/MYMEMORY WARNING/i.test(tr)) result = tr;
  }

  if (result && result !== text) {
    try {
      localStorage.setItem(key, result);
    } catch {
    }
    return result;
  }
  return text;
}

async function applyTranslations() {
  const lang = currentLang.value;

  for (const post of posts.value) {
    // Страховка: если оригинала нет — считаем оригиналом текущий текст
    if (!post.originalText) post.originalText = post.fullText || '';

    if (lang === 'ru') {
      post.fullText = post.originalText;
      post.quotedText = post.originalQuoted || '';
      post.translated = false;
    } else {
      post.fullText = await translateText(post.originalText, lang);
      if (post.originalQuoted) {
        post.quotedText = await translateText(post.originalQuoted, lang);
      }
      post.translated = post.fullText !== post.originalText;
    }

    // Безопасное обновление заголовка
    const text = post.fullText || '';
    post.title = text.substring(0, 60) + (text.length > 60 ? '...' : '');
  }
}

// При переключении языка — переводим/возвращаем оригинал
watch(currentLang, () => applyTranslations());

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short', year: 'numeric'});
  } catch {
    return '';
  }
}

onMounted(async () => {
  try {
    posts.value = await fetchTelegram();

    // Сохраняем оригиналы
    posts.value.forEach(p => {
      p.originalText = p.fullText;
      p.originalQuoted = p.quotedText || '';
    });

    // 👇 Переводим сразу при загрузке, если язык не RU
    await applyTranslations();

    if (posts.value.length === 0) error.value = true;
  } catch (e) {
    console.error('Telegram fetch error:', e);
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style>
/* ═══ База ═══ */
.card-glass {
  background: linear-gradient(210deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 1rem;
}

/* ═══ Слайдер ═══ */
.tg-slider {
  height: 430px;
}

.tg-slider::-webkit-scrollbar {
  height: 6px;
}

.tg-slider::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 3px;
}

.tg-slider::-webkit-scrollbar-thumb {
  background: rgba(34, 158, 217, 0.35);
  border-radius: 3px;
}

/* ═══ Карточка ═══ */
.tg-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ═══ Контейнер картинки (blur живёт только тут) ═══ */
.tg-image-wrap {
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.gallery-img-blur {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(20px) brightness(0.3) saturate(0.8);
  transform: scale(1.1);
  z-index: -20;
  pointer-events: none;
}

.gallery-img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: contain;

  z-index: 1;
  transition: transform .18s ease, filter .18s ease;
}

.gallery-item:hover .gallery-img {
  transform: scale(1.02);
  filter: brightness(1.05);
}

/* ═══ Карточка без картинки ═══ */
.tg-card-noimage {
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  padding: 1.2rem;
  background: linear-gradient(135deg, rgba(34, 158, 217, 0.12), rgba(34, 158, 217, 0.04));
  border: 1px dashed rgba(34, 158, 217, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all .18s ease;
}

.tg-card:hover .tg-card-noimage {
  background: linear-gradient(135deg, rgba(34, 158, 217, 0.18), rgba(34, 158, 217, 0.08));
  border-color: rgba(34, 158, 217, 0.4);
}

.tg-noimage-icon {
  color: #229ED9;
  flex-shrink: 0;
}

.tg-noimage-text {
  font-size: 0.85rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  flex: 1;
}

/* ═══ Подпись (вне blur-зоны) ═══ */
.tg-card-footer {
  flex-shrink: 0;
}

.tg-card-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ═══ Бейджи ═══ */
.tg-multi-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.tg-mini-badge {
  font-size: 0.7rem;
  color: #229ED9;
  background: rgba(34, 158, 217, 0.12);
  padding: 2px 8px;
  border-radius: 10px;
}

/* CTA карточка */
.tg-card-cta {
  background: linear-gradient(135deg, rgba(34, 158, 217, 0.25), rgba(34, 158, 217, 0.08)) !important;
  border: 1px solid rgba(34, 158, 217, 0.3) !important;
  border-radius: 10px;
  transition: all .2s ease;
}

.tg-card-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(34, 158, 217, 0.25);
}

.tg-cta-icon {
  color: #229ED9;
  filter: drop-shadow(0 4px 12px rgba(34, 158, 217, 0.4));
}

/* Скроллбар слайдера */
.tg-slider::-webkit-scrollbar {
  height: 6px;
}

.tg-slider::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 3px;
}

.tg-slider::-webkit-scrollbar-thumb {
  background: rgba(34, 158, 217, 0.35);
  border-radius: 3px;
}

.modal-content.card-glass {

  background: linear-gradient(210deg, rgba(10, 15, 20, 0.95), rgba(30, 30, 35, 0.90)) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
}

.btn-to-tg {
  background: linear-gradient(90deg, #101010, #0b0c0f);
}


/* Modal for gallery */
.modal-content {
  background: rgba(10, 10, 15, 0.6) !important;
  border: none !important;
  width: auto !important;
  margin: 0 auto;
  display: inline-block !important;
}

.modal-body {
  padding: 0 !important;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.modal-body img {
  max-width: 90vw !important;
  max-height: 70vh !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain;
  border-radius: 16px;
  margin: 0 auto;
}

.modal-dialog {
  display: flex !important;
  align-items: center;
  justify-content: center;
  margin: 1rem;

  width: auto !important;
}

/* ═══ Скелетоны загрузки ═══ */
.skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 8px;
}

.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
  animation: tg-shimmer 1.5s infinite;
}

@keyframes tg-shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-img {
  flex: 1;
  min-height: 0;
}

.skeleton-line {
  height: 12px;
  flex-shrink: 0;
}

/* ═══ Цитата в модалке ═══ */
.tg-quote {
  border-left: 3px solid #229ED9;
  background: rgba(34, 158, 217, 0.08);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 120px;
  overflow: hidden;
}
</style>