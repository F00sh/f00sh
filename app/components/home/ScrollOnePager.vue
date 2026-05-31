<template>
  <section ref="root" class="scroll-onepager relative isolate overflow-hidden bg-[#030604] text-neutral-50">
    <div ref="stage" class="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
    <div class="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_76%_18%,rgba(197,255,64,0.13),transparent_27%),radial-gradient(circle_at_18%_72%,rgba(45,212,191,0.12),transparent_25%),linear-gradient(110deg,rgba(3,6,4,0.18),rgba(3,6,4,0.72)_78%)]" />

    <div class="fixed bottom-5 left-1/2 z-30 hidden -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur md:block">
      <ol class="flex items-center gap-2" aria-label="Flight path sections">
        <li v-for="(item, index) in flightItems" :key="item.id">
          <a
            :href="`#${item.id}`"
            class="section-dot block h-2.5 w-2.5 rounded-full border border-white/30 bg-white/10 transition-all duration-300 hover:border-lime-300 focus-outline motion-reduce:transition-none"
            :aria-label="item.navLabel"
            :data-dot="index"
          />
        </li>
      </ol>
    </div>

    <div class="relative z-10">
      <section
        v-for="(item, index) in flightItems"
        :id="item.id"
        :key="item.id"
        class="scroll-panel grid min-h-screen items-center px-4 py-24 sm:px-8 lg:px-10"
        :aria-labelledby="`${item.id}-title`"
        data-panel
      >
        <div class="mx-auto grid w-full max-w-[88rem] gap-8 lg:grid-cols-12 lg:items-end">
          <div :class="index % 2 === 0 ? 'lg:col-span-5' : 'lg:col-span-5 lg:col-start-8'">
            <p class="font-dm-mono text-xs uppercase tracking-[0.28em] text-lime-300" data-reveal>
              {{ item.eyebrow }}
            </p>
            <h1
              v-if="index === 0"
              :id="`${item.id}-title`"
              class="mt-4 max-w-5xl font-archivo-black text-[clamp(4rem,13vw,12rem)] leading-[0.78] tracking-[-0.08em] text-white"
              data-reveal
            >
              {{ item.title }}
            </h1>
            <h2
              v-else
              :id="`${item.id}-title`"
              class="mt-4 max-w-4xl font-archivo-black text-5xl leading-[0.86] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl"
              data-reveal
            >
              {{ item.title }}
            </h2>
            <p class="mt-7 max-w-xl text-base leading-7 text-neutral-200 sm:text-lg" data-reveal>
              {{ item.description }}
            </p>

            <div class="mt-8 flex flex-wrap gap-3" data-reveal>
              <NuxtLink
                v-if="item.link"
                :to="item.link.href"
                class="rounded-full border border-lime-300 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-lime-300 transition-colors hover:bg-lime-300 hover:text-neutral-950 focus-outline motion-reduce:transition-none"
              >
                {{ item.link.label }}
              </NuxtLink>
              <a
                v-if="item.email"
                :href="item.email.href"
                class="rounded-full border border-lime-300 bg-lime-300 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-950 transition-transform hover:-translate-y-0.5 focus-outline motion-reduce:transition-none"
              >
                {{ item.email.label }}
              </a>
              <span class="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-xs uppercase tracking-[0.2em] text-neutral-300 backdrop-blur">
                {{ item.category }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useGsap } from "~/composables/useGsap";
import { usePrefersReducedMotion } from "~/composables/usePrefersReducedMotion";

type FlightItem = {
  id: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  category: string;
  image: string;
  link?: { label: string; href: string };
  email?: { label: string; href: string };
};

type FlightPoint = {
  plane: { x: number; y: number; z: number };
  camera: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
};

type FlightPlane = {
  group: THREE.Group;
  imageMaterial: THREE.MeshBasicMaterial;
  frameMaterial: THREE.LineBasicMaterial;
  glowMaterial: THREE.MeshBasicMaterial;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
  mouseRotation: THREE.Vector3;
  targetMouseRotation: THREE.Vector3;
  floatOffset: number;
};

type PathWire = {
  object: THREE.Object3D;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
  mouseRotation: THREE.Vector3;
  targetMouseRotation: THREE.Vector3;
  respondsToMouse: boolean;
  floatOffset: number;
};

type DustField = {
  points: THREE.Points;
  positions: Float32Array;
  velocities: Float32Array;
  seeds: Float32Array;
};

const root = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
const { loadGsap, trackAnimation, addCleanup } = useGsap();
const { prefersReducedMotion } = usePrefersReducedMotion();
const lavandaUrl = new URL("../../assets/3D/lavanda01.glb", import.meta.url).href;
const lavandaLayer = 1;

