<template>
  <main
    class="relative bg-neutral-950 text-neutral-50"
    :class="isHome ? 'min-h-screen' : 'h-screen h-[100svh] h-[100dvh] overflow-hidden flex flex-col'"
  >
    <SiteHeader />
    <div :class="isHome ? '' : 'flex-1 min-h-0 overflow-hidden'">
      <NuxtPage />
    </div>
    <SiteFooter />
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const isHome = computed(() => route.path === '/');
</script>
