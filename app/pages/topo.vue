<template>
  <section class="topo-shell">
    <TopographyScene ref="scene" :settings="settings" :show-ui="showUi" />
    <div v-show="showUi">
    <TopographyControls
      :settings="settings"
      :status="status"
      @update="settings = $event"
      @upload="loadHeightmap"
      @randomize="randomize"
      @reset-camera="scene?.resetCamera()"
      @screenshot="scene?.screenshot()"
    />
    <NuxtLink class="topo-exit" to="/work/interactive-web" aria-label="Close topography project">×</NuxtLink>
    <div class="topo-title" aria-hidden="true">
      <span>Procedural cartography</span>
      <strong>Topographic<br>field study</strong>
    </div>
    </div>
    <button class="topo-ui-toggle" type="button" :aria-pressed="!showUi" @click="showUi = !showUi">
      {{ showUi ? 'Hide UI' : 'Show UI' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import TopographyControls from '~/components/topography/TopographyControls.vue';
import TopographyScene from '~/components/topography/TopographyScene.client.vue';
import type { TopographySettings } from '~/utils/topography/types';

const scene = ref<InstanceType<typeof TopographyScene> | null>(null);
const showUi = ref(true);
const settings = ref<TopographySettings>({
  seed: 284,
  resolution: 64,
  maxHeight: 18,
  noiseScale: 5.5,
  octaves: 5,
  persistence: 0.52,
  smoothing: 1,
  contourStep: 1.5,
  verticalExaggeration: 0.85,
  terrainOpacity: 0.12,
  showTerrain: true,
  showContours: true,
  showConnectors: false,
  autoRotate: true,
  scanLine: true,
  mode: 'layers',
});
const status = ref('');

const randomize = async () => {
  status.value = '';
  settings.value = { ...settings.value, seed: Math.floor(Math.random() * 998) + 1 };
  await nextTick();
  scene.value?.regenerate(true);
};

const loadHeightmap = async (file: File) => {
  status.value = 'Reading heightmap...';
  try {
    await scene.value?.loadHeightmap(file);
    status.value = `Loaded ${file.name}`;
  } catch (error) {
    status.value = error instanceof Error ? error.message : 'Heightmap import failed.';
  }
};

useSeoMeta({
  title: 'TOPO — Interactive Topographic Field',
  description: 'A procedural and heightmap-driven interactive 3D topography generator by FOOSH.',
});
</script>

<style scoped>
.topo-shell { position: fixed; z-index: 100; inset: 0; width: 100vw; height: 100dvh; overflow: hidden; background: #030706; }
.topo-ui-toggle { position: fixed; z-index: 30; right: max(1rem, env(safe-area-inset-right)); bottom: max(1rem, env(safe-area-inset-bottom)); border: 1px solid #b8d9c833; background: #07100dd9; padding: .65rem .8rem; color: #cfe3d8; font: 500 9px/1 "Montserrat", sans-serif; letter-spacing: .14em; text-transform: uppercase; backdrop-filter: blur(14px); }
.topo-ui-toggle:hover { border-color: #c7ffe099; color: white; }
.topo-exit { position: fixed; z-index: 20; right: max(1rem, env(safe-area-inset-right)); top: max(1rem, env(safe-area-inset-top)); display: grid; width: clamp(2.25rem, 7vmin, 2.75rem); height: clamp(2.25rem, 7vmin, 2.75rem); place-items: center; border: 1px solid #b8d9c833; background: #07100dbb; color: #cfe3d8; font-size: 1.5rem; line-height: 1; backdrop-filter: blur(14px); }
.topo-exit:hover { border-color: #c7ffe099; color: white; }
.topo-title { position: fixed; z-index: 5; left: 50%; bottom: max(1rem, env(safe-area-inset-bottom)); transform: translateX(-50%); width: max-content; text-align: center; color: #d7e9df; pointer-events: none; text-transform: uppercase; }
.topo-title span { display: block; margin-bottom: .35rem; color: #82958b; font: 500 8px/1 "Montserrat", sans-serif; letter-spacing: .25em; }
.topo-title strong { font: 500 clamp(1rem, 2vw, 1.7rem)/.9 "Josefin Sans", sans-serif; letter-spacing: .16em; }
@media (max-width: 640px) { .topo-title { display: none; } }
@media (orientation: landscape) and (max-height: 640px) { .topo-title { display: none; } }
</style>
