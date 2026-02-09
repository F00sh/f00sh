<template>
  <div class="video-bg">
    <div class="video-bg__media" aria-hidden="true">
      <ClientOnly>
        <iframe
          class="video-bg__iframe"
          :src="embedUrl"
          title="Background video"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
        />
      </ClientOnly>
    </div>
    <div class="video-bg__overlay" :class="overlayClass" />
    <div class="video-bg__content">
      <div v-if="showToolkit" class="video-bg__toolkit">
        <div class="toolkit-panel">
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
              If you have a direction in mind, Iâ€™ll help you shape it and ship it cleanly.
            </p>
          </div>
        </div>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  videoId: {
    type: String,
    default: "UKPcEo7-ZMU"
  },
  overlayClass: {
    type: String,
    default: "bg-black/40"
  },
  showToolkit: {
    type: Boolean,
    default: true
  }
})

const embedUrl = computed(() => {
  const id = encodeURIComponent(props.videoId)
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&disablekb=1`
})
</script>

<style scoped>
.video-bg {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}
.video-bg__media {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.video-bg__iframe {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140vw;
  height: 78.75vw;
  min-width: 100%;
  min-height: 100%;
  transform: translate(-50%, -50%);
}
@media (max-aspect-ratio: 16/9) {
  .video-bg__iframe {
    width: 177.78vh;
    height: 100vh;
  }
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
  height: 100%;
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
  background: rgba(234, 179, 8, 0.92);
  padding: 1.5rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
}
.tool {
  padding: 0.6rem 0.75rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.45);
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
