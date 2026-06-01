<template>
  <header class="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur">
    <nav class="mx-auto flex w-[min(94%,76rem)] items-center justify-between py-4" aria-label="Primary">
      <NuxtLink to="/" class="text-sm font-ibm-plex-mono uppercase tracking-[0.24em] text-neutral-100 focus-outline">f00sh</NuxtLink>

      <ul class="hidden items-center gap-5 md:flex">
        <li v-for="item in links" :key="item.to">
          <NuxtLink :to="item.to" class="text-xs uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-lime-300 focus-outline">{{ item.label }}</NuxtLink>
        </li>
      </ul>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-lime-300"
          :aria-label="isMuted ? 'Sound off' : 'Sound on'"
          @click="toggleMute"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 8.5L16 12L9 15.5V8.5Z" />
            <path v-if="isMuted" d="M6 18L18 6" />
          </svg>
        </button>

        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-neutral-100 md:hidden"
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
      <ul class="mx-auto flex w-[min(94%,76rem)] flex-col py-3">
        <li v-for="item in links" :key="item.to">
          <NuxtLink :to="item.to" class="block py-2 text-xs uppercase tracking-[0.2em] text-neutral-300" @click="mobileOpen = false">{{ item.label }}</NuxtLink>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useBackgroundAudio } from '~/composables/useBackgroundAudio';

const mobileOpen = ref(false);
const links = [
  { to: '/work', label: 'Work' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const { isMuted, toggleMute } = useBackgroundAudio();
</script>
