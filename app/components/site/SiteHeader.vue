<template>
  <header class="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/85 backdrop-blur">
    <nav class="mx-auto flex w-[min(94%,76rem)] items-center justify-between py-4" aria-label="Primary">
      <NuxtLink to="/" class="text-sm font-dm-mono uppercase tracking-[0.24em] text-neutral-100 focus-outline">f00sh</NuxtLink>
      <ul class="flex items-center gap-5">
        <li v-for="item in links" :key="item.to">
          <NuxtLink :to="item.to" class="text-xs uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-lime-300 focus-outline">{{ item.label }}</NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
const links = [
  { to: '/work', label: 'Work' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];
</script>