const flightItems: FlightItem[] = [
  {
    id: "home",
    navLabel: "Intro",
    eyebrow: "Three.js flight path",
    title: "fly through the work",
    description: "Scroll forward and the camera moves through a field of image planes, landing on one piece at a time.",
    category: "3D onepager",
    image: "/img/bg/ap_fin_all_1.png",
    link: { label: "Enter archive", href: "/portfolio" },
  },
  {
    id: "about",
    navLabel: "About",
    eyebrow: "01 / visual systems",
    title: "images as spatial landmarks",
    description: "Each plane sits at a different depth, angle, and scale so the page behaves more like a camera move than a flat scroll.",
    category: "design + web",
    image: "/img/bg/ap_fin_all_2.png",
  },
  {
    id: "portfolio",
    navLabel: "Portfolio",
    eyebrow: "02 / selected work",
    title: "pass the first frame",
    description: "Project imagery becomes the navigation surface: foreground planes move past while distant frames wait in the fog.",
    category: "portfolio",
    image: "/img/bg/gallery1.png",
    link: { label: "Full archive", href: "/portfolio" },
  },
  {
    id: "motion",
    navLabel: "Motion",
    eyebrow: "03 / motion study",
    title: "drift, rotate, approach",
    description: "GSAP scrubs camera position and look-at targets while Three.js handles depth, parallax, image planes, and starfield motion.",
    category: "GSAP scroll",
    image: "/img/bg/cvike4.png",
  },
  {
    id: "field",
    navLabel: "Field",
    eyebrow: "04 / depth field",
    title: "the archive keeps going",
    description: "Extra frames sit off-axis to make the space feel larger than the viewport, with pointer movement adding a small handheld camera offset.",
    category: "interactive 3D",
    image: "/img/bg/cvike6.png",
  },
  {
    id: "contact",
    navLabel: "Contact",
    eyebrow: "05 / final approach",
    title: "land the idea",
    description: "The last camera stop pulls the field into alignment and leaves a clear action point for new work.",
    category: "contact",
    image: "/img/bg/ap_fin_wh_3.png",
    email: { label: "Start a project", href: "mailto:fooshmoola@gmail.com" },
  },
];

const flightPath: FlightPoint[] = [
  {
    plane: { x: -1.65, y: 0.45, z: -6.2 },
    camera: { x: -0.28, y: 0.24, z: 1.2 },
    rotation: { x: 0.025, y: 0.28, z: -0.06 },
  },
  {
    plane: { x: 3.35, y: -0.75, z: -19.5 },
    camera: { x: 2.58, y: -0.55, z: -12.2 },
    rotation: { x: -0.045, y: -0.42, z: 0.09 },
  },
  {
    plane: { x: -3.55, y: 1.15, z: -33.0 },
    camera: { x: -2.85, y: 0.92, z: -25.7 },
    rotation: { x: 0.035, y: 0.46, z: -0.07 },
  },
  {
    plane: { x: 4.15, y: 0.86, z: -47.6 },
    camera: { x: 3.26, y: 0.68, z: -40.2 },
    rotation: { x: -0.025, y: -0.5, z: 0.07 },
  },
  {
    plane: { x: -2.65, y: -1.18, z: -61.8 },
    camera: { x: -2.04, y: -0.96, z: -54.4 },
    rotation: { x: 0.055, y: 0.32, z: 0.12 },
  },
  {
    plane: { x: 0.42, y: 0.04, z: -76.0 },
    camera: { x: 0.1, y: 0.04, z: -68.4 },
    rotation: { x: 0.0, y: -0.05, z: -0.03 },
  },
];

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let galleryRoot: THREE.Group | null = null;
let starField: THREE.Points | null = null;
let dustField: DustField | null = null;
let plantGroup: THREE.Group | null = null;
let frameId = 0;
let isVisible = true;
let pointerX = 0;
let pointerY = 0;
let clock = new THREE.Clock();
let lastFrameTime = 0;
let lastMouseShuffle = 0;
let lastPointerMoveAt = 0;
const cameraTarget = new THREE.Vector3(flightPath[0].plane.x, flightPath[0].plane.y, flightPath[0].plane.z);
const lookAtTarget = new THREE.Vector3();
const flightPlanes: FlightPlane[] = [];
const pathWires: PathWire[] = [];
const loadedTextures: THREE.Texture[] = [];

