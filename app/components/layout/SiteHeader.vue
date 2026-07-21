<template>
  <header class="site-header fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-[#05070a]/88 backdrop-blur-xl">
    <nav class="site-header__nav mx-auto flex h-14 w-[min(92%,82rem)] items-center justify-between sm:h-16" aria-label="Primary">
      <NuxtLink to="/" class="brand-link focus-outline"><span aria-hidden="true" />f00sh</NuxtLink>

      <ul class="hidden items-center md:flex">
        <li v-for="item in links" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="focus-outline block border-l border-white/15 px-5 py-2 text-[0.61rem] font-medium uppercase tracking-[0.1em] transition-colors"
            :class="isActive(item.to) ? 'text-[#c8ff63]' : 'text-[#9ca29f] hover:text-white'"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >{{ item.label }}</NuxtLink>
        </li>
      </ul>

      <a href="mailto:fooshmoola@gmail.com" class="header-cta focus-outline hidden md:inline-flex">Start a project <span aria-hidden="true">↗</span></a>

      <button
        type="button"
        class="focus-outline grid h-10 w-10 place-items-center border border-white/20 bg-transparent text-white md:hidden"
        :aria-expanded="mobileOpen"
        aria-controls="mobile-navigation"
        aria-label="Toggle navigation"
        @click="mobileOpen = !mobileOpen"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square">
          <path :d="mobileOpen ? 'M6 6L18 18M18 6L6 18' : 'M4 7H20M4 12H20M4 17H20'" />
        </svg>
      </button>
    </nav>

    <div v-if="mobileOpen" id="mobile-navigation" class="site-header__menu border-t border-white/15 bg-[#05070a] md:hidden">
      <ul class="mx-auto flex w-[min(92%,82rem)] flex-col">
        <li v-for="(item, index) in links" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="focus-outline flex min-h-14 items-center justify-between border-b border-white/15 text-[0.68rem] font-medium uppercase tracking-[0.12em]"
            :class="isActive(item.to) ? 'text-[#c8ff63]' : 'text-[#b6bbb8]'"
            :aria-current="isActive(item.to) ? 'page' : undefined"
            @click="mobileOpen = false"
          ><span><small class="mr-4 text-[#68706c]">0{{ index + 1 }}</small>{{ item.label }}</span><span aria-hidden="true">↗</span></NuxtLink>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const route = useRoute();
const mobileOpen = ref(false);
const links = [
  { to: '/work', label: 'Work' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];
const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`);
watch(() => route.fullPath, () => { mobileOpen.value = false; });
</script>

<style scoped>
.brand-link { display: inline-flex; align-items: center; gap: 0.65rem; color: #f2f3ef; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; }
.brand-link > span { width: 0.65rem; height: 0.65rem; background: #c8ff63; }
.header-cta { min-height: 2.35rem; align-items: center; gap: 0.65rem; border: 1px solid #c8ff63; background: #c8ff63; padding: 0.6rem 0.85rem; color: #080b09; font-size: 0.58rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; transition: background-color 160ms ease, color 160ms ease; }
.header-cta:hover { background: transparent; color: #c8ff63; }
</style>
