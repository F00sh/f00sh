<template>
  <div ref="rootEl" class="video-bg bg-yellow-600">
    <canvas ref="canvasEl" class="parallax-layer" aria-hidden="true" />
    <div class="video-bg__overlay" :class="overlayClass" />
    <div class="video-bg__content">
      <div v-if="showToolkit" class="video-bg__toolkit">
        <div class="toolkit-panel rounded-4xl">
          <h2 class="text-lg sm:text-xl font-bold text-white mb-4">
            Toolkit
          </h2>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="tool">Adobe CC</div>
            <div class="tool">Blender</div>
            <div class="tool">Figma</div>
            <div class="tool">HTML &amp; CSS</div>
            <div class="tool">Revit</div>
            <div class="tool">AutoCAD</div>
          </div>

          <div class="mt-8 pt-6 border-t border-white/15">
            <h3 class="text-white font-semibold mb-3">
              What you get
            </h3>

            <ul class="space-y-2 text-white font-dm-mono">
              <li class="li">Clear concepts and fast iterations</li>
              <li class="li">Strong visuals with practical constraints in mind</li>
              <li class="li">Assets and UI that feel coherent across the whole product</li>
            </ul>

            <p class="mt-6 text-white">
              If you have a direction in mind, I'll help you shape it and ship it cleanly.
            </p>
          </div>
        </div>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue"

const props = defineProps({
  overlayClass: {
    type: String,
    default: "bg-black/40"
  },
  showToolkit: {
    type: Boolean,
    default: true
  }
})

const rootEl = ref(null)
const canvasEl = ref(null)
const currentFrame = ref(1)
const displayFrame = ref(1)
let ticking = false
const totalFrames = 250
const framePadding = 4
const imageCache = Array.from({ length: totalFrames + 1 })
let requestedFrame = 1
let ctx = null

const clamp = (value, min, max) => Math.max(min, Math.min(value, max))

const updateFrame = () => {
  ticking = false
  const el = rootEl.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const viewportHeight = window.innerHeight || 1
  const midPoint = rect.top + rect.height / 2
  const start = viewportHeight + rect.height / 2
  const end = -rect.height / 2
  const progressRaw = (start - midPoint) / (start - end)
  const progress = clamp(progressRaw, 0, 1)
  const frame = Math.round(1 + progress * (totalFrames - 1))
  currentFrame.value = clamp(frame, 1, totalFrames)
  requestedFrame = currentFrame.value
  ensureFrame(requestedFrame)
}

const handleScroll = () => {
  if (ticking) return
  ticking = true
  window.requestAnimationFrame(updateFrame)
}

const handleResize = () => {
  resizeCanvas()
  handleScroll()
}

onMounted(() => {
  initCanvas()
  ensureFrame(1)
  updateFrame()
  window.addEventListener("scroll", handleScroll, { passive: true })
  window.addEventListener("resize", handleResize, { passive: true })
  preloadFrames()
})

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll)
  window.removeEventListener("resize", handleResize)
})

const framePath = (frame) =>
  `/img/heart/${String(frame).padStart(framePadding, "0")}.png`

const ensureFrame = (frame) => {
  const cached = imageCache[frame]
  if (cached) {
    displayFrame.value = frame
    drawFrame(frame)
    return
  }

  const img = new Image()
  img.src = framePath(frame)
  const commit = () => {
    imageCache[frame] = img
    if (requestedFrame === frame) {
      displayFrame.value = frame
      drawFrame(frame)
    }
  }

  img.onload = () => {
    if (img.decode) {
      img.decode().then(commit).catch(commit)
    } else {
      commit()
    }
  }
  img.onerror = commit
}

const preloadFrames = () => {
  let nextFrame = 1
  const batchSize = 10
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 40))

  const loadBatch = () => {
    const endFrame = Math.min(nextFrame + batchSize - 1, totalFrames)
    for (let i = nextFrame; i <= endFrame; i += 1) {
      if (imageCache[i]) continue
      const img = new Image()
      img.src = framePath(i)
      img.onload = () => {
        if (img.decode) {
          img.decode().then(() => {
            imageCache[i] = img
          }).catch(() => {
            imageCache[i] = img
          })
        } else {
          imageCache[i] = img
        }
      }
      img.onerror = () => {
        imageCache[i] = img
      }
    }
    nextFrame = endFrame + 1
    if (nextFrame <= totalFrames) {
      idle(loadBatch)
    }
  }

  idle(loadBatch)
}

const initCanvas = () => {
  const canvas = canvasEl.value
  if (!canvas) return
  ctx = canvas.getContext("2d")
  resizeCanvas()
  drawFrame(displayFrame.value)
}

const resizeCanvas = () => {
  const canvas = canvasEl.value
  if (!canvas || !ctx) return
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (!width || !height) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  drawFrame(displayFrame.value)
}

const drawFrame = (frame) => {
  if (!ctx) return
  const img = imageCache[frame]
  if (!img || !img.naturalWidth || !img.naturalHeight) return

  const canvas = canvasEl.value
  if (!canvas) return
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (!width || !height) return

  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
  const drawWidth = img.naturalWidth * scale
  const drawHeight = img.naturalHeight * scale
  const dx = (width - drawWidth) / 2
  const dy = (height - drawHeight) / 2

  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(img, dx, dy, drawWidth, drawHeight)
}

</script>

<style scoped>
.video-bg {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  
}
.parallax-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  width: 100%;
  height: 100%;
  display: block;
  will-change: contents;
  filter: saturate(1.02);
}
.video-bg__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.video-bg__content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100vh;
}
.video-bg__toolkit {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}
.toolkit-panel {
  width: min(46rem, 100%);
  background: rgba(234, 179, 8, 0);
  padding: 1.5rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);

}
.tool {
  padding: 0.6rem 0.75rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(193, 9, 255, 0.7);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-align: center;
  font-size: 0.9rem;
}
.li {
  position: relative;
  padding-left: 1.1rem;
}
.li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.65em;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
}
</style>
