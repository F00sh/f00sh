<template>
  <section class="relative min-h-screen overflow-hidden bg-[#020403] text-neutral-50">
    <div ref="mount" class="absolute inset-0" aria-hidden="true" />
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(163,230,53,0.08),transparent_30%),linear-gradient(180deg,rgba(2,4,3,0.06),rgba(2,4,3,0.78))]" />

    <div class="relative z-10 flex min-h-screen flex-col px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div class="flex justify-center pt-3 sm:hidden">
        <h1 class="font-josefin text-[clamp(2.2rem,9vw,3.25rem)] leading-[0.92] text-neutral-50">Sound Surfer</h1>
      </div>

      <div class="hidden max-w-4xl pt-16 sm:block sm:pt-20">
        <p class="text-xs uppercase tracking-[0.22em] text-lime-300">Interactive Audio Experience</p>
        <h1 class="mt-4 font-josefin text-[clamp(2rem,6vw,4.8rem)] leading-[0.94]">Sound Surfer</h1>
        <p class="mt-5 max-w-2xl text-base leading-7 text-neutral-200 sm:text-lg">
          An endless wireframe sea where baseline waves stay alive and incoming sound pushes the surface into stronger motion.
        </p>
      </div>

      <div class="mt-auto grid gap-3 pb-[max(0.35rem,env(safe-area-inset-bottom))] sm:gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <button
            type="button"
            class="min-h-11 border border-lime-300 px-3 py-2 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-lime-300 transition-colors hover:bg-lime-300 hover:text-neutral-950 sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.18em]"
            @click="toggleMic"
          >
            {{ micActive ? 'Stop Mic' : 'Use Mic' }}
          </button>
          <label class="inline-flex min-h-11 cursor-pointer items-center justify-center border border-white/15 px-3 py-2 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-neutral-200 transition-colors hover:border-lime-300 hover:text-lime-300 sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.18em]">
            Audio File
            <input class="sr-only" type="file" accept="audio/*" @change="loadAudioFile">
          </label>
          <button
            v-if="audioElement"
            type="button"
            class="min-h-11 border border-white/15 px-3 py-2 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-neutral-200 transition-colors hover:border-lime-300 hover:text-lime-300 sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.18em]"
            @click="togglePlayback"
          >
            {{ filePlaying ? 'Pause File' : 'Play File' }}
          </button>
          <div class="col-span-2 flex min-h-11 items-center justify-center border border-white/10 bg-black/35 px-3 py-2 text-[0.64rem] uppercase tracking-[0.16em] text-neutral-300 sm:col-auto sm:px-5 sm:py-3 sm:text-xs">
            Signal {{ Math.round(audioState.level * 100) }}%
          </div>
        </div>

        <form class="w-full border border-white/10 bg-black/72 p-3 backdrop-blur-md sm:p-4 lg:w-[22rem]" @submit.prevent>
          <div class="mb-2 flex items-center justify-between gap-3 sm:mb-3 sm:gap-4">
            <p class="text-[0.64rem] uppercase tracking-[0.2em] text-lime-300 sm:text-xs sm:tracking-[0.22em]">Wave Controls</p>
            <div class="flex items-center gap-2 sm:gap-3">
              <button type="button" class="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-400 hover:text-lime-300 sm:text-xs sm:tracking-[0.18em]" @click="controlsVisible = !controlsVisible">
                {{ controlsVisible ? 'Hide' : 'Show' }}
              </button>
              <button type="button" class="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-400 hover:text-lime-300 sm:text-xs sm:tracking-[0.18em]" @click="resetControls">Reset</button>
            </div>
          </div>

          <div v-show="controlsVisible" class="compact-controls grid max-h-[38vh] gap-2 overflow-y-auto pr-1 sm:max-h-[28rem] sm:gap-3 sm:pr-0 lg:max-h-[32rem]">
            <label v-for="control in numericControls" :key="control.key" class="grid gap-1 text-[0.64rem] uppercase tracking-[0.11em] text-neutral-300 sm:text-xs sm:tracking-[0.12em]">
              <span class="flex justify-between gap-3">
                {{ control.label }}
                <span class="text-neutral-500">{{ formatControlValue(control.key) }}</span>
              </span>
              <input
                v-model.number="settings[control.key]"
                type="range"
                :min="control.min"
                :max="control.max"
                :step="control.step"
                class="sound-slider"
                @input="handleControlInput(control.key)"
              >
            </label>

            <label class="grid gap-1 text-[0.64rem] uppercase tracking-[0.11em] text-neutral-300 sm:text-xs sm:tracking-[0.12em]">
              <span class="flex justify-between gap-3">
                Color Tint
                <span class="text-neutral-500">{{ settings.color }}</span>
              </span>
              <input v-model="settings.color" type="color" class="h-8 w-full border border-white/10 bg-black/50 sm:h-9" @input="syncMaterial">
            </label>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// @ts-ignore: missing type declarations for three
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import surferModelUrl from '~/assets/3d/surfer.glb?url';

type AudioBands = {
  level: number;
  low: number;
  mid: number;
  high: number;
};

type Settings = {
  baseAmplitude: number;
  audioInfluence: number;
  speed: number;
  frequency: number;
  density: number;
  smoothing: number;
  cameraTilt: number;
  brightness: number;
  color: string;
};

type NumericSettingKey = Exclude<keyof Settings, 'color'>;

type NumericControl = {
  key: NumericSettingKey;
  label: string;
  min: number;
  max: number;
  step: number;
};

const mount = ref<HTMLElement | null>(null);
const micActive = ref(false);
const filePlaying = ref(false);
const audioElement = ref<HTMLAudioElement | null>(null);
const controlsVisible = ref(true);

const defaults: Settings = {
  baseAmplitude: 0.42,
  audioInfluence: 2.2,
  speed: 1.15,
  frequency: 1,
  density: 64,
  smoothing: 0.84,
  cameraTilt: 31,
  brightness: 0.86,
  color: '#baff70',
};

const settings = reactive<Settings>({ ...defaults });
const audioState = reactive<AudioBands>({ level: 0, low: 0, mid: 0, high: 0 });

