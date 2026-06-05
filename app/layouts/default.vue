<template>
  <main
    class="relative bg-neutral-950 text-neutral-50"
    :class="mainClass"
  >
    <SiteHeader v-if="!isFullscreenWorkProject" />
    <div :class="contentClass">
      <NuxtPage />
    </div>
    <SiteFooter v-if="!isFullscreenWorkProject" />
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const isHome = computed(() => route.path === '/');
const isFullscreenWorkProject = computed(() =>
  ['/work/echo-sphere', '/work/kinetic-sphere', '/work/sound-surfer', '/work/rumpelstiltskin', '/topo'].includes(route.path)
);

const mainClass = computed(() => {
  if (isFullscreenWorkProject.value) return 'h-[100dvh] w-screen overflow-hidden';
  return isHome.value
    ? 'pt-14 sm:pt-16 min-h-screen'
    : 'pt-14 sm:pt-16 min-h-screen flex flex-col';
});

const contentClass = computed(() => {
  if (isFullscreenWorkProject.value) return 'h-[100dvh] w-screen overflow-hidden';
  return isHome.value
    ? 'pb-16 sm:pb-20'
    : 'flex-1 min-h-0 overflow-visible pb-16 sm:pb-20';
});
</script>
