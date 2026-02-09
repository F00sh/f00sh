<template>
  <div class="h-screen flex items-center justify-center bg-black text-yellow-500">
    <div class="h-full w-full flex flex-col md:flex-row">
      <!-- Title half with background carousel -->
      <BackgroundCarousel
        class="h-full w-full md:w-1/2 flex items-center justify-center md:justify-end"
        :slides="bgSlides"
        :interval-ms="4200"
        :fade-ms="900"
        :parallax-strength="0.18"
        overlay-class="bg-black/35"
      >
        <div class="h-full w-full flex items-center justify-center px-6 md:px-10 m-auto">
          <div class="text-center">
            <h1 class="font-archivo-black text-7xl sm:text-8xl md:text-9xl tracking-widest uppercase whitespace-nowrap text-shadow-lg">
              f00sh
            </h1>
            <h2 class="md:text-3xl font-dm-mono">
              creative solutions
            </h2>
          </div>
        </div>
      </BackgroundCarousel>

      <!-- Words half -->
      <div
        class="bg-blue-600 font-dm-mono pl-15 pr-5 md:pr-0 h-full w-full md:w-1/2 flex flex-col items-center md:items-start justify-center text-black text-2xl md:mt-0 text-center md:text-left"
      >
        <div class="flex flex-col">
          <div
            v-for="(word, row) in visibleWords"
            :key="row"
            class="word-row h-7 leading-5 overflow-hidden"
          >
            <span
              v-for="(ch, i) in renderedRows[row]"
              :key="i"
              class="char"
              :style="{ animationDelay: `${i * 18}ms` }"
              :class="{ 'char-scramble': scramblingRow === row }"
            >
              {{ ch }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import BackgroundCarousel from "~/components/BackgroundCarousel.vue"

const bgSlides = [
  { src: "/img/bg/ap_fin_all_1.png", alt: "Background 1" },
  { src: "/img/bg/cvike4.png", alt: "Background 4" },
  { src: "/img/bg/ap_fin_all_2.png", alt: "Background 2" },
  { src: "/img/bg/cvike6.png", alt: "Background 5" },
  { src: "/img/bg/ap_fin_wh_3.png", alt: "Background 3" }
]

const words = [
  "design",
  "development",
  "art",
  "landscape",
  "interior",
  "illustration",
  "animation",
  "branding",
  "typography",
  "photography",
  "ui/ux",
  "frontend",
  "backend"
]

const visibleWords = ref(words.slice(0, 4))
let timerId
const scramblingRow = ref(-1)

const maxLen = computed(() =>
  Math.max(...words.map((w) => w.length), ...visibleWords.value.map((w) => w.length))
)

const renderedRows = computed(() => {
  const len = maxLen.value
  return visibleWords.value.map((w) => w.padEnd(len, " ").split(""))
})

function randomInt(max) {
  return Math.floor(Math.random() * max)
}

function randomChangeOneRow() {
  const row = randomInt(4)

  const used = new Set(visibleWords.value)
  used.delete(visibleWords.value[row])

  const candidates = words.filter((w) => !used.has(w))
  if (!candidates.length) return

  const replacement = candidates[randomInt(candidates.length)]

  scramblingRow.value = row

  const next = [...visibleWords.value]
  next[row] = replacement
  visibleWords.value = next

  window.setTimeout(() => {
    if (scramblingRow.value === row) scramblingRow.value = -1
  }, 520)
}

onMounted(() => {
  timerId = window.setInterval(() => {
    randomChangeOneRow()
  }, 1200)
})

onBeforeUnmount(() => {
  if (timerId) window.clearInterval(timerId)
})
</script>

<style scoped>
.word-row {
  white-space: pre;
}
.char {
  display: inline-block;
  transform: translateZ(0);
}
.char-scramble {
  animation: jig 520ms ease both;
}
@keyframes jig {
  0% {
    opacity: 0.2;
    transform: translateY(8px) rotate(-2deg);
    filter: blur(0.5px);
  }
  45% {
    opacity: 1;
    transform: translateY(-2px) rotate(1deg);
    filter: blur(0px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
    filter: blur(0px);
  }
}
</style>