const numericControls: NumericControl[] = [
  { key: 'baseAmplitude', label: 'Base amplitude', min: 0.08, max: 1.1, step: 0.01 },
  { key: 'audioInfluence', label: 'Audio influence', min: 0, max: 5, step: 0.05 },
  { key: 'speed', label: 'Wave speed', min: 0.15, max: 3.4, step: 0.05 },
  { key: 'frequency', label: 'Wave frequency', min: 0.35, max: 2.8, step: 0.05 },
  { key: 'density', label: 'Wire density', min: 24, max: 110, step: 2 },
  { key: 'smoothing', label: 'Smoothing', min: 0.55, max: 0.96, step: 0.01 },
  { key: 'cameraTilt', label: 'Camera tilt', min: 18, max: 48, step: 1 },
  { key: 'brightness', label: 'Brightness', min: 0.18, max: 1.4, step: 0.01 },
];

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let gridLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
let rowLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
let voronoiLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
let horizonLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
let foamPoints: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null = null;
let wakePoints: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
let rippleLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
let surfer: THREE.Group | null = null;
let frameId = 0;
let clock: THREE.Clock | null = null;
let lastFrameTime = 0;
let basePositions: Float32Array | null = null;
let rowBasePositions: Float32Array | null = null;
let voronoiBasePositions: Float32Array | null = null;
let foamBasePositions: Float32Array | null = null;
let foamSeeds: Float32Array | null = null;
let wakeBasePositions: Float32Array | null = null;
let wakeAge: Float32Array | null = null;
let wakeLife: Float32Array | null = null;
let wakeVelocities: Float32Array | null = null;
let wakeCursor = 0;
let wakeSpawnTimer = 0;
let rippleBasePositions: Float32Array | null = null;
let rippleAge: Float32Array | null = null;
let rippleLife: Float32Array | null = null;
let rippleRadius: Float32Array | null = null;
let rippleVelocityX: Float32Array | null = null;
let rippleVelocityZ: Float32Array | null = null;
let rippleCursor = 0;
let rippleSpawnTimer = 0;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let freqData: Uint8Array | null = null;
let micStream: MediaStream | null = null;
let mediaSource: MediaElementAudioSourceNode | null = null;
let fileUrl: string | null = null;
let densityRebuildTimer = 0;
let surferLoadToken = 0;
let surferWireMaterial: THREE.MeshStandardMaterial | null = null;
let surferX = 0;
let surferVelocityX = 0;
let surferInputX = 0;
let leftPressed = false;
let rightPressed = false;
let touchStartX = 0;
let touchStartY = 0;

const planeWidth = 42;
const nearZ = 20;
const farZ = -122;
const foamStride = 3;
const foamSeedStride = 5;
const surferZ = 13.2;
const surferLimitX = planeWidth * 0.32;
const surferYaw = THREE.MathUtils.degToRad(90);
const surferTurnMax = THREE.MathUtils.degToRad(24);
const surferScreenY = 3.1;
const surferMaxSpeed = 8.5;
const surferForwardZ = -1;
const wakeTrailSpeed = 5.6;
const wakeLineLength = 1.15;
const voronoiLift = 0.035;
const surfaceDriftSpeed = 4.2;

const getAudioContextCtor = () =>
  window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

const isLowPowerDevice = () => {
  if (typeof navigator === 'undefined') return true;
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
  return (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4)
    || (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4);
};

const wakeParticleCount = isLowPowerDevice() ? 120 : 180;
const rippleCount = isLowPowerDevice() ? 8 : 12;
const rippleSegments = isLowPowerDevice() ? 18 : 24;

const targetDensity = computed(() => {
  const limit = isLowPowerDevice() ? 76 : 110;
  return Math.max(16, Math.min(limit, Math.round(settings.density)));
});

const formatControlValue = (key: NumericSettingKey) => {
  const value = settings[key];
  return key === 'density' || key === 'cameraTilt' ? Math.round(value).toString() : value.toFixed(2);
};

const averageRange = (data: Uint8Array | null, from: number, to: number) => {
  if (!data) return 0;
  const start = Math.max(0, Math.floor(from));
  const end = Math.min(data.length, Math.max(start + 1, Math.floor(to)));
  let sum = 0;
  for (let i = start; i < end; i += 1) {
    // data is checked above; ensure numeric value to satisfy TS strict checks
    const v = data[i] ?? 0;
    sum += v;
  }
  return (sum / (end - start)) / 255;
};

const ensureAudioContext = async () => {
  if (!audioContext || audioContext.state === 'closed') {
    const AudioCtx = getAudioContextCtor();
    if (!AudioCtx) return null;
    audioContext = new AudioCtx();
  }
  if (audioContext.state === 'suspended') await audioContext.resume();
  return audioContext;
};

const createAnalyser = (context: AudioContext) => {
  const nextAnalyser = context.createAnalyser();
  nextAnalyser.fftSize = 1024;
  nextAnalyser.smoothingTimeConstant = settings.smoothing;
  freqData = new Uint8Array(nextAnalyser.frequencyBinCount);
  analyser = nextAnalyser;
  return nextAnalyser;
};

const updateAudioState = () => {
  if (!analyser || !freqData) {
    audioState.level += (0 - audioState.level) * 0.04;
    audioState.low += (0 - audioState.low) * 0.04;
    audioState.mid += (0 - audioState.mid) * 0.04;
    audioState.high += (0 - audioState.high) * 0.04;
    return;
  }

  analyser.smoothingTimeConstant = settings.smoothing;
  analyser.getByteFrequencyData(freqData as Uint8Array<ArrayBuffer>);
  const low = averageRange(freqData, 2, 24);
  const mid = averageRange(freqData, 24, 128);
  const high = averageRange(freqData, 128, freqData.length);
  const level = low * 0.46 + mid * 0.34 + high * 0.2;
  const follow = 1 - settings.smoothing;

  audioState.low += (low - audioState.low) * follow;
  audioState.mid += (mid - audioState.mid) * follow;
  audioState.high += (high - audioState.high) * follow;
  audioState.level += (level - audioState.level) * follow;
};

const surfShape = (phase: number) => {
  const s = Math.sin(phase);
  const crest = Math.max(0, s);
  const trough = Math.min(0, s);
  return trough * 0.46 + crest * 0.68 + crest * crest * crest * 1.28;
};

const wrapDepth = (z: number) => {
  const rowTileLength = nearZ - farZ;
  const wrapped = ((nearZ - z) % rowTileLength + rowTileLength) % rowTileLength;
  return nearZ - wrapped;
};

const waveHeight = (x: number, z: number, time: number) => {
  const frequency = settings.frequency;
  const speed = settings.speed;
  const scrollZ = z - time * speed * 9;
  const base = settings.baseAmplitude;
  const audioBoost = settings.audioInfluence;
  const lowSwell = audioState.low * audioBoost;
  const midDetail = audioState.mid * audioBoost;
  const highRipple = audioState.high * audioBoost;

  const longFace = surfShape(x * 0.12 * frequency + scrollZ * 0.22 * frequency) * (base * 0.88 + lowSwell * 0.9);
  const peelingLip = surfShape(scrollZ * 0.34 * frequency + Math.sin(x * 0.13) * 1.2) * (base * 0.5 + lowSwell * 0.44);
  const crossWave = Math.sin((x * 0.9 + scrollZ) * 0.48 * frequency) * (base * 0.18 + midDetail * 0.32);
  const shimmer = Math.sin((x * 1.8 + scrollZ * 1.25) * frequency) * highRipple * 0.14;
  const turbulence = Math.sin(x * 0.8 + Math.sin(scrollZ * 0.21) * 2.4) * midDetail * 0.08;

  return longFace + peelingLip + crossWave + shimmer + turbulence;
};

