<template>
  <div id="telegram-vertical">
    <!-- ═══ СОСТОЯНИЕ ЗАГРУЗКИ ═══ -->
    <div v-if="loading" class="tg-chat d-flex flex-column pb-3 px-3">
      <div v-for="n in 4" :key="n" class="tg-msg tg-msg--incoming">
        <div class="tg-msg-bubble">
          <div class="skeleton skeleton-avatar"></div>
          <div class="tg-msg-body">
            <div class="skeleton skeleton-header"></div>
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-line mt-2" style="width: 85%;"></div>
            <div class="skeleton skeleton-line mt-1" style="width: 45%;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ СОСТОЯНИЕ ОШИБКИ ═══ -->
    <div v-else-if="error" class="tg-error-state">
      <div class="tg-error-icon mb-3">
        <svg viewBox="0 0 204 140" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#ff6b6b"/>
              <stop offset="1" stop-color="#e03131"/>
            </linearGradient>
          </defs>

          <path fill="url(#cloudGrad)"
                d="M94.1 8.6a58 58 0 0 0-33.6 26.9l-3 6H49c-7.3 0-9.3.4-14.3 2.8A49 49 0 0 0 9.9 79.4a48 48 0 0 0 22.5 47.7c9.9 5.6 15.9 6.2 48.9 5 16.2-.6 38.8-1.1 50.3-1.1 33.2-.1 41.5-2 52-12.4 8-8 10.7-14.5 10.7-26.6a32 32 0 0 0-10.8-26.7c-5.6-5.5-7.2-6.5-13.8-8.4l-7.4-2.2-1.1-6.1a53 53 0 0 0-40-40.5 75 75 0 0 0-27.1.5Z"/>
          <path fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" d="M82 63l38 38m0-38-38 38"/>
        </svg>
      </div>
      <p class="text-white mb-3 fw-medium">{{ t('loadError') || 'Не удалось загрузить посты' }}</p>
      <div class="d-flex gap-2 justify-content-center flex-wrap">
        <button class="social-btn btn-steam" @click="retryLoad">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
          {{ t('retry') || 'Повторить' }}
        </button>
        <a href="https://t.me/ishwacha" target="_blank" rel="noopener" class="social-btn btn-telegram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
                d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.03-1.82 8.57c-.13.6-.5.75-.99.46l-2.78-2.04-1.34 1.29c-.15.15-.27.27-.56.27l.2-2.84 5.18-4.68c.22-.2-.05-.3-.35-.12L9.04 12.8l-2.75-.86c-.6-.19-.61-.6.12-.89l10.76-4.15c.5-.19.93.12.77.93z"/>
          </svg>
          {{ t('openChannel') || 'Канал' }}
        </a>
      </div>
    </div>

    <!-- ═══ ЧАТ-ЛЕНТА (Telegram style) ═══ -->
    <div v-else class="tg-chat" ref="chatContainer">
      <article
          v-for="(post, idx) in posts"
          :key="post.id || idx"
          :ref="el => { if (el) postRefs[idx] = el }"
          :data-post-id="post.id"
          class="tg-msg tg-msg--incoming"
          :class="{ 'tg-msg--highlight': highlightedPostId === post.id }"
      >
        <div class="tg-msg-bubble">
          <!-- Аватар канала -->
          <div class="tg-msg-avatar">
            <div class="tg-avatar-circle">
              <img
                  v-if="channelAvatar"
                  :src="channelAvatar"
                  alt="ishwacha"
                  class="tg-avatar-img"
                  @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
              />
              <svg v-else viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path
                    d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.03-1.82 8.57c-.13.6-.5.75-.99.46l-2.78-2.04-1.34 1.29c-.15.15-.27.27-.56.27l.2-2.84 5.18-4.68c.22-.2-.05-.3-.35-.12L9.04 12.8l-2.75-.86c-.6-.19-.61-.6.12-.89l10.76-4.15c.5-.19.93.12.77.93z"/>
              </svg>
            </div>
          </div>

          <div class="tg-msg-body">
            <!-- Заголовок канала -->
            <div class="tg-msg-header">
              <a
                  :href="post.authorLink || `https://t.me/${CHANNEL}`"
                  target="_blank"
                  rel="noopener"
                  class="tg-channel-name"
                  @click.stop
              >
                {{ post.authorName || CHANNEL }}
              </a>
              <span v-if="post.translated" class="tg-translated-badge">auto</span>
            </div>

            <!-- Цитата (reply) — кликабельная, скроллит к источнику -->
            <div
                v-if="post.quotedText"
                class="tg-msg-reply"
                @click.stop="scrollToQuoted(post)"
            >
              <div class="tg-reply-bar"></div>
              <div class="tg-reply-content">
                <div class="tg-reply-title">quote</div>
                <div class="tg-reply-text">{{ truncate(post.quotedText, 80) }}</div>
              </div>
            </div>

            <!-- Медиа: сетка картинок и видео (Telegram-style grid) -->
            <div
                v-if="post.media && post.media.length > 0"
                class="tg-media-grid"
                :class="mediaGridClass(post.media.length)"
            >
              <div
                  v-for="(item, mIdx) in post.media"
                  :key="mIdx"
                  class="tg-media-item"
                  @click.stop="openMedia(post, mIdx)"
              >
                <!-- 1. 🎥 Обычное видео (или ссылка содержит .mp4) -->
                <video
                    v-if="item.type === 'video' || (item.src && item.src.includes('.mp4'))"
                    :src="item.src"
                    :poster="item.poster || item.src"
                    class="tg-media-img"
                    preload="metadata"
                    muted
                    playsinline
                ></video>

                <div
                    v-else-if="item.type === 'video_stub'"
                    class="tg-media-stub"
                >
                  <img :src="item.poster" class="tg-media-img" loading="lazy"/>
                  <div class="tg-play-overlay">
                    <div class="tg-play-circle">
                      <!-- Иконка Telegram -->
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 30 30">
                        <path
                            d="m20 4v2h2l.0010534-1.97483793c.7298783.05096843 1.0959232.17857229 1.4642152.37553699.4888888.26146063.8725717.6451435 1.1340323 1.13403238l.0922854.18482021c.2018093.43861897.3084137.9561578.3084137 2.12627615v14.3083444c0 1.3372781-.1392384 1.8222075-.4006991 2.3110964-.2614606.4888888-.6451435.8725717-1.1340323 1.1340323-.368292.1969647-.7343369.3245686-1.4642152.375537l-.0010534-1.9748379h-2v2h-10v-2h-2l-.00008693 1.9749054c-.73052165-.0509233-1.09672713-.1785528-1.46518163-.3756045-.48888888-.2614606-.87257175-.6451435-1.13403238-1.1340323l-.09228534-.1848203c-.18739436-.407289-.29269878-.8826263-.30678617-1.8853159l-.00162755-14.5493046c0-1.33727811.13923842-1.82220747.40069906-2.31109636.26146063-.48888888.6451435-.87257175 1.13403238-1.13403238.3684545-.19705162.73465998-.32468117 1.46518163-.37560443l.00008693 1.97490537h2v-2zm-10 16h-2v2h2zm12 0h-2v2h2zm-12-4h-2v2h2zm12 0h-2v2h2zm-12-4h-2v2h2zm12 0h-2v2h2zm-12-4h-2v2h2zm12 0h-2v2h2z"
                            fill="#fff"
                            fill-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- 3. 📺 Iframe (YouTube, Vimeo, Telegram embed) -->
                <iframe
                    v-else-if="item.type === 'iframe'"
                    :src="item.src"
                    class="tg-media-iframe"
                    frameborder="0"
                    allow="autoplay; fullscreen"
                ></iframe>

                <!-- 4. 🖼 Обычная картинка (FALLBACK: должен быть самым последним!) -->
                <img
                    v-else
                    :src="item.poster || item.src"
                    :alt="post.title"
                    class="tg-media-img"
                    loading="lazy"
                    @error="$event.target.style.display='none'"
                />

                <!-- ▶️ Оверлей play (только для реальных видео и iframe, у stub своя иконка внутри) -->
                <div v-if="item.type === 'video' || item.type === 'iframe' || (item.src && item.src.includes('.mp4'))"
                     class="tg-play-overlay">
                  <div class="tg-play-circle">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>

                <!-- Счётчик "+N" -->
                <div v-if="isHiddenOverflow(post.media.length, mIdx)" class="tg-media-more">
                  +{{ post.media.length - visibleMediaCount(post.media.length) }}
                </div>
              </div>
            </div>
            <!-- Текст сообщения -->
            <div v-if="post.fullText" class="tg-msg-text" :class="{ 'has-media': post.media && post.media.length > 0 }">
              <span v-html="linkify(post.fullText)"></span>
            </div>

            <!-- Мета: время + просмотры -->
            <div class="tg-msg-meta">
              <span class="tg-meta-views" v-if="post.views">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {{ formatViews(post.views) }}
              </span>
              <time class="tg-meta-time">{{ post.time }}</time>
              <svg v-if="idx === posts.length - 1" class="tg-check-mark" width="14" height="10" viewBox="0 0 16 11"
                   fill="currentColor">
                <path
                    d="M11.071.653a.75.75 0 0 1 .082 1.052l-6.6 7.921-.56-.002L.653 5.93a.75.75 0 1 1 1.145-.94l2.73 3.337 6.057-7.27a.75.75 0 0 1 1.086-.404z"/>
                <path
                    d="M14.071.653a.75.75 0 0 1 .082 1.052l-6.6 7.921-.56-.002-.8-.96.94-1.128 6.057-7.27a.75.75 0 0 1 1.086-.404z"/>
              </svg>
            </div>


          </div>
        </div>
      </article>

      <!-- CTA-сообщение -->
      <a
          :href="`https://t.me/${CHANNEL}`"
          target="_blank"
          rel="noopener"
          class="tg-msg tg-msg--system"
          @click.stop
      >
        <div class="tg-system-card">
          <div class="tg-cta-icon mb-2">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <path
                  d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.03-1.82 8.57c-.13.6-.5.75-.99.46l-2.78-2.04-1.34 1.29c-.15.15-.27.27-.56.27l.2-2.84 5.18-4.68c.22-.2-.05-.3-.35-.12L9.04 12.8l-2.75-.86c-.6-.19-.61-.6.12-.89l10.76-4.15c.5-.19.93.12.77.93z"/>
            </svg>
          </div>
          <h3 class="h6 mb-1 text-white">{{ t('ctaTitle') }}</h3>
          <p class="small text-white-50 mb-2">{{ t('ctaDescription') }}</p>
          <span class="btn btn-sm btn-primary rounded-pill px-4">{{ t('ctaFollow') }}</span>
        </div>
      </a>
    </div>

    <!-- ═══ МОДАЛКА (Telegram-style) ═══ -->
    <Transition name="modal-fade">
      <div v-if="modalOpen" class="tg-modal-overlay" :class="{ 'is-dragging': isDragging }" @click.self="closeModal">
        <div class="tg-modal-box" :style="{ transform: dragY > 0 ? `translateY(${dragY}px)` : '' }">
          <button class="tg-modal-close" @click="closeModal" aria-label="Close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <div v-if="modalPost" class="tg-modal-content">
            <!-- Вьюпорт галереи с обработчиками свайпов -->
            <div
                class="tg-modal-media-viewport"
                :class="{ 'is-dragging': isDragging }"
                @touchstart="onTouchStart"
                @touchmove="onTouchMove"
                @touchend="onTouchEnd"
                @touchcancel="onTouchEnd"
            >
              <!-- Единый трек, который сдвигается как поезд -->
              <div
                  class="tg-modal-media-track"
                  :style="{ transform: `translateX(calc(-100% * ${flatIndex} + ${dragX}px))` }"
              >
                <div
                    v-for="(item, idx) in flatMedia"
                    :key="item.media.src + '-' + idx"
                    class="tg-modal-media-slide"
                >

                  <img

                      v-if="item.media.type === 'image'"
                      :src="item.media.src"
                      :alt="item.post.title"
                      class="tg-modal-img"
                      loading="lazy"
                      @error="$event.target.style.display='none'"
                  />
                  <!-- 🎥 Видео -->
                  <video
                      v-else-if="item.media.type === 'video'"
                      :ref="el => { if (idx === flatIndex) activeVideoRef = el }"
                      :src="item.media.src"
                      :poster="item.media.poster"
                      controls
                      muted
                      playsinline
                      preload="auto"
                      class="tg-modal-video"
                  />

                  <!-- хуета -->

                  <div
                      v-else-if="item.media.type === 'video_stub'"
                      class="tg-modal-stub"
                  >
                    <img :src="item.media.poster" class="tg-modal-stub-bg"/>
                    <div class="tg-modal-stub-content">

                      <h3 class="tg-modal-stub-title">{{ t('modalVideobig') }}</h3>
                      <a
                          :href="item.media.link"
                          target="_blank"
                          rel="noopener"
                          class="tg-modal-stub-btn"
                      >
                        {{ t('modalVideobigSee') }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Кнопки навигации (скрыты на мобильных благодаря d-none d-md-flex) -->
              <div class="tg-modal-nav d-none d-md-flex" v-if="flatMedia.length > 1">
                <button class="tg-nav-btn left" @click.stop="prevMedia" :disabled="flatIndex === 0">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <button class="tg-nav-btn right" @click.stop="nextMedia" :disabled="flatIndex === flatMedia.length - 1">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>

              <div v-if="flatMedia.length > 1" class="tg-modal-counter">
                {{ flatIndex + 1 }} / {{ flatMedia.length }}
              </div>
            </div>

            <!-- Инфо о посте -->
            <div class="tg-modal-info">
              <div class="tg-modal-header">
                <div class="tg-avatar-circle tg-avatar-sm">
                  <img
                      v-if="channelAvatar"
                      :src="channelAvatar"
                      alt="channelAvatar"
                      class="tg-avatar-img"
                      @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
                  />
                  <svg v-else viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path
                        d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.03-1.82 8.57c-.13.6-.5.75-.99.46l-2.78-2.04-1.34 1.29c-.15.15-.27.27-.56.27l.2-2.84 5.18-4.68c.22-.2-.05-.3-.35-.12L9.04 12.8l-2.75-.86c-.6-.19-.61-.6.12-.89l10.76-4.15c.5-.19.93.12.77.93z"/>
                  </svg>
                </div>
                <div>
                  <div class="fw-bold text-white">{{ modalPost.authorName || CHANNEL }}</div>
                  <div class="tg-modal-date small text-secondary">{{ modalPost.date }}</div>
                </div>
              </div>

              <div v-if="modalPost.quotedText" class="tg-msg-reply mb-2" @click="scrollToQuoted(modalPost)">
                <div class="tg-reply-bar"></div>
                <div class="tg-reply-content">
                  <div class="tg-reply-title">quote</div>
                  <div class="tg-reply-text">{{ modalPost.quotedText }}</div>
                </div>
              </div>

              <div class="tg-modal-text" v-html="linkify(modalPost.fullText)"></div>

              <div class="tg-modal-footer">
                <a :href="modalPost.link" target="_blank" rel="noopener" class="social-btn btn-to-tg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
                    <path
                        d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.03-1.82 8.57c-.13.6-.5.75-.99.46l-2.78-2.04-1.34 1.29c-.15.15-.27.27-.56.27l.2-2.84 5.18-4.68c.22-.2-.05-.3-.35-.12L9.04 12.8l-2.75-.86c-.6-.19-.61-.6.12-.89l10.76-4.15c.5-.19.93.12.77.93z"/>
                  </svg>
                  {{ t("toPost") || 'Открыть в Telegram' }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, inject, watch, computed, nextTick} from 'vue';

const t = inject('t');
const currentLang = inject('currentLang', ref('en'));
const CHANNEL = 'ishwacha';
const PROXY_BASE = 'https://social-proxy.gbaranovskaa76.workers.dev/?url=';
const POSTS_LIMIT = 10;
const posts = ref([]);
const channelAvatar = ref('')
const loading = ref(true);
const error = ref(false);

const modalOpen = ref(false);
const modalPost = ref(null);      // пост, медиа из которого открыто
const flatIndex = ref(0);         // индекс в плоском списке всех медиа
const activeVideoRef = ref(null)

const postRefs = ref([]); // было: ref({})
// refs article-элементов
const chatContainer = ref(null);  // ref контейнера чата
const highlightedPostId = ref(null);
let highlightTimer = null;

// ═══ Плоский список всех медиа из всех постов (для перелистывания между постами) ═══
const flatMedia = computed(() => {
  const list = [];
  posts.value.forEach((post) => {
    if (post.media && post.media.length) {
      post.media.forEach((media, mediaIdx) => {
        list.push({post, media, mediaIdx});
      });
    }
  });
  return list;
});

const currentMedia = computed(() => {
  const entry = flatMedia.value[flatIndex.value];
  return entry ? entry.media : null;
});


// ═══ Состояние перетаскивания (drag-and-drop) ═══
const isDragging = ref(false);
const dragX = ref(0);
const dragY = ref(0);
let startX = 0;
let startY = 0;
let isVertical = false;

function onTouchStart(e) {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  isDragging.value = true;
  dragX.value = 0;
  dragY.value = 0;
  isVertical = false;
}

function onTouchMove(e) {
  if (!isDragging.value) return;

  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  const diffX = currentX - startX;
  const diffY = currentY - startY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Горизонтальный свайп (перелистывание)
    isVertical = false;
    dragX.value = diffX;
    e.preventDefault(); // Блокируем скролл страницы только при горизонтальном движении
  } else {
    // Вертикальный свайп (закрытие модалки)
    isVertical = true;
    if (diffY > 0) {
      dragY.value = diffY;
      e.preventDefault(); // Блокируем скролл страницы при свайпе вниз для закрытия
    }
  }
}

