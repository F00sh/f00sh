<template>
  <aside class="topo-panel" :class="{ 'topo-panel--open': open }">
    <button class="topo-panel__toggle" type="button" :aria-expanded="open" @click="open = !open">
      {{ open ? 'Close controls' : 'Map controls' }}
    </button>

    <div v-show="open" class="topo-panel__body">
      <header class="topo-panel__header">
        <span>Terrain system / 01</span>
        <strong>TOPO</strong>
      </header>

      <label class="topo-upload">
        <input type="file" accept="image/png,image/jpeg" @change="onUpload">
        <span>Import heightmap</span>
        <small>PNG / JPG</small>
      </label>
      <p v-if="status" class="topo-status" aria-live="polite">{{ status }}</p>

      <div class="topo-modes">
        <button
          v-for="mode in modes"
          :key="mode.value"
          type="button"
          :class="{ active: settings.mode === mode.value }"
          @click="update('mode', mode.value)"
        >
          {{ mode.label }}
        </button>
      </div>

      <div class="topo-controls">
        <label>
          <span>Seed <output>{{ settings.seed }}</output></span>
          <input :value="settings.seed" type="range" min="1" max="999" step="1" @input="numberUpdate('seed', $event)">
        </label>
        <label>
          <span>Resolution <output>{{ settings.resolution }}</output></span>
          <input :value="settings.resolution" type="range" min="32" max="128" step="16" @input="numberUpdate('resolution', $event)">
        </label>
        <label>
          <span>Relief <output>{{ settings.maxHeight }}</output></span>
          <input :value="settings.maxHeight" type="range" min="5" max="28" step="1" @input="numberUpdate('maxHeight', $event)">
        </label>
        <label>
          <span>Contour gap <output>{{ settings.contourStep }}</output></span>
          <input :value="settings.contourStep" type="range" min="1" max="5" step="0.5" @input="numberUpdate('contourStep', $event)">
        </label>
        <label>
          <span>Vertical scale <output>{{ settings.verticalExaggeration.toFixed(1) }}</output></span>
          <input :value="settings.verticalExaggeration" type="range" min="0" max="2" step="0.1" @input="numberUpdate('verticalExaggeration', $event)">
        </label>
        <label>
          <span>Noise scale <output>{{ settings.noiseScale.toFixed(1) }}</output></span>
          <input :value="settings.noiseScale" type="range" min="2" max="10" step="0.5" @input="numberUpdate('noiseScale', $event)">
        </label>
        <label>
          <span>Smoothing <output>{{ settings.smoothing }}</output></span>
          <input :value="settings.smoothing" type="range" min="0" max="3" step="1" @input="numberUpdate('smoothing', $event)">
        </label>
        <label>
          <span>Octaves <output>{{ settings.octaves }}</output></span>
          <input :value="settings.octaves" type="range" min="1" max="7" step="1" @input="numberUpdate('octaves', $event)">
        </label>
        <label>
          <span>Persistence <output>{{ settings.persistence.toFixed(2) }}</output></span>
          <input :value="settings.persistence" type="range" min="0.25" max="0.8" step="0.05" @input="numberUpdate('persistence', $event)">
        </label>
        <label>
          <span>Mesh opacity <output>{{ settings.terrainOpacity.toFixed(2) }}</output></span>
          <input :value="settings.terrainOpacity" type="range" min="0.02" max="0.4" step="0.02" @input="numberUpdate('terrainOpacity', $event)">
        </label>
      </div>

      <div class="topo-switches">
        <label><input :checked="settings.showTerrain" type="checkbox" @change="booleanUpdate('showTerrain', $event)"> Mesh</label>
        <label><input :checked="settings.showContours" type="checkbox" @change="booleanUpdate('showContours', $event)"> Lines</label>
        <label><input :checked="settings.showConnectors" type="checkbox" @change="booleanUpdate('showConnectors', $event)"> Guides</label>
        <label><input :checked="settings.autoRotate" type="checkbox" @change="booleanUpdate('autoRotate', $event)"> Drift</label>
        <label><input :checked="settings.scanLine" type="checkbox" @change="booleanUpdate('scanLine', $event)"> Scan</label>
      </div>

      <div class="topo-actions">
        <button type="button" @click="$emit('randomize')">Randomize</button>
        <button type="button" @click="$emit('reset-camera')">Reset view</button>
        <button type="button" @click="$emit('screenshot')">Capture</button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { TopographyMode, TopographySettings } from '~/features/topography/utils/types';

const props = defineProps<{ settings: TopographySettings; status?: string }>();
const emit = defineEmits<{
  update: [settings: TopographySettings];
  upload: [file: File];
  randomize: [];
  'reset-camera': [];
  screenshot: [];
}>();

