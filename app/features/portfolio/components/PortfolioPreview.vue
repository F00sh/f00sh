<template>
  <section class="min-h-screen bg-yellow-600 flex items-center">
    <div class="mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-16 py-14">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <p class="text-white tracking-widest uppercase text-xs sm:text-sm">Portfolio</p>
          <h2 class="text-3xl sm:text-4xl font-black uppercase text-white mt-2">
            A few highlights
          </h2>
          <p class="text-white mt-3 max-w-xl font-dm-mono">
            Selected work across web, game, animation and visual design.
          </p>
        </div>

        <NuxtLink
          to="/portfolio"
          class="inline-flex items-center justify-center bg-blue-600 text-white drop-shadow-md px-5 py-2 hover:bg-black/70 w-fit"
        >
          View all
        </NuxtLink>
      </div>

      <!-- Preview grid (smaller than full portfolio page) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <button
          v-for="project in previewProjects"
          :key="project.id"
          type="button"
          class="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/40 text-left"
          @click="openProject(project)"
        >
          <div class="aspect-[4/3] w-full overflow-hidden">
            <img
              :src="project.cover"
              :alt="project.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              loading="lazy"
            />
          </div>

          <div class="p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-white font-bold text-lg leading-tight">
                  {{ project.title }}
                </h3>
                <p class="text-white/70 text-sm mt-1">
                  {{ project.subtitle }}
                </p>
              </div>

              <span class="chip">{{ project.tag }}</span>
            </div>
          </div>

          <div
            class="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style="background: linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0) 55%);"
          />
        </button>
      </div>
    </div>

    <!-- Fullscreen modal (same behavior as portfolio page) -->
    <Teleport to="body">
      <div v-if="isOpen" class="fixed inset-0 z-[60]">
        <div class="absolute inset-0 bg-black/80" @click="close"></div>

        <div class="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
          <div class="relative w-full h-full max-w-6xl">
            <button
              type="button"
              class="absolute right-3 top-3 z-10 rounded-full bg-black/60 text-white border border-white/20 px-4 py-2 hover:bg-black/80"
              @click="close"
            >
              Close
            </button>

            <div class="absolute left-3 top-3 z-10 pr-28">
              <div class="rounded-2xl bg-black/55 border border-white/15 px-4 py-3">
                <p class="text-white font-bold leading-tight">{{ activeProject?.title }}</p>
                <p class="text-white/70 text-sm">{{ activeProject?.subtitle }}</p>
              </div>
            </div>

            <div class="h-full w-full rounded-2xl overflow-hidden border border-white/15 bg-black">
              <div class="h-full w-full grid grid-rows-[1fr_auto]">
                <div class="relative h-full w-full flex items-center justify-center">
                  <img
                    v-if="activeImage"
                    :src="activeImage"
                    :alt="activeProject?.title || 'Project image'"
                    class="max-h-full max-w-full object-contain"
                  />

                  <button type="button" class="nav-btn left-3" @click="prev" :disabled="!canNav">
                    Prev
                  </button>
                  <button type="button" class="nav-btn right-3" @click="next" :disabled="!canNav">
                    Next
                  </button>

                  <div class="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 border border-white/15 px-3 py-1 text-white/85 text-sm">
                    {{ activeIndex + 1 }} / {{ activeProject?.images?.length || 0 }}
                  </div>
                </div>

                <div class="w-full overflow-x-auto border-t border-white/10 bg-black/60">
                  <div class="flex gap-2 p-3">
                    <button
                      v-for="(img, idx) in (activeProject?.images || [])"
                      :key="img"
                      type="button"
                      class="thumb"
                      :class="{ 'thumb--active': idx === activeIndex }"
                      @click="activeIndex = idx"
                    >
                      <img :src="img" :alt="`Thumbnail ${idx + 1}`" class="h-full w-full object-cover" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p class="hidden md:block text-white/60 text-xs mt-3 text-center">
              Tip: use ← / → to navigate, ESC to close.
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { portfolioProjects, type PortfolioProject } from '~/features/portfolio/data/portfolioProjects'

const props = defineProps<{
  limit?: number
}>()

const limit = computed(() => props.limit ?? 3)
const previewProjects = computed(() => portfolioProjects.slice(0, limit.value))

const isOpen = ref(false)
const activeProject = ref<PortfolioProject | null>(null)
const activeIndex = ref(0)

const activeImage = computed(() => activeProject.value?.images?.[activeIndex.value] || '')
const canNav = computed(() => (activeProject.value?.images?.length || 0) > 1)

function openProject(project: PortfolioProject) {
  activeProject.value = project
  activeIndex.value = 0
  isOpen.value = true
  document.documentElement.style.overflow = 'hidden'
}

function close() {
  isOpen.value = false
  activeProject.value = null
  activeIndex.value = 0
  document.documentElement.style.overflow = ''
}

function prev() {
  if (!activeProject.value?.images?.length) return
  const n = activeProject.value.images.length
  activeIndex.value = (activeIndex.value - 1 + n) % n
}

function next() {
  if (!activeProject.value?.images?.length) return
  const n = activeProject.value.images.length
  activeIndex.value = (activeIndex.value + 1) % n
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.45);
  color: rgba(255, 255, 255, 0.9);
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  line-height: 1;
  white-space: nowrap;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.5rem 0.9rem;
}
.nav-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.thumb {
  width: 88px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  flex: 0 0 auto;
}
.thumb--active {
  border-color: rgba(255, 255, 255, 0.45);
}
</style>
