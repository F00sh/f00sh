<template>
  <section ref="detailRoot" class="relative px-4 pb-20 pt-32 sm:px-8 lg:px-10">
    <div class="mx-auto w-full max-w-[90rem]">
      <NuxtLink to="/portfolio" class="mb-8 inline-flex border border-[var(--foosh-violet)] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[var(--foosh-text)] transition-colors hover:border-[var(--foosh-cyan)] hover:text-[var(--foosh-cyan)] focus-outline">
        Back to archive
      </NuxtLink>

      <div class="detail-reveal grid gap-10 border-b border-[var(--foosh-line)] pb-14 lg:grid-cols-12 lg:items-end">
        <div class="lg:col-span-8">
          <p class="text-xs uppercase tracking-[0.24em] text-[var(--foosh-muted)]">{{ project.tag }} · {{ project.year }}</p>
          <h1 class="mt-4 font-josefin text-[clamp(2.1rem,7vw,5rem)] leading-[0.94] uppercase text-[var(--foosh-text)]">
            {{ project.title }}
          </h1>
          <p class="mt-5 max-w-2xl text-lg text-[var(--foosh-muted)]">
            {{ project.description }}
          </p>
        </div>

        <div class="vapor-card p-5 lg:col-span-4">
          <p class="text-xs uppercase tracking-[0.2em] text-[var(--foosh-muted)]">Location</p>
          <p class="mt-2 text-lg text-[var(--foosh-text)]">{{ project.location }}</p>
          <p class="mt-6 text-xs uppercase tracking-[0.2em] text-[var(--foosh-muted)]">Services</p>
          <ul class="mt-2 space-y-1 text-sm uppercase tracking-[0.16em] text-[var(--foosh-text)]">
            <li v-for="item in project.services" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>

      <div class="mt-10 space-y-6">
        <article v-for="(image, index) in project.images" :key="image" class="detail-reveal vapor-card overflow-hidden p-3">
          <img :src="image" :alt="`${project.title} preview ${index + 1}`" class="h-auto w-full object-cover" loading="lazy" />
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { PortfolioProject } from "~/data/portfolioProjects";
import { usePrefersReducedMotion } from "~/composables/usePrefersReducedMotion";
import { useGsap } from "~/composables/useGsap";

const { project } = defineProps<{
  project: PortfolioProject;
}>();

const detailRoot = ref<HTMLElement | null>(null);
const { prefersReducedMotion } = usePrefersReducedMotion();
const { loadGsap, trackAnimation } = useGsap();

onMounted(async () => {
  if (!detailRoot.value || prefersReducedMotion.value) return;

  const { gsap } = await loadGsap();
  const blocks = detailRoot.value.querySelectorAll(".detail-reveal");

  trackAnimation(
    gsap.fromTo(
      blocks,
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.92,
        stagger: 0.11,
        ease: "power3.out",
      },
    ),
  );
});
</script>