const setCameraTilt = () => {
  if (!camera) return;
  camera.position.set(0, 8.6, 24);
  camera.rotation.set(THREE.MathUtils.degToRad(-settings.cameraTilt), 0, 0);
};

const getSurferWireMaterial = () => {
  if (!surferWireMaterial) {
    surferWireMaterial = new THREE.MeshStandardMaterial({
      color: 0xb86cff,
      emissive: 0x8f42ff,
      emissiveIntensity: 1.9,
      wireframe: true,
      transparent: true,
      opacity: Math.min(1, settings.brightness),
      depthTest: false,
      depthWrite: false,
    });
  }
  surferWireMaterial.opacity = Math.min(1, settings.brightness);
  surferWireMaterial.emissiveIntensity = 1.15 + settings.brightness * 0.85;
  return surferWireMaterial;
};

const syncMaterial = () => {
  if (gridLines) {
    gridLines.material.color.set(settings.color);
    gridLines.material.opacity = 0;
    gridLines.visible = false;
  }
  if (rowLines) {
    rowLines.material.color.set(settings.color);
    rowLines.material.opacity = Math.min(1, settings.brightness * 1.08);
    rowLines.visible = true;
  }
  if (voronoiLines) {
    voronoiLines.material.color.set(settings.color);
    voronoiLines.material.opacity = Math.min(0.5, settings.brightness * 0.42);
  }
  if (horizonLines) {
    horizonLines.material.color.set(settings.color);
    horizonLines.material.opacity = Math.min(0.28, settings.brightness * 0.28);
  }
  if (foamPoints) {
    foamPoints.material.opacity = Math.min(0.62, settings.brightness * 0.46);
  }
  if (wakePoints) {
    wakePoints.material.opacity = Math.min(0.92, settings.brightness * 0.78);
  }
  if (rippleLines) {
    rippleLines.material.opacity = Math.min(0.5, settings.brightness * 0.42);
  }
  if (surfer) {
    const surferMaterial = getSurferWireMaterial();
    surfer.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
      if (!mesh.material) return;
      if (mesh.material !== surferMaterial) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => material.dispose());
        mesh.material = surferMaterial;
      }
    });
  }
};

const createWake = () => {
  if (!scene) return;
  const positions = new Float32Array(wakeParticleCount * 2 * 3);
  const colors = new Float32Array(wakeParticleCount * 2 * 3);
  wakeBasePositions = new Float32Array(wakeParticleCount * 3);
  wakeAge = new Float32Array(wakeParticleCount);
  wakeLife = new Float32Array(wakeParticleCount);
  wakeVelocities = new Float32Array(wakeParticleCount * 3);
  for (let i = 0; i < wakeParticleCount; i += 1) {
    const index = i * 3;
    const lineIndex = i * 6;
    positions[lineIndex] = 0;
    positions[lineIndex + 1] = -80;
    positions[lineIndex + 2] = 0;
    positions[lineIndex + 3] = 0;
    positions[lineIndex + 4] = -80;
    positions[lineIndex + 5] = 0;
    wakeBasePositions[index] = 0;
    wakeBasePositions[index + 1] = -80;
    wakeBasePositions[index + 2] = 0;
    wakeAge[i] = 999;
    wakeLife[i] = 1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  wakePoints = new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: Math.min(0.92, settings.brightness * 0.78),
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    }),
  );
  wakePoints.renderOrder = 5;
  scene.add(wakePoints);
};

const createRipple = () => {
  if (!scene) return;
  const positions = new Float32Array(rippleCount * rippleSegments * 2 * 3);
  rippleBasePositions = new Float32Array(rippleCount * 3);
  rippleAge = new Float32Array(rippleCount);
  rippleLife = new Float32Array(rippleCount);
  rippleRadius = new Float32Array(rippleCount);
  rippleVelocityX = new Float32Array(rippleCount);
  rippleVelocityZ = new Float32Array(rippleCount);

  for (let i = 0; i < rippleCount; i += 1) {
    const baseIndex = i * 3;
    rippleBasePositions[baseIndex] = 0;
    rippleBasePositions[baseIndex + 1] = -80;
    rippleBasePositions[baseIndex + 2] = 0;
    rippleAge[i] = 999;
    rippleLife[i] = 1;
    rippleRadius[i] = 0.1;
    rippleVelocityX[i] = 0;
    rippleVelocityZ[i] = 0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  rippleLines = new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({
      color: 0xf6ffe8,
      transparent: true,
      opacity: Math.min(0.5, settings.brightness * 0.42),
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    }),
  );
  rippleLines.renderOrder = 4;
  scene.add(rippleLines);
};

const createSurfer = () => {
  if (!scene) return;
  const group = new THREE.Group();
  group.renderOrder = 6;
  group.position.set(surferX, 0, surferZ);
  group.rotation.y = surferYaw;
  surfer = group;
  scene.add(group);

  const loadToken = ++surferLoadToken;
  const loader = new GLTFLoader();
  loader.load(surferModelUrl, (gltf) => {
    if (!surfer || surfer !== group || loadToken !== surferLoadToken) {
      disposeObject3D(gltf.scene);
      return;
    }

    const model = gltf.scene;
    const bounds = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    bounds.getSize(size);
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.7 / maxDimension;

    model.name = 'surfer-model';
    model.scale.setScalar(scale);
    model.rotation.y = -Math.PI / 2;
    model.position.set(
      -(bounds.min.x + size.x * 0.5) * scale,
      -bounds.min.y * scale,
      -(bounds.min.z + size.z * 0.5) * scale,
    );
    model.traverse((child: THREE.Object3D) => {
      child.renderOrder = 6;
    });
    group.add(model);
    syncMaterial();
  });
  syncMaterial();
};

const disposeObject3D = (object: THREE.Object3D) => {
  object.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
    if (mesh.geometry) mesh.geometry.dispose();
    if (!mesh.material) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => material.dispose());
  });
};

const disposeGrid = () => {
  if (gridLines && scene) {
    scene.remove(gridLines);
    gridLines.geometry.dispose();
    gridLines.material.dispose();
    gridLines = null;
  }
  if (rowLines && scene) {
    scene.remove(rowLines);
    rowLines.geometry.dispose();
    rowLines.material.dispose();
    rowLines = null;
  }
  if (voronoiLines && scene) {
    scene.remove(voronoiLines);
    voronoiLines.geometry.dispose();
    voronoiLines.material.dispose();
    voronoiLines = null;
  }
  if (foamPoints && scene) {
    scene.remove(foamPoints);
    foamPoints.geometry.dispose();
    foamPoints.material.dispose();
    foamPoints = null;
  }
  basePositions = null;
  rowBasePositions = null;
  voronoiBasePositions = null;
  foamBasePositions = null;
  foamSeeds = null;
};

