<template>
  <section ref="root" class="relative isolate overflow-hidden py-12 sm:py-14 md:py-16 lg:py-20 xl:py-24">
    <component :is="scene" v-if="scene" />
    <div v-else class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.12),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.1),transparent_30%)]" />
    <div class="site-shell max-w-[88rem]">
      <p data-reveal class="text-xs uppercase tracking-[0.22em] text-lime-300">{{ eyebrow }}</p>
      <h1 data-reveal class="page-title mt-4 max-w-5xl">{{ title }}</h1>
      <p data-reveal class="page-intro">{{ intro }}</p>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useGsap } from '~/composables/useGsap';
import { usePrefersReducedMotion } from '~/composables/usePrefersReducedMotion';

defineProps<{ eyebrow: string; title: string; intro: string; scene?: unknown }>();
const root = ref<HTMLElement | null>(null);
const { loadGsap, trackAnimation } = useGsap();
const { prefersReducedMotion } = usePrefersReducedMotion();

onMounted(async () => {
  if (!root.value || prefersReducedMotion.value) return;
  const { gsap } = await loadGsap();
  trackAnimation(gsap.fromTo(root.value.querySelectorAll('[data-reveal]'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.75, ease: 'power3.out' }));
});
</script>
