<script setup>
import {inject} from 'vue'

defineProps({
  support: {type: Array, required: true},
  socials: {type: Array, required: true}
})

const t = inject('t')
const isMobile = inject('isMobile')
</script>

<template>
  <div>
    <div class="social-row justify-content-center">
      <h2 :class="isMobile ? 'h4 mb-2' : 'h5 mb-2'">{{ t('supportSubtitle') }}</h2>
    </div>
    <div class="social-row justify-content-center">
      <a
          v-for="s in support"
          :key="s.href"
          class="social-btn"
          :class="s.btnClass"
          :href="s.href"
          :aria-label="s.label"
          target="_blank"
          rel="noopener noreferrer"
      >
        <svg :fill="s.fill" :width="s.svgwidth" :height="s.svgheight" :viewBox="s.viewBox"
             xmlns="http://www.w3.org/2000/svg" v-html="s.svg"/>
        {{ s.label }}
      </a>
    </div>
  </div>

  <hr class="border-1 border-secondary my-3"/>

  <div>
    <div class="social-row justify-content-center">
      <h2 :class="isMobile ? 'h4 mb-2' : 'h5 mb-2'">{{ t('socialTitle') }}</h2>
    </div>
    <div class="social-row justify-content-center">
      <a
          v-for="s in socials"
          :key="s.href"
          class="social-btn"
          :class="s.btnClass"
          :href="s.href"
          :aria-label="s.label"
          target="_blank"
          rel="noopener noreferrer"
      >
        <svg :fill="s.fill" :width="s.svgwidth" :height="s.svgheight" :viewBox="s.viewBox"
             xmlns="http://www.w3.org/2000/svg" v-html="s.svg"/>
        {{ s.label }}
      </a>
    </div>
  </div>
</template>

<style scoped>
/* ═══ Социальные кнопки ═══ */
.social-row {
  display: flex;
  gap: .6rem;
  flex-wrap: wrap;
  align-items: center;
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

.social-btn svg {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
}

@media (hover: hover) {
  .social-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 30px rgba(2, 6, 23, 0.55);
    opacity: 0.98;
  }
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

@media (max-width: 576px) {
  .btn-tiktok::before, .btn-tiktok::after,
  .btn-nexus::before, .btn-nexus::after {
    filter: blur(30px);
  }

  h2.h4 {
    font-size: 1rem;
  }

  h2.h5 {
    font-size: 0.9rem;
  }

  .social-row {
    flex-direction: column;
    gap: 0.4rem;
    width: 100%;
  }

  .social-btn {
    width: 90%;
    justify-content: center;
    padding: 0.35rem 0.6rem;
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
</style>
