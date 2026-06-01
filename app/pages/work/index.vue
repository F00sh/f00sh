<template>
  <div ref="root">
    <PageHero :scene="WorkScene" eyebrow="Work" title="Selected work in 3D, animation and interactive design." intro="Interactive websites, product visualization and motion systems built to be sharp and performant.">
      <div class="mt-10 grid gap-4 md:grid-cols-2">
        <article v-for="project in projects" :key="project.title" data-card class="bg-white/[0.02] p-6">
          <div class="flex items-center justify-between gap-4">
            <p class="text-xs uppercase tracking-[0.22em] text-lime-300">{{ project.category }}</p>
            <NuxtLink
              v-if="project.galleryLink"
              :to="project.galleryLink"
              class="rounded-full bg-lime-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-950"
            >
              Gallery
            </NuxtLink>
          </div>
          <h2 class="mt-2 text-2xl">{{ project.title }}</h2>
          <p class="mt-2 text-neutral-300">{{ project.text }}</p>
        </article>
      </div>
    </PageHero>
  </div>
</template>
<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue';
import PageHero from '~/components/shared/PageHero.vue';
import { useGsap } from '~/composables/useGsap';
import { usePrefersReducedMotion } from '~/composables/usePrefersReducedMotion';
const WorkScene = defineAsyncComponent(() => import('~/components/three/WorkScene.client.vue'));
useSeoMeta({ title: 'Work — FOOSH', description: 'Portfolio projects across 3D modeling, animation and interactive web experiences.' });
const projects = [
  { category: 'Interactive Web', title: 'Echo Sphere', text: 'Audio-reactive high-density wireframe sphere that deforms in real time.', galleryLink: '/work/echo-sphere' },
  { category: '3D Modeling', title: 'Low-Poly Asset Pack', text: 'Game-ready assets optimized for performance and style.' },
  { category: 'Animation', title: 'Logo Motion Loop', text: 'Short-form cinematic logo animation for campaign launch.' },
  { category: 'Web Design', title: 'Nuxt Portfolio System', text: 'High-contrast responsive website with motion-led hierarchy.' },
];
const root = ref<HTMLElement | null>(null);
const { loadGsap, trackAnimation } = useGsap();
const { prefersReducedMotion } = usePrefersReducedMotion();
onMounted(async () => {
  if (!root.value || prefersReducedMotion.value) return;
  const { gsap } = await loadGsap();
  root.value.querySelectorAll('[data-card]').forEach((card) => {
    trackAnimation(gsap.fromTo(card, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 86%' } }));
  });
});
</script>
