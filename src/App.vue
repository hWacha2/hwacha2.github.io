<script setup>
import {ref, onMounted, reactive, provide} from "vue";
import ModTile from './components/ModTile.vue';
import Star from './components/StarCanvas.vue';
import TelegramSlider from './components/TelegramSlider.vue';

// ===== i18n =====
const currentLang = ref('en');
const supportedLangs = ['en', 'ru'];


const translations = reactive({
  en: {
    autoTranslated: "Auto-translated" ,
    subtitle: "Artist meme maker, and a bit of a programmer...",
    socialTitle: "All social media:",
    supportSubtitle: "Support me:",
    lastWorks: "Latest posts on Telegram",
    postTg: "Post in Telegram",
    toPost: "Go to post →",
    openChannel: "Open channel →",
    clickHint: "click on the image to view",
    modsTitle: "Mods and projects",
    modsSubtitle: "Short descriptions and links",
    footer: "© 2026 hWacha — no rights for men",
    melonDesc: "Replaces the egg in the hands of Rennala with a melon.",
    watermelonDesc: "Replaces the egg in the hands of Rennala with a watermelon",
    frierenDesc: "Sliders settings for Frieren character from anime \"Frieren beyond journey's end\".",
    dieAloneDesc: "This mod adds the song \"Die Alone\" by Zetsubo Extreme 7★",
    art1: "Such a silly",
    art2: "Ah yes. Me. My girlfriend. And her four foot tall Flea.",
    art3: "mikuuuu",
    art4: "Shakra is a soft pillow"
  },
  ru: {
    autoTranslated: "Переведено автоматически",
    subtitle: "Художник мемодел, и немного программист...",
    socialTitle: "Все соц. сети:",
    supportSubtitle: "Поддержать меня:",
    lastWorks: "Последние посты в Telegram",
    postTg: "Пост в Telegram",
    toPost: "Перейти к посту →",
    openChannel: "Oткрыть канал →",
    clickHint: "тыкни на изображение для просмотра",
    modsTitle: "Моды и проекты",
    modsSubtitle: "Короткие описания и ссылки",
    footer: "© 2026 hWacha — у мужлан нет прав",
    melonDesc: "Заменяет яйцо в руках Ренналы на сочную дыньку",
    watermelonDesc: "Заменяет яйцо в руках Ренналы на арбуз лооол",
    frierenDesc: "Настройки ползунков для персонажа Фрирен из аниме «Провожающая в последний путь Фрирен».",
    dieAloneDesc: "Этот мод добавляет песню «Die Alone» от Zetsubo Extreme 7★",
    art1: "Такая глупышка",
    art2: "Ах да. Я. Моя девушка. И ее метровая блоха.",
    art3: "микуууу",
    art4: "Шакра мягкая подушка"
  }

});

const t = (key) => translations[currentLang.value]?.[key] || translations['en'][key] || key;

function detectLanguage() {
  const saved = localStorage.getItem('lang');
  if (saved && supportedLangs.includes(saved)) {
    return saved;
  }
  const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase().slice(0, 2);
  if (supportedLangs.includes(browserLang)) {
    return browserLang;
  }
  return 'en';
}

const avatarLoaded = ref(false);
const avatarImg = ref(null);

const coverLoaded = ref(false);

function toggleLang() {
  const idx = supportedLangs.indexOf(currentLang.value);
  currentLang.value = supportedLangs[(idx + 1) % supportedLangs.length];
  localStorage.setItem('lang', currentLang.value);
}

onMounted(() => {
  currentLang.value = detectLanguage();

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.getAttribute('data-img');
      const title = item.getAttribute('data-title') || '';
      document.getElementById('modalImg').src = img;
      document.getElementById('modalTitle').textContent = title;
    });
  });

  if (avatarImg.value?.complete && avatarImg.value?.naturalWidth > 0) {
    avatarLoaded.value = true;
  }
  const img = new Image();
  img.src = '/cover.png';
  img.onload = () => (coverLoaded.value = true);
  img.onerror = () => (coverLoaded.value = true); // не оставляем скелетон навечно
  // если картинка уже в кэше
  if (img.complete && img.naturalWidth > 0) {
    coverLoaded.value = true;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const imgs = document.querySelectorAll('.gallery-img');
  imgs.forEach(img => {
    img.loading = 'lazy';
  });
});

provide('t', t);
provide('currentLang', currentLang);
</script>

