<template>
  <main
    class="relative bg-neutral-950 pt-14 text-neutral-50 sm:pt-16"
    :class="isHome ? 'min-h-screen' : 'h-screen h-[100svh] h-[100dvh] overflow-hidden flex flex-col'"
  >
    <SiteHeader />
    <div :class="isHome ? 'pb-16 sm:pb-20' : 'flex-1 min-h-0 overflow-hidden pb-16 sm:pb-20'">
      <NuxtPage />
    </div>
    <SiteFooter />
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const isHome = computed(() => route.path === '/');
</script>
