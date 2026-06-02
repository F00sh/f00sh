<template>
  <section class="relative h-screen h-[100svh] h-[100dvh] overflow-hidden">
    <div class="pointer-events-none absolute inset-0 z-0 h-screen h-[100svh] h-[100dvh]">
      <KineticSphereScene />
    </div>
    <div class="relative z-10 mx-auto w-[min(94%,76rem)] py-16">
      <p class="font-ibm-plex-mono text-xs uppercase tracking-[0.24em] text-lime-300">Interactive 3D Game</p>
      <h1 class="mt-4 font-space-grotesk text-[clamp(1.8rem,5vw,3.8rem)] leading-[0.96]">Kinetic Sphere</h1>
      <p class="mt-5 max-w-3xl text-neutral-300">
        Click to summon an invisible collider wall that shoves the sphere forward across neverending procedural wireframe terrain.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import KineticSphereScene from '~/components/work/KineticSphereScene.client.vue';

useSeoMeta({
  title: 'Kinetic Sphere — FOOSH Interactive 3D Game',
  description: 'Kinetic Sphere is a procedural wireframe terrain game where click-driven invisible collider pushes propel a sphere forward.',
});
</script>