const createStarField = () => {
  const count = 2200;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const colorA = new THREE.Color(0xd9ff66);
  const colorB = new THREE.Color(0x74f7d0);

  for (let index = 0; index < count; index += 1) {
    const positionIndex = index * 3;
    const depth = THREE.MathUtils.randFloat(-84, 3);
    const spread = THREE.MathUtils.mapLinear(depth, 3, -84, 8, 24);
    positions[positionIndex] = THREE.MathUtils.randFloatSpread(spread);
    positions[positionIndex + 1] = THREE.MathUtils.randFloatSpread(spread * 0.55);
    positions[positionIndex + 2] = depth;

    const color = colorA.clone().lerp(colorB, Math.random());
    colors[positionIndex] = color.r;
    colors[positionIndex + 1] = color.g;
    colors[positionIndex + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.74,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
};

const seedDustParticle = (
  positions: Float32Array,
  velocities: Float32Array,
  seeds: Float32Array,
  index: number,
  cameraPosition?: THREE.Vector3,
) => {
  const offset = index * 3;
  const z = cameraPosition ? cameraPosition.z - THREE.MathUtils.randFloat(2.5, 22) : THREE.MathUtils.randFloat(-82, 4);
  const spread = cameraPosition ? THREE.MathUtils.randFloat(2.8, 9.5) : THREE.MathUtils.mapLinear(z, 4, -82, 5, 18);

  positions[offset] = (cameraPosition?.x ?? 0) + THREE.MathUtils.randFloatSpread(spread);
  positions[offset + 1] = (cameraPosition?.y ?? 0) + THREE.MathUtils.randFloat(-3.6, 4.2);
  positions[offset + 2] = z;

  velocities[offset] = THREE.MathUtils.randFloatSpread(0.08);
  velocities[offset + 1] = THREE.MathUtils.randFloatSpread(0.08);
  velocities[offset + 2] = THREE.MathUtils.randFloat(-0.16, 0.04);
  seeds[index] = Math.random() * Math.PI * 2;
};

const createDustField = () => {
  const count = 760;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const warmDust = new THREE.Color(0xf4f0cf);
  const greenDust = new THREE.Color(0xd9ff66);
  const cyanDust = new THREE.Color(0x64f4d0);

  for (let index = 0; index < count; index += 1) {
    const colorOffset = index * 3;
    const color = warmDust.clone().lerp(index % 3 === 0 ? cyanDust : greenDust, Math.random() * 0.28);
    seedDustParticle(positions, velocities, seeds, index);
    colors[colorOffset] = color.r;
    colors[colorOffset + 1] = color.g;
    colors[colorOffset + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.052,
    vertexColors: true,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return {
    points: new THREE.Points(geometry, material),
    positions,
    velocities,
    seeds,
  } satisfies DustField;
};

const updateDustField = (delta: number, elapsed: number) => {
  if (!dustField || !camera) return;

  const positions = dustField.positions;
  const velocities = dustField.velocities;
  const seeds = dustField.seeds;
  const cameraPosition = camera.position;
  const count = seeds.length;
  const pushRadius = 4.8;
  const pushRadiusSq = pushRadius * pushRadius;

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    let x = positions[offset];
    let y = positions[offset + 1];
    let z = positions[offset + 2];
    const dx = x - cameraPosition.x;
    const dy = y - cameraPosition.y;
    const dz = z - cameraPosition.z;
    const distanceSq = dx * dx + dy * dy + dz * dz;

    if (z > cameraPosition.z + 5 || z < cameraPosition.z - 28 || Math.abs(dx) > 15 || Math.abs(dy) > 9) {
      seedDustParticle(positions, velocities, seeds, index, cameraPosition);
      continue;
    }

    if (distanceSq < pushRadiusSq) {
      const distance = Math.max(Math.sqrt(distanceSq), 0.001);
      const influence = (1 - distance / pushRadius) ** 2;
      const seed = seeds[index];
      const randomX = Math.sin(elapsed * 4.7 + seed) * 0.48;
      const randomY = Math.cos(elapsed * 5.1 + seed * 1.7) * 0.48;
      const randomZ = Math.sin(elapsed * 3.9 + seed * 2.3) * 0.34;

      velocities[offset] += (dx / distance + randomX) * influence * 8.4 * delta;
      velocities[offset + 1] += (dy / distance + randomY) * influence * 8.4 * delta;
      velocities[offset + 2] += (dz / distance + randomZ) * influence * 8.4 * delta;
    } else {
      velocities[offset] += Math.sin(elapsed * 0.9 + seeds[index]) * 0.012 * delta;
      velocities[offset + 1] += Math.cos(elapsed * 0.8 + seeds[index]) * 0.012 * delta;
      velocities[offset + 2] -= 0.012 * delta;
    }

    velocities[offset] *= 0.986;
    velocities[offset + 1] *= 0.986;
    velocities[offset + 2] *= 0.986;

    x += velocities[offset];
    y += velocities[offset + 1];
    z += velocities[offset + 2];

    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
  }

  const positionAttribute = dustField.points.geometry.getAttribute("position") as THREE.BufferAttribute;
  positionAttribute.needsUpdate = true;
};

const createLineSegments = (
  segments: Array<[THREE.Vector3, THREE.Vector3]>,
  material: THREE.LineBasicMaterial,
) => {
  const positions = new Float32Array(segments.length * 6);

  segments.forEach(([start, end], index) => {
    const offset = index * 6;
    positions[offset] = start.x;
    positions[offset + 1] = start.y;
    positions[offset + 2] = start.z;
    positions[offset + 3] = end.x;
    positions[offset + 4] = end.y;
    positions[offset + 5] = end.z;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return new THREE.LineSegments(geometry, material);
};

const createWireGrid = (
  width: number,
  height: number,
  columns: number,
  rows: number,
  color: number,
  opacity: number,
) => {
  const segments: Array<[THREE.Vector3, THREE.Vector3]> = [];
  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;

  for (let column = 0; column <= columns; column += 1) {
    const x = THREE.MathUtils.mapLinear(column, 0, columns, -halfWidth, halfWidth);
    segments.push([new THREE.Vector3(x, -halfHeight, 0), new THREE.Vector3(x, halfHeight, 0)]);
  }

  for (let row = 0; row <= rows; row += 1) {
    const y = THREE.MathUtils.mapLinear(row, 0, rows, -halfHeight, halfHeight);
    segments.push([new THREE.Vector3(-halfWidth, y, 0), new THREE.Vector3(halfWidth, y, 0)]);
  }

  return createLineSegments(
    segments,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    }),
  );
};

const registerPathWire = (object: THREE.Object3D, index: number, respondsToMouse = true) => {
  pathWires.push({
    object,
    basePosition: object.position.clone(),
    baseRotation: object.rotation.clone(),
    mouseRotation: new THREE.Vector3(),
    targetMouseRotation: new THREE.Vector3(),
    respondsToMouse,
    floatOffset: index * 0.57,
  });
};

const terrainBounds = {
  minX: -9.5,
  maxX: 9.5,
  minZ: -82,
  maxZ: 2,
  xSteps: 18,
  zSteps: 34,
} as const;

const terrainHeight = (x: number, z: number) =>
  -2.45 + Math.sin(x * 0.72 + z * 0.12) * 0.18 + Math.cos(z * 0.17) * 0.12;

const terrainNormal = (x: number, z: number) => {
  const sampleDistance = 0.42;
  const heightLeft = terrainHeight(x - sampleDistance, z);
  const heightRight = terrainHeight(x + sampleDistance, z);
  const heightBack = terrainHeight(x, z - sampleDistance);
  const heightFront = terrainHeight(x, z + sampleDistance);
  const dx = (heightRight - heightLeft) / (sampleDistance * 2);
  const dz = (heightFront - heightBack) / (sampleDistance * 2);

  return new THREE.Vector3(-dx, 1, -dz).normalize();
};

const createTerrainGrid = () => {
  const segments: Array<[THREE.Vector3, THREE.Vector3]> = [];
  const { minX, maxX, minZ, maxZ, xSteps, zSteps } = terrainBounds;

  for (let zIndex = 0; zIndex <= zSteps; zIndex += 1) {
    const z = THREE.MathUtils.mapLinear(zIndex, 0, zSteps, maxZ, minZ);
    for (let xIndex = 0; xIndex < xSteps; xIndex += 1) {
      const xA = THREE.MathUtils.mapLinear(xIndex, 0, xSteps, minX, maxX);
      const xB = THREE.MathUtils.mapLinear(xIndex + 1, 0, xSteps, minX, maxX);
      segments.push([
        new THREE.Vector3(xA, terrainHeight(xA, z), z),
        new THREE.Vector3(xB, terrainHeight(xB, z), z),
      ]);
    }
  }

  for (let xIndex = 0; xIndex <= xSteps; xIndex += 1) {
    const x = THREE.MathUtils.mapLinear(xIndex, 0, xSteps, minX, maxX);
    for (let zIndex = 0; zIndex < zSteps; zIndex += 1) {
      const zA = THREE.MathUtils.mapLinear(zIndex, 0, zSteps, maxZ, minZ);
      const zB = THREE.MathUtils.mapLinear(zIndex + 1, 0, zSteps, maxZ, minZ);
      segments.push([
        new THREE.Vector3(x, terrainHeight(x, zA), zA),
        new THREE.Vector3(x, terrainHeight(x, zB), zB),
      ]);
    }
  }

  return createLineSegments(
    segments,
    new THREE.LineBasicMaterial({
      color: 0x5cf4cc,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    }),
  );
};

const createTerrainShadowReceiver = () => {
  const { minX, maxX, minZ, maxZ } = terrainBounds;
  const xSegments = 48;
  const zSegments = 144;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let zIndex = 0; zIndex <= zSegments; zIndex += 1) {
    const z = THREE.MathUtils.mapLinear(zIndex, 0, zSegments, maxZ, minZ);
    for (let xIndex = 0; xIndex <= xSegments; xIndex += 1) {
      const x = THREE.MathUtils.mapLinear(xIndex, 0, xSegments, minX, maxX);
      positions.push(x, terrainHeight(x, z) + 0.018, z);
    }
  }

  for (let zIndex = 0; zIndex < zSegments; zIndex += 1) {
    for (let xIndex = 0; xIndex < xSegments; xIndex += 1) {
      const topLeft = zIndex * (xSegments + 1) + xIndex;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + xSegments + 1;
      const bottomRight = bottomLeft + 1;
      indices.push(topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.ShadowMaterial({
    opacity: 0.3,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const receiver = new THREE.Mesh(geometry, material);
  receiver.name = "terrain-shadow-receiver";
  receiver.layers.set(lavandaLayer);
  receiver.castShadow = false;
  receiver.receiveShadow = true;
  receiver.frustumCulled = false;

  return receiver;
};

const createPortalWire = (index: number, pointA: FlightPoint, pointB: FlightPoint) => {
  const color = index % 2 === 0 ? 0xd9ff66 : 0x64f4d0;
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
  });
  const width = 4.8 + index * 0.55;
  const height = 2.4 + (index % 3) * 0.7;
  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;
  const shape = index % 4;
  const points =
    shape === 0
      ? [
          new THREE.Vector3(-halfWidth, -halfHeight, 0),
          new THREE.Vector3(halfWidth, -halfHeight * 0.75, 0),
          new THREE.Vector3(halfWidth * 0.9, halfHeight, 0),
          new THREE.Vector3(-halfWidth * 0.75, halfHeight * 0.85, 0),
        ]
      : shape === 1
        ? [
            new THREE.Vector3(0, halfHeight, 0),
            new THREE.Vector3(halfWidth, 0, 0),
            new THREE.Vector3(0, -halfHeight, 0),
            new THREE.Vector3(-halfWidth, 0, 0),
          ]
        : shape === 2
          ? [
              new THREE.Vector3(-halfWidth, -halfHeight, 0),
              new THREE.Vector3(halfWidth, -halfHeight, 0),
              new THREE.Vector3(halfWidth * 0.42, halfHeight, 0),
              new THREE.Vector3(-halfWidth * 0.55, halfHeight * 0.72, 0),
            ]
          : [
              new THREE.Vector3(-halfWidth, 0, 0),
              new THREE.Vector3(-halfWidth * 0.2, halfHeight, 0),
              new THREE.Vector3(halfWidth, halfHeight * 0.15, 0),
              new THREE.Vector3(halfWidth * 0.2, -halfHeight, 0),
            ];

  const segments: Array<[THREE.Vector3, THREE.Vector3]> = points.map((point, pointIndex) => [
    point,
    points[(pointIndex + 1) % points.length],
  ]);
  segments.push([new THREE.Vector3(-halfWidth * 0.55, 0, 0), new THREE.Vector3(halfWidth * 0.55, 0, 0)]);
  segments.push([new THREE.Vector3(0, -halfHeight * 0.55, 0), new THREE.Vector3(0, halfHeight * 0.55, 0)]);

  const portal = createLineSegments(segments, material);
  portal.position.set(
    (pointA.plane.x + pointB.plane.x) * 0.5,
    (pointA.plane.y + pointB.plane.y) * 0.5,
    (pointA.plane.z + pointB.plane.z) * 0.5,
  );
  portal.rotation.set(0.04 * (index % 2 === 0 ? 1 : -1), (index % 2 === 0 ? -0.18 : 0.18), 0.12 * (index - 2));

  return portal;
};

const createWirePath = () => {
  if (!galleryRoot) return;

  const terrain = createTerrainGrid();
  const terrainShadow = createTerrainShadowReceiver();
  galleryRoot.add(terrain);
  galleryRoot.add(terrainShadow);
  registerPathWire(terrain, 0, false);
  registerPathWire(terrainShadow, 0, false);

  flightPath.slice(0, -1).forEach((point, index) => {
    const nextPoint = flightPath[index + 1];
    const portal = createPortalWire(index, point, nextPoint);
    galleryRoot?.add(portal);
    registerPathWire(portal, index + 1);

    for (let step = 1; step <= 3; step += 1) {
      const t = step / 4;
      const z = THREE.MathUtils.lerp(point.plane.z, nextPoint.plane.z, t);
      const x = THREE.MathUtils.lerp(point.plane.x, nextPoint.plane.x, t);
      const side = (index + step) % 2 === 0 ? -1 : 1;
      const grid = createWireGrid(
        1.7 + index * 0.42 + step * 0.18,
        2.4 + ((index + step) % 3) * 0.72,
        3 + ((index + step) % 4),
        4 + (step % 3),
        side < 0 ? 0x64f4d0 : 0xd9ff66,
        0.18 + step * 0.035,
      );

      grid.position.set(x + side * (5.3 + step * 0.65), -0.2 + step * 0.55, z);
      grid.rotation.set(
        THREE.MathUtils.degToRad(8 * side),
        THREE.MathUtils.degToRad(side < 0 ? 63 : -63),
        THREE.MathUtils.degToRad((index - step) * 5),
      );
      galleryRoot?.add(grid);
      registerPathWire(grid, index * 4 + step + 3);
    }
  });
};

const loadLavandaPlants = () => {
  if (!galleryRoot) return;

  const loader = new GLTFLoader();
  loader.load(
    lavandaUrl,
    (gltf) => {
      if (!galleryRoot) return;

      const source = gltf.scene;
      source.updateMatrixWorld(true);

      const size = new THREE.Vector3();
      new THREE.Box3().setFromObject(source).getSize(size);
      const maxAxis = Math.max(size.x, size.y, size.z, 0.001);
      const normalizedScale = 1.44 / maxAxis;
      const localUpAxis = size.z > size.y * 1.15 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
      const shadowReceivers: Array<{ parent: THREE.Object3D; receiver: THREE.Mesh }> = [];

      source.traverse((node) => {
        node.layers.set(lavandaLayer);

        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh) return;

        mesh.frustumCulled = true;
        mesh.castShadow = mesh.name.toLowerCase() !== "ground";
        mesh.receiveShadow = mesh.name.toLowerCase() === "ground";

        if (mesh.name.toLowerCase() === "ground") {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const wireMaterials = materials.map((material) => {
            const wireMaterial = material.clone();
            wireMaterial.wireframe = true;
            wireMaterial.transparent = true;
            wireMaterial.opacity = 0.5;
            return wireMaterial;
          });

          mesh.material = Array.isArray(mesh.material) ? wireMaterials : wireMaterials[0];

          const shadowMaterial = new THREE.ShadowMaterial({
            opacity: 0.24,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          const receiver = new THREE.Mesh(mesh.geometry, shadowMaterial);
          receiver.name = `${mesh.name}-shadow-receiver`;
          receiver.position.copy(mesh.position);
          receiver.quaternion.copy(mesh.quaternion);
          receiver.scale.copy(mesh.scale);
          receiver.layers.set(lavandaLayer);
          receiver.castShadow = false;
          receiver.receiveShadow = true;

          if (mesh.parent) {
            shadowReceivers.push({ parent: mesh.parent, receiver });
          }
        }
      });

      shadowReceivers.forEach(({ parent, receiver }) => {
        parent.add(receiver);
      });

      plantGroup = new THREE.Group();
      plantGroup.name = "lavanda-scatter";

      const plantCount = 105;
      for (let index = 0; index < plantCount; index += 1) {
        const plant = source.clone(true);
        plant.traverse((node) => {
          node.layers.set(lavandaLayer);
        });

        const sideBias = Math.random() < 0.68 ? (Math.random() < 0.5 ? -1 : 1) : 0;
        const x = sideBias === 0 ? THREE.MathUtils.randFloatSpread(8.8) : sideBias * THREE.MathUtils.randFloat(3.2, 8.8);
        const z = THREE.MathUtils.randFloat(-80, -2.5);
        const y = terrainHeight(x, z) + 0.03;
        const scale = normalizedScale * THREE.MathUtils.randFloat(0.55, 1.45);
        const normal = terrainNormal(x, z);
        const alignToTerrain = new THREE.Quaternion().setFromUnitVectors(localUpAxis, normal);
        const spinAroundStem = new THREE.Quaternion().setFromAxisAngle(
          localUpAxis,
          THREE.MathUtils.randFloat(0, Math.PI * 2),
        );

        plant.position.set(x, y, z);
        plant.scale.setScalar(scale);
        plant.quaternion.copy(alignToTerrain).multiply(spinAroundStem);
        plantGroup.add(plant);
      }

      galleryRoot.add(plantGroup);
    },
    undefined,
    () => {
      // Keep the WebGL scene usable if the optional plant model is unavailable.
    },
  );
};

const createImagePlane = (item: FlightItem, point: FlightPoint, index: number) => {
  const textureLoader = new THREE.TextureLoader();
  const group = new THREE.Group();
  const basePosition = new THREE.Vector3(point.plane.x, point.plane.y, point.plane.z);
  const baseRotation = new THREE.Euler(point.rotation.x, point.rotation.y, point.rotation.z);
  const planeGeometry = new THREE.PlaneGeometry(4.35, 2.75, 1, 1);
  const glowGeometry = new THREE.PlaneGeometry(4.85, 3.22, 1, 1);
  const frameGeometry = new THREE.EdgesGeometry(planeGeometry);

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: index % 2 === 0 ? 0xd9ff66 : 0x64f4d0,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const imageMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: index === 0 ? 0.98 : 0.52,
    side: THREE.DoubleSide,
  });
  const frameMaterial = new THREE.LineBasicMaterial({
    color: index % 2 === 0 ? 0xd9ff66 : 0x64f4d0,
    transparent: true,
    opacity: index === 0 ? 0.82 : 0.28,
  });

  const texture = textureLoader.load(item.image, (loaded) => {
    loaded.colorSpace = THREE.SRGBColorSpace;
    loaded.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy() ?? 4, 8);
    imageMaterial.map = loaded;
    imageMaterial.needsUpdate = true;
  });

  loadedTextures.push(texture);

  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  const image = new THREE.Mesh(planeGeometry, imageMaterial);
  const frame = new THREE.LineSegments(frameGeometry, frameMaterial);
  glow.position.z = -0.04;
  frame.position.z = 0.025;

  group.position.copy(basePosition);
  group.rotation.copy(baseRotation);
  group.scale.setScalar(index === 0 ? 1.08 : 0.84);
  group.add(glow, image, frame);

  galleryRoot?.add(group);

  return {
    group,
    imageMaterial,
    frameMaterial,
    glowMaterial,
    basePosition,
    baseRotation,
    mouseRotation: new THREE.Vector3(),
    targetMouseRotation: new THREE.Vector3(),
    floatOffset: index * 0.84,
  } satisfies FlightPlane;
};

const setupScene = () => {
  if (!stage.value) return;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x030604, 0);
  stage.value.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030604, 0.014);

  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 140);
  camera.position.set(flightPath[0].camera.x, flightPath[0].camera.y, flightPath[0].camera.z);
  camera.layers.enable(lavandaLayer);

  const ambient = new THREE.AmbientLight(0xffffff, 0.38);
  const laneLight = new THREE.PointLight(0xd9ff66, 4.5, 82);
  const cyanLight = new THREE.PointLight(0x64f4d0, 3.2, 76);
  const lavandaSun = new THREE.DirectionalLight(0xffb566, 6.2);
  const lavandaSunTarget = new THREE.Object3D();
  laneLight.position.set(-2, 2, -8);
  cyanLight.position.set(3, -1.6, -32);
  lavandaSun.position.set(-48, 8.5, -10);
  lavandaSunTarget.position.set(4, -2.25, -48);
  lavandaSun.target = lavandaSunTarget;
  lavandaSun.layers.set(lavandaLayer);
  lavandaSunTarget.layers.set(lavandaLayer);
  lavandaSun.castShadow = true;
  lavandaSun.shadow.mapSize.set(2048, 2048);
  lavandaSun.shadow.bias = -0.00035;
  lavandaSun.shadow.normalBias = 0.025;

  const sunShadowCamera = lavandaSun.shadow.camera as THREE.OrthographicCamera;
  sunShadowCamera.left = -68;
  sunShadowCamera.right = 68;
  sunShadowCamera.top = 68;
  sunShadowCamera.bottom = -68;
  sunShadowCamera.near = 0.5;
  sunShadowCamera.far = 140;
  sunShadowCamera.layers.set(lavandaLayer);
  sunShadowCamera.updateProjectionMatrix();

  scene.add(ambient, laneLight, cyanLight, lavandaSun, lavandaSunTarget);

  galleryRoot = new THREE.Group();
  starField = createStarField();
  dustField = createDustField();
  galleryRoot.add(starField);
  galleryRoot.add(dustField.points);
  scene.add(galleryRoot);
  createWirePath();
  loadLavandaPlants();

  flightItems.forEach((item, index) => {
    flightPlanes.push(createImagePlane(item, flightPath[index], index));
  });
};

