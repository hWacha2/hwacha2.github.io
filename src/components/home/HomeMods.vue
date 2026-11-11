<script setup>
import {inject} from 'vue'
import ModTile from '../ModTile.vue'
import GithubTitle from "../GithubTitle.vue";

defineProps({
  projects: {type: Array, required: true},
  mods: {type: Array, required: true}
})



const t = inject('t')
const currentLang = inject('currentLang')
const isMobile = inject('isMobile')
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 :class="isMobile ? 'h3 mb-0' : 'h5 mb-0'">
      {{ t('modsTitle') }}
    </h2>
    <small class="text-secondary" style="text-align: right; display: block;">{{ t('modsSubtitle') }}</small>
  </div>

  <div class="row g-3">
     <GithubTitle
        v-for="project in projects"
        :key="project.link"
        :title="project.title"
        :img="project.img"
        :link="project.link"
        :uploaded="project.uploaded"

        :description="project.description[currentLang] || project.description.en"
    />

    <ModTile
        v-for="mod in mods"
        :key="mod.link"
        :title="mod.title"
        :img="mod.img"
        :link="mod.link"
        :game="mod.game"
        :category="mod.category"
        :uploaded="mod.uploaded"

        :description="mod.description[currentLang] || mod.description.en"
    />
  </div>
</template>

<style scoped>
@media (max-width: 576px) {
  h2.h3 {
    font-size: 1.1rem;
  }
}
</style>
