<template>
  <div ref="root">
    <PageHero :scene="WorkScene" eyebrow="Work" title="Selected work in 3D, animation and interactive design." intro="Interactive websites, product visualization and motion systems built to be sharp and performant.">
      <div class="mt-10 grid gap-4 md:grid-cols-2">
        <NuxtLink
          v-for="project in projects"
          :key="project.title"
          :to="project.link || '/work'"
          data-card
          class="block bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.05]"
        >
          <p class="text-xs uppercase tracking-[0.22em] text-lime-300">{{ project.category }}</p>
          <h2 class="mt-2 text-2xl">{{ project.title }}</h2>
          <p class="mt-2 text-neutral-300">{{ project.text }}</p>
        </NuxtLink>
      </div>
    </PageHero>
  </div>
</template>
<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue';
import PageHero from '~/components/ui/PageHero.vue';
import { useGsap } from '~/composables/useGsap';
import { usePrefersReducedMotion } from '~/composables/usePrefersReducedMotion';
const WorkScene = defineAsyncComponent(() => import('~/components/three/WorkScene.client.vue'));
useSeoMeta({ title: 'Work — FOOSH', description: 'Portfolio projects across 3D modeling, animation and interactive web experiences.' });
const projects = [
  { category: 'Interactive Web', title: 'Interactive Web Projects', text: 'Browser-based 3D experiences, audio-reactive scenes and WebGL interfaces.', link: '/work/interactive-web' },
  { category: '3D Modeling', title: 'Low-Poly Asset Pack', text: 'Game-ready assets optimized for performance and style.', link: '/work' },
  { category: 'Animation', title: 'Logo Motion Loop', text: 'Short-form cinematic logo animation for campaign launch.', link: '/work' },
  { category: 'Web Design', title: 'Nuxt Portfolio System', text: 'High-contrast responsive website with motion-led hierarchy.', link: '/work' },
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
