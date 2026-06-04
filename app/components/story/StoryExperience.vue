<template>
  <div ref="root" class="relative isolate overflow-x-clip bg-[#070403] text-stone-100">
    <div class="pointer-events-none fixed inset-0 z-0">
      <ClientOnly>
        <StoryCanvas
          :sections="sections"
          :progress="progress"
          :active-section-id="activeSectionId"
          :section-progress="sectionProgress"
        />
        <template #fallback>
          <div class="h-full w-full bg-[radial-gradient(circle_at_50%_12%,rgba(225,181,105,0.12),transparent_26%),linear-gradient(180deg,#070403,#110b09_46%,#050303)]" />
        </template>
      </ClientOnly>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(252,219,148,0.08),transparent_28%),linear-gradient(180deg,rgba(3,2,2,0.08),rgba(4,3,3,0.7)_68%,rgba(4,3,3,0.94))]" />
    </div>

    <div class="pointer-events-none fixed inset-0 z-10 bg-[linear-gradient(180deg,rgba(5,3,2,0.86),transparent_14%,transparent_78%,rgba(4,3,2,0.94))]" />

    <header class="pointer-events-none fixed inset-x-0 top-0 z-30 px-4 py-4 sm:px-6 lg:px-8">
      <div class="mx-auto flex w-full max-w-6xl items-start justify-between gap-4">
        <div class="pointer-events-auto max-w-md border border-white/10 bg-black/28 px-4 py-3 backdrop-blur-md">
          <p class="text-[0.62rem] uppercase tracking-[0.3em] text-amber-100/78">Interactive Storybook</p>
          <h1 class="mt-2 font-josefin text-2xl leading-none text-stone-50 sm:text-3xl">Rumpelstiltskin</h1>
          <p class="mt-2 max-w-sm text-xs leading-6 text-stone-200/72 sm:text-sm">
            Scroll through a paper-theater retelling with one persistent camera traveling across eleven staged worlds.
          </p>
        </div>

        <NuxtLink
          to="/work/interactive-web"
          class="pointer-events-auto inline-flex items-center gap-2 border border-white/10 bg-black/42 px-4 py-3 text-[0.64rem] uppercase tracking-[0.22em] text-stone-100 backdrop-blur-md transition-colors hover:border-amber-200/40 hover:text-amber-100"
        >
          Back
        </NuxtLink>
      </div>
    </header>

    <div class="relative z-20">
      <StorySection
        v-for="(section, index) in sections"
        :key="section.id"
        :active="activeSectionId === section.id"
        :index="index"
        :section="section"
        :section-ref="(element) => setSectionRef(section.id, element)"
      />
    </div>

    <div class="pointer-events-none fixed inset-x-4 bottom-4 z-30 sm:inset-x-6 lg:inset-x-8">
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 border border-white/10 bg-black/34 px-4 py-3 backdrop-blur-md">
        <div>
          <p class="text-[0.58rem] uppercase tracking-[0.28em] text-amber-100/72">Current Scene</p>
          <p class="mt-1 text-sm text-stone-100">{{ activeTitle }}</p>
        </div>

        <div class="w-32 sm:w-48">
          <div class="h-px bg-white/16">
            <div class="h-px bg-amber-200 transition-[width] duration-200" :style="{ width: `${progressPercent}%` }" />
          </div>
          <p class="mt-2 text-right text-[0.58rem] uppercase tracking-[0.24em] text-stone-300/72">{{ progressPercent }}%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted } from 'vue';
import StoryCanvas from '~/components/story/StoryCanvas.vue';
import StorySection from '~/components/story/StorySection.vue';
import { useScrollProgress } from '~/composables/useScrollProgress';
import { rumpelstiltskinSections } from '~/data/rumpelstiltskin';

const sections = rumpelstiltskinSections;
const sectionIds = sections.map((section) => section.id);
const { root, progress, activeSectionId, sectionProgress, setSectionRef, initializeScroll } = useScrollProgress(sectionIds);

const activeTitle = computed(
  () => sections.find((section) => section.id === activeSectionId.value)?.title ?? sections[0]?.title ?? '',
);
const progressPercent = computed(() => Math.round(progress.value * 100));

onMounted(async () => {
  await nextTick();
  await initializeScroll();
});
</script>