const disposeWake = () => {
  if (wakePoints && scene) {
    scene.remove(wakePoints);
    wakePoints.geometry.dispose();
    wakePoints.material.dispose();
    wakePoints = null;
  }
  wakeBasePositions = null;
  wakeAge = null;
  wakeLife = null;
  wakeVelocities = null;
  wakeCursor = 0;
  wakeSpawnTimer = 0;
};

const disposeRipple = () => {
  if (rippleLines && scene) {
    scene.remove(rippleLines);
    rippleLines.geometry.dispose();
    rippleLines.material.dispose();
    rippleLines = null;
  }
  rippleBasePositions = null;
  rippleAge = null;
  rippleLife = null;
  rippleRadius = null;
  rippleVelocityX = null;
  rippleVelocityZ = null;
  rippleCursor = 0;
  rippleSpawnTimer = 0;
};

const disposeSurfer = () => {
  if (!surfer || !scene) return;
  surferLoadToken += 1;
  scene.remove(surfer);
  disposeObject3D(surfer);
  surferWireMaterial = null;
  surfer = null;
};

const createGrid = () => {
  if (!scene) return;
  disposeGrid();
  const xSegments = targetDensity.value;
  const zSegments = Math.round(targetDensity.value * 1.65);
  const xLines = xSegments + 1;
  const zLines = zSegments + 1;
  const segmentCount = zLines * xSegments + xLines * zSegments;
  const rowSegmentCount = zLines * xSegments * 3;
  const positions = new Float32Array(segmentCount * 2 * 3);
  const rowPositions = new Float32Array(rowSegmentCount * 2 * 3);
  basePositions = new Float32Array(positions.length);
  rowBasePositions = new Float32Array(rowPositions.length);
  let index = 0;
  let rowIndex = 0;
  const rowTileLength = nearZ - farZ;

  const writePoint = (x: number, z: number) => {
    positions[index] = x;
    positions[index + 1] = 0;
    positions[index + 2] = z;
    basePositions![index] = x;
    basePositions![index + 1] = 0;
    basePositions![index + 2] = z;
    index += 3;
  };

  const writeRowPoint = (x: number, z: number) => {
    rowPositions[rowIndex] = x;
    rowPositions[rowIndex + 1] = 0;
    rowPositions[rowIndex + 2] = z;
    rowBasePositions![rowIndex] = x;
    rowBasePositions![rowIndex + 1] = 0;
    rowBasePositions![rowIndex + 2] = z;
    rowIndex += 3;
  };

  for (let zi = 0; zi <= zSegments; zi += 1) {
    const z = THREE.MathUtils.lerp(nearZ, farZ, zi / zSegments);
    for (let xi = 0; xi < xSegments; xi += 1) {
      const x0 = THREE.MathUtils.lerp(-planeWidth * 0.5, planeWidth * 0.5, xi / xSegments);
      const x1 = THREE.MathUtils.lerp(-planeWidth * 0.5, planeWidth * 0.5, (xi + 1) / xSegments);
      writePoint(x0, z);
      writePoint(x1, z);
      for (const tileOffset of [-rowTileLength, 0, rowTileLength]) {
        writeRowPoint(x0, z + tileOffset);
        writeRowPoint(x1, z + tileOffset);
      }
    }
  }

  for (let xi = 0; xi <= xSegments; xi += 1) {
    const x = THREE.MathUtils.lerp(-planeWidth * 0.5, planeWidth * 0.5, xi / xSegments);
    for (let zi = 0; zi < zSegments; zi += 1) {
      const z0 = THREE.MathUtils.lerp(nearZ, farZ, zi / zSegments);
      const z1 = THREE.MathUtils.lerp(nearZ, farZ, (zi + 1) / zSegments);
      writePoint(x, z0);
      writePoint(x, z1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color: settings.color,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  });
  gridLines = new THREE.LineSegments(geometry, material);
  gridLines.renderOrder = 1;
  gridLines.visible = false;
  scene.add(gridLines);

  const rowGeometry = new THREE.BufferGeometry();
  rowGeometry.setAttribute('position', new THREE.BufferAttribute(rowPositions, 3));
  rowLines = new THREE.LineSegments(
    rowGeometry,
    new THREE.LineBasicMaterial({
      color: settings.color,
      transparent: true,
      opacity: Math.min(1, settings.brightness * 1.08),
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    }),
  );
  rowLines.renderOrder = 3;
  scene.add(rowLines);

  // Build a jittered Voronoi overlay in x/z space and let waveHeight animate it above the sea.
  const voronoiColumns = isLowPowerDevice() ? 28 : 36;
  const voronoiRows = isLowPowerDevice() ? 44 : 56;
  const voronoiBounds = {
    minX: -planeWidth * 0.48,
    maxX: planeWidth * 0.48,
    minZ: farZ + 8,
    maxZ: nearZ - 4,
  };
  const voronoiCellWidth = (voronoiBounds.maxX - voronoiBounds.minX) / voronoiColumns;
  const voronoiCellDepth = (voronoiBounds.maxZ - voronoiBounds.minZ) / voronoiRows;
  const voronoiSeeds: Array<{ x: number; z: number }> = [];
  for (let row = 0; row < voronoiRows; row += 1) {
    for (let column = 0; column < voronoiColumns; column += 1) {
      voronoiSeeds.push({
        x: voronoiBounds.minX + (column + 0.5 + THREE.MathUtils.randFloatSpread(0.62)) * voronoiCellWidth,
        z: voronoiBounds.minZ + (row + 0.5 + THREE.MathUtils.randFloatSpread(0.62)) * voronoiCellDepth,
      });
    }
  }

  const clipPolygon = (
    polygon: Array<{ x: number; z: number }>,
    keepPoint: { x: number; z: number },
    otherPoint: { x: number; z: number },
  ) => {
    const nextPolygon: Array<{ x: number; z: number }> = [];
    const midX = (keepPoint.x + otherPoint.x) * 0.5;
    const midZ = (keepPoint.z + otherPoint.z) * 0.5;
    const normalX = otherPoint.x - keepPoint.x;
    const normalZ = otherPoint.z - keepPoint.z;
    const signedDistance = (point: { x: number; z: number }) =>
      (point.x - midX) * normalX + (point.z - midZ) * normalZ;

    for (let i = 0; i < polygon.length; i += 1) {
      const current = polygon[i];
      const previous = polygon[(i + polygon.length - 1) % polygon.length];
      if (!current || !previous) continue;
      const currentDistance = signedDistance(current);
      const previousDistance = signedDistance(previous);
      const currentInside = currentDistance <= 0;
      const previousInside = previousDistance <= 0;

      if (currentInside !== previousInside) {
        const t = previousDistance / (previousDistance - currentDistance);
        nextPolygon.push({
          x: previous.x + (current.x - previous.x) * t,
          z: previous.z + (current.z - previous.z) * t,
        });
      }
      if (currentInside) nextPolygon.push(current);
    }

    return nextPolygon;
  };

  const voronoiSegments: number[] = [];
  const voronoiBase: number[] = [];
  const voronoiTileLength = voronoiBounds.maxZ - voronoiBounds.minZ;
  for (let i = 0; i < voronoiSeeds.length; i += 1) {
    const seed = voronoiSeeds[i];
    if (!seed) continue;
    let polygon = [
      { x: voronoiBounds.minX, z: voronoiBounds.minZ },
      { x: voronoiBounds.maxX, z: voronoiBounds.minZ },
      { x: voronoiBounds.maxX, z: voronoiBounds.maxZ },
      { x: voronoiBounds.minX, z: voronoiBounds.maxZ },
    ];

    for (let j = 0; j < voronoiSeeds.length; j += 1) {
      if (i === j) continue;
      const other = voronoiSeeds[j];
      if (!other) continue;
      polygon = clipPolygon(polygon, seed, other);
      if (polygon.length < 3) break;
    }

    for (let j = 0; j < polygon.length; j += 1) {
      const start = polygon[j];
      const end = polygon[(j + 1) % polygon.length];
      if (!start || !end) continue;
      if (start.x > end.x || (Math.abs(start.x - end.x) < 0.0001 && start.z > end.z)) continue;
      for (const tileOffset of [-voronoiTileLength, 0, voronoiTileLength]) {
        voronoiSegments.push(start.x, 0, start.z + tileOffset, end.x, 0, end.z + tileOffset);
        voronoiBase.push(start.x, 0, start.z + tileOffset, end.x, 0, end.z + tileOffset);
      }
    }
  }

  const voronoiGeometry = new THREE.BufferGeometry();
  voronoiGeometry.setAttribute('position', new THREE.Float32BufferAttribute(voronoiSegments, 3));
  voronoiBasePositions = new Float32Array(voronoiBase);
  voronoiLines = new THREE.LineSegments(
    voronoiGeometry,
    new THREE.LineBasicMaterial({
      color: settings.color,
      transparent: true,
      opacity: Math.min(0.5, settings.brightness * 0.42),
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    }),
  );
  voronoiLines.renderOrder = 3;
  scene.add(voronoiLines);

  const foamColumns = isLowPowerDevice() ? 14 : 18;
  const foamRows = isLowPowerDevice() ? 24 : 32;
  const foamCount = foamColumns * foamRows;
  const foamPositions = new Float32Array(foamCount * foamStride);
  foamBasePositions = new Float32Array(foamCount * foamStride);
  foamSeeds = new Float32Array(foamCount * foamSeedStride);
  const travelLength = nearZ - farZ;
  const cellWidth = (planeWidth * 0.92) / foamColumns;
  const cellDepth = travelLength / foamRows;
  for (let i = 0; i < foamCount; i += 1) {
    const positionIndex = i * foamStride;
    const seedIndex = i * foamSeedStride;
    const column = i % foamColumns;
    const row = Math.floor(i / foamColumns);
    const x = -planeWidth * 0.46 + (column + 0.5 + THREE.MathUtils.randFloatSpread(0.72)) * cellWidth;
    const z = nearZ - (row + 0.5 + THREE.MathUtils.randFloatSpread(0.72)) * cellDepth;
    foamPositions[positionIndex] = x;
    foamPositions[positionIndex + 1] = -80;
    foamPositions[positionIndex + 2] = z;
    foamBasePositions[positionIndex] = x;
    foamBasePositions[positionIndex + 1] = 0;
    foamBasePositions[positionIndex + 2] = z;
    foamSeeds[seedIndex] = x;
    foamSeeds[seedIndex + 1] = z;
    foamSeeds[seedIndex + 2] = Math.random() * Math.PI * 2;
    foamSeeds[seedIndex + 3] = THREE.MathUtils.randFloat(0.55, 1);
    foamSeeds[seedIndex + 4] = THREE.MathUtils.randFloatSpread(1);
  }
  const foamGeometry = new THREE.BufferGeometry();
  foamGeometry.setAttribute('position', new THREE.BufferAttribute(foamPositions, 3));
  foamPoints = new THREE.Points(
    foamGeometry,
    new THREE.PointsMaterial({
      color: 0xf6ffe8,
      transparent: true,
      opacity: Math.min(0.62, settings.brightness * 0.46),
      size: isLowPowerDevice() ? 0.045 : 0.06,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    }),
  );
  foamPoints.renderOrder = 4;
  scene.add(foamPoints);
  syncMaterial();
};

const createHorizonLines = () => {
  if (!scene) return;
  const positions: number[] = [];
  for (let i = 0; i < 22; i += 1) {
    const z = -18 - i * 5.3;
    positions.push(-planeWidth * 0.52, -0.08 - i * 0.015, z, planeWidth * 0.52, -0.08 - i * 0.015, z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  horizonLines = new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({
      color: settings.color,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  scene.add(horizonLines);
};

const updateGrid = (time: number) => {
  const updatePositions = (lines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null, bases: Float32Array | null) => {
    if (!lines || !bases) return;
    const attr = lines.geometry.getAttribute('position') as THREE.BufferAttribute;
    const positions = attr.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = bases[i]!;
      const z = bases[i + 2]!;
      const horizonFade = THREE.MathUtils.clamp((nearZ - z) / (nearZ - farZ), 0, 1);
      positions[i + 1] = waveHeight(x, z, time) * (1 - horizonFade * 0.35);
    }
    attr.needsUpdate = true;
  };

  updatePositions(gridLines, basePositions);
  if (rowLines && rowBasePositions) {
    const attr = rowLines.geometry.getAttribute('position') as THREE.BufferAttribute;
    const positions = attr.array as Float32Array;
    const driftRange = nearZ - farZ;
    const driftPhase = THREE.MathUtils.euclideanModulo(time * settings.speed * surfaceDriftSpeed, driftRange);
    for (let i = 0; i < positions.length; i += 3) {
      const x = rowBasePositions[i]!;
      const z = rowBasePositions[i + 2]! - driftPhase;
      const horizonFade = THREE.MathUtils.clamp((nearZ - z) / (nearZ - farZ), 0, 1);
      positions[i] = x;
      positions[i + 1] = waveHeight(x, z, time) * (1 - horizonFade * 0.35);
      positions[i + 2] = z;
    }
    attr.needsUpdate = true;
  }
  if (voronoiLines && voronoiBasePositions) {
    const attr = voronoiLines.geometry.getAttribute('position') as THREE.BufferAttribute;
    const positions = attr.array as Float32Array;
    const driftRange = (nearZ - 4) - (farZ + 8);
    const driftPhase = THREE.MathUtils.euclideanModulo(time * settings.speed * surfaceDriftSpeed, driftRange);
    for (let i = 0; i < positions.length; i += 6) {
      const x0 = voronoiBasePositions[i]!;
      const z0 = voronoiBasePositions[i + 2]! - driftPhase;
      const x1 = voronoiBasePositions[i + 3]!;
      const z1 = voronoiBasePositions[i + 5]! - driftPhase;
      const fade0 = THREE.MathUtils.clamp((nearZ - z0) / (nearZ - farZ), 0, 1);
      const fade1 = THREE.MathUtils.clamp((nearZ - z1) / (nearZ - farZ), 0, 1);

      positions[i] = x0;
      positions[i + 1] = waveHeight(x0, z0, time) * (1 - fade0 * 0.18) + voronoiLift;
      positions[i + 2] = z0;
      positions[i + 3] = x1;
      positions[i + 4] = waveHeight(x1, z1, time) * (1 - fade1 * 0.18) + voronoiLift;
      positions[i + 5] = z1;
    }
    attr.needsUpdate = true;
  }
};

const updateFoam = (time: number) => {
  if (!foamPoints || !foamSeeds || !foamBasePositions) return;
  const attr = foamPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
  const positions = attr.array as Float32Array;
  const travelLength = nearZ - farZ;
  const speed = settings.speed;
  const scatterWidth = planeWidth * 0.92;
  const halfScatterWidth = scatterWidth * 0.5;
  const scroll = time * speed * 9;

  for (let i = 0; i < foamSeeds.length / foamSeedStride; i += 1) {
    const positionIndex = i * foamStride;
    const seedIndex = i * foamSeedStride;
    const seedX = foamSeeds[seedIndex] ?? 0;
    const seedZ = foamSeeds[seedIndex + 1] ?? 0;
    const seedPhase = foamSeeds[seedIndex + 2] ?? 0;
    const intensity = foamSeeds[seedIndex + 3] ?? 1;
    const sideDrift = foamSeeds[seedIndex + 4] ?? 0;
    const driftX = Math.sin(time * 0.38 + seedPhase) * 0.08 + sideDrift * 0.05;
    const x = THREE.MathUtils.euclideanModulo(seedX + driftX + halfScatterWidth, scatterWidth) - halfScatterWidth;
    const z = wrapDepth(seedZ + scroll);
    const y = waveHeight(x, z, time);
    const depthFade = THREE.MathUtils.clamp((nearZ - z) / travelLength, 0, 1);
    const edgeFade = Math.sin(depthFade * Math.PI);
    const glint = 0.5 + 0.5 * Math.sin(seedPhase + time * 1.8 + z * 0.09);
    const lift = 0.018 + intensity * 0.018 + glint * 0.012;

    positions[positionIndex] = x;
    positions[positionIndex + 1] = edgeFade > 0.08 ? y + lift : -80;
    positions[positionIndex + 2] = z;
  }
  attr.needsUpdate = true;
};

const spawnWakeParticle = (x: number, z: number, time: number, velocityX: number, velocityZ: number) => {
  if (!wakePoints || !wakeBasePositions || !wakeAge || !wakeLife || !wakeVelocities) return;
  const index = wakeCursor % wakeParticleCount;
  wakeCursor += 1;
  const baseIndex = index * 3;
  const backwardZ = -surferForwardZ;
  const trailBias = THREE.MathUtils.clamp(0.45 + Math.abs(velocityX) * 0.55 + Math.abs(velocityZ) * 0.08, 0.35, 1);
  const scatter = THREE.MathUtils.randFloatSpread(0.48 + trailBias * 0.28);
  const wakeX = x + scatter;
  const wakeZ = z + backwardZ * THREE.MathUtils.randFloat(0.15, 0.52);
  wakeBasePositions[baseIndex] = wakeX;
  wakeBasePositions[baseIndex + 1] = 0.025;
  wakeBasePositions[baseIndex + 2] = wakeZ;
  wakeAge[index] = 0;
  wakeLife[index] = 0.58 + Math.random() * 0.62;
  wakeVelocities[baseIndex] = THREE.MathUtils.randFloatSpread(0.18) + velocityX * 0.16;
  wakeVelocities[baseIndex + 1] = 0;
  wakeVelocities[baseIndex + 2] = backwardZ * wakeTrailSpeed * (0.7 + trailBias * 0.42);
};

const spawnRipple = (x: number, z: number, time: number, velocityX: number, velocityZ: number) => {
  if (!rippleLines || !rippleBasePositions || !rippleAge || !rippleLife || !rippleRadius || !rippleVelocityX || !rippleVelocityZ) return;
  const index = rippleCursor % rippleCount;
  rippleCursor += 1;
  const baseIndex = index * 3;
  const backwardZ = -surferForwardZ;
  const speed = Math.hypot(velocityX, velocityZ);
  const drift = THREE.MathUtils.clamp(0.18 + speed * 0.22, 0.14, 0.42);

  rippleBasePositions[baseIndex] = x;
  rippleBasePositions[baseIndex + 1] = waveHeight(x, z, time) + 0.02;
  rippleBasePositions[baseIndex + 2] = z + backwardZ * 0.24;
  rippleAge[index] = 0;
  rippleLife[index] = 0.48 + Math.random() * 0.42;
  rippleRadius[index] = 0.08 + speed * 0.02;
  rippleVelocityX[index] = velocityX * 0.08 + THREE.MathUtils.randFloatSpread(0.028);
  rippleVelocityZ[index] = backwardZ * drift;
};

const updateWake = (time: number, delta: number) => {
  if (!wakePoints || !wakeBasePositions || !wakeAge || !wakeLife || !wakeVelocities || !surfer) return;
  const attr = wakePoints.geometry.getAttribute('position');
  const colorAttr = wakePoints.geometry.getAttribute('color');
  if (!attr || !colorAttr) return;
  const positions = attr.array as Float32Array;
  const colors = colorAttr.array as Float32Array;
  const wakeBasePositionsArr = wakeBasePositions;
  const wakeAgeArr = wakeAge;
  const wakeLifeArr = wakeLife;
  const wakeVelocitiesArr = wakeVelocities;
  const wakeColor = new THREE.Color(settings.color);
  const motionX = surferVelocityX / surferMaxSpeed;
  const speedBurst = THREE.MathUtils.clamp(0.48 + Math.abs(motionX) * 0.52, 0.35, 1);
  wakeSpawnTimer += delta;
  if (wakeSpawnTimer >= 0.024) {
    const spawnCount = Math.max(1, Math.floor(wakeSpawnTimer / 0.024));
    wakeSpawnTimer = 0;
    for (let i = 0; i < spawnCount; i += 1) {
      const offset = (i - (spawnCount - 1) * 0.5) * 0.16;
      const wakeX = surfer.position.x + offset + THREE.MathUtils.randFloatSpread(0.16);
      const wakeZ = surferZ - surferForwardZ * 0.72;
      spawnWakeParticle(wakeX, wakeZ, time, motionX, 0);
    }
  }
  rippleSpawnTimer += delta;
  if (rippleSpawnTimer >= 0.11) {
    const backwardZ = -surferForwardZ;
    const railOffset = THREE.MathUtils.clamp(motionX * 0.28, -0.32, 0.32);
    const rippleX = surfer.position.x + railOffset;
    const rippleZ = surferZ + backwardZ * 0.92;
    spawnRipple(rippleX, rippleZ, time, motionX, 0);
    rippleSpawnTimer = 0;
  }

  for (let i = 0; i < wakeParticleCount; i += 1) {
    const baseIndex = i * 3;
    const lineIndex = i * 6;
    const age = wakeAgeArr[i];
    const life = wakeLifeArr[i];
    if (age === undefined || life === undefined || age >= life) {
      positions[lineIndex] = 0;
      positions[lineIndex + 1] = -80;
      positions[lineIndex + 2] = 0;
      positions[lineIndex + 3] = 0;
      positions[lineIndex + 4] = -80;
      positions[lineIndex + 5] = 0;
      for (let j = 0; j < 6; j += 1) colors[lineIndex + j] = 0;
      continue;
    }

    const nextAge = age + delta;
    wakeAgeArr[i] = nextAge;
    const fade = 1 - (nextAge / life);
    const baseX = wakeBasePositionsArr[baseIndex] ?? 0;
    const baseY = wakeBasePositionsArr[baseIndex + 1] ?? 0;
    const baseZ = wakeBasePositionsArr[baseIndex + 2] ?? 0;
    const velX = wakeVelocitiesArr[baseIndex] ?? 0;
    const velZ = wakeVelocitiesArr[baseIndex + 2] ?? 0;
    const x = baseX + velX * nextAge;
    const z = baseZ + velZ * nextAge;
    const surface = waveHeight(x, z, time);
    const speed = Math.hypot(velX, velZ) || 1;
    const dirX = velX / speed;
    const dirZ = velZ / speed;
    const length = wakeLineLength * (0.5 + fade * 0.65);
    const y = surface + baseY + fade * 0.035;
    const tailX = x - dirX * length;
    const tailZ = z - dirZ * length;
    const tailY = waveHeight(tailX, tailZ, time) + baseY;
    const headStrength = fade * Math.min(1.15, settings.brightness);
    const tailStrength = fade * fade * 0.38 * Math.min(1.15, settings.brightness);

    positions[lineIndex] = tailX;
    positions[lineIndex + 1] = tailY;
    positions[lineIndex + 2] = tailZ;
    positions[lineIndex + 3] = x;
    positions[lineIndex + 4] = y;
    positions[lineIndex + 5] = z;

    colors[lineIndex] = wakeColor.r * tailStrength;
    colors[lineIndex + 1] = wakeColor.g * tailStrength;
    colors[lineIndex + 2] = wakeColor.b * tailStrength;
    colors[lineIndex + 3] = wakeColor.r * headStrength;
    colors[lineIndex + 4] = wakeColor.g * headStrength;
    colors[lineIndex + 5] = wakeColor.b * headStrength;
  }
  attr.needsUpdate = true;
  colorAttr.needsUpdate = true;
};

const updateRipple = (time: number, delta: number) => {
  if (!rippleLines || !rippleBasePositions || !rippleAge || !rippleLife || !rippleRadius || !rippleVelocityX || !rippleVelocityZ || !surfer) return;
  const attr = rippleLines.geometry.getAttribute('position');
  if (!attr) return;
  const positions = attr.array as Float32Array;
  const rippleBasePositionsArr = rippleBasePositions;
  const rippleAgeArr = rippleAge;
  const rippleLifeArr = rippleLife;
  const rippleRadiusArr = rippleRadius;
  const rippleVelocityXArr = rippleVelocityX;
  const rippleVelocityZArr = rippleVelocityZ;
  const motionX = surferVelocityX / surferMaxSpeed;

  for (let i = 0; i < rippleCount; i += 1) {
    const baseIndex = i * 3;
    const lineIndex = i * rippleSegments * 2 * 3;
    const age = rippleAgeArr[i];
    const life = rippleLifeArr[i];
    if (age === undefined || life === undefined || age >= life) {
      for (let j = 0; j < rippleSegments * 2; j += 1) {
        positions[lineIndex + j * 3] = 0;
        positions[lineIndex + j * 3 + 1] = -80;
        positions[lineIndex + j * 3 + 2] = 0;
      }
      continue;
    }

    const currentAge = age + delta;
    rippleAgeArr[i] = currentAge;
    const progress = currentAge / life;
    const fade = 1 - progress;
    const centerX = (rippleBasePositionsArr[baseIndex] ?? 0) + (rippleVelocityXArr[i] ?? 0) * currentAge;
    const centerZ = (rippleBasePositionsArr[baseIndex + 2] ?? 0) + (rippleVelocityZArr[i] ?? 0) * currentAge;
    const centerY = waveHeight(centerX, centerZ, time) + (rippleBasePositionsArr[baseIndex + 1] ?? 0);
    const radius = (rippleRadiusArr[i] ?? 0) + progress * (2.2 + Math.abs(motionX) * 0.7);
    const lift = fade * 0.06;

    for (let j = 0; j < rippleSegments; j += 1) {
      const angleA = (j / rippleSegments) * Math.PI * 2;
      const angleB = ((j + 1) / rippleSegments) * Math.PI * 2;
      const squashA = 0.78 + Math.abs(Math.cos(angleA)) * 0.18;
      const squashB = 0.78 + Math.abs(Math.cos(angleB)) * 0.18;
      const ax = centerX + Math.cos(angleA) * radius * squashA;
      const az = centerZ + Math.sin(angleA) * radius;
      const bx = centerX + Math.cos(angleB) * radius * squashB;
      const bz = centerZ + Math.sin(angleB) * radius;
      const ai = lineIndex + j * 6;
      positions[ai] = ax;
      positions[ai + 1] = waveHeight(ax, az, time) + lift;
      positions[ai + 2] = az;
      positions[ai + 3] = bx;
      positions[ai + 4] = waveHeight(bx, bz, time) + lift;
      positions[ai + 5] = bz;
    }

    positions[lineIndex + 1] = centerY;
  }
  attr.needsUpdate = true;
};

const syncSurferInput = () => {
  surferInputX = (rightPressed ? 1 : 0) - (leftPressed ? 1 : 0);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    leftPressed = true;
    syncSurferInput();
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    rightPressed = true;
    syncSurferInput();
  }
};

const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    leftPressed = false;
    syncSurferInput();
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    rightPressed = false;
    syncSurferInput();
  }
};

const handleTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0];
  if (!touch) return;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
};

