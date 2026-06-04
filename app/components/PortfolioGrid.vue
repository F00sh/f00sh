<template>
  <section class="relative pb-20 pt-24 sm:pt-28 lg:pt-32">
    <div class="site-shell max-w-[88rem]">
      <div class="grid gap-10 border-b border-neutral-800 pb-12 lg:grid-cols-12 lg:items-end">
        <div class="lg:col-span-8">
          <p class="portfolio-meta mb-4 text-xs uppercase tracking-[0.2em] text-neutral-500">
            Portfolio
          </p>
          <h1 class="portfolio-headline font-archivo-black text-[clamp(2.4rem,7.4vw,5.8rem)] leading-[0.95] text-neutral-50">
            Selected<br />
            Work
          </h1>
        </div>

        <div class="lg:col-span-4 lg:justify-self-end">
          <p class="portfolio-meta max-w-sm text-sm text-neutral-300">
            Product design, UI systems, web execution, 3D production, and animation craft.
          </p>
          <NuxtLink
            to="/"
            class="portfolio-meta mt-6 inline-flex items-center border border-neutral-700 px-4 py-3 text-xs uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-lime-400 hover:text-lime-400 focus-outline motion-reduce:transition-none"
          >
            Back home
          </NuxtLink>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        <button
          v-for="project in projects"
          :key="project.id"
          type="button"
          class="portfolio-card group relative overflow-hidden border border-neutral-800 bg-neutral-900 text-left"
          @click="openProject(project)"
        >
          <div class="aspect-[4/3] overflow-hidden">
            <img
              :src="project.cover"
              :alt="project.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
              loading="lazy"
            />
          </div>

          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-4 pb-4 pt-14 sm:px-5 sm:pb-5 sm:pt-16">
            <p class="text-xs uppercase tracking-[0.2em] text-neutral-400">{{ project.tag }}</p>
            <h2 class="mt-2 text-2xl font-black uppercase text-neutral-50 transition-transform duration-300 group-hover:-translate-y-1 sm:text-3xl motion-reduce:transition-none">
              {{ project.title }}
            </h2>
            <p class="mt-2 max-w-md text-sm text-neutral-300">
              {{ project.subtitle }}
            </p>
          </div>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isOpen" class="fixed inset-0 z-[70]">
        <div class="absolute inset-0 bg-black/90 backdrop-blur-sm" @click="close" />

        <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 lg:p-6">
          <article class="relative h-full w-full max-w-7xl overflow-hidden border border-neutral-700 bg-neutral-950">
            <button
              type="button"
              class="absolute right-2 top-2 z-20 border border-neutral-600 bg-black/60 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-100 transition-colors hover:border-lime-400 hover:text-lime-400 focus-outline sm:right-3 sm:top-3 sm:px-4 sm:text-xs motion-reduce:transition-none"
              @click="close"
            >
              Close
            </button>

            <header class="absolute left-2 top-2 z-20 max-w-[calc(100%-6rem)] border border-neutral-700 bg-black/65 px-3 py-2 sm:left-3 sm:top-3 sm:max-w-[70%] sm:px-4 sm:py-3">
              <p class="text-xs uppercase tracking-[0.2em] text-neutral-400">{{ activeProject?.tag }}</p>
              <h3 class="mt-1 text-lg font-black uppercase text-neutral-50 sm:text-2xl">
                {{ activeProject?.title }}
              </h3>
              <p class="mt-1 text-xs text-neutral-300 sm:text-sm">
                {{ activeProject?.subtitle }}
              </p>
            </header>

            <div class="grid h-full grid-rows-[1fr_auto]">
              <div class="relative flex items-center justify-center overflow-hidden bg-neutral-950 px-3 pb-14 pt-20 sm:p-6 sm:pt-24">
                <img
                  v-if="activeImage"
                  :src="activeImage"
                  :alt="activeProject?.title || 'Project image'"
                  class="max-h-full max-w-full object-contain"
                />

                <button
                  type="button"
                  class="nav-btn left-3"
                  @click="prev"
                  :disabled="!canNav"
                  aria-label="Previous image"
                >
                  Prev
                </button>
                <button
                  type="button"
                  class="nav-btn right-3"
                  @click="next"
                  :disabled="!canNav"
                  aria-label="Next image"
                >
                  Next
                </button>

                <p class="absolute bottom-3 left-1/2 -translate-x-1/2 border border-neutral-700 bg-black/65 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-neutral-200 sm:bottom-4 sm:text-xs">
                  {{ activeIndex + 1 }} / {{ activeProject?.images?.length || 0 }}
                </p>
              </div>

              <div class="overflow-x-auto border-t border-neutral-800 bg-neutral-900/95">
                <div class="flex gap-2 p-3">
                  <button
                    v-for="(img, idx) in activeProject?.images || []"
                    :key="img"
                    type="button"
                    :class="idx === activeIndex ? 'thumb thumb--active' : 'thumb'"
                    :aria-label="`Open thumbnail ${idx + 1}`"
                    @click="activeIndex = idx"
                  >
                    <img :src="img" :alt="`Thumbnail ${idx + 1}`" class="h-full w-full object-cover" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { portfolioProjects, type PortfolioProject } from "~/data/portfolioProjects";
