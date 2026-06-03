<template>
  <section class="relative h-screen h-[100svh] h-[100dvh] overflow-hidden bg-neutral-950">
    <div class="pointer-events-none absolute inset-0 z-0 h-screen h-[100svh] h-[100dvh]">
      <EchoSphereScene />
    </div>
    <NuxtLink
      to="/work/interactive-web"
      class="absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center border border-white/12 bg-black/65 text-neutral-100 backdrop-blur-md transition-colors hover:border-lime-300 hover:text-lime-300 sm:right-4 sm:top-4"
      aria-label="Close project"
    >
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
import EchoSphereScene from '~/components/work/EchoSphereScene.client.vue';

useSeoMeta({
  title: 'Echo Sphere — FOOSH Interactive 3D Application',
  description: 'Echo Sphere is a high-density wireframe audio-reactive 3D sphere built as an interactive web application by FOOSH.',
});
</script>
