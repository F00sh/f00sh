<template>
  <main
    class="site-shell relative bg-[#05070a] text-[#f2f3ef]"
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
import SiteFooter from '~/components/layout/SiteFooter.vue';
import SiteHeader from '~/components/layout/SiteHeader.vue';

const route = useRoute();
const isFullscreenWorkProject = computed(() =>
  ['/work/echo-sphere', '/work/kinetic-sphere', '/work/sound-surfer', '/topo'].includes(route.path)
);

const mainClass = computed(() => {
  if (isFullscreenWorkProject.value) return 'site-shell--fullscreen h-[100dvh] w-screen overflow-hidden';
  return 'min-h-screen pt-14 sm:pt-16 flex flex-col';
});

const contentClass = computed(() => {
  if (isFullscreenWorkProject.value) return 'site-content h-[100dvh] w-screen overflow-hidden';
  return 'site-content flex-1';
});
</script>
