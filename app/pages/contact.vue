<template><PageHero :scene="ContactScene" eyebrow="Contact" title="Have a 3D, animation or interactive web project?" intro="Send a short brief and let’s turn the idea into a sharp visual experience."><div class="mt-10 grid gap-4 md:grid-cols-2"><a data-card href="mailto:fooshmoola@gmail.com" class="border border-lime-300 p-6 text-lime-300 hover:bg-lime-300 hover:text-neutral-950">fooshmoola@gmail.com</a><div data-card class="border border-white/10 p-6 text-neutral-200">Croatia · Remote collaboration</div></div></PageHero></template>
<script setup lang="ts">
import { defineAsyncComponent, onMounted } from 'vue';
import PageHero from '~/components/shared/PageHero.vue';
import { useGsap } from '~/composables/useGsap';
import { usePrefersReducedMotion } from '~/composables/usePrefersReducedMotion';
const ContactScene = defineAsyncComponent(() => import('~/components/three/ContactScene.client.vue'));
useSeoMeta({ title: 'Contact — FOOSH', description: 'Contact FOOSH for 3D modeling, animation, and interactive web projects.' });
const { loadGsap, trackAnimation } = useGsap();
const { prefersReducedMotion } = usePrefersReducedMotion();
onMounted(async () => {
  if (prefersReducedMotion.value) return;
  const { gsap } = await loadGsap();
  document.querySelectorAll('[data-card]').forEach((card) => {
    trackAnimation(gsap.fromTo(card, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: card, start: 'top 92%' } }));
  });
});
</script>
