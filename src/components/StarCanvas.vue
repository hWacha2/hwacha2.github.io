<!-- src/components/StarCanvas.vue -->
<template>
    <canvas ref="canvas"></canvas>

</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx = null
let width, height
let stars = []
let animationFrame

const CONFIG = {
  starCount: 300,
  minRadius: 0.5,
  maxRadius: 2.5,
  baseSpeed: 0.2,
  speedVariance: 0.4,
  twinkleSpeed: 0.002,
  opacityMin: 0.3,
  opacityMax: 1
}

function initStars() {
  width = window.innerWidth
  height = window.innerHeight

  if (canvas.value) {
    canvas.value.width = width
    canvas.value.height = height
  }

  stars = []

  for (let i = 0; i < CONFIG.starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
      speed: CONFIG.baseSpeed + Math.random() * CONFIG.speedVariance,
      baseOpacity: CONFIG.opacityMin + Math.random() * (CONFIG.opacityMax - CONFIG.opacityMin),
      twinkleOffset: Math.random() * Math.PI * 2
    })
  }
}

function animate() {
  if (!ctx) return

  ctx.clearRect(0, 0, width, height)

  stars.forEach(star => {
    star.y += star.speed

    if (star.y > height) {
      star.y = 0
      star.x = Math.random() * width
    }

    const twinkle = Math.sin(Date.now() * CONFIG.twinkleSpeed + star.twinkleOffset)
    const opacity = star.baseOpacity * (0.7 + 0.3 * twinkle)

    ctx.beginPath()
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    ctx.fill()
  })

  animationFrame = requestAnimationFrame(animate)
}

function handleResize() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  initStars()
  animate()
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    initStars()
    animate()
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.container {
  position: relative;
  height: 100vh;
  width: 100vw;
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
  overflow: hidden;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

#title {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  color: #fff;
  text-align: center;
  font-family: "lato", sans-serif;
  font-weight: 300;
  font-size: 50px;
  letter-spacing: 10px;
  margin-top: -60px;
  padding-left: 10px;
  opacity: 0;
  transform: translateY(30px);
  animation: introFadeUp 1.2s ease-out forwards;
  z-index: 10;
  text-shadow: 0 0 20px rgba(255,255,255,0.3);
}

#title span {
  background: linear-gradient(to bottom, #fff, #8ba9c7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes introFadeUp {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>