const resize = () => {
  if (!renderer || !camera) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
};

const render = () => {
  if (!renderer || !scene || !camera || !galleryRoot) return;
  if (!isVisible) return;

  const now = performance.now();
  const delta = lastFrameTime === 0 ? 0.016 : Math.min((now - lastFrameTime) / 1000, 0.04);
  lastFrameTime = now;
  const elapsed = clock.getElapsedTime();
  const pointerLift = prefersReducedMotion.value ? 0 : 1;
  const mouseRecentlyMoved = performance.now() - lastPointerMoveAt < 520;
  const mouseBlendSpeed = mouseRecentlyMoved ? 0.09 : 0.045;

  flightPlanes.forEach((plane, index) => {
    const float = Math.sin(elapsed * 0.72 + plane.floatOffset) * 0.045 * pointerLift;
    if (!mouseRecentlyMoved) {
      plane.targetMouseRotation.multiplyScalar(0.92);
    }
    plane.mouseRotation.lerp(plane.targetMouseRotation, mouseBlendSpeed);

    plane.group.position.y = plane.basePosition.y + float;
    plane.group.rotation.x =
      plane.baseRotation.x + Math.sin(elapsed * 0.45 + index) * 0.01 * pointerLift + plane.mouseRotation.x;
    plane.group.rotation.y =
      plane.baseRotation.y + Math.cos(elapsed * 0.38 + index) * 0.012 * pointerLift + plane.mouseRotation.y;
    plane.group.rotation.z = plane.baseRotation.z + plane.mouseRotation.z;
  });

  pathWires.forEach((wire, index) => {
    const drift = Math.sin(elapsed * 0.5 + wire.floatOffset) * 0.035 * pointerLift;
    if (wire.respondsToMouse) {
      if (!mouseRecentlyMoved) {
        wire.targetMouseRotation.multiplyScalar(0.9);
      }
      wire.mouseRotation.lerp(wire.targetMouseRotation, mouseBlendSpeed);
    }

    wire.object.position.y = wire.basePosition.y + drift;
    wire.object.rotation.x = wire.baseRotation.x + wire.mouseRotation.x;
    wire.object.rotation.y = wire.baseRotation.y + wire.mouseRotation.y;
    wire.object.rotation.z =
      wire.baseRotation.z + Math.sin(elapsed * 0.28 + index) * 0.012 * pointerLift + wire.mouseRotation.z;
  });

  if (starField) {
    starField.rotation.y -= 0.00045;
    starField.rotation.x += 0.00018;
  }

  updateDustField(delta, elapsed);

  lookAtTarget.set(
    cameraTarget.x + pointerX * 0.74,
    cameraTarget.y - pointerY * 0.46,
    cameraTarget.z,
  );
  camera.lookAt(lookAtTarget);
  renderer.render(scene, camera);
  frameId = window.requestAnimationFrame(render);
};