function onTouchEnd() {
  if (!isDragging.value) return
  isDragging.value = false

  const thresholdX = 50
  const thresholdY = 80

  if (!isVertical) {
    // ─── Горизонтальный свайп ───
    if (dragX.value < -thresholdX && flatIndex.value < flatMedia.value.length - 1) {
      flatIndex.value++
    } else if (dragX.value > thresholdX && flatIndex.value > 0) {
      flatIndex.value--
    }
    dragX.value = 0
    dragY.value = 0     // ⚠️ на всякий случай, если что-то накопилось
  } else {
    // ─── Вертикальный свайп ───
    if (dragY.value > thresholdY) {
      closeModal()
    }
    // ⚠️ сбрасываем dragY ВСЕГДА — и после closeModal, и после возврата
    dragY.value = 0
    dragX.value = 0
  }
}

// ═══ Навигация для кнопок на ПК ═══
function nextMedia() {
  if (flatIndex.value < flatMedia.value.length - 1) {
    flatIndex.value++;
  }
}

function prevMedia() {
  if (flatIndex.value > 0) {
    flatIndex.value--;
  }
}

watch(flatIndex, async (newIdx) => {
  const entry = flatMedia.value[newIdx]
  if (entry && entry.post) modalPost.value = entry.post

  await nextTick()

  // Пауза всех, кроме активного
  document.querySelectorAll('.tg-modal-video').forEach(v => {
    if (v !== activeVideoRef.value) {
      v.pause()
    }
  })

  // Запуск активного
  const v = activeVideoRef.value
  if (v) {
    v.muted = true
    try {
      await v.play()
    } catch (e) {
      console.log('Autoplay blocked:', e.message)
    }
  }
})