import { useAnime } from "~/composables/useAnime";
import { usePrefersReducedMotion } from "~/composables/usePrefersReducedMotion";

const projects = portfolioProjects;
const isOpen = ref(false);
const activeProject = ref<PortfolioProject | null>(null);
const activeIndex = ref(0);

const activeImage = computed(() => activeProject.value?.images?.[activeIndex.value] || "");
const canNav = computed(() => (activeProject.value?.images?.length || 0) > 1);

const { loadAnime, track } = useAnime();
const { prefersReducedMotion } = usePrefersReducedMotion();

function openProject(project: PortfolioProject) {
  activeProject.value = project;
  activeIndex.value = 0;
  isOpen.value = true;
  document.documentElement.style.overflow = "hidden";
}

function close() {
  isOpen.value = false;
  activeProject.value = null;
  activeIndex.value = 0;
  document.documentElement.style.overflow = "";
}

function prev() {
  if (!activeProject.value?.images.length) return;
  const total = activeProject.value.images.length;
  activeIndex.value = (activeIndex.value - 1 + total) % total;
}

function next() {
  if (!activeProject.value?.images.length) return;
  const total = activeProject.value.images.length;
  activeIndex.value = (activeIndex.value + 1) % total;
}

function onKeydown(event: KeyboardEvent) {
  if (!isOpen.value) return;
  if (event.key === "Escape") close();
  if (event.key === "ArrowLeft") prev();
  if (event.key === "ArrowRight") next();
}

onMounted(async () => {
  window.addEventListener("keydown", onKeydown);

  if (prefersReducedMotion.value) return;
  const { animate, stagger } = await loadAnime();
  const cards = document.querySelectorAll(".portfolio-card");
  const meta = document.querySelectorAll(".portfolio-meta, .portfolio-headline");

  track(
    animate(meta, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 700,
      delay: stagger(80),
      ease: "outCubic",
    }),
  );

  track(
    animate(cards, {
      opacity: [0, 1],
      translateY: [26, 0],
      duration: 850,
      delay: stagger(100, { start: 220 }),
      ease: "outExpo",
    }),
  );
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  document.documentElement.style.overflow = "";
});
</script>

<style scoped>
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid rgba(82, 82, 82, 1);
  background: rgba(10, 10, 10, 0.72);
  color: rgba(250, 250, 250, 1);
  padding: 0.55rem 0.92rem;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.nav-btn:disabled {
  opacity: 0.38;
  cursor: default;
}

.thumb {
  width: 92px;
  height: 64px;
  border: 1px solid rgba(64, 64, 64, 1);
  flex: 0 0 auto;
  overflow: hidden;
}

.thumb--active {
  border-color: rgba(163, 230, 53, 1);
}

@media (prefers-reduced-motion: no-preference) {
  .portfolio-meta,
  .portfolio-headline,
  .portfolio-card {
    opacity: 0;
  }
}
</style>
