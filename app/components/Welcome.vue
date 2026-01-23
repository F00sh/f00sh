<template>
  <div class="h-screen flex items-center justify-center bg-black text-purple-600">
    <div class="h-full w-full flex flex-col md:flex-row items-center justify-center">
      <!-- Title -->
      <div class="h-full w-full flex items-center justify-center md:justify-end">
        <h1 class="text-7xl sm:text-8xl md:text-9xl font-black tracking-widest uppercase md:h-35 whitespace-nowrap">
          f00sh
        </h1>
      </div>

      <!-- Words -->
      <div
        class="bg-blue-600 pl-5 h-full w-full flex flex-col items-center md:items-start justify-center text-black font-semibold mt-6 md:mt-0 text-center md:text-left"
      >
        <!-- fixed-height stack, no transition-group reordering -->
        <div class="flex flex-col">
          <div
            v-for="(word, row) in visibleWords"
            :key="row"
            class="word-row h-7 leading-7 overflow-hidden"
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const words = [
  'design',
  'development',
  'art',
  'landscape',
  'interior',
  'illustration',
  'animation',
    'branding',
    'typography',
    'photography',
    'ui/ux',
    'frontend',
    'backend'
]

const visibleWords = ref(words.slice(0, 4))

let timerId
const scramblingRow = ref(-1)

// Use padded character arrays so every row keeps the same width/height footprint.
// This avoids subtle width shifts if you later right-align, etc.
const maxLen = computed(() => Math.max(...words.map(w => w.length), ...visibleWords.value.map(w => w.length)))

const renderedRows = computed(() => {
  const len = maxLen.value
  return visibleWords.value.map(w => w.padEnd(len, ' ').split(''))
})

function randomInt(max) {
  return Math.floor(Math.random() * max)
}

function randomChangeOneRow() {
  const row = randomInt(4)

  // avoid duplicates among visible words
  const used = new Set(visibleWords.value)
  used.delete(visibleWords.value[row])

  const candidates = words.filter(w => !used.has(w))
  if (!candidates.length) return

  const replacement = candidates[randomInt(candidates.length)]

  // trigger per-letter scramble on this row
  scramblingRow.value = row

  // swap word immediately; animation provides the transition feel
  const next = [...visibleWords.value]
  next[row] = replacement
  visibleWords.value = next

  // stop scramble class after animation completes
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
/* Keep rows stable: height is controlled by Tailwind h-7/leading-7 */
.word-row {
  white-space: pre; /* preserves padEnd spaces so width stays stable */
}

/* Per-letter animation */
.char {
  display: inline-block;
  transform: translateZ(0);
}

/* Jigsaw / scramble effect:
   Each character briefly “ticks” through opacity/transform. Delays are set inline per char. */
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