// ═══ Telegram-style media-grid классы ═══
function mediaGridClass(count) {
  if (count <= 0) return '';
  if (count === 1) return 'tg-grid-1';
  if (count === 2) return 'tg-grid-2';
  if (count === 3) return 'tg-grid-3';
  if (count === 4) return 'tg-grid-4';
  if (count === 5) return 'tg-grid-5';
  if (count === 6) return 'tg-grid-6';
  if (count === 7) return 'tg-grid-7';
  if (count === 8) return 'tg-grid-8';
  if (count === 9) return 'tg-grid-9';
  return 'tg-grid-many';
}

function visibleMediaCount(count) {
  // Показываем все до 9, а на 10-м месте показываем "+N", если их больше 9
  // (или можно показывать все 10, тогда верни просто count)
  return count > 9 ? 9 : count;
}

function isHiddenOverflow(count, idx) {
  // Показываем оверлей "+N" только на 9-м элементе (индекс 8), если всего элементов > 9
  return count > 9 && idx === 8;
}

// ═══ Парсинг постов ═══
async function fetchTelegram() {
  const targetUrl = `https://t.me/s/${CHANNEL}`;
  const urlsToTry = [targetUrl, `${PROXY_BASE}${encodeURIComponent(targetUrl)}`];
  // Аватар канала (берём со страницы превью)

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
  const avatarImg = doc.querySelector('.tgme_page_photo img, .tgme_header img')
  const channelAvatarUrl = avatarImg?.getAttribute('src') || ''
  const messages = doc.querySelectorAll('.tgme_widget_message_wrap');

  const parsed = [];
  messages.forEach(wrap => {
    const msg = wrap.querySelector('.tgme_widget_message');
    if (!msg) return;
    if ((msg.getAttribute('class') || '').includes('service')) return;

    const authorEl = msg.querySelector('.tgme_widget_message_author') ||
        msg.querySelector('.tgme_widget_message_forwarded_from .tgme_widget_message_author') ||
        doc.querySelector('.tgme_page_title a');

    const authorName = authorEl?.textContent?.trim() || CHANNEL;

    let authorHref = authorEl?.href || `https://t.me/${CHANNEL}`;
    // Если ссылка относительная (например, "/iwaer_shitpost"), делаем её абсолютной
    if (authorHref.startsWith('/')) {
      authorHref = `https://t.me${authorHref}`;
    }

    // ID сообщения (data-post)
    const postId = msg.getAttribute('data-post') || '';
    const allTexts = Array.from(msg.querySelectorAll('.tgme_widget_message_text'));
    const textEl = allTexts.filter(el => !el.closest('[class*="reply"]')).pop() || allTexts.pop();
    if (!textEl) return;

    // ⚠️ ВАЖНО: используем innerHTML + замену <br>/<br /> на \n,
    // т.к. textContent теряет переносы строк (отсюда "идеяХорнет" без переноса)
    let fullText = '';
    if (textEl.innerHTML) {
      fullText = textEl.innerHTML
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>\s*<p>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
    } else {
      fullText = (textEl.textContent || '').trim();
    }
    if (!fullText) return;

    // Цитата (reply)
    // Цитата (reply)
    let quotedText = '';
    let quotedPostId = '';

// В Telegram preview API reply — это САМА ссылка <a class="tgme_widget_message_reply">
    const replyLink = msg.querySelector('a.tgme_widget_message_reply, .tgme_widget_message_reply');
    if (replyLink) {
      // 1) Извлекаем ID цитируемого поста из href
      const href = replyLink.getAttribute('href') || '';
      // Ищем число перед ?, # или концом строки
      let match = href.match(/\/(\d+)(?=[?#/]|$)/);
      if (!match) {
        // Fallback: любое последнее число
        match = href.match(/(\d+)[^\d]*$/);
      }
      if (match) {
        quotedPostId = match[1];
      }

      // 2) Извлекаем автора
      const authorEl = replyLink.querySelector(
          '.tgme_widget_message_author, [class*="author"]'
      );
      const name = authorEl?.textContent?.trim() || '';

      // 3) Извлекаем текст цитаты через innerHTML (сохраняем <br> как \n)
      const quoteEl = replyLink.querySelector('.tgme_widget_message_text');
      let quote = '';
      if (quoteEl && quoteEl.innerHTML) {
        quote = quoteEl.innerHTML
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
      } else {
        quote = (quoteEl?.textContent || '').trim();
      }

      quotedText = [name, quote].filter(Boolean).join('\n');
    }

    const linkEl = msg.querySelector('a.tgme_widget_message_date');
    const link = linkEl?.href || `https://t.me/${CHANNELLINK}`;

    const viewsEl = msg.querySelector('.tgme_widget_message_views');
    const views = viewsEl?.textContent?.trim() || '';

    // === СБОР МЕДИА ===
    // === СБОР МЕДИА (Обновленная логика для видео) ===
    const media = [];

    // 1. Обычные фото
    msg.querySelectorAll('.tgme_widget_message_photo_wrap').forEach(pw => {
      const style = pw.getAttribute('style') || '';
      const match = style.match(/url\(['"]?([^'")]+)['"]?\)/);
      if (match) {
        media.push({type: 'image', src: match[1], poster: match[1]});
      }
    });

    // 2. Видео (приоритетная проверка по наличию реальной ссылки)
    msg.querySelectorAll('.tgme_widget_message_video_player').forEach(vw => {
      const videoEl = vw.querySelector('video');

      // ШАГ 1: Пытаемся найти реальную ссылку на видеофайл
      let src = videoEl?.getAttribute('data-src') ||
          videoEl?.querySelector('source')?.getAttribute('src') ||
          videoEl?.getAttribute('src') || '';

      // Делаем ссылку абсолютной, если она относительная (начинается с /)
      if (src && src.startsWith('/')) {
        src = `https://t.me${src}`;
      }

      // ШАГ 2: Извлекаем визуальные данные (они есть у всех видео)
      const thumbEl = vw.querySelector('.tgme_widget_message_video_thumb');
      const style = thumbEl?.getAttribute('style') || '';
      const posterMatch = style.match(/url\(['"]?([^'")]+)['"]?\)/);
      const poster = posterMatch ? posterMatch[1] : '';

      const duration = vw.querySelector('.message_video_duration')?.textContent?.trim() || '';
      const link = vw.getAttribute('href') || `https://t.me/${CHANNEL}`;

      // ШАГ 3: Логика определения типа медиа
      if (src && !src.startsWith('blob:') && src.length > 10) {
        // ✅ ЕСТЬ ВАЛИДНАЯ ССЫЛКА: Это обычное воспроизводимое видео
        media.push({
          type: 'video',
          src,
          poster,
          duration,
          isRound: false
        });
      } else if (vw.classList.contains('not_supported') || vw.querySelector('.message_media_not_supported')) {
        media.push({
          type: 'video_stub',
          poster,
          duration,
          link,
          isRound: false
        });
      } else {
        // ⚠️ FALLBACK: Видео есть в DOM, но ссылки нет (редкий случай, пробуем embed)
        const embedUrl = link.includes('?') ? link + '&embed=1' : link + '?embed=1';
        media.push({
          type: 'iframe',
          src: embedUrl,
          poster,
          duration
        });
      }
    });

    // 3. Круглые видео (сторис) - аналогичная логика
    msg.querySelectorAll('.tgme_widget_message_round_video').forEach(rv => {
      const videoEl = rv.querySelector('video');
      const poster = videoEl?.getAttribute('poster') || rv.querySelector('img')?.src || '';
      let src = videoEl?.getAttribute('data-src') || videoEl?.getAttribute('src') || '';

      if (src && src.startsWith('/')) src = `https://t.me${src}`;

      if (src && !src.startsWith('blob:')) {
        media.push({type: 'video', src, poster, isRound: true});
      }
    });

    // 4. Внешние iframe (YouTube, Vimeo и т.д.)
    msg.querySelectorAll('iframe').forEach(iframe => {
      const src = iframe.src || iframe.getAttribute('src') || '';
      if (src && (src.includes('youtube') || src.includes('youtu.be') || src.includes('vimeo') || src.includes('embed=1'))) {
        media.push({type: 'iframe', src, poster: ''});
      }
    });

    const timeEl = msg.querySelector('time[datetime]');
    const isoDate = timeEl?.getAttribute('datetime') || '';

    parsed.push({
      id: postId,
      authorName: authorName,       // <--- ДОБАВЛЕНО
      authorLink: authorHref,       // <--- ДОБАВЛЕНО
      title: fullText.substring(0, 60) + (fullText.length > 60 ? '...' : ''),
      fullText,
      originalText: fullText,
      quotedText,
      originalQuoted: quotedText,
      quotedPostId, // для скролла к цитируемому сообщению
      link,
      media,
      images: media.filter(m => m.type === 'image').map(m => m.src),
      views,
      time: formatTime(isoDate),
      date: formatDate(isoDate),
      timestamp: isoDate ? new Date(isoDate).getTime() : 0,
    });
  });


  return {
    posts: parsed.sort((a, b) => b.timestamp - a.timestamp).slice(0, POSTS_LIMIT),
    channelAvatar: channelAvatarUrl
  }

}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

function linkify(text) {
  if (!text) return '';
  const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  const withLinks = escaped.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener" class="tg-inline-link" onclick="event.stopPropagation()">$1</a>'
  );
  const withMentions = withLinks.replace(
      /@(\w+)/g,
      '<a href="https://t.me/$1" target="_blank" rel="noopener" class="tg-mention" onclick="event.stopPropagation()">@$1</a>'
  );
  return withMentions.replace(/\n/g, '<br>');
}

function formatTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
  } catch {
    return '';
  }
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

function formatViews(v) {
  if (!v) return '';
  const s = v.replace(/\s/g, '');
  const n = parseFloat(s);
  if (isNaN(n)) return v;
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return String(n);
}

// ═══ Переводы ═══
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  return h.toString(36);
}

