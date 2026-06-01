<template>
  <section ref="root" class="relative isolate overflow-hidden">
    <SectionAtmosphere class="absolute inset-0 -z-10" :speed="0.5" :density="140" />
    <div class="mx-auto grid w-[min(94%,76rem)] min-h-[72vh] items-end gap-8 py-16 md:grid-cols-12">
      <div class="md:col-span-8">
        <p data-reveal class="text-xs uppercase tracking-[0.25em] text-lime-300">creative studio</p>
        <h1 data-reveal class="mt-5 text-[18vw] leading-[0.78] tracking-[-0.07em] text-white md:text-[10vw]">f00sh</h1>
        <p data-reveal class="mt-6 max-w-2xl text-lg text-neutral-200">3D visuals, animation and interactive web experiences.</p>
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
