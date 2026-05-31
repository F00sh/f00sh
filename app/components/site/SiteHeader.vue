<template>
  <header class="fixed inset-x-0 top-0 z-40">
    <nav
      class="mx-auto mt-4 flex w-[min(94%,72rem)] items-center justify-between rounded-full border border-neutral-800/90 bg-neutral-950/75 px-4 py-3 backdrop-blur"
      aria-label="Primary"
    >
      <a href="#home" class="text-sm font-dm-mono uppercase tracking-[0.2em] text-neutral-100 focus-outline">
        f00sh
      </a>

      <ul class="hidden items-center gap-6 md:flex">
        <li v-for="item in links" :key="item.href">
          <a :href="item.href" class="text-xs uppercase tracking-[0.2em] text-neutral-400 transition-colors hover:text-neutral-50 focus-outline">
            {{ item.label }}
          </a>
        </li>
      </ul>

      <a
        href="mailto:fooshmoola@gmail.com"
        class="text-xs uppercase tracking-[0.2em] text-lime-400 transition-colors hover:text-lime-300 focus-outline"
      >
        Email
      </a>
    </nav>
  </header>
</template>

<script setup lang="ts">
const links = [
  { href: "#about", label: "About" },
  { href: "#portfolio", label: "Work" },
  { href: "#contact", label: "Contact" },
];
</script>