async function fetchJsonVia(url) {
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
  const key = `tgtr_${tl}_${hashStr(text)}`;
  try {
    const cached = localStorage.getItem(key);
    if (cached) return cached;
  } catch {
  }

  let result = null;
  const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  const gData = await fetchJsonVia(gUrl);
  if (gData && Array.isArray(gData[0])) {
    result = gData[0].map(s => s[0]).join('');
  }

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
    if (!post.originalText) post.originalText = post.fullText || '';
    if (lang === 'ru') {
      post.fullText = post.originalText;
      post.quotedText = post.originalQuoted || '';
      post.translated = false;
    } else {
      post.fullText = await translateText(post.originalText, lang);
      if (post.originalQuoted) post.quotedText = await translateText(post.originalQuoted, lang);
      post.translated = post.fullText !== post.originalText;
    }
  }
}

watch(currentLang, () => applyTranslations());

// ═══ Модалка (только по клику на медиа) ═══
function openMedia(post, idx) {
  // Находим глобальный индекс в flatMedia
  const target = flatMedia.value.findIndex(
      entry => entry.post === post && entry.mediaIdx === idx
  );
  if (target === -1) return;
  flatIndex.value = target;
  modalPost.value = post;
  modalOpen.value = true;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOpen.value = false;
  modalPost.value = null;
  document.body.style.overflow = '';
}


