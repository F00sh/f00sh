<template>
  <main
    class="relative bg-neutral-950 pt-14 text-neutral-50 sm:pt-16"
    :class="isHome ? 'min-h-screen' : 'min-h-screen flex flex-col md:h-screen md:h-[100svh] md:h-[100dvh] md:overflow-hidden'"
  >
    <SiteHeader />
    <div :class="isHome ? 'pb-16 sm:pb-20' : 'flex-1 min-h-0 overflow-visible pb-16 sm:pb-20 md:overflow-hidden'">
      <NuxtPage />
    </div>
    <SiteFooter />
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const isHome = computed(() => route.path === '/');
</script>