const start = () => {
  if (frameId !== 0) return;
  frameId = window.requestAnimationFrame(render);
};

const stop = () => {
  if (frameId === 0) return;
  window.cancelAnimationFrame(frameId);
  frameId = 0;
};

const randomRotation = (strength: number) =>
  new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(strength),
    THREE.MathUtils.randFloatSpread(strength),
    THREE.MathUtils.randFloatSpread(strength * 0.75),
  );

const shuffleMouseRotations = () => {
  const now = performance.now();
  if (now - lastMouseShuffle < 95) return;

  lastMouseShuffle = now;
  lastPointerMoveAt = now;

  flightPlanes.forEach((plane, index) => {
    const strength = 0.18 + (index % 3) * 0.045;
    plane.targetMouseRotation.copy(randomRotation(strength));
  });

  pathWires.forEach((wire, index) => {
    if (!wire.respondsToMouse) return;

    const strength = 0.12 + (index % 4) * 0.035;
    wire.targetMouseRotation.copy(randomRotation(strength));
  });
};

const setActivePlane = (index: number, gsap: Awaited<ReturnType<typeof loadGsap>>["gsap"]) => {
  flightPlanes.forEach((plane, planeIndex) => {
    const isActive = planeIndex === index;
    gsap.to(plane.group.scale, {
      x: isActive ? 1.16 : 0.82,
      y: isActive ? 1.16 : 0.82,
      z: isActive ? 1.16 : 0.82,
      duration: 0.45,
      ease: "power2.out",
      overwrite: true,
    });
    gsap.to(plane.imageMaterial, {
      opacity: isActive ? 0.98 : 0.5,
      duration: 0.45,
      overwrite: true,
    });
    gsap.to(plane.frameMaterial, {
      opacity: isActive ? 0.88 : 0.24,
      duration: 0.45,
      overwrite: true,
    });
    gsap.to(plane.glowMaterial, {
      opacity: isActive ? 0.18 : 0.055,
      duration: 0.45,
      overwrite: true,
    });
  });
};