// ═══ Скролл к цитируемому сообщению с подсветкой ═══
function scrollToQuoted(post) {
  console.log('[scrollToQuoted] start', post.id, 'quotedPostId =', post.quotedPostId);

  if (!post.quotedPostId) {
    console.log('[scrollToQuoted] exit: no quotedPostId');
    return;
  }

  const targetPost = posts.value.find(p => {
    if (!p.id) return false;
    // p.id = "ishwacha/413", quotedPostId = "413"
    return p.id.endsWith(post.quotedPostId) || p.id === post.quotedPostId;
  });

  if (!targetPost) {
    console.log(
        '[scrollToQuoted] targetPost not found in loaded posts. ' +
        'Opening original link in new tab. Available ids:',
        posts.value.map(p => p.id)
    );
    // Fallback: открываем цитируемый пост напрямую в Telegram
    window.open(`https://t.me/${CHANNELLINK}/${post.quotedPostId}`, '_blank', 'noopener');
    return;
  }

  const idx = posts.value.indexOf(targetPost);
  if (idx === -1) return;

  const el = postRefs.value[idx];
  console.log('[scrollToQuoted] target idx =', idx, 'el =', el);

  if (!el) {
    console.log('[scrollToQuoted] exit: el is null');
    return;
  }

  if (modalOpen.value) {
    console.log('[scrollToQuoted] closing modal');
    closeModal();

  }

  if (chatContainer.value) {
    const containerRect = chatContainer.value.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const targetScroll =
        chatContainer.value.scrollTop + (elRect.top - containerRect.top) - 40;

    console.log('[scrollToQuoted] scrolling to', targetScroll);
    chatContainer.value.scrollTo({top: targetScroll, behavior: 'smooth'});
  } else {
    el.scrollIntoView({behavior: 'smooth', block: 'center'});
  }

  highlightedPostId.value = targetPost.id;
  if (highlightTimer) clearTimeout(highlightTimer);
  highlightTimer = setTimeout(() => {
    highlightedPostId.value = null;
  }, 2500);
}