const handleTouchMove = (event: TouchEvent) => {
  const touch = event.touches[0];
  if (!touch) return;
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  if (Math.abs(deltaX) < 16 || Math.abs(deltaX) < Math.abs(deltaY) * 0.8) return;
  surferInputX = THREE.MathUtils.clamp(deltaX / 120, -1, 1);
};

const handleTouchEnd = () => {
  surferInputX = 0;
};

const updateSurfer = (time: number, delta: number) => {
  if (!surfer) return;
  const desiredVelocity = surferInputX * surferMaxSpeed;
  const easeRate = Math.abs(surferInputX) > 0 ? 5.6 : 7.8;
  surferVelocityX += (desiredVelocity - surferVelocityX) * (1 - Math.exp(-easeRate * delta));
  surferX = THREE.MathUtils.clamp(surferX + surferVelocityX * delta, -surferLimitX, surferLimitX);
  if ((surferX <= -surferLimitX && surferVelocityX < 0) || (surferX >= surferLimitX && surferVelocityX > 0)) {
    surferVelocityX *= 0.18;
  }
  const center = waveHeight(surferX, surferZ, time);
  const front = waveHeight(surferX, surferZ + 1, time);
  const back = waveHeight(surferX, surferZ - 0.9, time);
  const left = waveHeight(surferX - 0.72, surferZ, time);
  const right = waveHeight(surferX + 0.72, surferZ, time);
  const swell = (center * 2 + front + back + left + right) / 6;
  const crestLift = Math.max(0, center) * 0.42 + Math.max(0, front) * 0.24;
  const turn = THREE.MathUtils.clamp((surferVelocityX / surferMaxSpeed) * 0.85 + (right - left) * 0.12, -1, 1) * surferTurnMax;
  surfer.position.set(surferX, surferScreenY + swell * 0.42 + crestLift * 0.34, surferZ);
  surfer.rotation.x = THREE.MathUtils.clamp((front - back) * 0.34 + (center - back) * 0.1, -0.58, 0.58);
  surfer.rotation.y = surferYaw + turn;
  surfer.rotation.z = THREE.MathUtils.clamp((right - left) * -0.28 + (surferVelocityX / surferMaxSpeed) * -0.24, -0.52, 0.52);
};

