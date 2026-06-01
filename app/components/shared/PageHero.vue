<template>
  <section ref="root" class="relative isolate overflow-hidden py-16">
    <component :is="scene" v-if="scene" />
    <div v-else class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.12),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.1),transparent_30%)]" />
    <div class="mx-auto w-[min(94%,76rem)]">
      <p data-reveal class="text-xs uppercase tracking-[0.22em] text-lime-300">{{ eyebrow }}</p>
      <h1 data-reveal class="mt-4 text-5xl tracking-[-0.04em] md:text-8xl">{{ title }}</h1>
      <p data-reveal class="mt-6 max-w-3xl text-lg text-neutral-300">{{ intro }}</p>
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
