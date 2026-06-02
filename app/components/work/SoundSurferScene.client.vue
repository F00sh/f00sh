<template>
  <section class="relative min-h-screen overflow-hidden bg-[#020403] text-neutral-50">
    <div ref="mount" class="absolute inset-0" aria-hidden="true" />
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(163,230,53,0.08),transparent_30%),linear-gradient(180deg,rgba(2,4,3,0.06),rgba(2,4,3,0.78))]" />

    <div class="relative z-10 flex min-h-screen flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
      <div class="max-w-4xl pt-16 sm:pt-20">
        <p class="text-xs uppercase tracking-[0.22em] text-lime-300">Interactive Audio Experience</p>
        <h1 class="mt-4 font-josefin text-[clamp(2rem,6vw,4.8rem)] leading-[0.94]">Sound Surfer</h1>
        <p class="mt-5 max-w-2xl text-base leading-7 text-neutral-200 sm:text-lg">
          An endless wireframe sea where baseline waves stay alive and incoming sound pushes the surface into stronger motion.
        </p>
      </div>

      <div class="grid gap-4 pb-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="border border-lime-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-lime-300 transition-colors hover:bg-lime-300 hover:text-neutral-950"
            @click="toggleMic"
          >
            {{ micActive ? 'Stop Mic' : 'Use Mic' }}
          </button>
          <label class="inline-flex cursor-pointer items-center border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-neutral-200 transition-colors hover:border-lime-300 hover:text-lime-300">
            Audio File
            <input class="sr-only" type="file" accept="audio/*" @change="loadAudioFile">
          </label>
          <button
            v-if="audioElement"
            type="button"
            class="border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-neutral-200 transition-colors hover:border-lime-300 hover:text-lime-300"
            @click="togglePlayback"
          >
            {{ filePlaying ? 'Pause File' : 'Play File' }}
          </button>
          <div class="border border-white/10 bg-black/35 px-5 py-3 text-xs uppercase tracking-[0.16em] text-neutral-300">
            Signal {{ Math.round(audioState.level * 100) }}%
          </div>
        </div>

        <form class="border border-white/10 bg-black/60 p-4 backdrop-blur" @submit.prevent>
          <div class="mb-3 flex items-center justify-between gap-4">
            <p class="text-xs uppercase tracking-[0.22em] text-lime-300">Wave Controls</p>
            <div class="flex items-center gap-3">
              <button type="button" class="text-xs uppercase tracking-[0.18em] text-neutral-400 hover:text-lime-300" @click="controlsVisible = !controlsVisible">
                {{ controlsVisible ? 'Hide' : 'Show' }}
              </button>
              <button type="button" class="text-xs uppercase tracking-[0.18em] text-neutral-400 hover:text-lime-300" @click="resetControls">Reset</button>
            </div>
          </div>

          <div v-show="controlsVisible">
            <label v-for="control in numericControls" :key="control.key" class="mb-3 grid gap-1 text-xs uppercase tracking-[0.12em] text-neutral-300">
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

            <label class="grid gap-1 text-xs uppercase tracking-[0.12em] text-neutral-300">
              <span class="flex justify-between gap-3">
                Color Tint
                <span class="text-neutral-500">{{ settings.color }}</span>
              </span>
              <input v-model="settings.color" type="color" class="h-9 w-full border border-white/10 bg-black/50" @input="syncMaterial">
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

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
let horizonLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
let foamPoints: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null = null;
let wakePoints: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null = null;
let rippleLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
let surfer: THREE.Group | null = null;
let frameId = 0;
let clock: THREE.Clock | null = null;
let lastFrameTime = 0;
let basePositions: Float32Array | null = null;
let rowBasePositions: Float32Array | null = null;
let foamBasePositions: Float32Array | null = null;
let foamSeeds: Float32Array | null = null;
let wakeBasePositions: Float32Array | null = null;
let wakeAge: Float32Array | null = null;
let wakeLife: Float32Array | null = null;
let wakeVelocities: Float32Array | null = null;
let wakeCursor = 0;
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
let surferX = 0;
let surferTargetX = 0;
let touchStartX = 0;
let touchStartY = 0;