const render = () => {
  if (!renderer || !scene || !camera || !clock) return;
  const elapsed = clock.getElapsedTime();
  const delta = elapsed - lastFrameTime;
  lastFrameTime = elapsed;
  updateAudioState();
  updateGrid(elapsed);
  updateFoam(elapsed);
  updateSurfer(elapsed, Math.max(0.001, delta));
  updateWake(elapsed, Math.max(0.001, delta));
  updateRipple(elapsed, Math.max(0.001, delta));
  renderer.render(scene, camera);
  frameId = window.requestAnimationFrame(render);
};

const resize = () => {
  if (!renderer || !camera || !mount.value) return;
  const widthPx = mount.value.clientWidth;
  const heightPx = mount.value.clientHeight;
  camera.aspect = widthPx / Math.max(heightPx, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(widthPx, heightPx);
};

const setupScene = () => {
  if (!mount.value) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020403);
  scene.fog = new THREE.FogExp2(0x020403, 0.027);

  camera = new THREE.PerspectiveCamera(46, 1, 0.1, 180);
  setCameraTilt();

  renderer = new THREE.WebGLRenderer({ antialias: !isLowPowerDevice(), alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowPowerDevice() ? 1 : 1.5));
  mount.value.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.24));
  createHorizonLines();
  createGrid();
  createSurfer();
  createWake();
  createRipple();
  clock = new THREE.Clock();
  lastFrameTime = 0;
  resize();
  render();
};

