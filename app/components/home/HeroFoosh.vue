<template>
  <section ref="root" class="relative isolate overflow-hidden">
    <SectionAtmosphere class="absolute inset-0 -z-10" :speed="0.5" :density="140" />
    <div class="site-shell grid min-h-[66svh] items-end gap-8 py-12 sm:min-h-[70svh] sm:py-14 md:min-h-[72vh] md:grid-cols-12 md:py-16 xl:min-h-[76vh] xl:py-20">
      <div class="md:col-span-8">
        <p data-reveal class="text-xs uppercase tracking-[0.25em] text-lime-300">creative studio</p>
        <h1 data-reveal class="mt-5 text-[clamp(4rem,18vw,9rem)] leading-[0.86] text-white md:text-[clamp(5rem,10vw,10rem)]">f00sh</h1>
        <p data-reveal class="mt-5 max-w-2xl text-base text-neutral-200 sm:mt-6 sm:text-lg">3D visuals, animation and interactive web experiences.</p>
        <div data-reveal class="mt-8 flex flex-wrap gap-3">
          <NuxtLink to="/work" class="rounded-full border border-lime-300 px-5 py-3 text-xs uppercase tracking-[0.2em] text-lime-300 hover:bg-lime-300 hover:text-neutral-950">View work</NuxtLink>
          <NuxtLink to="/contact" class="rounded-full bg-lime-300 px-5 py-3 text-xs uppercase tracking-[0.2em] text-neutral-950">Start a project</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue';
import { useGsap } from '~/composables/useGsap';
import { usePrefersReducedMotion } from '~/composables/usePrefersReducedMotion';

const SectionAtmosphere = defineAsyncComponent(() => import('~/components/three/SectionAtmosphere.client.vue'));
const root = ref<HTMLElement | null>(null);
const { loadGsap, trackAnimation } = useGsap();
const { prefersReducedMotion } = usePrefersReducedMotion();

onMounted(async () => {
  if (!root.value || prefersReducedMotion.value) return;
  const { gsap } = await loadGsap();
  const animation = gsap.fromTo(root.value.querySelectorAll('[data-reveal]'), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' });
  trackAnimation(animation);
});
</script>