const setupScroll = async () => {
  if (!root.value || !camera || !galleryRoot || flightPlanes.length === 0) return;

  const { gsap, ScrollTrigger } = await loadGsap();
  const panelElements = Array.from(root.value.querySelectorAll<HTMLElement>("[data-panel]"));
  const dotElements = Array.from(root.value.querySelectorAll<HTMLElement>("[data-dot]"));

  gsap.set(dotElements[0], { scale: 1.65, backgroundColor: "#d9ff66", borderColor: "#d9ff66" });
  setActivePlane(0, gsap);

  if (!prefersReducedMotion.value) {
    const master = gsap.timeline({
      defaults: { ease: "power1.inOut" },
      scrollTrigger: {
        trigger: root.value,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.15,
      },
    });

    flightPath.slice(1).forEach((point, index) => {
      const position = index;
      master
        .to(camera.position, { ...point.camera, duration: 1 }, position)
        .to(cameraTarget, { ...point.plane, duration: 1 }, position)
        .to(galleryRoot.rotation, { z: index % 2 === 0 ? -0.025 : 0.025, duration: 1 }, position);
    });

    trackAnimation(master);
  }

  panelElements.forEach((panel, index) => {
    if (!prefersReducedMotion.value) {
      const revealItems = panel.querySelectorAll("[data-reveal]");
      const reveal = gsap.fromTo(
        revealItems,
        { autoAlpha: 0, y: 34, filter: "blur(10px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: panel,
            start: "top 62%",
            end: "top 18%",
            toggleActions: "play none none reverse",
          },
        },
      );
      trackAnimation(reveal);
    }

    const active = ScrollTrigger.create({
      trigger: panel,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (!self.isActive) return;

        setActivePlane(index, gsap);
        dotElements.forEach((dot, dotIndex) => {
          gsap.to(dot, {
            scale: dotIndex === index ? 1.65 : 1,
            backgroundColor: dotIndex === index ? "#d9ff66" : "rgba(255,255,255,0.1)",
            borderColor: dotIndex === index ? "#d9ff66" : "rgba(255,255,255,0.3)",
            duration: 0.25,
            overwrite: true,
          });
        });
      },
    });
    addCleanup(() => active.kill());
  });

  requestAnimationFrame(() => ScrollTrigger.refresh());
};