<template>
  <div class="containerAnim">
    <Star class="star-background"/>
  </div>


  <!-- Language Switcher -->
  <button class="lang-switcher" @click="toggleLang"
          :title="currentLang === 'en' ? 'Switch to Russian' : 'Переключить на English'">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
      <path
          d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7.02 7.02 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49a7 7 0 0 0 .656 2.5zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.02 7.02 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/>
    </svg>
    <span class="lang-label">{{ currentLang.toUpperCase() }}</span>
  </button>

  <main class="container contglass mt-4 p-4">
    <section class="hero-cover-layout">
      <!-- Скелетон, пока фон грузится -->
      <div v-if="!coverLoaded" class="hero-cover-skeleton"></div>
      <!-- Сам фон -->
      <div class="hero-cover-bg" :class="{ 'is-loaded': coverLoaded }"></div>

      <div class="hero-content-overlay">
        <div class="mt-2 mb-2">
          <div class="avatar-holder" :class="{ 'is-loaded': avatarLoaded }">
            <img
                ref="avatarImg"
                src="/ava.png"
                alt="avatar"
                class="avatar"
                @load="avatarLoaded = true"
                @error="avatarLoaded = true"
            />
          </div>
        </div>
        <h1 class="h3 mb-2">ishwacha</h1>
        <p class="fw-weight-bold mb-2">{{ t('subtitle') }}</p>
      </div>
    </section>
    <section>
      <div class="social-row justify-content-center">
        <h1 class="h5 mb-2">{{ t('supportSubtitle') }}</h1>
      </div>
      <div class="social-row justify-content-center">
        <a class="social-btn btn-boosty" href="https://boosty.to/ishwacha" aria-label="Boosty">
          <svg width="24" height="24" viewBox="38 40 170 215" fill="currentColor">
            <path d="M44.3,164.5L76.9,51.6H127l-10.1,35c-0.1,0.2-0.2,0.4-0.3,0.6L90,179.6h24.8c-10.4,25.9-18.5,46.2-24.3,60.9
            c-45.8-0.5-58.6-33.3-47.4-72.1 M90.7,240.6l60.4-86.9h-25.6l22.3-55.7c38.2,4,56.2,34.1,45.6,70.5
            c-11.3,39.1-57.1,72.1-101.7,72.1C91.3,240.6,91,240.6,90.7,240.6z"/>
          </svg>
          Boosty
        </a>

      </div>


    </section>
    <hr class="border-1 border-secondary my-3 "/>
    <section>
      <div class="social-row justify-content-center">
        <h1 class="h5 mb-2">{{ t('socialTitle') }}</h1>
      </div>
      <div class="social-row justify-content-center">
        <a class="social-btn btn-vk-depth" href="https://vk.com/ishwacha" aria-label="ВКонтакте">
          <svg width="24" height="24" viewBox="5.9 9.7 13.5 7.7" fill="currentColor">
            <path
                d="M12.6 17.4c-4.2 0-6.6-2.9-6.7-7.7h2.1c.1 3.5 1.6 5 2.8 5.3V9.7h2v3c1.2-.1 2.4-1.5 2.8-3h2c-.3 1.8-1.7 3.2-2.9 3.7 1.2.6 3 2 3.6 4h-2.2c-.5-1.5-1.8-2.7-3.3-2.9v2.9h-.2z"/>
          </svg>
          Вконтакте
        </a>
        <a class="social-btn btn-twitter" href="https://x.com/ishwacha" aria-label="Twitter">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path xmlns="http://www.w3.org/2000/svg"
                  d="m21.742 21.75-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714h-6.189l7.29 10.776-7.399 8.724h2.456l6.035-7.118 4.818 7.118h6.191zm-14.003-17.932 11.071 16.364h-2.447l-11.073-16.364h2.447z"/>
          </svg>
          Twitter
        </a>

        <a class="social-btn btn-telegram" href="https://t.me/ishwacha" aria-label="Telegram">
          <svg width="24" height="24" viewBox="1.16 5.79 44.14 36.58" fill="currentColor">
            <path xmlns="http://www.w3.org/2000/svg"
                  d="M41.4193 7.30899C41.4193 7.30899 45.3046 5.79399 44.9808 9.47328C44.8729 10.9883 43.9016 16.2908 43.1461 22.0262L40.5559 39.0159C40.5559 39.0159 40.3401 41.5048 38.3974 41.9377C36.4547 42.3705 33.5408 40.4227 33.0011 39.9898C32.5694 39.6652 24.9068 34.7955 22.2086 32.4148C21.4531 31.7655 20.5897 30.4669 22.3165 28.9519L33.6487 18.1305C34.9438 16.8319 36.2389 13.8019 30.8426 17.4812L15.7331 27.7616C15.7331 27.7616 14.0063 28.8437 10.7686 27.8698L3.75342 25.7055C3.75342 25.7055 1.16321 24.0823 5.58815 22.459C16.3807 17.3729 29.6555 12.1786 41.4193 7.30899Z"
                  fill="#fff"/>
          </svg>
          Telegram
        </a>

        <a class="social-btn btn-reddit" href="https://reddit.com/u/hWacha_wolf" aria-label="Reddit">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-reddit"
               viewBox="0 0 16 16">
            <path
                d="M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z"/>
            <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165"/>
          </svg>
          Reddit
        </a>

        <a class="social-btn btn-tiktok" href="https://tiktok.com/@ishwacha" aria-label="Tiktok">
          <svg width="24px" height="24px" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M8.45095 19.7926C8.60723 18.4987 9.1379 17.7743 10.1379 17.0317C11.5688 16.0259 13.3561 16.5948 13.3561 16.5948V13.2197C13.7907 13.2085 14.2254 13.2343 14.6551 13.2966V17.6401C14.6551 17.6401 12.8683 17.0712 11.4375 18.0775C10.438 18.8196 9.90623 19.5446 9.7505 20.8385C9.74562 21.5411 9.87747 22.4595 10.4847 23.2536C10.3345 23.1766 10.1815 23.0889 10.0256 22.9905C8.68807 22.0923 8.44444 20.7449 8.45095 19.7926ZM22.0352 6.97898C21.0509 5.90039 20.6786 4.81139 20.5441 4.04639H21.7823C21.7823 4.04639 21.5354 6.05224 23.3347 8.02482L23.3597 8.05134C22.8747 7.7463 22.43 7.38624 22.0352 6.97898ZM28 10.0369V14.293C28 14.293 26.42 14.2312 25.2507 13.9337C23.6179 13.5176 22.5685 12.8795 22.5685 12.8795C22.5685 12.8795 21.8436 12.4245 21.785 12.3928V21.1817C21.785 21.6711 21.651 22.8932 21.2424 23.9125C20.709 25.246 19.8859 26.1212 19.7345 26.3001C19.7345 26.3001 18.7334 27.4832 16.9672 28.28C15.3752 28.9987 13.9774 28.9805 13.5596 28.9987C13.5596 28.9987 11.1434 29.0944 8.96915 27.6814C8.49898 27.3699 8.06011 27.0172 7.6582 26.6277L7.66906 26.6355C9.84383 28.0485 12.2595 27.9528 12.2595 27.9528C12.6779 27.9346 14.0756 27.9528 15.6671 27.2341C17.4317 26.4374 18.4344 25.2543 18.4344 25.2543C18.5842 25.0754 19.4111 24.2001 19.9423 22.8662C20.3498 21.8474 20.4849 20.6247 20.4849 20.1354V11.3475C20.5435 11.3797 21.2679 11.8347 21.2679 11.8347C21.2679 11.8347 22.3179 12.4734 23.9506 12.8889C25.1204 13.1864 26.7 13.2483 26.7 13.2483V9.91314C27.2404 10.0343 27.7011 10.0671 28 10.0369Z"
                fill="#EE1D52"/>
            <path
                d="M26.7009 9.91314V13.2472C26.7009 13.2472 25.1213 13.1853 23.9515 12.8879C22.3188 12.4718 21.2688 11.8337 21.2688 11.8337C21.2688 11.8337 20.5444 11.3787 20.4858 11.3464V20.1364C20.4858 20.6258 20.3518 21.8484 19.9432 22.8672C19.4098 24.2012 18.5867 25.0764 18.4353 25.2553C18.4353 25.2553 17.4337 26.4384 15.668 27.2352C14.0765 27.9539 12.6788 27.9357 12.2604 27.9539C12.2604 27.9539 9.84473 28.0496 7.66995 26.6366L7.6591 26.6288C7.42949 26.4064 7.21336 26.1717 7.01177 25.9257C6.31777 25.0795 5.89237 24.0789 5.78547 23.7934C5.78529 23.7922 5.78529 23.791 5.78547 23.7898C5.61347 23.2937 5.25209 22.1022 5.30147 20.9482C5.38883 18.9122 6.10507 17.6625 6.29444 17.3494C6.79597 16.4957 7.44828 15.7318 8.22233 15.0919C8.90538 14.5396 9.6796 14.1002 10.5132 13.7917C11.4144 13.4295 12.3794 13.2353 13.3565 13.2197V16.5948C13.3565 16.5948 11.5691 16.028 10.1388 17.0317C9.13879 17.7743 8.60812 18.4987 8.45185 19.7926C8.44534 20.7449 8.68897 22.0923 10.0254 22.991C10.1813 23.0898 10.3343 23.1775 10.4845 23.2541C10.7179 23.5576 11.0021 23.8221 11.3255 24.0368C12.631 24.8632 13.7249 24.9209 15.1238 24.3842C16.0565 24.0254 16.7586 23.2167 17.0842 22.3206C17.2888 21.7611 17.2861 21.1978 17.2861 20.6154V4.04639H20.5417C20.6763 4.81139 21.0485 5.90039 22.0328 6.97898C22.4276 7.38624 22.8724 7.7463 23.3573 8.05134C23.5006 8.19955 24.2331 8.93231 25.1734 9.38216C25.6596 9.61469 26.1722 9.79285 26.7009 9.91314Z"
                fill="#000000"/>
            <path d="M4.48926 22.7568V22.7594L4.57004 22.9784C4.56076 22.9529 4.53074 22.8754 4.48926 22.7568Z"
                  fill="#69C9D0"/>
            <path
                d="M10.5128 13.7916C9.67919 14.1002 8.90498 14.5396 8.22192 15.0918C7.44763 15.7332 6.79548 16.4987 6.29458 17.354C6.10521 17.6661 5.38897 18.9168 5.30161 20.9528C5.25223 22.1068 5.61361 23.2983 5.78561 23.7944C5.78543 23.7956 5.78543 23.7968 5.78561 23.798C5.89413 24.081 6.31791 25.0815 7.01191 25.9303C7.2135 26.1763 7.42963 26.4111 7.65924 26.6334C6.92357 26.1457 6.26746 25.5562 5.71236 24.8839C5.02433 24.0451 4.60001 23.0549 4.48932 22.7626C4.48919 22.7605 4.48919 22.7584 4.48932 22.7564V22.7527C4.31677 22.2571 3.95431 21.0651 4.00477 19.9096C4.09213 17.8736 4.80838 16.6239 4.99775 16.3108C5.4985 15.4553 6.15067 14.6898 6.92509 14.0486C7.608 13.4961 8.38225 13.0567 9.21598 12.7484C9.73602 12.5416 10.2778 12.3891 10.8319 12.2934C11.6669 12.1537 12.5198 12.1415 13.3588 12.2575V13.2196C12.3808 13.2349 11.4148 13.4291 10.5128 13.7916Z"
                fill="#69C9D0"/>
            <path
                d="M20.5438 4.04635H17.2881V20.6159C17.2881 21.1983 17.2881 21.76 17.0863 22.3211C16.7575 23.2167 16.058 24.0253 15.1258 24.3842C13.7265 24.923 12.6326 24.8632 11.3276 24.0368C11.0036 23.823 10.7187 23.5594 10.4844 23.2567C11.5962 23.8251 12.5913 23.8152 13.8241 23.341C14.7558 22.9821 15.4563 22.1734 15.784 21.2774C15.9891 20.7178 15.9864 20.1546 15.9864 19.5726V3H20.4819C20.4819 3 20.4315 3.41188 20.5438 4.04635ZM26.7002 8.99104V9.9131C26.1725 9.79263 25.6609 9.61447 25.1755 9.38213C24.2352 8.93228 23.5026 8.19952 23.3594 8.0513C23.5256 8.1559 23.6981 8.25106 23.8759 8.33629C25.0192 8.88339 26.1451 9.04669 26.7002 8.99104Z"
                fill="#69C9D0"/>
          </svg>
          Tiktok
        </a>


        <a class="social-btn btn-steam" href="https://steamcommunity.com/id/ishwacha/" aria-label="Steam">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-steam"
               viewBox="0 0 16 16">
            <path
                d="M.329 10.333A8.01 8.01 0 0 0 7.99 16C12.414 16 16 12.418 16 8s-3.586-8-8.009-8A8.006 8.006 0 0 0 0 7.468l.003.006 4.304 1.769A2.2 2.2 0 0 1 5.62 8.88l1.96-2.844-.001-.04a3.046 3.046 0 0 1 3.042-3.043 3.046 3.046 0 0 1 3.042 3.043 3.047 3.047 0 0 1-3.111 3.044l-2.804 2a2.223 2.223 0 0 1-3.075 2.11 2.22 2.22 0 0 1-1.312-1.568L.33 10.333Z"/>
            <path
                d="M4.868 12.683a1.715 1.715 0 0 0 1.318-3.165 1.7 1.7 0 0 0-1.263-.02l1.023.424a1.261 1.261 0 1 1-.97 2.33l-.99-.41a1.7 1.7 0 0 0 .882.84Zm3.726-6.687a2.03 2.03 0 0 0 2.027 2.029 2.03 2.03 0 0 0 2.027-2.029 2.03 2.03 0 0 0-2.027-2.027 2.03 2.03 0 0 0-2.027 2.027m2.03-1.527a1.524 1.524 0 1 1-.002 3.048 1.524 1.524 0 0 1 .002-3.048"/>
          </svg>
          Steam
        </a>

        <a class="social-btn btn-nexus" href="https://www.nexusmods.com/profile/hWacha23" aria-label="Nexus Mods">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 162.688 162.5">
            <g id="g269">
              <g id="g271">
                <g id="g273">
                  <path
                      d="m 44.4,162.5 c -0.6,0 -1.3,0 -1.9,-0.1 -1.5,-0.2 -2.9,-0.5 -4.5,-1 -2.8,-0.9 -5.2,-2.2 -6.9,-3.2 -3.8,-2.2 -7.7,-4.9 -11.8,-8.3 -1.8,-1.5 -3.6,-3.1 -5.3,-4.7 l -1.4,-1.4 c -1,-0.9 -1.9,-1.9 -2.6,-3 -1.3,-2 -2.4,-4.6 -2.5,-8 -0.1,-1.1 -0.2,-2.2 -0.2,-3.4 0,-2.4 0.1,-5 0.5,-7.5 0.7,-5.2 2.4,-9.8 3.7,-13.3 0.1,-0.3 0.2,-0.6 0.3,-0.9 -0.4,-0.9 -0.7,-1.9 -1.1,-2.9 C 8.9,99.6 7.7,93.8 7.1,88 6.5,81.9 6.7,75.7 7.6,69.6 7.8,68.3 8,67 8.3,65.8 5.9,62.3 2.9,57.3 1,51.5 v -0.1 c -0.4,-1.2 -1.4,-4.2 -0.8,-8 0.2,-1.4 0.5,-2.8 1,-4.3 0.9,-2.8 2.2,-5.1 3.2,-6.8 2.2,-3.8 4.9,-7.6 8.2,-11.7 1.5,-1.8 3,-3.6 4.6,-5.2 L 18.6,14 c 0.7,-0.8 1.5,-1.5 2.4,-2.1 2,-1.5 4.8,-2.8 8.6,-2.9 1.2,-0.1 2.5,-0.2 3.8,-0.2 h 0.1 c 2.5,0 5.2,0.2 7.8,0.6 4,0.6 7.6,1.7 10.8,2.9 2.1,-0.9 4.3,-1.7 6.6,-2.5 5.4,-1.8 11.2,-3 17,-3.4 6.1,-0.5 12.3,-0.2 18.2,0.8 1.4,0.2 2.8,0.5 4.2,0.8 4.7,-3.2 9,-5.5 13.5,-6.9 h 0.1 c 1,-0.4 3.2,-1.1 6.1,-1.1 0.6,0 1.3,0 1.9,0.1 1.5,0.2 2.9,0.5 4.5,1 2.8,0.9 5.2,2.2 6.9,3.2 3.8,2.2 7.7,4.9 11.8,8.3 1.8,1.5 3.6,3.1 5.3,4.7 l 1.4,1.4 c 0.7,0.6 1.4,1.3 1.9,2.1 1.8,2.3 3.2,5.6 3.3,10.2 0.1,1.6 0.1,3.3 0,5 -0.2,3.7 -0.7,7.2 -1.6,10.4 -0.7,2.4 -1.5,4.8 -2.4,7.2 1.8,4.5 3.1,9.1 4,13.8 1.8,9.9 1.6,20.1 -0.6,29.9 1.3,1.9 2.5,3.7 3.5,5.5 1.7,3 3.1,6.1 4.1,9.3 0.4,1.2 1.3,4.2 0.7,8.2 -0.2,1.4 -0.6,2.7 -1.1,4.2 -1.8,5.1 -4.6,9.3 -7.1,12.8 -2.7,3.8 -5.8,7.5 -9,10.9 l -1.2,1.2 c -0.7,0.8 -1.5,1.5 -2.4,2.2 -2,1.5 -4.8,2.7 -8.6,2.9 -1.2,0.1 -2.5,0.2 -3.8,0.2 h -0.1 c -2.7,0 -5.4,-0.2 -8.2,-0.7 -4.5,-0.7 -8.5,-2.1 -12.1,-3.5 -1.9,0.8 -3.9,1.5 -5.8,2.1 -5.6,1.7 -11.5,2.8 -17.4,3.1 -6.1,0.4 -12.3,-0.1 -18.3,-1.2 -0.7,-0.1 -1.5,-0.3 -2.2,-0.4 -5.2,3.7 -9.8,6.1 -14.6,7.7 h -0.1 c -1,-0.1 -3.2,0.7 -6.1,0.7 z m -19.8,-28.4 10.6,3.7 c 0.9,-2.6 1,-5.4 0.4,-8 0,0.2 0,0.5 0.1,0.7 0,0.3 0.1,0.7 0.1,1.1 -0.1,-2 -0.8,-4.6 -2.6,-7 -0.7,-0.9 -1.5,-1.7 -2.4,-2.4 l 0.5,0.4 0.9,0.9 c -0.8,-0.8 -1.7,-1.6 -2.7,-2.3 z m 99.1,-4.7 c -0.8,0.8 -1.6,1.6 -2.3,2.7 l 11.9,4.6 v -11.1 c 0,0 0,0 0,0 -1.1,0 -2.2,0.1 -3.2,0.4 0.2,0 0.4,0 0.6,0 0.3,0 0.7,-0.1 1.1,-0.1 -1.8,0.1 -4.2,0.7 -6.4,2.1 -1.2,0.8 -2.2,1.7 -3.1,2.9 l 0.4,-0.5 z m -87.9,-2.6 c 0.5,0.4 1,0.8 1.5,1.3 2.6,2.2 5,3.9 7.2,5.2 1.4,-0.7 3,-1.7 4.7,-3 0.5,-0.3 0.9,-0.7 1.4,-1.1 0.3,-0.2 0.5,-0.5 0.8,-0.7 0.1,-0.1 0.3,-0.3 0.4,-0.4 l 6.2,-6.3 8.4,2.9 c 0.3,0.1 0.6,0.2 0.8,0.3 1.8,0.6 3.6,1 5.4,1.4 3.7,0.7 7.6,1 11.4,0.7 3.6,-0.2 7.3,-0.9 10.7,-1.9 1.7,-0.5 3.4,-1.1 5,-1.9 0.8,-0.3 1.6,-0.7 2.3,-1.1 2,-1 4.3,-1.6 6.6,-1.6 3.6,0 6.3,1.3 7.6,2 0.4,0.2 0.8,0.4 1.3,0.5 2.5,1 5.4,2.2 8,2.6 0.4,0.1 0.9,0.1 1.3,0.2 1.5,-1.7 2.9,-3.5 4.2,-5.3 0.8,-1.1 1.6,-2.2 2.3,-3.3 -0.1,-0.2 -0.2,-0.4 -0.4,-0.7 -0.7,-1.2 -1.5,-2.4 -2.5,-3.9 -0.3,-0.5 -0.7,-0.9 -1.1,-1.4 -0.2,-0.2 -0.3,-0.4 -0.5,-0.6 -4.1,-4 -5.5,-9.7 -3.6,-15.1 0.1,-0.3 0.2,-0.6 0.3,-0.8 2.3,-7.2 2.7,-14.9 1.4,-22.3 -0.7,-3.5 -1.7,-7 -3.2,-10.3 -0.1,-0.3 -0.3,-0.6 -0.4,-0.9 -3.3,-6.1 -1.9,-11.3 -0.7,-13.8 0.5,-1 0.9,-2.1 1.3,-3.1 0.8,-1.9 1.4,-3.9 2,-5.7 0.2,-0.9 0.4,-1.8 0.5,-2.9 -0.5,-0.4 -1,-0.8 -1.5,-1.3 -2.7,-2.2 -5,-3.9 -7.2,-5.2 -1.4,0.8 -3,1.8 -4.8,3 -0.5,0.4 -1,0.8 -1.5,1.2 -0.1,0.1 -0.3,0.2 -0.4,0.4 -2.7,2.6 -6.3,4 -10,4 -1.8,0 -3.5,-0.3 -5.2,-1 C 95.4,36.8 95,36.6 94.6,36.5 92.8,36 91,35.5 89.1,35.2 85.4,34.6 81.5,34.4 77.7,34.7 c -3.6,0.3 -7.2,1 -10.6,2.1 -1.7,0.5 -3.3,1.2 -4.9,1.9 -0.8,0.3 -1.5,0.7 -2.3,1.1 L 59.5,40 c -2.1,1.2 -4.6,1.8 -7,1.8 -2.2,0 -4.4,-0.5 -6.5,-1.5 -0.5,-0.2 -0.9,-0.4 -1.4,-0.6 -2.4,-1 -5.3,-2.1 -7.8,-2.4 -0.4,-0.1 -0.8,-0.1 -1.1,-0.2 -0.4,0.5 -0.8,1 -1.2,1.4 -2.2,2.7 -3.9,5 -5.2,7.3 0.7,1.4 1.7,2.9 2.9,4.7 0.3,0.5 0.7,1 1.1,1.4 0.2,0.3 0.5,0.5 0.7,0.8 l 5.8,6.1 -2.5,8 c -0.2,0.5 -0.3,1 -0.5,1.5 -0.5,1.8 -0.9,3.7 -1.2,5.6 -0.6,3.8 -0.7,7.6 -0.3,11.5 0.3,3.6 1.1,7.2 2.3,10.6 0.6,1.7 1.3,3.3 2,4.9 0.1,0.2 0.2,0.4 0.3,0.6 2.1,4.3 2.1,9.1 -0.1,13.4 -0.2,0.4 -0.4,0.8 -0.5,1.2 -0.4,1 -0.9,2 -1.3,3 -0.8,2.2 -1.8,4.8 -2.1,7.1 0,0.1 -0.1,0.4 -0.1,0.6 z m 94.1,-88 c 0.8,0.8 1.7,1.6 2.8,2.4 L 137.6,28.3 127,24.6 c -0.9,2.6 -1,5.4 -0.4,8 0,-0.1 0,-0.2 0,-0.3 0,-0.8 0,-1.3 v -0.1 c 0,1.5 0.5,4 2.1,6.4 0.8,1.1 1.7,2.1 2.8,3 L 131,39.9 Z M 29.3,26.3 v 11.1 c 1.1,0 2.2,-0.1 3.2,-0.4 -0.2,0 -0.4,0 -0.6,0 -0.3,0 -0.7,0.1 -1.1,0.1 1.8,-0.1 4.2,-0.7 6.4,-2.1 1.2,-0.8 2.2,-1.7 3.1,-2.9 l -0.4,0.5 -0.9,1 c 0.8,-0.8 1.6,-1.7 2.3,-2.7 z"
                      id="path276"></path>
                </g>
              </g>
              <g id="g278">
                <g id="g280">
                  <g id="g282">
                    <path style="fill:#faa431"
                          d="M 56.3,88.4 57,116.7 50,111 c -7.8,12.7 -10.3,25 -6.6,34.1 l 1.3,3.2 -3.2,-1.4 c -7.3,-3.2 -13.9,-7.7 -19.4,-13.5 l -0.3,-0.3 -0.1,-0.5 c -0.4,-3.5 -0.2,-7.3 0.7,-11.2 v -0.1 c 1.3,-4.9 3.2,-9.8 5.6,-14.7 1.5,-3.1 3.3,-6.2 5.3,-9.2 l -6.1,-5 z"
                          id="path284"></path>
                  </g>
                </g>
                <g id="g286">
                  <g id="g288">
                    <path style="fill:#faa431"
                          d="m 105.9,74.1 -0.7,-28.3 7,5.7 c 7.8,-12.7 10.3,-25 6.6,-34.1 l -1.3,-3.2 3.2,1.4 c 7.3,3.2 13.9,7.7 19.4,13.5 l 0.3,0.3 0.1,0.5 c 0.4,3.5 0.2,7.3 -0.7,11.2 v 0.1 c -1.3,4.9 -3.2,9.8 -5.6,14.7 -1.5,3.1 -3.3,6.2 -5.3,9.2 l 6.1,5 z"
                          id="path290"></path>
                  </g>
                </g>
                <g id="g292">
                  <g id="g294">
                    <path style="fill:#faa431"
                          d="m 88.5,105.4 28.3,-0.7 -5.7,7 c 12.7,7.8 25,10.3 34.1,6.6 l 3.2,-1.3 -1.4,3.2 c -3.2,7.3 -7.7,13.9 -13.5,19.4 l -0.3,0.3 -0.5,0.1 c -3.5,0.4 -7.3,0.2 -11.2,-0.7 h -0.1 c -4.9,-1.3 -9.8,-3.2 -14.7,-5.6 -3.1,-1.5 -6.2,-3.3 -9.2,-5.3 l -5,6.1 z"
                          id="path296"></path>
                  </g>
                </g>
                <g id="g298">
                  <g id="g300">
                    <path style="fill:#faa431"
                          d="m 74.1,57.6 -28.3,0.7 5.7,-7 C 38.8,43.5 26.5,41 17.4,44.7 L 14.3,46 15.7,42.8 C 18.9,35.5 23.4,28.9 29.2,23.4 L 29.5,23.1 30,23 c 3.5,-0.4 7.3,-0.2 11.2,0.7 h 0.1 c 4.9,1.3 9.8,3.2 14.7,5.6 3.1,1.5 6.2,3.3 9.2,5.3 l 5,-6.1 z"
                          id="path302"></path>
                  </g>
                </g>
                <g id="g304">
                  <g id="g307">
                    <circle style="fill:#e6832b" cx="81.400002" cy="80.800003" r="60.5" id="circle309"></circle>
                  </g>
                </g>
                <g id="g311">
                  <path style="fill:#ffffff"
                        d="M 59.3,59.5 C 55.8,57.9 53.2,56.3 50.6,54.4 46.6,51.6 42.9,48.5 39.8,45.2 32.2,37.5 28.2,29.6 29.3,23.1 L 27,25.6 c -5.5,5.8 -12.8,16 -12.9,20.4 0.1,0.5 0.1,0.5 0.1,0.5 1,3.4 2.6,6.8 4.9,10.1 v 0.1 c 3,4.8 8.9,12.7 29.9,21.9 l -3.7,7 L 73.6,78 63.5,51.5 Z"
                        id="path314"></path>
                </g>
                <g id="g316">
                  <path style="fill:#ffffff"
                        d="m 103.3,103.5 c 3.5,1.6 6.1,3.2 8.7,5.1 4,2.8 7.7,5.9 10.8,9.2 7.6,7.7 11.6,15.6 10.5,22.1 l 2.3,-2.4 c 5.5,-5.8 12.8,-16 12.9,-20.4 -0.1,-0.5 -0.1,-0.5 -0.1,-0.5 -1,-3.4 -2.6,-6.8 -4.9,-10.1 v -0.1 c -3,-4.8 -8.9,-12.7 -29.9,-21.9 l 3.7,-7 -28.3,7.6 10.2,26.2 z"
                        id="path318"></path>
                </g>
                <g id="g320">
                  <path style="fill:#ffffff"
                        d="m 104,59.3 c 1.6,-3.5 3.2,-6.1 5.1,-8.7 2.8,-4 5.9,-7.7 9.2,-10.8 7.7,-7.6 15.6,-11.6 22.1,-10.5 L 138,27 c -5.8,-5.5 -16,-12.8 -20.4,-12.9 -0.5,0.1 -0.5,0.1 -0.5,0.1 -3.4,1 -6.8,2.6 -10.1,4.9 h -0.1 C 102.1,22.1 94.2,28 85,49 l -7,-3.7 7.6,28.3 26.4,-10 z"
                        id="path323"></path>
                </g>
                <g id="g325">
                  <path style="fill:#ffffff"
                        d="m 58.2,103.2 c -1.6,3.5 -3.2,6.1 -5.1,8.7 -2.8,4 -5.9,7.7 -9.2,10.8 -7.7,7.6 -15.6,11.6 -22.1,10.5 l 2.4,2.3 c 5.8,5.5 16,12.8 20.4,12.9 0.5,-0.1 0.5,-0.1 0.5,-0.1 3.4,-1 6.8,-2.6 10.1,-4.9 h 0.1 c 4.8,-3 12.7,-8.9 21.9,-29.9 l 7,3.7 -7.6,-28.3 -26.3,10 z"
                        id="path328"></path>
                </g>
              </g>
            </g>
          </svg>
          Nexus Mods
        </a>
      </div>
    </section>


  </main>


  <main class="container contglass mt-3 p-4">
    <!-- GALLERY -->
    <section id="gallery">
      <div class="d-flex justify-content-between align-items-center">
        <h2 class="h5 mb-0">{{ t("lastWorks") }}</h2>
        <a
            href="https://t.me/ishwacha"
            target="_blank"
            rel="noopener"
            class="text-secondary small text-decoration-none"
        >
          {{ t("openChannel") }}
        </a>
      </div>
      <TelegramSlider/>
    </section>


    <hr class="border-1 border-secondary my-5"/>

    <!-- MODS BLOCK -->
    <section id="mods" class="my-5">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h5 mb-0">{{ t('modsTitle') }}</h2>
        <small class="text-secondary" style="text-align: right; display: block;">{{ t('modsSubtitle') }}</small>
      </div>

      <div class="row g-3">
        <ModTile
            title="Melon"
            img="https://staticdelivery.nexusmods.com/mods/4333/images/thumbnails/8655/8655-1767871601-1709009517.jpg"
            link="https://www.nexusmods.com/eldenring/mods/8655"
            game="Elden Ring"
            category="Miscellaneous"
            uploaded="08 Jan 2026"
            :description="t('melonDesc')"
        />
        <ModTile
            title="Watermelon"
            img="https://staticdelivery.nexusmods.com/mods/4333/images/thumbnails/8416/8416-1753001294-597023354.png"
            link="https://www.nexusmods.com/eldenring/mods/8416"
            game="Elden Ring"
            category="Miscellaneous"
            uploaded="20 Jul 2026"
            :description="t('watermelonDesc')"
        />
        <ModTile
            title="Frieren - Female Character Preset"
            img="https://staticdelivery.nexusmods.com/mods/4333/images/thumbnails/5316/5316-1719562446-1270980075.png"
            link="https://www.nexusmods.com/eldenring/mods/5316"
            game="Elden Ring"
            category="Characters"
            uploaded="27 Jun 2024"
            :description="t('frierenDesc')"
        />
        <ModTile
            title="Die Alone - Zetsubou"
            img="https://images.gamebanana.com/img/ss/mods/68d74222a6bea.jpg"
            link="https://gamebanana.com/mods/623143"
            author=""
            authorAvatar=""
            game="Hatsune Miku: Project Diva Mega Mix"
            category="Custom Songs"
            uploaded="27 Sep 2025"
            :description="t('dieAloneDesc')"
        />
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <div class="small text">{{ t('footer') }}</div>
    </div>
  </footer>