// ═══ Обработка Esc для закрытия модалки ═══
function handleKeydown(e) {
  if (!modalOpen.value) return;
  if (e.key === 'Escape') {
    closeModal();
  } else if (e.key === 'ArrowRight') {
    nextMedia();
  } else if (e.key === 'ArrowLeft') {
    prevMedia();
  }
}

// ═══ Загрузка ═══
async function loadPosts() {
  loading.value = true;
  error.value = false;
  postRefs.value = [];
  try {
    const result = await fetchTelegram()
    posts.value = result.posts
    channelAvatar.value = result.channelAvatar
    posts.value.forEach(p => {
      p.originalText = p.fullText;
      p.originalQuoted = p.quotedText || '';
    });
    await applyTranslations();
    if (posts.value.length === 0) error.value = true;
  } catch (e) {
    console.error('Telegram fetch error:', e);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

function retryLoad() {
  loadPosts();
}

onMounted(() => {
  loadPosts();
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  if (highlightTimer) clearTimeout(highlightTimer);
});

</script>

<style scoped>
/* ═══════════════════════════════════════════════
   TELEGRAM-STYLE VERTICAL CHAT
   ═══════════════════════════════════════════════ */

#telegram-vertical {
  flex: 1 1 auto;
  position: relative;
  width: 100%;
}

.tg-chat {
  max-height: 72vh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: 12px 8px 20px;
  background: radial-gradient(ellipse at top, rgba(34, 158, 217, 0.05), transparent 60%),
  linear-gradient(180deg, #0e1621 0%, #17212b 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 2px;
  scroll-behavior: smooth;
}

.tg-chat::-webkit-scrollbar {
  width: 6px;
}

.tg-chat::-webkit-scrollbar-track {
  background: transparent;
}

.tg-chat::-webkit-scrollbar-thumb {
  background: rgba(34, 158, 217, 0.3);
  border-radius: 3px;
}

.tg-chat::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 158, 217, 0.5);
}

/* ═══ Сообщение (bubble) ═══ */
.tg-msg {
  display: flex;
  padding: 2px 4px;
  flex-shrink: 0;
}

.tg-msg--incoming {
  justify-content: flex-start;
}

.tg-msg-bubble {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: min(85%, 480px);
  animation: tg-fade-in 0.3s ease;
}

@keyframes tg-fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tg-msg-avatar {
  flex-shrink: 0;
  padding-top: 4px;
}

.tg-avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #229ED9, #1976a8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 2px 8px rgba(34, 158, 217, 0.3);
  overflow: hidden; /* чтобы img не вылезал */

}

.tg-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.tg-avatar-sm {
  width: 28px;
  height: 28px;
}

.tg-msg-body {
  position: relative;
  background: #182533;
  border-radius: 4px 12px 12px 12px;
  padding: 6px 10px 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  max-width: 100%;
  overflow: hidden;
  transition: background 0.15s ease, box-shadow 0.3s ease;
}

/* ✨ Подсветка при скролле к цитируемому сообщению */
.tg-msg--highlight .tg-msg-body {
  background: #23435f;
  box-shadow: 0 0 0 2px rgba(34, 158, 217, 0.55),
  0 0 24px rgba(34, 158, 217, 0.35);
  animation: tg-highlight-pulse 2.5s ease;
}

@keyframes tg-highlight-pulse {
  0% {
    background: #2b5a80;
    box-shadow: 0 0 0 2px rgba(34, 158, 217, 0.9), 0 0 32px rgba(34, 158, 217, 0.6);
  }
  50% {
    background: #23435f;
    box-shadow: 0 0 0 2px rgba(34, 158, 217, 0.55), 0 0 24px rgba(34, 158, 217, 0.35);
  }
  100% {
    background: #182533;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
}

.tg-msg-bubble:hover .tg-msg-body {
  background: #1c2c3d;
}

.tg-msg--highlight .tg-msg-bubble:hover .tg-msg-body {
  background: #23435f;
}


.tg-msg-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}

.tg-channel-name {
  color: #229ED9;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.15s;
}

.tg-channel-name:hover {
  color: #4ab3e3;
  text-decoration: underline;
}

.tg-translated-badge {
  font-size: 10px;
  color: #708499;
  background: rgba(255, 255, 255, 0.05);
  padding: 1px 6px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Цитата — теперь с явным cursor: pointer и более заметным ховером */
.tg-msg-reply {
  background: rgba(34, 158, 217, 0.08);
  border-radius: 6px;
  padding: 4px 8px;
  margin-bottom: 6px;
  display: flex;
  gap: 8px;
  align-items: stretch;
  cursor: pointer;
  transition: background 0.15s;
}

.tg-msg-reply:hover {
  background: rgba(34, 158, 217, 0.2);
}

.tg-reply-bar {
  width: 3px;
  background: #229ED9;
  border-radius: 2px;
  flex-shrink: 0;
}

.tg-reply-content {
  flex: 1;
  min-width: 0;
}

.tg-reply-title {
  color: #229ED9;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 1px;
}

.tg-reply-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.tg-msg-text {
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
  white-space: pre-wrap;
  margin-bottom: 2px;
}

.tg-msg-text.has-media {
  padding-top: 6px;
}

.tg-inline-link {
  color: #229ED9;
  text-decoration: none;
  word-break: break-all;
}

.tg-inline-link:hover {
  text-decoration: underline;
}

.tg-mention {
  color: #229ED9;
  text-decoration: none;
  font-weight: 500;
}

.tg-mention:hover {
  text-decoration: underline;
}

.tg-msg-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  float: right;
  margin-top: 2px;
  margin-left: 8px;
  padding-top: 2px;
  shape-outside: margin-box;
}

.tg-meta-views {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #708499;
}

.tg-meta-time {
  font-size: 11px;
  color: #708499;
  font-weight: 500;
}

.tg-check-mark {
  color: #4fae4e;
  margin-left: 2px;
}

/* ═══ ЗАГЛУШКА В СЕТКЕ ПОСТОВ ═══ */
.tg-media-stub {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  background: #0e1621;
}

.tg-media-stub .tg-media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.6) blur(1px); /* Затемняем и размываем превью */
  transition: filter 0.3s ease, transform 0.3s ease;
}

