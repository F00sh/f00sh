<template>
  <div ref="root">
    <PageHero
      :scene="WorkScene"
      eyebrow="Work"
      title="Interactive Web Projects"
      intro="Realtime 3D and interactive experiences built for speed, clarity and visual impact."
    >
      <div class="mt-10 grid gap-4 md:grid-cols-2">
        <NuxtLink
          v-for="project in projects"
          :key="project.title"
          :to="project.link"
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
import PageHero from '~/components/shared/PageHero.vue';
import { useGsap } from '~/composables/useGsap';
import { usePrefersReducedMotion } from '~/composables/usePrefersReducedMotion';

const WorkScene = defineAsyncComponent(() => import('~/components/three/WorkScene.client.vue'));

useSeoMeta({
  title: 'Interactive Web Projects — FOOSH',
  description: 'Interactive web projects by FOOSH, including Echo Sphere, Sound Surfer and realtime 3D experiences.'
});

const projects = [
  {
    category: 'Interactive 3D Application',
    title: 'Echo Sphere',
    text: 'Audio-reactive wireframe ico sphere with realtime deformation, particles and mic input.',
    link: '/work/echo-sphere'
  },
  {
    category: 'Interactive Audio Experience',
    title: 'Sound Surfer',
    text: 'An audio-reactive surfing experience where sound energy drives motion, waves and visual feedback.',
    link: '/work/sound-surfer'
  },
  {
    category: 'Interactive 3D Game',
    title: 'Kinetic Sphere',
    text: 'Click-driven invisible wall collider pushes a sphere through endless procedural wireframe terrain.',
    link: '/work/kinetic-sphere'
  }
];

const root = ref<HTMLElement | null>(null);
const { loadGsap, trackAnimation } = useGsap();
const { prefersReducedMotion } = usePrefersReducedMotion();

onMounted(async () => {
  if (!root.value || prefersReducedMotion.value) return;
  const { gsap } = await loadGsap();
  root.value.querySelectorAll('[data-card]').forEach((card) => {
    trackAnimation(
      gsap.fromTo(
        card,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 86%' } }
      )
    );
  });
});
</script>
