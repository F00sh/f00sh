<template>
  <footer
    class="site-footer fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-neutral-950/88 backdrop-blur transition-transform duration-300"
    :class="footerHidden ? 'translate-y-full' : 'translate-y-0'"
  >
    <div class="site-footer__inner mx-auto flex w-[min(94%,76rem)] flex-col gap-2 py-3 sm:gap-3 sm:py-4 md:flex-row md:items-center md:justify-between">
      <p class="text-[10px] uppercase tracking-[0.16em] text-neutral-500 sm:text-xs sm:tracking-[0.2em]">f00sh · 3D, animation, interactive web</p>
      <p class="text-[10px] uppercase tracking-[0.16em] text-neutral-500 sm:text-xs sm:tracking-[0.2em]">Croatia · Remote collaboration</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const footerHidden = ref(true);

const onScroll = () => {
  const y = window.scrollY || 0;
  const viewport = window.innerHeight || 0;
  const fullHeight = document.documentElement.scrollHeight || 0;
  const bottomThreshold = 24;
  footerHidden.value = y + viewport < fullHeight - bottomThreshold;
};

onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
});
</script>
