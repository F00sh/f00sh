<template>
  <div ref="root" class="relative overflow-hidden" :class="$attrs.class">
    <!-- Images -->
    <div class="absolute inset-0">
      <img
        v-for="(s, i) in slides"
        :key="s.src"
        :src="s.src"
        :alt="s.alt ?? ''"
        class="absolute inset-0 h-full w-full object-cover will-change-transform"
        :class="fadeClass"
        :style="imgStyle(i)"
        draggable="false"
      />
    </div>

    <!-- Optional overlay for contrast -->
    <div class="absolute inset-0" :class="overlayClass" />

    <!-- Foreground content -->
    <div class="relative z-10 h-full w-full">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"

type Slide = { src: string; alt?: string }

const props = withDefaults(
  defineProps<{
    slides: Slide[]
    intervalMs?: number
    fadeMs?: number
    parallaxStrength?: number
    overlayClass?: string
  }>(),
  {
    intervalMs: 4200,
    fadeMs: 900,
    parallaxStrength: 5.5,
    overlayClass: "bg-black/35"
  }
)

const root = ref<HTMLElement | null>(null)
const active = ref(0)

let timer: number | null = null
let raf: number | null = null
let latestScrollY = 0
const parallaxY = ref(0)

const fadeClass = `transition-opacity ease-in-out`
const fadeDurationStyle = () => ({ transitionDuration: `${props.fadeMs}ms` })

function next() {
  if (!props.slides?.length) return
  active.value = (active.value + 1) % props.slides.length
}

function computeParallax() {
  if (!root.value) return
  const rect = root.value.getBoundingClientRect()
  const elTop = rect.top + latestScrollY
  const elMid = elTop + rect.height / 2
  const viewportMid = latestScrollY + window.innerHeight / 2

  // positive when element is below viewport center, negative when above
  const delta = elMid - viewportMid

  parallaxY.value = -delta * props.parallaxStrength
}

function onScroll() {
  latestScrollY = window.scrollY || 0
  if (raf) return
  raf = window.requestAnimationFrame(() => {
    computeParallax()
    raf = null
  })
}

function imgStyle(i: number) {
  const isActive = i === active.value
  return {
    opacity: isActive ? 1 : 0,
    transform: `translate3d(0, ${parallaxY.value}px, 0) scale(1.08)`,
    ...fadeDurationStyle()
  } as Record<string, string | number>
}

onMounted(() => {
  // set initial
  latestScrollY = window.scrollY || 0
  computeParallax()

  // autoplay
  timer = window.setInterval(next, props.intervalMs)

  // parallax
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
  if (raf) window.cancelAnimationFrame(raf)
  window.removeEventListener("scroll", onScroll)
  window.removeEventListener("resize", onScroll)
})
</script>
