<template>
  <main class="relative z-10 min-h-screen bg-neutral-950 text-neutral-50">
    <HeroScene />
    <SiteHeader />
    <PortfolioGrid />
    <SiteFooter />
  </main>
</template>

<script setup lang="ts">
import HeroScene from "~/components/three/HeroScene.client.vue";

useHead({
  title: "f00sh — portfolio",
  meta: [
    {
      name: "description",
      content:
        "Selected FOOSH work across web, UI/UX, game assets, 3D, and animation.",
    },
  ],
});
</script>