const planeWidth = 42;
const nearZ = 20;
const farZ = -122;
const foamStride = 3;
const surferZ = 13.2;
const surferLimitX = planeWidth * 0.32;
const surferYaw = THREE.MathUtils.degToRad(90);
const surferTurnMax = THREE.MathUtils.degToRad(24);
const surferScreenY = 3.1;

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
  const travelLength = nearZ - farZ;
  const wrapped = ((nearZ - z) % travelLength + travelLength) % travelLength;
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
  if (horizonLines) {
    horizonLines.material.color.set(settings.color);
    horizonLines.material.opacity = Math.min(0.28, settings.brightness * 0.28);
  }
  if (foamPoints) {
    foamPoints.material.opacity = Math.min(0.9, settings.brightness * 0.72);
  }
  if (wakePoints) {
    wakePoints.material.opacity = Math.min(0.92, settings.brightness * 0.78);
  }
  if (rippleLines) {
    rippleLines.material.opacity = Math.min(0.5, settings.brightness * 0.42);
  }
  if (surfer) {
    surfer.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
      if (!mesh.material) return;
      const material = mesh.material as THREE.MeshBasicMaterial;
      if (material.color) material.color.set(settings.color);
      material.opacity = child.name === 'surfer-board' ? Math.min(0.88, settings.brightness * 0.7) : Math.min(1, settings.brightness);
    });
  }
};

