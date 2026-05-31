<template>
  <main class="relative z-10 bg-neutral-950 text-neutral-50">
    <SiteHeader />
    <ScrollOnePager />
    <SiteFooter />
  </main>
</template>

<script setup lang="ts">
import ScrollOnePager from "~/components/home/ScrollOnePager.vue";

useHead({
  title: "f00sh - 3D interactive portfolio",
  meta: [
    {
      name: "description",
      content: "A Three.js and GSAP-powered one-page portfolio with scroll-driven 3D transitions.",
    },
  ],
});
</script>