.tg-media-stub:hover .tg-media-img {
  filter: brightness(0.8) blur(0px);
  transform: scale(1.05);
}

.tg-stub-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  pointer-events: none;
}


.tg-stub-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

/* ═══ ЗАГЛУШКА В МОДАЛКЕ ═══ */
.tg-modal-stub {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0e1621;
  overflow: hidden;
}

.tg-modal-stub-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.3) blur(4px);
}

.tg-modal-stub-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px;
  max-width: 400px;
}


.tg-modal-stub-title {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
}


.tg-modal-stub-btn {
  display: inline-block;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  transition: all .2s ease;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.9);
  padding: 10px 20px 9px;
  margin-top: 12px;
}

.tg-modal-stub-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(34, 158, 217, 0.1);
}

/* ═══════════════════════════════════════════════
   MEDIA GRID
   ═══════════════════════════════════════════════ */
.tg-media-grid {
  display: grid;
  gap: 2px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 4px;
  max-width: 100%;
  width: 100%;
}

.tg-media-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: #0e1621;
}

.tg-media-item video.tg-media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none; /* Клики проходят сквозь видео к родителю .tg-media-item */
  background: #0e1621; /* Темный фон пока грузится метаданные */
}

.tg-media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.tg-msg-bubble:hover .tg-media-img {
  filter: brightness(1.05);
}

/* ═══════════════════════════════════════════════
   TELEGRAM MEDIA GRIDS (1 to 10 items)
   ═══════════════════════════════════════════════ */
.tg-media-grid {
  display: grid;
  gap: 2px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 4px;
  max-width: 100%;
  width: 100%;
  grid-auto-flow: dense; /* Заполняет дырки в сетке автоматически */
}

/* 1 элемент: Полная ширина, адаптивная высота */
.tg-grid-1 {
  grid-template-columns: 1fr;
  grid-template-rows: minmax(200px, 300px);
}

/* 2 элемента: 50/50 */
.tg-grid-2 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 200px;
}

/* 3 элемента: 1 большое слева, 2 маленьких справа */
.tg-grid-3 {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  height: 240px;
}

.tg-grid-3 .tg-media-item:nth-child(1) {
  grid-column: 1;
  grid-row: 1 / 3;
}

/* 4 элемента: Ровная сетка 2x2 */
.tg-grid-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  height: 240px;
}

/* 5 элементов: 1 большое слева, 4 маленьких справа (2x2) */
.tg-grid-5 {
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  height: 260px;
}

.tg-grid-5 .tg-media-item:nth-child(1) {
  grid-column: 1;
  grid-row: 1 / 3;
}

/* 6 элементов: Ровная сетка 3x2 */
.tg-grid-6 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr 1fr;
  height: 240px;
}

.tg-grid-7 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1.4fr 1fr 1fr;
  height: 300px;
}

/* Большое — на всю ширину верхнего ряда */
.tg-grid-7 .tg-media-item:nth-child(1) {
  grid-column: 1 / 4;
  grid-row: 1;
}

/* 8 элементов: Ровная сетка 4x2 */
.tg-grid-8 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 1fr 1fr;
  height: 240px;
}

/* 9 элементов: Ровная сетка 3x3 */
.tg-grid-9 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  height: 280px;
}

/* 10 элементов: 1 большое сверху-слева (2x2), остальные 9 заполняют пространство */
.tg-grid-10 {
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: repeat(4, 1fr);
  height: 320px;
}

.tg-grid-10 .tg-media-item:nth-child(1) {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
}

/* Fallback для >10 (на всякий случай) */
.tg-grid-many {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  height: 280px;
}

.tg-play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  transition: background 0.2s;
  pointer-events: none;
}

.tg-media-item:hover .tg-play-overlay {
  background: rgba(0, 0, 0, 0.4);
}

.tg-play-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s;
}

.tg-media-item:hover .tg-play-circle {
  transform: scale(1.08);
}

.tg-media-more {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(2px);
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  pointer-events: none;
}

.tg-msg--system {
  justify-content: center;
  margin-top: 12px;
  text-decoration: none;
}

.tg-system-card {
  background: linear-gradient(135deg, rgba(34, 158, 217, 0.18), rgba(34, 158, 217, 0.06));
  border: 1px solid rgba(34, 158, 217, 0.28);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  max-width: 380px;
  transition: all 0.2s;
}

.tg-system-card:hover {
  transform: translateY(-2px);
  border-color: rgba(34, 158, 217, 0.5);
  box-shadow: 0 8px 24px rgba(34, 158, 217, 0.2);
}

.tg-cta-icon {
  color: #229ED9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(34, 158, 217, 0.15);
  filter: drop-shadow(0 4px 12px rgba(34, 158, 217, 0.3));
}

/* ═══════════════════════════════════════════════
   МОДАЛКА
   ═══════════════════════════════════════════════ */
.tg-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 10, 15, 0.88);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: tg-modal-in 0.25s ease;
}

@keyframes tg-modal-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tg-modal-box {
  background: #17212b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  width: 100%;
  max-width: 820px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  animation: tg-modal-scale 0.25s ease;
}

@keyframes tg-modal-scale {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.tg-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.tg-modal-close:hover {
  background: rgba(224, 49, 49, 0.7);
}

.tg-modal-content {
  display: grid;
  height: 100%;
  overflow: hidden;
}

@media (max-width: 720px) {
  .tg-modal-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    overflow-y: auto;
  }
}

/* ═══════════════════════════════════════════════
   КАРУСЕЛЬ ("ПОЕЗД") МЕДИА
   ═══════════════════════════════════════════════ */
.tg-modal-media-viewport {
  position: relative;
  background: #0e1621;
  width: 100%;
  min-height: 300px;
  max-height: 70vh;
  overflow: hidden;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tg-modal-media-track {
  display: flex;
  height: 100%;
  width: 100%;
  /* Плавное "доезжание" до позиции при изменении flatIndex или сбросе dragX */
  transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  will-change: transform;
  user-select: none;
  -webkit-user-select: none;
}

/* Во время перетаскивания отключаем транзиции для мгновенного отклика на палец */
.tg-modal-media-viewport.is-dragging .tg-modal-media-track {
  transition: none !important;
}

.tg-modal-media-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;

  justify-content: center;
  overflow: hidden;
}

.tg-modal-img,
.tg-modal-video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  -webkit-user-drag: none; /* Запрет нативного перетаскивания картинки браузером */
  user-select: none;
}

.tg-modal-video {
  pointer-events: auto; /* Видео должно реагировать на клики для play/pause */
}