const open = ref(true);
const modes: { label: string; value: TopographyMode }[] = [
  { label: 'Layers', value: 'layers' },
  { label: 'Flat', value: 'flat' },
  { label: 'Sliced', value: 'sliced' },
  { label: 'Scanner', value: 'scanner' },
];

const update = <K extends keyof TopographySettings>(key: K, value: TopographySettings[K]) => {
  emit('update', { ...props.settings, [key]: value });
};

const numberUpdate = (key: keyof TopographySettings, event: Event) => {
  update(key, Number((event.target as HTMLInputElement).value) as never);
};

const booleanUpdate = (key: keyof TopographySettings, event: Event) => {
  update(key, (event.target as HTMLInputElement).checked as never);
};

const onUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) emit('upload', file);
  input.value = '';
};
</script>

<style scoped>
.topo-panel { --panel-gap: clamp(.45rem, 1.2vmin, .85rem); position: fixed; z-index: 20; left: max(1rem, env(safe-area-inset-left)); top: max(1rem, env(safe-area-inset-top)); width: min(20rem, calc(100vw - max(2rem, env(safe-area-inset-left) + env(safe-area-inset-right)))); color: #d8e5dc; font: 500 clamp(8px, 1.15vmin, 10px)/1.4 "Montserrat", sans-serif; letter-spacing: .12em; text-transform: uppercase; }
.topo-panel__toggle { display: none; width: 100%; border: 1px solid #b8d9c833; background: #07100dd9; padding: .8rem; text-align: left; color: inherit; backdrop-filter: blur(18px); }
.topo-panel__body { max-height: calc(100dvh - max(2rem, env(safe-area-inset-top) + env(safe-area-inset-bottom))); overflow: auto; overscroll-behavior: contain; scrollbar-width: thin; border: 1px solid #b8d9c833; background: #07100de8; padding: clamp(.65rem, 1.8vmin, 1rem); backdrop-filter: blur(18px); box-shadow: 0 20px 60px #0008; }
.topo-panel__header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: var(--panel-gap); color: #9fb0a8; }
.topo-panel__header strong { color: #e5fff1; font: 600 clamp(1.25rem, 3.2vmin, 1.6rem)/1 "Josefin Sans", sans-serif; letter-spacing: .2em; }
.topo-upload { display: flex; align-items: center; justify-content: space-between; border: 1px dashed #b8d9c844; padding: clamp(.55rem, 1.5vmin, .75rem); cursor: pointer; }
.topo-upload:hover { border-color: #c7ffe0aa; }
.topo-upload input { display: none; }
.topo-upload small { color: #819088; font-size: 8px; }
.topo-status { margin-top: .5rem; color: #b8e9cb; font-size: 8px; line-height: 1.5; overflow-wrap: anywhere; }
.topo-modes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin: var(--panel-gap) 0; }
.topo-modes button, .topo-actions button { border: 1px solid #b8d9c826; padding: clamp(.4rem, 1.2vmin, .55rem) .25rem; color: #91a39a; transition: .2s ease; }
.topo-modes button:hover, .topo-modes button.active, .topo-actions button:hover { border-color: #c7ffe088; color: #e5fff1; background: #d9ffe60d; }
.topo-controls { display: grid; gap: clamp(.4rem, 1.2vmin, .6rem); }
.topo-controls label span { display: flex; justify-content: space-between; margin-bottom: .25rem; color: #91a39a; }
.topo-controls output { color: #d7fce7; }
.topo-controls input { width: 100%; accent-color: #b8e9cb; }
.topo-switches { display: grid; grid-template-columns: repeat(3, 1fr); gap: .45rem; margin: var(--panel-gap) 0; color: #91a39a; }
.topo-switches label { display: flex; gap: .35rem; align-items: center; }
.topo-switches input { accent-color: #b8e9cb; }
.topo-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
@media (max-width: 640px) {
  .topo-panel__toggle { display: block; }
  .topo-panel__body { max-height: calc(100dvh - max(4.5rem, env(safe-area-inset-top) + env(safe-area-inset-bottom) + 3.5rem)); }
  .topo-panel:not(.topo-panel--open) { width: 9rem; }
}
@media (orientation: landscape) and (max-height: 640px) and (max-width: 960px) {
  .topo-panel { width: min(40rem, calc(100vw - max(5.5rem, env(safe-area-inset-left) + env(safe-area-inset-right) + 4rem))); }
  .topo-panel__toggle { display: block; }
  .topo-panel__body { max-height: calc(100dvh - max(4.5rem, env(safe-area-inset-top) + env(safe-area-inset-bottom) + 3.5rem)); }
  .topo-panel:not(.topo-panel--open) { width: 9rem; }
  .topo-controls { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: clamp(.8rem, 2vw, 1.4rem); }
}
</style>