const cleanupAudio = () => {
  micStream?.getTracks().forEach((track) => track.stop());
  micStream = null;
  micActive.value = false;
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.src = '';
  }
  if (fileUrl) URL.revokeObjectURL(fileUrl);
  fileUrl = null;
  mediaSource = null;
  analyser = null;
  freqData = null;
  audioContext?.close().catch(() => undefined);
  audioContext = null;
};

const toggleMic = async () => {
  if (micActive.value) {
    micStream?.getTracks().forEach((track) => track.stop());
    micStream = null;
    micActive.value = false;
    analyser = null;
    freqData = null;
    return;
  }

  const context = await ensureAudioContext();
  if (!context) return;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
    const source = context.createMediaStreamSource(micStream);
    const micAnalyser = createAnalyser(context);
    source.connect(micAnalyser);
    micActive.value = true;
  } catch {
    micStream = null;
    micActive.value = false;
  }
};

const loadAudioFile = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (fileUrl) URL.revokeObjectURL(fileUrl);
  fileUrl = URL.createObjectURL(file);

  if (!audioElement.value) audioElement.value = new Audio();
  audioElement.value.loop = true;
  audioElement.value.crossOrigin = 'anonymous';
  audioElement.value.src = fileUrl;

  const context = await ensureAudioContext();
  if (!context) return;
  if (!mediaSource) mediaSource = context.createMediaElementSource(audioElement.value);
  const fileAnalyser = createAnalyser(context);
  mediaSource.connect(fileAnalyser);
  fileAnalyser.connect(context.destination);
  await audioElement.value.play().catch(() => undefined);
  filePlaying.value = !audioElement.value.paused;
  input.value = '';
};

