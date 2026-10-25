<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  title: String,
  img: String,
  link: String,
  author: String,
  authorAvatar: String,
  game: String,
  category: String,
  uploaded: String,
  description: String
})
</script>

<style>
.cont {
  background-color: #29292E;
}

.mod-game-cat {
  color: #d4d4d8;
}

.mod-down-text {
  color: #a1a1aa;
}

.space-borderbottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

/* Фиксированное соотношение сторон 16:9 для картинки */
.mod-thumb {
  aspect-ratio: 16 / 9;
  height: auto !important;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.mod-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.mod-tile {
  background: linear-gradient(180deg, #1d1d21, #1d1d21);

  border: 1px solid rgba(255,255,255,0.05);
  transition: transform .15s ease, box-shadow .2s ease;
}

.mod-tile:hover {

  box-shadow: 0 12px 28px rgba(0,0,0,0.45);
}

.mod-thumb {
  height: 100%;
  overflow: hidden;
}

.mod-thumb img {
  transition: transform .25s ease;
}

.mod-thumb:hover img {
  transform: scale(1.05);
}

.mod-footer {
  opacity: .85;
}

</style>

<template>
  <div class="col-12 col-md-6 col-lg-4">
    <div class="mod-tile h-100 d-flex flex-column rounded overflow-hidden">

      <!-- Картинка -->
      <a :href="link" class="mod-thumb d-block position-relative">
        <img :src="img" :alt="title" />
      </a>

      <!-- Контент -->
      <div class="cont p-3 flex-grow-1 d-flex flex-column ">

        <div class="space-borderbottom">
          <!-- Заголовок -->
          <h3 class="h6 text-white fw-semibold">
            <a :href="link" class="text-decoration-none text-white">
              {{ title }}
            </a>
          </h3>
        </div>

        <div class="space-borderbottom">
          <!-- Игра + категория -->
          <div class="mod-game-cat d-flex align-items-center">
            <div class="py-2">
              <a href="#" class="mod-game-cat text-decoration-none">{{ game }}</a>
              <span class="mod-game-cat mx-1">•</span>
              <a href="#" class="mod-game-cat text-decoration-none">{{ category }}</a>
            </div>
          </div>
        </div>

        <!-- Дата -->
        <div class="space-borderbottom">
          <div class="py-2 small d-flex flex-column gap-1">
            <div class="mod-down-text d-flex align-items-center gap-1">
              <svg viewBox="0 0 24 24" role="presentation" style="width: 1rem; height: 1rem;">
                <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" style="fill: currentcolor;"></path>
              </svg>
              {{ uploaded }}
            </div>
          </div>
        </div>

        <!-- Описание -->
        <p class="py-2 mod-down-text flex-grow-1 m-0">
          {{ description }}
        </p>

      </div>
    </div>
  </div>
</template>