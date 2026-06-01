<template>
  <footer
    class="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-neutral-950/88 backdrop-blur transition-transform duration-300"
    :class="footerHidden ? 'translate-y-full' : 'translate-y-0'"
  >
    <div class="mx-auto flex w-[min(94%,76rem)] flex-col gap-2 py-3 sm:gap-3 sm:py-4 md:flex-row md:items-center md:justify-between">
      <p class="text-[10px] uppercase tracking-[0.16em] text-neutral-500 sm:text-xs sm:tracking-[0.2em]">f00sh · 3D, animation, interactive web</p>
      <p class="text-[10px] uppercase tracking-[0.16em] text-neutral-500 sm:text-xs sm:tracking-[0.2em]">Croatia · Remote collaboration</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const footerHidden = ref(false);
let lastY = 0;

const onScroll = () => {
  const y = window.scrollY || 0;
  if (y <= 8) {
    footerHidden.value = false;
  } else {
    footerHidden.value = y > lastY;
  }
  lastY = y;
};

onMounted(() => {
  lastY = window.scrollY || 0;
  window.addEventListener('scroll', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>
