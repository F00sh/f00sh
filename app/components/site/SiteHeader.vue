<template>
  <header
    class="fixed inset-x-0 top-0 z-50 bg-neutral-950/85 backdrop-blur transition-transform duration-300"
    :class="headerHidden ? '-translate-y-full' : 'translate-y-0'"
  >
    <nav class="mx-auto flex w-[min(94%,76rem)] items-center justify-between py-3 sm:py-4" aria-label="Primary">
      <NuxtLink to="/" class="text-xs font-ibm-plex-mono uppercase tracking-[0.22em] text-neutral-100 focus-outline sm:text-sm">f00sh</NuxtLink>

      <ul class="hidden items-center gap-5 md:flex">
        <li v-for="item in links" :key="item.to">
          <NuxtLink :to="item.to" class="text-[11px] uppercase tracking-[0.18em] text-neutral-400 transition-colors hover:text-lime-300 focus-outline lg:text-xs">{{ item.label }}</NuxtLink>
        </li>
      </ul>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-full bg-black/40 text-neutral-100 md:hidden"
          aria-label="Toggle menu"
          @click="mobileOpen = !mobileOpen"
        >
          <span class="sr-only">Menu</span>
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path :d="mobileOpen ? 'M6 6L18 18M18 6L6 18' : 'M4 7H20M4 12H20M4 17H20'" />
          </svg>
        </button>
      </div>
    </nav>

    <div v-if="mobileOpen" class="border-t border-white/10 bg-neutral-950/95 md:hidden">
      <ul class="mx-auto flex w-[min(94%,76rem)] flex-col py-2">
        <li v-for="item in links" :key="item.to">
          <NuxtLink :to="item.to" class="block py-2 text-[11px] uppercase tracking-[0.18em] text-neutral-300" @click="mobileOpen = false">{{ item.label }}</NuxtLink>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const mobileOpen = ref(false);
const headerHidden = ref(false);
const links = [
  { to: '/work', label: 'Work' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

let lastY = 0;
const onScroll = () => {
  const y = window.scrollY || 0;
  if (mobileOpen.value || y <= 8) {
    headerHidden.value = false;
  } else {
    headerHidden.value = y > lastY;
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