/* ═══════════════════════════════════════════════
   АНИМАЦИЯ ОТКРЫТИЯ/ЗАКРЫТИЯ МОДАЛКИ + СВАЙП ВНИЗ
   ═══════════════════════════════════════════════ */

.tg-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 10, 15, 0.88);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  /* Плавное появление/исчезновение фона */
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s ease;
}

.tg-modal-box {
  background: #17212b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  width: 100%;
  max-width: 820px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  /* Плавное масштабирование и сдвиг при открытии/закрытии */
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
  opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Отключаем транзиции во время свайпа для мгновенного отклика */
.tg-modal-overlay.is-dragging .tg-modal-box {
  transition: none !important;
}

/* ═══ Классы Vue Transition для модалки ═══ */

/* Начальное состояние при появлении (модалка снизу, прозрачная) */
.modal-fade-enter-from {
  opacity: 0;
}

.modal-fade-enter-from .tg-modal-box {
  transform: translateY(80px) scale(0.92);
  opacity: 0;
}

/* Конечное состояние при появлении (модалка на месте, видимая) */
.modal-fade-enter-to {
  opacity: 1;
}

.modal-fade-enter-to .tg-modal-box {
  transform: translateY(0) scale(1);
  opacity: 1;
}

/* Начальное состояние при закрытии (модалка на месте, видимая) */
.modal-fade-leave-from {
  opacity: 1;
}

.modal-fade-leave-from .tg-modal-box {
  transform: translateY(0) scale(1);
  opacity: 1;
}

/* Конечное состояние при закрытии (модалка уезжает вниз и исчезает) */
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-leave-to .tg-modal-box {
  transform: translateY(120px) scale(0.9);
  opacity: 0;
}

/* Активные фазы анимации (длительность и easing) */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-active .tg-modal-box,
.modal-fade-leave-active .tg-modal-box {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
  opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tg-modal-nav {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}

.tg-nav-btn {
  pointer-events: auto;
  width: 15%;
  height: 100%;
  border: none;
  outline: none;
  opacity: 0;
  color: #fff;
  cursor: pointer;
  display: flex;

  transition: background 0.15s, transform 0.15s;
}

.tg-nav-btn.left {

  align-items: center;
  justify-content: left;
  background: linear-gradient(90deg, rgba(0, 0, 10, 0.55), transparent);
}

.tg-nav-btn.right {
  align-items: center;
  justify-content: right;
  background: linear-gradient(270deg, rgba(0, 0, 10, 0.55), transparent);
}

.tg-nav-btn:hover:not(:disabled) {
  opacity: 1;
  transform: scale(1.1);
}

.tg-nav-btn:disabled {
  opacity: 0;
  cursor: not-allowed;
}

.tg-modal-counter {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.tg-modal-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.tg-modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.tg-modal-date {
  color: #708499;
}

.tg-modal-text {
  color: #fff;
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
  white-space: pre-wrap;
  flex: 1;
  overflow-y: auto;
  margin-bottom: 12px;
}

.tg-modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* ═══════════════════════════════════════════════
   СКЕЛЕТОНЫ
   ═══════════════════════════════════════════════ */
.skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
}

.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: tg-shimmer 1.5s infinite;
}

@keyframes tg-shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-header {
  width: 220px;
  height: 14px;
  margin-bottom: 8px;
}

.skeleton-img {
  width: 100%;
  height: 180px;
  border-radius: 10px;
  margin-bottom: 4px;
}

.skeleton-line {
  height: 12px;
}

/* ═══ СОСТОЯНИЕ ОШИБКИ ═══ */
.tg-error-state {
  height: 72vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #0e1621, #17212b);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 24px;
}

.tg-error-icon svg {
  width: 72px;
  height: auto;
  display: block;
  margin: 0 auto;
  filter: drop-shadow(0 6px 18px rgba(224, 49, 49, 0.35));
}

.tg-error-icon {
  animation: tg-error-float 2.5s ease-in-out infinite;
}

@keyframes tg-error-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* ═══ КНОПКИ ═══ */
.social-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  color: #fff;
  text-decoration: none;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.08);
}

.social-btn:hover {
  transform: translateY(-1px);
  color: #fff;
}

.btn-steam {
  background: linear-gradient(135deg, #2a475e, #1b2838);
}

.btn-steam:hover {
  background: linear-gradient(135deg, #3a5a75, #263c50);
  box-shadow: 0 6px 18px rgba(42, 71, 94, 0.4);
}

.btn-telegram {
  background: linear-gradient(135deg, #229ED9, #1976a8);
}

.btn-telegram:hover {
  background: linear-gradient(135deg, #3bb0e8, #229ED9);
  box-shadow: 0 6px 18px rgba(34, 158, 217, 0.4);
}

.btn-to-tg {
  background: linear-gradient(90deg, #229ED9, #1976a8);
}

.btn-to-tg:hover {
  background: linear-gradient(90deg, #3bb0e8, #229ED9);
  box-shadow: 0 6px 18px rgba(34, 158, 217, 0.4);
}

@media (max-width: 576px) {
  .tg-chat {
    max-height: none;
    flex: 1 1 auto;
    min-height: 0;
    padding: 8px 4px 16px;
  }

  .tg-msg-bubble {
    max-width: 92%;
  }

  .tg-avatar-circle {
    width: 32px;
    height: 32px;
  }

  .tg-play-circle {
    width: 48px;
    height: 48px;
  }

  /* Адаптивные высоты для мобильных */
  .tg-grid-1 {
    grid-template-rows: minmax(180px, 240px);
  }

  /* 2-4 элемента: компактная высота */
  .tg-grid-2, .tg-grid-3, .tg-grid-4, .tg-grid-6, .tg-grid-8 {
    height: 200px !important;
  }

  /* 5-7 элементов: чуть выше, чтобы не было слишком мелко */
  .tg-grid-5, .tg-grid-7 {
    height: 220px !important;
  }

  /* 9-10 элементов: на мобильном лучше сделать 2 колонки вместо 3, чтобы картинки были крупнее */
  .tg-grid-9, .tg-grid-10, .tg-grid-many {
    grid-template-columns: 1fr 1fr !important;
    grid-template-rows: repeat(auto-fill, minmax(100px, 1fr)) !important;
    height: auto !important;
    max-height: 400px; /* Ограничиваем общую высоту */
  }

  /* Если на мобильном в сетке 10 элементов первый был 2x2, сбрасываем это для 2-колоночного вида */
  .tg-grid-10 .tg-media-item:nth-child(1) {
    grid-column: 1 / 3 !important;
    grid-row: 1 / 2 !important;
  }
}
</style>