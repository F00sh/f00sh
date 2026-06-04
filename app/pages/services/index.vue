<template>
  <div ref="root">
    <PageHero :scene="ServicesScene" eyebrow="Services" title="Creative services for 3D, animation and interactive web." intro="FOOSH combines visual design, 3D production, animation and modern web development to create clear, memorable digital experiences.">
      <div class="page-card-grid">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to" data-card class="surface-card hover:border-lime-300/60"><h2 class="text-xl sm:text-2xl">{{ item.title }}</h2><p class="mt-2 text-sm text-neutral-300 sm:text-base">{{ item.text }}</p></NuxtLink>
      </div>
    </PageHero>
  </div>
</template>
<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue';
import PageHero from '~/components/shared/PageHero.vue';
import { useGsap } from '~/composables/useGsap';
import { usePrefersReducedMotion } from '~/composables/usePrefersReducedMotion';
const ServicesScene = defineAsyncComponent(() => import('~/components/three/ServicesScene.client.vue'));
useSeoMeta({ title: 'Services — FOOSH', description: '3D modeling, animation, interactive 3D websites, and web design services by FOOSH.' });
const items = [
  { to: '/services/3d-modeling', title: '3D Modeling', text: 'Web-ready assets, product visualization, stylized models.' },
  { to: '/services/3d-animation', title: '3D Animation', text: 'Motion storytelling, product and logo animation.' },
  { to: '/services/interactive-3d-websites', title: 'Interactive 3D Websites', text: 'Three.js websites and browser-based 3D apps.' },
  { to: '/services/web-design', title: 'Web Design & Nuxt Development', text: 'Clean structure, motion, SEO and responsive delivery.' },
];
const root = ref<HTMLElement | null>(null);
const { loadGsap, trackAnimation } = useGsap();
const { prefersReducedMotion } = usePrefersReducedMotion();
onMounted(async () => {
  if (!root.value || prefersReducedMotion.value) return;
  const { gsap, ScrollTrigger } = await loadGsap();
  root.value.querySelectorAll('[data-card]').forEach((card) => {
    trackAnimation(gsap.fromTo(card, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 85%' } }));
  });
  requestAnimationFrame(() => ScrollTrigger.refresh());
});
</script>
