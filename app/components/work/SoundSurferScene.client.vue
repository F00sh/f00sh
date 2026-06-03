<template>
  <section class="relative min-h-screen overflow-hidden bg-[#020403] text-neutral-50">
    <div ref="mount" class="absolute inset-0" aria-hidden="true" />
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(163,230,53,0.08),transparent_30%),linear-gradient(180deg,rgba(2,4,3,0.06),rgba(2,4,3,0.78))]" />

    <div class="relative z-10 flex min-h-screen flex-col px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div class="fixed left-3 top-16 z-30 sm:left-4 sm:top-20 lg:left-6">
        <button
          type="button"
          class="flex h-10 items-center gap-2 border border-white/10 bg-black/70 px-3 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-neutral-100 backdrop-blur-md transition-colors hover:border-lime-300 hover:text-lime-300 sm:h-11 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
          :aria-expanded="controlsVisible"
          aria-controls="wave-controls-menu"
          @click="controlsVisible = !controlsVisible"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M4 6H20M4 12H16M4 18H14" />
          </svg>
          <span>Controls</span>
        </button>

        <form
          id="wave-controls-menu"
          v-show="controlsVisible"
          class="mt-2 w-[min(18rem,calc(100vw-1.5rem))] border border-white/10 bg-black/80 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.32)] backdrop-blur-md sm:w-76 sm:p-4"
          @submit.prevent
        >
          <div class="mb-2 flex items-center justify-between gap-3 sm:mb-3">
            <p class="text-[0.64rem] uppercase tracking-[0.2em] text-lime-300 sm:text-xs sm:tracking-[0.22em]">Wave Controls</p>
            <button type="button" class="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-400 hover:text-lime-300 sm:text-xs sm:tracking-[0.18em]" @click="resetControls">
              Reset
            </button>
          </div>

          <div class="compact-controls grid max-h-[min(60vh,28rem)] gap-2 overflow-y-auto pr-1 sm:gap-3 sm:pr-0">
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

            <div class="grid gap-2 border-t border-white/10 pt-2 sm:gap-3 sm:pt-3">
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  class="min-h-10 border border-lime-300 px-3 py-2 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-lime-300 transition-colors hover:bg-lime-300 hover:text-neutral-950 sm:min-h-11 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
                  @click="toggleMic"
                >
                  {{ micActive ? 'Stop Mic' : 'Use Mic' }}
                </button>
                <label class="inline-flex min-h-10 cursor-pointer items-center justify-center border border-white/15 px-3 py-2 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-neutral-200 transition-colors hover:border-lime-300 hover:text-lime-300 sm:min-h-11 sm:px-4 sm:text-xs sm:tracking-[0.18em]">
                  Audio File
                  <input class="sr-only" type="file" accept="audio/*" @change="loadAudioFile">
                </label>
                <button
                  v-if="audioElement"
                  type="button"
                  class="min-h-10 border border-white/15 px-3 py-2 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-neutral-200 transition-colors hover:border-lime-300 hover:text-lime-300 sm:min-h-11 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
                  @click="togglePlayback"
                >
                  {{ filePlaying ? 'Pause File' : 'Play File' }}
                </button>
                <div class="col-span-2 flex min-h-10 items-center justify-center border border-white/10 bg-black/35 px-3 py-2 text-[0.64rem] uppercase tracking-[0.16em] text-neutral-300 sm:col-span-1 sm:min-h-11 sm:px-4 sm:text-xs">
                  Signal {{ Math.round(audioState.level * 100) }}%
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="mt-auto pb-[max(0.35rem,env(safe-area-inset-bottom))]"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Type issues with three and its examples in some environments — silence via ts-ignore
// @ts-ignore: module missing or has implicit any
import * as THREE from 'three';
// @ts-ignore: module missing or has implicit any
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// local fallback type for GLTF when typings are unavailable
type GLTF = any;
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
const controlsVisible = ref(false);

const defaults: Settings = {
  baseAmplitude: 0.42,
  audioInfluence: 2.2,
  speed: 1.15,
  frequency: 1,
  density: 64,
  smoothing: 0.75,
  cameraTilt: 29,
  brightness: 0.85,
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
];

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let gridLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
let rowLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
let voronoiLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
let horizonLines: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;
let surfer: THREE.Group | null = null;
let frameId = 0;
let clock: THREE.Clock | null = null;
let lastFrameTime = 0;
let basePositions: Float32Array | null = null;
let rowBasePositions: Float32Array | null = null;
let voronoiBasePositions: Float32Array | null = null;
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
let activePortrait = false;

