<template><PageHero :scene="AboutScene" eyebrow="About" title="Product design, 3D, animation and web connected through visual thinking." intro="FOOSH is the creative work of Marko Vilipić, combining product design experience, 3D visualization, animation, and interactive Nuxt development."><ul class="mt-8 grid gap-3 text-neutral-200 md:grid-cols-2"><li v-for="capability in capabilities" :key="capability" data-card class="border border-white/10 p-4">{{ capability }}</li></ul></PageHero></template>
<script setup lang="ts">
import { defineAsyncComponent, onMounted } from 'vue';
import PageHero from '~/components/shared/PageHero.vue';
import { useGsap } from '~/composables/useGsap';
import { usePrefersReducedMotion } from '~/composables/usePrefersReducedMotion';
const AboutScene = defineAsyncComponent(() => import('~/components/three/AboutScene.client.vue'));
useSeoMeta({ title: 'About — FOOSH', description: 'About FOOSH: product design background, 3D, animation, and interactive web development.' });
const capabilities = ['Product and industrial design background','3D visualization and web-ready assets','Three.js and Nuxt interactive experiences','Motion design and visual storytelling','Croatia-based, remote-friendly collaboration','Practical, performance-aware creative development'];
const { loadGsap, trackAnimation } = useGsap();
const { prefersReducedMotion } = usePrefersReducedMotion();
onMounted(async () => {
  if (prefersReducedMotion.value) return;
  const { gsap } = await loadGsap();
  document.querySelectorAll('[data-card]').forEach((card) => {
    trackAnimation(gsap.fromTo(card, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out', scrollTrigger: { trigger: card, start: 'top 90%' } }));
  });
});
</script>