const togglePlayback = async () => {
  if (!audioElement.value) return;
  await ensureAudioContext();
  if (audioElement.value.paused) {
    await audioElement.value.play().catch(() => undefined);
  } else {
    audioElement.value.pause();
  }
  filePlaying.value = !audioElement.value.paused;
};

const handleControlInput = (key: NumericSettingKey) => {
  if (key === 'density') {
    window.clearTimeout(densityRebuildTimer);
    densityRebuildTimer = window.setTimeout(createGrid, 180);
  }
  if (key === 'cameraTilt') setCameraTilt();
  if (key === 'brightness') syncMaterial();
};

const resetControls = () => {
  Object.assign(settings, defaults);
  setCameraTilt();
  createGrid();
  syncMaterial();
};

onMounted(() => {
  if (window.innerWidth < 640) controlsVisible.value = false;
  setupScene();
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchmove', handleTouchMove);
  window.removeEventListener('touchend', handleTouchEnd);
  window.cancelAnimationFrame(frameId);
  window.clearTimeout(densityRebuildTimer);
  cleanupAudio();
  disposeSurfer();
  disposeWake();
  disposeRipple();
  disposeGrid();
  if (horizonLines && scene) {
    scene.remove(horizonLines);
    horizonLines.geometry.dispose();
    horizonLines.material.dispose();
  }
  renderer?.dispose();
  renderer?.domElement.remove();
  renderer = null;
  scene = null;
  camera = null;
  clock = null;
});
</script>

<style scoped>
.sound-slider {
  height: 0.35rem;
  accent-color: #a3e635;
}

.compact-controls {
  scrollbar-width: thin;
  scrollbar-color: rgba(163, 230, 53, 0.38) rgba(255, 255, 255, 0.05);
}

.compact-controls::-webkit-scrollbar {
  width: 0.32rem;
}

.compact-controls::-webkit-scrollbar-thumb {
  background: rgba(163, 230, 53, 0.38);
}

.compact-controls::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
</style>