const planeWidth = 42;
const nearZ = 20;
const farZ = -122;
const surferZ = 13.2;
const surferFrameMargin = 0.9;
const surferYaw = THREE.MathUtils.degToRad(90);
const surferTurnMax = THREE.MathUtils.degToRad(24);
const surferScreenY = 3.1;
const surferMaxSpeed = 8.5;
const landscapeCameraFov = 46;
const portraitCameraFov = 53;
const landscapeCameraY = 8.6;
const portraitCameraY = 9.8;
const landscapeCameraZ = 24;
const portraitCameraZ = 28.5;
const voronoiLift = 0.035;
const rowDriftSpeed = 4.2;
const voronoiDriftSpeed = 3.2;
const surferModelUrl = '/assets/3d/surfer.glb';

const getAudioContextCtor = () =>
  window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

const isLowPowerDevice = () => {
  if (typeof navigator === 'undefined') return true;
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
  return (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4)
    || (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4);
};

const lowPowerMode = isLowPowerDevice();

const targetDensity = computed(() => {
  const limit = lowPowerMode ? 56 : 110;
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

const setCameraFrame = () => {
  if (!camera) return;
  camera.fov = activePortrait ? portraitCameraFov : landscapeCameraFov;
  camera.position.set(0, activePortrait ? portraitCameraY : landscapeCameraY, activePortrait ? portraitCameraZ : landscapeCameraZ);
  camera.rotation.set(THREE.MathUtils.degToRad(-settings.cameraTilt), 0, 0);
  camera.updateProjectionMatrix();
};

const getSurferFrameLimit = (y: number) => {
  if (!camera) return planeWidth * 0.32;
  const sample = new THREE.Vector3();
  const maxX = planeWidth * 0.5;
  let low = 0;
  let high = maxX;
  for (let i = 0; i < 18; i += 1) {
    const mid = (low + high) * 0.5;
    sample.set(mid, y, surferZ).project(camera);
    const withinX = Math.abs(sample.x) <= surferFrameMargin;
    const withinY = Math.abs(sample.y) <= 0.92;
    if (withinX && withinY) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return Math.max(3, low - 0.25);
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
  if (surfer) {
    const surferMaterial = getSurferWireMaterial();
    surfer.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
      if (!mesh.material) return;
      if (mesh.material !== surferMaterial) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material: THREE.Material) => material.dispose());
        mesh.material = surferMaterial;
      }
    });
  }
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
  loader.load(surferModelUrl, (gltf: GLTF) => {
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
    materials.forEach((material: THREE.Material) => material.dispose());
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
  basePositions = null;
  rowBasePositions = null;
  voronoiBasePositions = null;
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
  const voronoiColumns = lowPowerMode ? 20 : 36;
  const voronoiRows = lowPowerMode ? 32 : 56;
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
    const driftPhase = THREE.MathUtils.euclideanModulo(time * settings.speed * rowDriftSpeed, driftRange);
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
    const driftPhase = THREE.MathUtils.euclideanModulo(time * settings.speed * voronoiDriftSpeed, driftRange);
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
  surferX += surferVelocityX * delta;
  const center = waveHeight(surferX, surferZ, time);
  const front = waveHeight(surferX, surferZ + 1, time);
  const back = waveHeight(surferX, surferZ - 0.9, time);
  const left = waveHeight(surferX - 0.72, surferZ, time);
  const right = waveHeight(surferX + 0.72, surferZ, time);
  const swell = (center * 2 + front + back + left + right) / 6;
  const crestLift = Math.max(0, center) * 0.42 + Math.max(0, front) * 0.24;
  const surferY = surferScreenY + swell * 0.42 + crestLift * 0.34;
  const frameLimitX = getSurferFrameLimit(surferY);
  surferX = THREE.MathUtils.clamp(surferX, -frameLimitX, frameLimitX);
  if ((surferX <= -frameLimitX && surferVelocityX < 0) || (surferX >= frameLimitX && surferVelocityX > 0)) {
    surferVelocityX *= 0.18;
  }
  const turn = THREE.MathUtils.clamp((surferVelocityX / surferMaxSpeed) * 0.85 + (right - left) * 0.12, -1, 1) * surferTurnMax;
  surfer.position.set(surferX, surferY, surferZ);
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
  updateSurfer(elapsed, Math.max(0.001, delta));
  renderer.render(scene, camera);
  frameId = window.requestAnimationFrame(render);
};

const resize = () => {
  if (!renderer || !camera || !mount.value) return;
  const widthPx = mount.value.clientWidth;
  const heightPx = mount.value.clientHeight;
  activePortrait = heightPx > widthPx;
  setCameraFrame();
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
  setCameraFrame();

  renderer = new THREE.WebGLRenderer({ antialias: !lowPowerMode, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPowerMode ? 0.85 : 1.5));
  mount.value.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.24));
  createHorizonLines();
  createGrid();
  createSurfer();
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
  if (key === 'cameraTilt') setCameraFrame();
  if (key === 'brightness') syncMaterial();
};

const resetControls = () => {
  Object.assign(settings, defaults);
  setCameraFrame();
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
