<template>
  <section id="portfolio" class="border-t border-neutral-800 px-4 py-20 sm:px-8 lg:px-10">
    <div class="mx-auto w-full max-w-[88rem]">
      <div class="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">Portfolio</p>
          <h2 class="font-archivo-black text-4xl leading-[0.98] text-neutral-50 sm:text-5xl lg:text-6xl">
            Selected Work
          </h2>
        </div>
        <NuxtLink to="/portfolio" class="inline-flex w-fit items-center gap-2 border border-lime-400 px-5 py-3 text-xs uppercase tracking-[0.2em] text-lime-400 transition-colors hover:bg-lime-400 hover:text-neutral-950 focus-outline motion-reduce:transition-none">
          View full archive
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <article
          v-for="project in homeProjects"
          :key="project.id"
          class="group relative overflow-hidden border border-neutral-800 bg-neutral-900"
        >
          <div class="aspect-[4/3] overflow-hidden">
            <img
              :src="project.image"
              :alt="project.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
              loading="lazy"
            />
          </div>

          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/65 to-transparent px-5 pb-5 pt-14">
            <p class="text-xs uppercase tracking-[0.2em] text-neutral-400">{{ project.category }}</p>
            <h3 class="mt-2 text-3xl font-black uppercase text-neutral-50 transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
              {{ project.title }}
            </h3>
            <p class="mt-2 max-w-md text-sm text-neutral-300">
              {{ project.description }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { homeProjects } from "~/data/projects";
</script>