</template>

<style>
:root {
  --bs-body-color: #e9eef8;
  --bs-heading-color: #e9eef8;
  --bs-body-bg: transparent;
  --muted: rgba(200, 200, 200, 1);
  --card-bg: #0f1724;
  --glass: rgba(255, 255, 255, 0.04);
}

body {
  background: linear-gradient(180deg, #151520 0%, #071a2b 100%);
  color: #e9eef8;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===== LANGUAGE SWITCHER ===== */
.lang-switcher {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 9999;
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
  letter-spacing: 0.5px;
}


.social-row {
  display: flex;
  gap: .6rem;
  flex-wrap: wrap;
  align-items: center;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  padding: .5rem .9rem;
  border-radius: 30px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: .95rem;
  min-width: 130px;
  transition: transform .16s ease, box-shadow .16s ease;
}

.social-btn svg {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(2, 6, 23, 0.55);
  opacity: 0.98;
}

.btn-telegram {
  background: linear-gradient(90deg, #2AABEE, #1E8ED8);
}

.btn-twitter {
  background: linear-gradient(60deg, #000000, #202020);
}

.btn-reddit {
  background: linear-gradient(90deg, #FF4500, #FF6A00);
}

.btn-steam {
  background: linear-gradient(90deg, #171A21, #0b0c0f);
}

.btn-boosty {
  background: linear-gradient(60deg, #EF7829, #F15A2C);
}

.btn-patreon {
  background: linear-gradient(90deg, #0b0c0f, #0b0c0f);
}

.avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(20, 20, 20, 0.9);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
}

/* ═══ Аватар со скелетоном ═══ */
.avatar-holder {
  position: relative;
  display: inline-block;
  overflow: hidden;
  border-radius: 50%; /* такое же скругление, как у .avatar */
  background: rgba(255, 255, 255, 0.07);
}

/* Картинка невидима до загрузки, но занимает место — нет скачка вёрстки */
.avatar-holder .avatar {
  opacity: 0;
  transition: opacity .4s ease;
  display: block;
}

.avatar-holder.is-loaded .avatar {
  opacity: 1;
}

/* Шиммер, пока картинка не загрузилась */
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

footer {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--muted);
}

/* ===== АДАПТАЦИЯ ПОД ТЕЛЕФОНЫ ===== */
@media (max-width: 576px) {
  .lang-switcher {
    top: 0.5rem;
    left: 0.5rem;
    padding: 0.35rem 0.6rem;
    font-size: 0.75rem;
  }

  .hero-cover-layout {
    height: 270px !important;
    padding: 1rem;
  }

  .btn-tiktok::before,
  .btn-tiktok::after,
  .btn-nexus::before,
  .btn-nexus::after {
    filter: blur(30px);
  }

  .avatar {
    width: 120px;
    height: 120px;
  }

  h1.h3 {
    font-size: 1.5rem;
  }

  .text-muted {
    font-size: 0.9rem;
  }

  .social-row {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .social-btn {
    width: 90%;
    justify-content: center;
    padding: 0.5rem 0.6rem;
    font-size: 1rem;
  }

=

.card-glass {
  font-size: 0.8rem;
  padding: 0.75rem;
}

  .mod-card {
    padding: 0.75rem;
  }

  .mod-card h3.h6 {
    font-size: 1rem;
  }

  .mod-card .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }

  footer {
    padding: 1.5rem 0.5rem;
  }

  footer .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }

  footer .me-3 {
    margin-right: 0 !important;
  }

  .modal-dialog {
    margin: 0.5rem;
  }

  .btn-close-white {
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    padding: 0.5rem;
  }
}

@media (min-width: 577px) and (max-width: 768px) {
  .social-row {
    justify-content: center;
  }

  .social-btn {
    font-size: 0.85rem;
    padding: 0.4rem 0.7rem;
  }


}

@media (hover: none) and (pointer: coarse) {
  .social-btn:hover {
    transform: none;
  }

  .gallery-item {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .gallery-item:active {
    opacity: 0.8;
  }

  .btn-vk-depth:active,
  .btn-telegram:active,
  .btn-tiktok:active,
  .btn-twitter:active,
  .btn-reddit:active,
  .btn-steam:active,
  .btn-nexus:active {
    transform: scale(0.98);
  }
}

.hero-cover-layout {
  position: relative;
  border-radius: 20px;
  height: 350px;
  display: flex;
  padding: 0.5rem;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
}



/* ═══ Скелетон фона ═══ */
.hero-cover-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
  z-index: -50;
  /* та же маска, чтобы шиммер таял к низу как фон */
  mask-image: linear-gradient(to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 60%,
    rgba(0, 0, 0, 0) 90%,
    rgba(0, 0, 0, 0) 100%);
}

.hero-cover-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: cover-shimmer 1.6s infinite;
}

@keyframes cover-shimmer {
  100% { transform: translateX(100%); }
}

/* ═══ Фон: плавное проявление ═══ */
.hero-cover-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/cover.png');
  background-size: cover;
  background-position: center;
  border-radius: inherit;
  mask-image: linear-gradient(to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 60%,
    rgba(0, 0, 0, 0) 90%,
    rgba(0, 0, 0, 0) 100%);
  z-index: -50;
  /* новое: */
  opacity: 0;
  transition: opacity .6s ease;
}

.hero-cover-bg.is-loaded {
  opacity: 1;
}

.hero-content-overlay {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.hero-cover-layout::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom,
  rgba(7, 16, 37, 0.1) 0%,
  rgba(7, 16, 37, 0.4) 70%,
  rgba(7, 16, 37, 0) 100%);
  z-index: 1;
  pointer-events: none;
  border-radius: inherit;
}

.contglass {
  color: white;
  position: relative;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.contglass::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(20, 25, 35, 0.9);
  z-index: -200;
  box-shadow: inset 0 0 15px rgba(235, 255, 255, 0.05),
  inset 0 0 30px rgba(255, 255, 255, 0.02);
}

.contglass::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -201;
  pointer-events: none;
  background: linear-gradient(210deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
}

</style>