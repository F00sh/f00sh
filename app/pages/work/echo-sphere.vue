<template>
  <section class="relative min-h-screen overflow-hidden">
    <div class="pointer-events-none fixed inset-0 z-0">
      <EchoSphereScene />
    </div>
    <div class="relative z-10 mx-auto w-[min(94%,76rem)] py-16">
      <p class="font-ibm-plex-mono text-xs uppercase tracking-[0.24em] text-lime-300">Interactive 3D Application</p>
      <h1 class="mt-4 font-space-grotesk text-[clamp(2.2rem,8vw,6rem)] leading-[0.9] tracking-[-0.03em]">Echo Sphere</h1>
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
