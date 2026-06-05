<template>
  <main
    class="site-shell relative bg-neutral-950 text-neutral-50"
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
const isScrollableFullscreenProject = computed(() => route.path === '/work/rumpelstiltskin');
const isFullscreenWorkProject = computed(() =>
  ['/work/echo-sphere', '/work/kinetic-sphere', '/work/sound-surfer', '/topo'].includes(route.path)
  || isScrollableFullscreenProject.value
);

const mainClass = computed(() => {
  if (isScrollableFullscreenProject.value) return 'site-shell--fullscreen h-[100dvh] w-screen overflow-y-auto overflow-x-hidden';
  if (isFullscreenWorkProject.value) return 'site-shell--fullscreen h-[100dvh] w-screen overflow-hidden';
  return isHome.value
    ? 'pt-14 sm:pt-16 min-h-screen'
    : 'pt-14 sm:pt-16 min-h-screen flex flex-col md:h-screen md:h-[100svh] md:h-[100dvh] md:overflow-hidden';
});

const contentClass = computed(() => {
  if (isScrollableFullscreenProject.value) return 'site-content h-[100dvh] w-screen overflow-y-auto overflow-x-hidden';
  if (isFullscreenWorkProject.value) return 'site-content h-[100dvh] w-screen overflow-hidden';
  return isHome.value
    ? 'site-content pb-16 sm:pb-20'
    : 'site-content flex-1 min-h-0 overflow-visible pb-16 sm:pb-20 md:overflow-hidden';
});
</script>
