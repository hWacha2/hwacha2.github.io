<script setup>
defineProps({
  title: String,
  img: String,
  link: String,
  uploaded: String,
  description: String
})
</script>

<style>
/* GitHub Primer (dark) */
.gh-card-link {
  display: block;
  height: 100%;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.gh-card {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
  transition: border-color .2s ease, box-shadow .2s ease;
}

@media (hover: hover) {
  .gh-card-link:hover .gh-card {
    border-color: #53585e;
    box-shadow: 0 12px 28px rgba(0,0,0,0.45);
  }
}

.gh-thumb {
  display: block;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: #161b22;
  border-bottom: 1px solid #30363d;
}

.gh-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gh-body {
  background-color: #0d1117;
}

.gh-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
  margin: 0;
  color: #58a6ff;
}

@media (hover: hover) {
  .gh-card-link:hover .gh-title {
    text-decoration: underline;
  }
}

.gh-badge {
  display: inline-block;
  padding: 0 7px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: #8b949e;
  border: 1px solid #30363d;
  border-radius: 2em;
  white-space: nowrap;
}

.gh-desc {
  color: #8b949e;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.gh-meta {
  color: #8b949e;
  font-size: 12px;
}

.gh-meta svg {
  fill: currentColor;
  flex-shrink: 0;
}
</style>

<template>
  <div class="col-12 col-md-6 col-lg-4">
    <!-- Вся карточка — одна ссылка -->
    <a :href="link" class="gh-card-link">
      <div class="gh-card h-100 d-flex flex-column">

        <!-- Превью -->
        <div class="gh-thumb">
          <img :src="img" :alt="title" />
        </div>

        <!-- Контент -->
        <div class="gh-body p-3 d-flex flex-column flex-grow-1">

          <!-- Заголовок + бейдж -->
          <div class="d-flex align-items-center gap-2 mb-2">
            <svg viewBox="0 0 16 16" width="16" height="16"
                 style="fill: #8b949e; flex-shrink: 0;">
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
            </svg>

            <h3 class="gh-title">{{ title }}</h3>

            <span class="gh-badge">Public</span>
          </div>

          <!-- Описание -->
          <p class="gh-desc flex-grow-1 mb-3">{{ description }}</p>

          <!-- Мета -->
          <div class="gh-meta d-flex align-items-center gap-1">
            <svg viewBox="0 0 16 16" width="16" height="16">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"></path>
            </svg>
            <span>Updated {{ uploaded }}</span>
          </div>

        </div>
      </div>
    </a>
  </div>
</template>