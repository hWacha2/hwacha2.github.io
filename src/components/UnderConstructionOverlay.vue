<!-- UnderConstructionOverlay.vue -->
<template>
  <Teleport to="body">
    <div
        v-if="modelValue"
        class="uc-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="uc-title"
        tabindex="-1"
        @click.stop
        @wheel.prevent
        @touchmove.prevent
    >
      <div class="uc-content">
        <div class="uc-icon">🚧</div>
        <h2 id="uc-title" class="uc-title"> {{ t('devTitle') }}</h2>
        <p class="uc-text">{{ t('devSubtitle') }} </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import {watch, onUnmounted, inject} from 'vue'
const t = inject('t');
const props = defineProps({
  modelValue: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue'])

let scrollLockCount = 0

const lockScroll = () => {
  if (scrollLockCount === 0) {
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = 'var(--scrollbar-width, 0px)'
  }
  scrollLockCount++
}

const unlockScroll = () => {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}

watch(
    () => props.modelValue,
    (val) => {
      if (val) lockScroll()
      else unlockScroll()
    },
    { immediate: true }
)

onUnmounted(() => {
  if (props.modelValue) unlockScroll()
})
</script>

<style scoped>
.uc-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(2px);
  cursor: not-allowed;
  user-select: none;
}

.uc-content {
  text-align: center;
  color: #fff;
  padding: 24px;
  max-width: 400px;
  pointer-events: none; /* пропускаем клики только по фону */
}

.uc-icon {
  font-size: 64px;
  line-height: 1;
  margin-bottom: 16px;
}

.uc-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 8px;
}

.uc-text {
  font-size: 15px;
  opacity: 0.8;
  margin: 0;
}
</style>