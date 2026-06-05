<template>
  <NuxtLink :to="`/portfolio/${project.id}`" class="portfolio-card vapor-card group relative block overflow-hidden">
    <div class="aspect-[4/3] overflow-hidden border border-[var(--foosh-line)]">
      <img
        :src="project.cover"
        :alt="project.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
        loading="lazy"
      />
    </div>
    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/50 to-transparent px-5 pb-5 pt-16">
      <p class="text-xs uppercase tracking-[0.2em] text-neutral-200">{{ project.tag }}</p>
      <h2 class="mt-2 font-josefin text-3xl leading-[0.95] uppercase text-white sm:text-4xl">
        {{ project.title }}
      </h2>
      <p class="mt-2 max-w-md text-sm text-neutral-100">
        {{ project.subtitle }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { PortfolioProject } from "~/features/portfolio/data/portfolioProjects";

defineProps<{
  project: PortfolioProject;
}>();
</script>
