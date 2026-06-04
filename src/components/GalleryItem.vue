<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  img: { type: String, required: true },
  title: { type: String, required: true }
})
</script>
<style>
    .card-glass{
      background: linear-gradient(210deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
      border: 1px solid rgba(255,255,255,0.04);
      border-radius:12px;
      padding:1rem;
      font-size: 1rem;
    }
    .gallery-img{
      width:100%; height:300px; object-fit:cover; border-radius:8px;
      transition: transform .18s ease, filter .18s ease;
      transform: translateZ(0);
    }
    .gallery-item
    {
       height: 100%;
    }
    .gallery-item:hover .gallery-img{ transform:scale(1.03); filter:brightness(1.02); }
</style>

<template>
  <div class="col-6 col-md-4 col-lg-3 text-center">
    <div
      class="card-glass gallery-item p-2"
      style="overflow: hidden"
      data-bs-toggle="modal"
      data-bs-target="#modalImage"
      :data-img="img"
      :data-title="title"
      role="button"
    >
      <img :src="img" :alt="title" class="gallery-img" />
      <div class="mt-2">
        <strong>{{ title }}</strong>
      </div>
    </div>
  </div>
</template>