const onPointerMove = (event: PointerEvent) => {
  pointerX = (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
  pointerY = (event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
  shuffleMouseRotations();
};

const onVisibilityChange = () => {
  isVisible = !document.hidden;
  if (isVisible) {
    start();
  } else {
    stop();
  }
};

const disposeNode = (node: THREE.Object3D) => {
  const mesh = node as THREE.Mesh;
  const line = node as THREE.LineSegments;
  const points = node as THREE.Points;
  const geometry = mesh.geometry ?? line.geometry ?? points.geometry;
  const material = mesh.material ?? line.material ?? points.material;

  geometry?.dispose?.();

  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
  } else {
    material?.dispose?.();
  }
};

onMounted(async () => {
  setupScene();
  resize();
  start();
  await setupScroll();

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
});

onBeforeUnmount(() => {
  stop();
  window.removeEventListener("resize", resize);
  window.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("visibilitychange", onVisibilityChange);

  galleryRoot?.traverse(disposeNode);
  loadedTextures.forEach((texture) => texture.dispose());
  renderer?.dispose();

  if (renderer?.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  renderer = null;
  scene = null;
  camera = null;
  galleryRoot = null;
  starField = null;
  dustField = null;
  plantGroup = null;
  flightPlanes.length = 0;
  pathWires.length = 0;
  loadedTextures.length = 0;
});
</script>

<style scoped>
.scroll-onepager {
  min-height: 720vh;
}

.scroll-panel {
  position: relative;
}

.scroll-panel::before {
  content: "";
  position: absolute;
  inset: 8rem 1rem 2rem;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.055);
  opacity: 0.64;
}

.scroll-panel::after {
  content: "";
  position: absolute;
  inset: auto 1rem 2rem;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(217, 255, 102, 0.42), transparent);
}

@media (max-width: 767px) {
  .scroll-panel::before {
    inset: 7rem 0.75rem 1rem;
  }
}
</style>
