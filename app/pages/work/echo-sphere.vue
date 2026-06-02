<template>
  <section class="relative h-screen h-[100svh] h-[100dvh] overflow-hidden">
    <div class="pointer-events-none absolute inset-0 z-0 h-screen h-[100svh] h-[100dvh]">
      <EchoSphereScene />
    </div>
    <div class="relative z-10 mx-auto w-[min(94%,76rem)] py-16">
      <p class="font-ibm-plex-mono text-xs uppercase tracking-[0.24em] text-lime-300">Interactive 3D Application</p>
      <h1 class="mt-4 font-space-grotesk text-[clamp(1.8rem,5vw,3.8rem)] leading-[0.96]">Echo Sphere</h1>
      <p class="mt-5 max-w-3xl text-neutral-300">A high-density wireframe sphere that deforms in real-time from both music and microphone sound energy.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import EchoSphereScene from '~/components/work/EchoSphereScene.client.vue';

useSeoMeta({
  title: 'Echo Sphere — FOOSH Interactive 3D Application',
  description: 'Echo Sphere is a high-density wireframe audio-reactive 3D sphere built as an interactive web application by FOOSH.',
});
</script>