const createWake = () => {
  if (!scene) return;
  const positions = new Float32Array(wakeParticleCount * 3);
  wakeBasePositions = new Float32Array(wakeParticleCount * 3);
  wakeAge = new Float32Array(wakeParticleCount);
  wakeLife = new Float32Array(wakeParticleCount);
  wakeVelocities = new Float32Array(wakeParticleCount * 3);
  for (let i = 0; i < wakeParticleCount; i += 1) {
    const index = i * 3;
    positions[index] = 0;
    positions[index + 1] = -80;
    positions[index + 2] = 0;
    wakeBasePositions[index] = 0;
    wakeBasePositions[index + 1] = -80;
    wakeBasePositions[index + 2] = 0;
    wakeAge[i] = 999;
    wakeLife[i] = 1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  wakePoints = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xf6ffe8,
      transparent: true,
      opacity: Math.min(0.92, settings.brightness * 0.78),
      size: isLowPowerDevice() ? 0.05 : 0.075,
      sizeAttenuation: true,
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
  const material = new THREE.MeshBasicMaterial({
    color: settings.color,
    transparent: true,
    opacity: Math.min(1, settings.brightness),
    depthTest: false,
    depthWrite: false,
  });
  const boardMaterial = new THREE.MeshBasicMaterial({
    color: 0xf6ffe8,
    transparent: true,
    opacity: Math.min(0.88, settings.brightness * 0.7),
    depthTest: false,
    depthWrite: false,
  });
  const makeLimb = (start: THREE.Vector3, end: THREE.Vector3, width = 0.08) => {
    const delta = end.clone().sub(start);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(delta.length(), width, width), material);
    mesh.position.copy(start).add(delta.multiplyScalar(0.5));
    mesh.rotation.z = Math.atan2(end.y - start.y, end.x - start.x);
    return mesh;
  };

  const board = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 0.46), boardMaterial);
  board.name = 'surfer-board';
  board.position.set(0, 0.08, 0);
  group.add(board);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.82, 0.16), material);
  body.position.set(0, 0.92, 0);
  body.rotation.z = -0.18;
  group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), material);
  head.position.set(-0.08, 1.44, 0);
  group.add(head);

  const armGeometry = new THREE.BoxGeometry(0.72, 0.08, 0.08);
  const leftArm = new THREE.Mesh(armGeometry, material);
  leftArm.position.set(-0.36, 1.14, 0);
  leftArm.rotation.z = 0.48;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, material);
  rightArm.position.set(0.42, 1.08, 0);
  rightArm.rotation.z = -0.58;
  group.add(rightArm);

  group.add(makeLimb(new THREE.Vector3(-0.1, 0.55, 0), new THREE.Vector3(-0.76, 0.16, 0), 0.09));
  group.add(makeLimb(new THREE.Vector3(0.1, 0.52, 0), new THREE.Vector3(0.76, 0.16, 0), 0.09));

  group.renderOrder = 6;
  group.position.set(surferX, 0, surferZ);
  group.rotation.y = surferYaw;
  surfer = group;
  scene.add(group);
  syncMaterial();
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
  if (foamPoints && scene) {
    scene.remove(foamPoints);
    foamPoints.geometry.dispose();
    foamPoints.material.dispose();
    foamPoints = null;
  }
  basePositions = null;
  rowBasePositions = null;
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
  scene.remove(surfer);
  surfer.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
    if (!mesh.geometry || !mesh.material) return;
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
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
  const rowSegmentCount = zLines * xSegments;
  const positions = new Float32Array(segmentCount * 2 * 3);
  const rowPositions = new Float32Array(rowSegmentCount * 2 * 3);
  basePositions = new Float32Array(positions.length);
  rowBasePositions = new Float32Array(rowPositions.length);
  let index = 0;
  let rowIndex = 0;

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
      writeRowPoint(x0, z);
      writeRowPoint(x1, z);
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

  const foamCount = isLowPowerDevice() ? 220 : 360;
  const foamPositions = new Float32Array(foamCount * foamStride);
  foamBasePositions = new Float32Array(foamCount * foamStride);
  foamSeeds = new Float32Array(foamCount * 4);
  const travelLength = nearZ - farZ;
  for (let i = 0; i < foamCount; i += 1) {
    const positionIndex = i * foamStride;
    const seedIndex = i * 4;
    const x = THREE.MathUtils.randFloatSpread(planeWidth * 0.92);
    const z = nearZ - Math.random() * travelLength;
    foamPositions[positionIndex] = x;
    foamPositions[positionIndex + 1] = -80;
    foamPositions[positionIndex + 2] = z;
    foamBasePositions[positionIndex] = x;
    foamBasePositions[positionIndex + 1] = 0;
    foamBasePositions[positionIndex + 2] = z;
    foamSeeds[seedIndex] = Math.floor(Math.random() * 16);
    foamSeeds[seedIndex + 1] = THREE.MathUtils.randFloatSpread(planeWidth * 0.9);
    foamSeeds[seedIndex + 2] = Math.random() * Math.PI * 2;
    foamSeeds[seedIndex + 3] = THREE.MathUtils.randFloatSpread(1);
  }
  const foamGeometry = new THREE.BufferGeometry();
  foamGeometry.setAttribute('position', new THREE.BufferAttribute(foamPositions, 3));
  foamPoints = new THREE.Points(
    foamGeometry,
    new THREE.PointsMaterial({
      color: 0xf6ffe8,
      transparent: true,
      opacity: Math.min(0.9, settings.brightness * 0.72),
      size: isLowPowerDevice() ? 0.08 : 0.105,
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
  updatePositions(rowLines, rowBasePositions);
};

const updateFoam = (time: number) => {
  if (!foamPoints || !foamSeeds || !foamBasePositions) return;
  const attr = foamPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
  const positions = attr.array as Float32Array;
  const travelLength = nearZ - farZ;
  const audioEnergy = audioState.level * settings.audioInfluence;
  const frequency = Math.max(0.2, settings.frequency);
  const speed = settings.speed;

  for (let i = 0; i < foamSeeds.length / 4; i += 1) {
    const positionIndex = i * foamStride;
    const seedIndex = i * 4;
    const crestBand = foamSeeds[seedIndex] ?? 0;
    const seedX = foamSeeds[seedIndex + 1] ?? 0;
    const seedPhase = foamSeeds[seedIndex + 2] ?? 0;
    const foamOffset = foamSeeds[seedIndex + 3] ?? 0;
    const x = seedX + Math.sin(time * 0.45 + seedPhase) * 0.32;
    const targetPhase = Math.PI * 0.5 + crestBand * Math.PI * 2;
    const lipPhaseOffset = Math.sin(x * 0.13) * 1.2;
    const zOnLip = ((targetPhase - lipPhaseOffset) / (0.34 * frequency)) + time * speed * 9;
    const z = wrapDepth(zOnLip + foamOffset * (0.18 + audioEnergy * 0.03));
    const y = waveHeight(x, z, time);
    const face = waveHeight(x, z + 0.45, time);
    const shoulder = waveHeight(x, z - 0.45, time);
    const slope = Math.max(0, y - Math.min(face, shoulder));
    const fade = THREE.MathUtils.clamp((nearZ - z) / travelLength, 0, 1);
    const topBias = THREE.MathUtils.clamp(
      (y - settings.baseAmplitude * 1.15) / (settings.baseAmplitude * 1.45 + audioEnergy * 0.18 + 0.001),
      0,
      1,
    );
    const slopeBias = THREE.MathUtils.clamp(slope / (settings.baseAmplitude * 0.72 + audioEnergy * 0.08 + 0.001), 0, 1);
    const foamDensity = THREE.MathUtils.clamp(topBias * 0.82 + slopeBias * 0.32, 0, 1);
    const visible = foamDensity > Math.abs(foamOffset) * 0.78 && fade < 0.9;

    positions[positionIndex] = x + Math.sin(time * 1.4 + seedPhase) * (0.04 + foamDensity * 0.08);
    positions[positionIndex + 1] = visible ? y + 0.08 + slope * 0.12 + foamDensity * 0.12 : -80;
    positions[positionIndex + 2] = z;
  }
  attr.needsUpdate = true;
};

const spawnWakeParticle = (x: number, z: number, time: number, velocityX: number, velocityZ: number) => {
  if (!wakePoints || !wakeBasePositions || !wakeAge || !wakeLife || !wakeVelocities) return;
  const index = wakeCursor % wakeParticleCount;
  wakeCursor += 1;
  const baseIndex = index * 3;
  const angle = surfer ? surfer.rotation.y : surferYaw;
  const backwardX = -Math.sin(angle);
  const backwardZ = -Math.cos(angle);
  const lateralX = Math.cos(angle);
  const lateralZ = -Math.sin(angle);
  const trailBias = THREE.MathUtils.clamp(Math.abs(velocityX) * 0.65 + Math.abs(velocityZ) * 0.08, 0.18, 1);
  const scatter = THREE.MathUtils.randFloatSpread(0.34);
  const wakeX = x + backwardX * (0.92 + trailBias * 0.7) + lateralX * scatter;
  const wakeZ = z + backwardZ * (0.92 + trailBias * 0.7) + lateralZ * scatter;
  const wakeY = waveHeight(wakeX, wakeZ, time);
  wakeBasePositions[baseIndex] = wakeX;
  wakeBasePositions[baseIndex + 1] = wakeY + 0.05;
  wakeBasePositions[baseIndex + 2] = wakeZ;
  wakeAge[index] = 0;
  wakeLife[index] = 0.42 + Math.random() * 0.55;
  wakeVelocities[baseIndex] = backwardX * (0.06 + trailBias * 0.12) + lateralX * scatter * 0.04;
  wakeVelocities[baseIndex + 1] = 0.01 + trailBias * 0.03;
  wakeVelocities[baseIndex + 2] = backwardZ * (0.06 + trailBias * 0.12) + lateralZ * scatter * 0.04;
};

const spawnRipple = (x: number, z: number, time: number, velocityX: number, velocityZ: number) => {
  if (!rippleLines || !rippleBasePositions || !rippleAge || !rippleLife || !rippleRadius || !rippleVelocityX || !rippleVelocityZ) return;
  const index = rippleCursor % rippleCount;
  rippleCursor += 1;
  const baseIndex = index * 3;
  const angle = surfer ? surfer.rotation.y : surferYaw;
  const backwardX = -Math.sin(angle);
  const backwardZ = -Math.cos(angle);
  const lateralX = Math.cos(angle);
  const lateralZ = -Math.sin(angle);
  const speed = Math.hypot(velocityX, velocityZ);
  const drift = THREE.MathUtils.clamp(speed * 0.18, 0.05, 0.38);

  rippleBasePositions[baseIndex] = x + backwardX * 0.24;
  rippleBasePositions[baseIndex + 1] = waveHeight(x, z, time) + 0.02;
  rippleBasePositions[baseIndex + 2] = z + backwardZ * 0.24;
  rippleAge[index] = 0;
  rippleLife[index] = 0.48 + Math.random() * 0.42;
  rippleRadius[index] = 0.08 + speed * 0.02;
  rippleVelocityX[index] = backwardX * drift + lateralX * THREE.MathUtils.randFloatSpread(0.028);
  rippleVelocityZ[index] = backwardZ * drift + lateralZ * THREE.MathUtils.randFloatSpread(0.028);
};

const updateWake = (time: number, delta: number) => {
  if (!wakePoints || !wakeBasePositions || !wakeAge || !wakeLife || !wakeVelocities || !surfer) return;
  const attr = wakePoints.geometry.getAttribute('position');
  if (!attr) return;
  const positions = attr.array as Float32Array;
  const wakeBasePositionsArr = wakeBasePositions;
  const wakeAgeArr = wakeAge;
  const wakeLifeArr = wakeLife;
  const wakeVelocitiesArr = wakeVelocities;
  const motionX = surferX - surferTargetX;
  const moving = Math.abs(motionX) > 0.02;
  if (moving) {
    const speedBurst = THREE.MathUtils.clamp(Math.abs(motionX) * 3.4, 0.18, 1);
    const spawnCount = Math.max(1, Math.round(speedBurst * 2));
    for (let i = 0; i < spawnCount; i += 1) {
      const offset = (i - (spawnCount - 1) * 0.5) * 0.16;
      const angle = surfer.rotation.y;
      const lateralX = Math.cos(angle);
      const lateralZ = -Math.sin(angle);
      const wakeX = surfer.position.x + lateralX * offset;
      const wakeZ = surferZ - 0.18;
      spawnWakeParticle(wakeX, wakeZ, time, motionX, 0);
    }
  }
  rippleSpawnTimer += delta;
  if (moving && rippleSpawnTimer >= 0.07) {
    const angle = surfer.rotation.y;
    const backwardX = -Math.sin(angle);
    const backwardZ = -Math.cos(angle);
    const lateralX = Math.cos(angle);
    const lateralZ = -Math.sin(angle);
    const railOffset = THREE.MathUtils.clamp(motionX * 0.28, -0.32, 0.32);
    const rippleX = surfer.position.x + backwardX * 0.92 + lateralX * railOffset;
    const rippleZ = surferZ - 0.18 + backwardZ * 0.92 + lateralZ * railOffset;
    spawnRipple(rippleX, rippleZ, time, motionX, 0);
    rippleSpawnTimer = 0;
  }

  for (let i = 0; i < wakeParticleCount; i += 1) {
    const baseIndex = i * 3;
    const age = wakeAgeArr[i];
    const life = wakeLifeArr[i];
    if (age === undefined || life === undefined || age >= life) {
      positions[baseIndex + 1] = -80;
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
    positions[baseIndex] = x;
    positions[baseIndex + 1] = surface + baseY + fade * 0.08;
    positions[baseIndex + 2] = z;
  }
  attr.needsUpdate = true;
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
  const motionX = surferX - surferTargetX;

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

const moveSurfer = (direction: number) => {
  surferTargetX = THREE.MathUtils.clamp(surferTargetX + direction * 2.6, -surferLimitX, surferLimitX);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    moveSurfer(-1);
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    moveSurfer(1);
  }
};

const handleTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0];
  if (!touch) return;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
};

const handleTouchEnd = (event: TouchEvent) => {
  const touch = event.changedTouches[0];
  if (!touch) return;
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  if (Math.abs(deltaX) < 34 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
  moveSurfer(deltaX > 0 ? 1 : -1);
};

const updateSurfer = (time: number) => {
  if (!surfer) return;
  surferX += (surferTargetX - surferX) * 0.12;
  const center = waveHeight(surferX, surferZ, time);
  const front = waveHeight(surferX, surferZ + 1, time);
  const back = waveHeight(surferX, surferZ - 0.9, time);
  const left = waveHeight(surferX - 0.72, surferZ, time);
  const right = waveHeight(surferX + 0.72, surferZ, time);
  const swell = (center * 2 + front + back + left + right) / 6;
  const crestLift = Math.max(0, center) * 0.42 + Math.max(0, front) * 0.24;
  const turn = THREE.MathUtils.clamp((surferTargetX - surferX) / 2.2 + (right - left) * 0.12, -1, 1) * surferTurnMax;
  surfer.position.set(surferX, surferScreenY + swell * 0.42 + crestLift * 0.34, surferZ);
  surfer.rotation.x = THREE.MathUtils.clamp((front - back) * 0.34 + (center - back) * 0.1, -0.58, 0.58);
  surfer.rotation.y = surferYaw + turn;
  surfer.rotation.z = THREE.MathUtils.clamp((right - left) * -0.28 + (surferTargetX - surferX) * -0.03, -0.52, 0.52);
};

const render = () => {
  if (!renderer || !scene || !camera || !clock) return;
  const elapsed = clock.getElapsedTime();
  const delta = elapsed - lastFrameTime;
  lastFrameTime = elapsed;
  updateAudioState();
  updateGrid(elapsed);
  updateFoam(elapsed);
  updateWake(elapsed, Math.max(0.001, delta));
  updateRipple(elapsed, Math.max(0.001, delta));
  updateSurfer(elapsed);
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
  setupScene();
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('touchstart', handleTouchStart);
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
</style>
