<template>
  <section ref="root" class="relative isolate overflow-hidden bg-[#040705] text-neutral-50">
    <div ref="stage" class="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
    <div class="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_82%_14%,rgba(163,230,53,0.14),transparent_30%),linear-gradient(180deg,rgba(4,7,5,0.35),rgba(4,7,5,0.78))]" />
    <button
      v-if="showMotionPrompt"
      type="button"
      class="fixed right-4 top-20 z-30 rounded-full bg-black/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-lime-300"
      @click="enableMotion"
    >
      Enable Motion
    </button>
    <button
      v-if="showSoundPrompt"
      type="button"
      class="fixed right-4 top-32 z-30 rounded-full bg-black/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-lime-300"
      @click="enableSound"
    >
      Enable Sound
    </button>

    <div class="relative z-10">
      <section
        v-for="(item, index) in sections"
        :id="item.id"
        :key="item.id"
        class="scroll-panel grid min-h-screen items-center px-4 py-20 sm:px-8 lg:px-10"
        :aria-labelledby="`${item.id}-title`"
        data-panel
      >
        <div class="mx-auto w-full max-w-[82rem]">
          <p class="font-ibm-plex-mono text-xs uppercase tracking-[0.24em] text-lime-300" data-reveal>{{ item.eyebrow }}</p>
          <h1
            v-if="index === 0"
            :id="`${item.id}-title`"
            class="mt-4 max-w-5xl font-space-grotesk text-[clamp(2.9rem,8.4vw,7.2rem)] leading-[0.86] tracking-[-0.04em]"
            data-reveal
          >
            {{ item.title }}
          </h1>
          <h2
            v-else
            :id="`${item.id}-title`"
            class="mt-4 max-w-5xl font-space-grotesk text-[clamp(2.1rem,6.2vw,5.3rem)] leading-[0.9] tracking-[-0.03em]"
            data-reveal
          >
            {{ item.title }}
          </h2>
          <p class="mt-6 max-w-2xl text-[clamp(1rem,1.9vw,1.25rem)] leading-7 text-neutral-200" data-reveal>{{ item.description }}</p>
          <div class="mt-7 flex flex-wrap gap-3" data-reveal>
            <NuxtLink
              v-if="item.link"
              :to="item.link.href"
              class="rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-lime-300 transition-colors hover:bg-lime-300 hover:text-neutral-950"
            >
              {{ item.link.label }}
            </NuxtLink>
            <a
              v-if="item.email"
              :href="item.email.href"
              class="rounded-full bg-lime-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-neutral-950"
            >
              {{ item.email.label }}
            </a>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useGsap } from '~/composables/useGsap';
import { usePrefersReducedMotion } from '~/composables/usePrefersReducedMotion';

type SectionItem = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  link?: { label: string; href: string };
  email?: { label: string; href: string };
};

type StopPoint = {
  look: { x: number; y: number; z: number };
  camera: { x: number; y: number; z: number };
};

type LeafInstance = {
  mesh: THREE.Mesh;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
  seed: number;
  amplitude: number;
};

const sections: SectionItem[] = [
  { id: 'home', eyebrow: 'FOOSH', title: '3D visuals, animation & interactive web experiences.', description: 'FOOSH creates 3D models, animations, interactive Three.js websites and modern digital experiences for products, brands and creative teams.', link: { label: 'View Work', href: '/work' } },
  { id: 'services', eyebrow: 'Services', title: 'Creative services for 3D, animation and interactive web.', description: '3D modeling, 3D animation, web-based 3D applications, and Nuxt-driven website design with strong visual hierarchy and performance.', link: { label: 'Explore Services', href: '/services' } },
  { id: 'work', eyebrow: 'Selected Work', title: 'Portfolio built across 3D, motion and interactive design.', description: 'From product viewers to motion-rich landing pages, each project is built with clear structure, visual depth and practical execution.', link: { label: 'Open Portfolio', href: '/work' } },
  { id: 'about', eyebrow: 'About FOOSH', title: 'Product design, 3D, animation and web — connected.', description: 'FOOSH combines industrial/product design thinking with modern web delivery to make digital experiences that feel sharp and useful.', link: { label: 'Read About', href: '/about' } },
  { id: 'contact', eyebrow: 'Contact', title: 'Have a 3D, animation or interactive web project?', description: 'Send a short project brief and let’s turn the idea into a clear, high-impact visual experience.', email: { label: 'Start a Project', href: 'mailto:fooshmoola@gmail.com' } },
];

const path: StopPoint[] = [
  { look: { x: 0, y: -1.6, z: -6 }, camera: { x: 0.6, y: 1.1, z: 2.2 } },
  { look: { x: 3.2, y: -1.3, z: -18 }, camera: { x: 3.8, y: 1.2, z: -10.8 } },
  { look: { x: -2.8, y: -1.7, z: -31 }, camera: { x: -2.2, y: 1.4, z: -23.2 } },
  { look: { x: 4.2, y: -1.35, z: -44 }, camera: { x: 4.8, y: 1.15, z: -36.5 } },
  { look: { x: 0.2, y: -1.5, z: -57 }, camera: { x: 0.5, y: 1.25, z: -49.5 } },
];

const root = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
const showMotionPrompt = ref(false);
const showSoundPrompt = ref(false);
const { loadGsap, trackAnimation, addCleanup } = useGsap();
const { prefersReducedMotion } = usePrefersReducedMotion();

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let world: THREE.Group | null = null;
let particleField: THREE.Points | null = null;
let grassField: THREE.LineSegments | null = null;
let treeGroup: THREE.Group | null = null;
let bgMusic: HTMLAudioElement | null = null;
let grassRoots: Float32Array | null = null;
let grassTips: Float32Array | null = null;
let grassSeeds: Float32Array | null = null;
const leafInstances: LeafInstance[] = [];
let frameId = 0;
let running = true;
let isLowPower = false;
let dprCap = 1.5;
let targetFrameMs = 16;
let lastRenderAt = 0;
let frameTick = 0;
const lookTarget = new THREE.Vector3(path[0].look.x, path[0].look.y, path[0].look.z);
let parallaxX = 0;
let parallaxY = 0;
let targetParallaxX = 0;
let targetParallaxY = 0;

const terrainHeight = (x: number, z: number) => -2.3 + Math.sin(z * 0.12 + x * 0.08) * 0.38 + Math.cos(z * 0.07) * 0.22;
const terrainNormal = (x: number, z: number) => {
  const d = 0.16;
  const hL = terrainHeight(x - d, z);
  const hR = terrainHeight(x + d, z);
  const hD = terrainHeight(x, z - d);
  const hU = terrainHeight(x, z + d);
  const dx = (hR - hL) / (2 * d);
  const dz = (hU - hD) / (2 * d);
  return new THREE.Vector3(-dx, 1, -dz).normalize();
};

const createTerrainWire = () => {
  const segments: Array<[THREE.Vector3, THREE.Vector3]> = [];
  const minX = -16; const maxX = 16; const minZ = -66; const maxZ = 6; const xSteps = 26; const zSteps = 52;
  for (let zi = 0; zi <= zSteps; zi += 1) {
    const z = THREE.MathUtils.mapLinear(zi, 0, zSteps, maxZ, minZ);
    for (let xi = 0; xi < xSteps; xi += 1) {
      const xA = THREE.MathUtils.mapLinear(xi, 0, xSteps, minX, maxX);
      const xB = THREE.MathUtils.mapLinear(xi + 1, 0, xSteps, minX, maxX);
      segments.push([new THREE.Vector3(xA, terrainHeight(xA, z), z), new THREE.Vector3(xB, terrainHeight(xB, z), z)]);
    }
  }
  for (let xi = 0; xi <= xSteps; xi += 1) {
    const x = THREE.MathUtils.mapLinear(xi, 0, xSteps, minX, maxX);
    for (let zi = 0; zi < zSteps; zi += 1) {
      const zA = THREE.MathUtils.mapLinear(zi, 0, zSteps, maxZ, minZ);
      const zB = THREE.MathUtils.mapLinear(zi + 1, 0, zSteps, maxZ, minZ);
      segments.push([new THREE.Vector3(x, terrainHeight(x, zA), zA), new THREE.Vector3(x, terrainHeight(x, zB), zB)]);
    }
  }
  const positions = new Float32Array(segments.length * 6);
  segments.forEach(([a, b], i) => {
    const o = i * 6;
    positions[o] = a.x; positions[o + 1] = a.y; positions[o + 2] = a.z;
    positions[o + 3] = b.x; positions[o + 4] = b.y; positions[o + 5] = b.z;
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x79f3c9, transparent: true, opacity: 0.34 }));
};

const createParticles = (count: number) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const o = i * 3;
    positions[o] = THREE.MathUtils.randFloatSpread(34);
    positions[o + 1] = THREE.MathUtils.randFloat(-0.5, 6.5);
    positions[o + 2] = THREE.MathUtils.randFloat(-70, 10);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xbaff70, size: 0.04, transparent: true, opacity: 0.5, depthWrite: false }));
};

const createGrass = (count: number) => {
  const positions = new Float32Array(count * 6);
  grassRoots = new Float32Array(count * 3);
  grassTips = new Float32Array(count * 3);
  grassSeeds = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const o = i * 6;
    const r = i * 3;
    const x = THREE.MathUtils.randFloatSpread(28);
    const z = THREE.MathUtils.randFloat(-66, 6);
    const y = terrainHeight(x, z);
    const h = THREE.MathUtils.randFloat(0.16, 0.42);
    const tx = x + THREE.MathUtils.randFloatSpread(0.06);
    const tz = z + THREE.MathUtils.randFloatSpread(0.06);
    positions[o] = x; positions[o + 1] = y; positions[o + 2] = z;
    positions[o + 3] = tx; positions[o + 4] = y + h; positions[o + 5] = tz;
    grassRoots[r] = x; grassRoots[r + 1] = y; grassRoots[r + 2] = z;
    grassTips[r] = tx; grassTips[r + 1] = y + h; grassTips[r + 2] = tz;
    grassSeeds[i] = Math.random() * Math.PI * 2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xc8ff8e, transparent: true, opacity: 0.35 }));
};

const createTrees = (treeCount: number) => {
  const trunkMaterial = new THREE.LineBasicMaterial({ color: 0x80f0cf, transparent: true, opacity: 0.58 });
  const branchMaterial = new THREE.LineBasicMaterial({ color: 0x9cf7d8, transparent: true, opacity: 0.52 });
  const leafMaterial = new THREE.MeshBasicMaterial({
    color: 0xcaff8c,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const addLeafCluster = (parent: THREE.Object3D) => {
    const leaf = new THREE.Mesh(
      new THREE.PlaneGeometry(
        THREE.MathUtils.randFloat(0.07, 0.15),
        THREE.MathUtils.randFloat(0.12, 0.22),
      ),
      leafMaterial,
    );
    leaf.position.set(
      THREE.MathUtils.randFloatSpread(0.24),
      THREE.MathUtils.randFloat(0.03, 0.24),
      THREE.MathUtils.randFloatSpread(0.24),
    );
    leaf.rotation.set(
      THREE.MathUtils.randFloat(0, Math.PI),
      THREE.MathUtils.randFloat(0, Math.PI),
      THREE.MathUtils.randFloat(0, Math.PI),
    );
    parent.add(leaf);
    leafInstances.push({
      mesh: leaf,
      basePosition: leaf.position.clone(),
      baseRotation: leaf.rotation.clone(),
      seed: Math.random() * Math.PI * 2,
      amplitude: THREE.MathUtils.randFloat(0.01, 0.045),
    });
  };

  const addBranch = (parent: THREE.Object3D, length: number, radius: number, depth: number) => {
    const segment = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.CylinderGeometry(radius * 0.7, radius, length, 5, 1, true)),
      depth === 0 ? trunkMaterial : branchMaterial,
    );
    segment.position.y = length * 0.5;
    parent.add(segment);

    const tip = new THREE.Group();
    tip.position.y = length;
    parent.add(tip);

    if (depth === 2) {
      const leaves = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < leaves; i += 1) addLeafCluster(tip);
      return;
    }

    const branchCount = depth === 0 ? 5 : 4;
    for (let i = 0; i < branchCount; i += 1) {
      const child = new THREE.Group();
      const spreadPitch =
        depth === 0
          ? THREE.MathUtils.randFloat(-0.5, 1.05)
          : THREE.MathUtils.randFloat(-0.85, 1.15);
      child.rotation.set(
        spreadPitch,
        (i / branchCount) * Math.PI * 2 + THREE.MathUtils.randFloat(-0.35, 0.35),
        THREE.MathUtils.randFloat(-0.45, 0.45),
      );
      tip.add(child);
      addBranch(
        child,
        length * (depth === 0 ? 0.82 : 0.74),
        radius * 0.48,
        depth + 1,
      );
    }
  };

  const group = new THREE.Group();
  for (let i = 0; i < treeCount; i += 1) {
    const x = THREE.MathUtils.randFloatSpread(26);
    const z = THREE.MathUtils.randFloat(-66, -2);
    const y = terrainHeight(x, z);
    const tree = new THREE.Group();
    tree.position.set(x, y, z);
    tree.rotation.y = Math.random() * Math.PI * 2;
    const trunkHeight = THREE.MathUtils.randFloat(1.3, 2.4);
    addBranch(tree, trunkHeight, 0.12, 0);
    group.add(tree);
  }
  return group;
};

const createLandmark = (point: StopPoint, index: number) => {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: 0xd9ff66, transparent: true, opacity: 0.82 });

  const width = 1.5;
  const seatDepth = 0.52;
  const seatHeight = 0.42;
  const backHeight = 0.86;
  const legInsetX = width * 0.42;
  const legInsetZ = seatDepth * 0.38;

  const addLine = (a: THREE.Vector3, b: THREE.Vector3) => {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([a, b]),
      material,
    );
    group.add(line);
  };

  // 4 legs
  addLine(new THREE.Vector3(-legInsetX, 0, -legInsetZ), new THREE.Vector3(-legInsetX, seatHeight, -legInsetZ));
  addLine(new THREE.Vector3(legInsetX, 0, -legInsetZ), new THREE.Vector3(legInsetX, seatHeight, -legInsetZ));
  addLine(new THREE.Vector3(-legInsetX, 0, legInsetZ), new THREE.Vector3(-legInsetX, seatHeight, legInsetZ));
  addLine(new THREE.Vector3(legInsetX, 0, legInsetZ), new THREE.Vector3(legInsetX, seatHeight, legInsetZ));

  // 3 sitting planks
  addLine(new THREE.Vector3(-width * 0.5, seatHeight, -seatDepth * 0.32), new THREE.Vector3(width * 0.5, seatHeight, -seatDepth * 0.32));
  addLine(new THREE.Vector3(-width * 0.5, seatHeight, 0), new THREE.Vector3(width * 0.5, seatHeight, 0));
  addLine(new THREE.Vector3(-width * 0.5, seatHeight, seatDepth * 0.32), new THREE.Vector3(width * 0.5, seatHeight, seatDepth * 0.32));

  // 3 behind/back planks
  addLine(new THREE.Vector3(-width * 0.5, seatHeight + 0.16, -seatDepth * 0.48), new THREE.Vector3(width * 0.5, seatHeight + 0.16, -seatDepth * 0.48));
  addLine(new THREE.Vector3(-width * 0.5, seatHeight + 0.34, -seatDepth * 0.48), new THREE.Vector3(width * 0.5, seatHeight + 0.34, -seatDepth * 0.48));
  addLine(new THREE.Vector3(-width * 0.5, seatHeight + 0.52, -seatDepth * 0.48), new THREE.Vector3(width * 0.5, seatHeight + 0.52, -seatDepth * 0.48));

  // side lines for back planks supports (left and right)
  addLine(new THREE.Vector3(-width * 0.5, seatHeight, -seatDepth * 0.42), new THREE.Vector3(-width * 0.5, backHeight, -seatDepth * 0.52));
  addLine(new THREE.Vector3(width * 0.5, seatHeight, -seatDepth * 0.42), new THREE.Vector3(width * 0.5, backHeight, -seatDepth * 0.52));

  const benchY = terrainHeight(point.look.x, point.look.z) + 0.03;
  const prev = path[Math.max(0, index - 1)].look;
  const next = path[Math.min(path.length - 1, index + 1)].look;
  const tangent = new THREE.Vector3(next.x - prev.x, 0, next.z - prev.z).normalize();
  const normal = terrainNormal(point.look.x, point.look.z);
  const side = new THREE.Vector3().crossVectors(normal, tangent).normalize();
  const adjustedTangent = new THREE.Vector3().crossVectors(side, normal).normalize();
  const basis = new THREE.Matrix4().makeBasis(adjustedTangent, normal, side);
  group.position.set(point.look.x, benchY, point.look.z);
  group.quaternion.setFromRotationMatrix(basis);
  const extraTurn = Math.PI * 0.5 + (index % 2 === 1 ? Math.PI : 0);
  group.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(normal, extraTurn));
  return group;
};

const createPebblePath = () => {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: 0xd9ff66, transparent: true, opacity: 0.5 });
  const pebbles: Array<{ x: number; z: number; r: number }> = [];
  const minGap = 0.03;

  const canPlace = (x: number, z: number, r: number) =>
    pebbles.every((p) => {
      const dx = x - p.x;
      const dz = z - p.z;
      const minDist = p.r + r + minGap;
      return dx * dx + dz * dz >= minDist * minDist;
    });

  const tryPlace = (x: number, z: number, radiusMin: number, radiusMax: number, attempts = 10) => {
    for (let k = 0; k < attempts; k += 1) {
      const r = THREE.MathUtils.randFloat(radiusMin, radiusMax);
      const jx = x + THREE.MathUtils.randFloatSpread(0.04);
      const jz = z + THREE.MathUtils.randFloatSpread(0.04);
      if (canPlace(jx, jz, r)) {
        pebbles.push({ x: jx, z: jz, r });
        return true;
      }
    }
    return false;
  };

  for (let i = 0; i < path.length - 1; i += 1) {
    const a = path[i].look;
    const b = path[i + 1].look;
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.max(Math.hypot(dx, dz), 0.001);
    const nx = -dz / len;
    const nz = dx / len;
    const steps = 44;

    for (let j = 0; j <= steps; j += 1) {
      const t = j / steps;
      const baseX = THREE.MathUtils.lerp(a.x, b.x, t);
      const baseZ = THREE.MathUtils.lerp(a.z, b.z, t);

      // Main route pebbles
      tryPlace(baseX, baseZ, 0.028, 0.09, 12);

      // Side scatter (both sides)
      const sideOffsetA = THREE.MathUtils.randFloat(0.16, 0.72);
      const sideOffsetB = THREE.MathUtils.randFloat(0.16, 0.72);
      tryPlace(baseX + nx * sideOffsetA, baseZ + nz * sideOffsetA, 0.025, 0.08, 9);
      tryPlace(baseX - nx * sideOffsetB, baseZ - nz * sideOffsetB, 0.025, 0.08, 9);
      const sideOffsetC = THREE.MathUtils.randFloat(0.4, 0.95);
      const sideOffsetD = THREE.MathUtils.randFloat(0.4, 0.95);
      tryPlace(baseX + nx * sideOffsetC, baseZ + nz * sideOffsetC, 0.022, 0.07, 8);
      tryPlace(baseX - nx * sideOffsetD, baseZ - nz * sideOffsetD, 0.022, 0.07, 8);
      if (j % 2 === 0) {
        const sideOffsetE = THREE.MathUtils.randFloat(0.22, 0.78);
        const sideOffsetF = THREE.MathUtils.randFloat(0.22, 0.78);
        tryPlace(baseX + nx * sideOffsetE, baseZ + nz * sideOffsetE, 0.02, 0.065, 7);
        tryPlace(baseX - nx * sideOffsetF, baseZ - nz * sideOffsetF, 0.02, 0.065, 7);
      }
    }
  }

  pebbles.forEach((pebble, index) => {
    const radius = pebble.r;
    const segments = 12;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    const loop = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), material);
    const y = terrainHeight(pebble.x, pebble.z) + 0.03 + (index % 3) * 0.004;
    loop.position.set(pebble.x, y, pebble.z);
    loop.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), terrainNormal(pebble.x, pebble.z));
    group.add(loop);
  });

  return group;
};

const setupScene = () => {
  if (!stage.value) return;
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const isReduced = prefersReducedMotion.value;
  isLowPower = isMobile || isReduced;
  dprCap = isLowPower ? 1 : 1.5;
  targetFrameMs = isLowPower ? 1000 / 36 : 1000 / 60;

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !isLowPower,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x040705, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
  stage.value.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x040705, 0.028);
  camera = new THREE.PerspectiveCamera(44, 1, 0.1, 160);
  camera.position.set(path[0].camera.x, path[0].camera.y, path[0].camera.z);

  const ambient = new THREE.AmbientLight(0xffffff, 0.34);
  const key = new THREE.DirectionalLight(0xb7ffd2, 0.52);
  key.position.set(-5, 8, 2);
  scene.add(ambient, key);

  world = new THREE.Group();
  particleField = createParticles(isLowPower ? 520 : 1200);
  grassField = createGrass(isLowPower ? 2600 : 6200);
  treeGroup = createTrees(isLowPower ? 16 : 28);

  world.add(createTerrainWire(), createPebblePath(), particleField, grassField, treeGroup);
  path.forEach((p, i) => world?.add(createLandmark(p, i)));
  scene.add(world);
};

const resize = () => {
  if (!renderer || !camera) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
};

const onPointerMove = (event: PointerEvent) => {
  const nx = event.clientX / Math.max(window.innerWidth, 1);
  const ny = event.clientY / Math.max(window.innerHeight, 1);
  targetParallaxX = (nx * 2 - 1) * 0.9;
  targetParallaxY = (ny * 2 - 1) * 0.6;
};

const onDeviceOrientation = (event: DeviceOrientationEvent) => {
  if (event.beta == null || event.gamma == null) return;
  const clampedGamma = THREE.MathUtils.clamp(event.gamma, -35, 35);
  const clampedBeta = THREE.MathUtils.clamp(event.beta - 45, -35, 35);
  targetParallaxX = THREE.MathUtils.mapLinear(clampedGamma, -35, 35, -0.95, 0.95);
  targetParallaxY = THREE.MathUtils.mapLinear(clampedBeta, -35, 35, -0.7, 0.7);
};

const enableMotion = async () => {
  const orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };
  try {
    if (typeof orientation.requestPermission === 'function') {
      const status = await orientation.requestPermission();
      if (status !== 'granted') return;
    }
    window.addEventListener('deviceorientation', onDeviceOrientation, true);
    showMotionPrompt.value = false;
  } catch {
    // Keep prompt visible if permission fails.
  }
};

const enableSound = async () => {
  if (!bgMusic) return;
  try {
    await bgMusic.play();
    showSoundPrompt.value = false;
  } catch {
    // Keep prompt visible if playback is blocked.
  }
};

const render = () => {
  if (!renderer || !scene || !camera) return;
  if (!running) return;
  const now = performance.now();
  if (lastRenderAt !== 0 && now - lastRenderAt < targetFrameMs) {
    frameId = requestAnimationFrame(render);
    return;
  }
  lastRenderAt = now;
  frameTick += 1;

  const elapsed = performance.now() * 0.001;
  if (particleField) particleField.rotation.y += isLowPower ? 0.00018 : 0.00035;
  if (grassField && grassRoots && grassTips && grassSeeds) {
    const positions = grassField.geometry.getAttribute('position') as THREE.BufferAttribute;
    const array = positions.array as Float32Array;
    const tipStep = isLowPower ? 3 : 2;
    for (let i = 0; i < grassSeeds.length; i += 1) {
      if (isLowPower && i % tipStep !== frameTick % tipStep) continue;
      const r = i * 3;
      const o = i * 6;
      const seed = grassSeeds[i];
      const swayX = Math.sin(elapsed * 1.8 + seed) * 0.03;
      const swayZ = Math.cos(elapsed * 1.45 + seed * 1.2) * 0.03;
      array[o + 3] = grassTips[r] + swayX;
      array[o + 4] = grassTips[r + 1];
      array[o + 5] = grassTips[r + 2] + swayZ;
    }
    positions.needsUpdate = true;
  }
  parallaxX = THREE.MathUtils.lerp(parallaxX, targetParallaxX, 0.06);
  parallaxY = THREE.MathUtils.lerp(parallaxY, targetParallaxY, 0.06);
  if (!isLowPower || frameTick % 2 === 0) leafInstances.forEach((leaf) => {
    const sway = Math.sin(elapsed * 1.9 + leaf.seed) * leaf.amplitude;
    leaf.mesh.position.x = leaf.basePosition.x + sway;
    leaf.mesh.position.y = leaf.basePosition.y + Math.cos(elapsed * 1.4 + leaf.seed * 1.3) * leaf.amplitude * 0.45;
    leaf.mesh.position.z = leaf.basePosition.z + Math.sin(elapsed * 1.2 + leaf.seed * 0.8) * leaf.amplitude * 0.6;
    leaf.mesh.rotation.z = leaf.baseRotation.z + sway * 5.5;
  });
  camera.lookAt(
    lookTarget.x + parallaxX,
    lookTarget.y - parallaxY,
    lookTarget.z,
  );
  renderer.render(scene, camera);
  frameId = requestAnimationFrame(render);
};

const stopRender = () => {
  if (frameId) cancelAnimationFrame(frameId);
  frameId = 0;
};

const setupScroll = async () => {
  if (!root.value || !camera) return;
  const { gsap, ScrollTrigger } = await loadGsap();
  const panels = Array.from(root.value.querySelectorAll<HTMLElement>('[data-panel]'));

  if (!prefersReducedMotion.value) {
    const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom bottom', scrub: 1 } });
    path.slice(1).forEach((point, index) => {
      timeline.to(camera.position, { ...point.camera, duration: 1 }, index).to(lookTarget, { ...point.look, duration: 1 }, index);
    });
    trackAnimation(timeline);
  }

  panels.forEach((panel) => {
    const tween = gsap.fromTo(
      panel.querySelectorAll('[data-reveal]'),
      { autoAlpha: 0, y: 24, filter: 'blur(8px)' },
      { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.72, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: panel, start: 'top 72%', end: 'top 34%', toggleActions: 'play none none reverse' } },
    );
    trackAnimation(tween);
  });

  addCleanup(() => ScrollTrigger.refresh());
  requestAnimationFrame(() => ScrollTrigger.refresh());
};

const onVisibility = () => {
  running = !document.hidden;
  if (running) render();
  else stopRender();
};

onMounted(async () => {
  const musicUrl = new URL('../../assets/music/bg-music-2.mp3', import.meta.url).href;
  bgMusic = new Audio(musicUrl);
  bgMusic.loop = true;
  bgMusic.volume = 0.5;
  void bgMusic.play()
    .then(() => {
      showSoundPrompt.value = false;
    })
    .catch(() => {
      // Autoplay can be blocked until user interaction.
      showSoundPrompt.value = true;
    });

  setupScene();
  resize();
  render();
  await setupScroll();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  const orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };
  const isMobile = window.matchMedia('(pointer: coarse)').matches;
  if (isMobile && typeof orientation.requestPermission === 'function') {
    showMotionPrompt.value = true;
  } else {
    window.addEventListener('deviceorientation', onDeviceOrientation, true);
  }
  document.addEventListener('visibilitychange', onVisibility);
});

onBeforeUnmount(() => {
  stopRender();
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
  window.removeEventListener('resize', resize);
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('deviceorientation', onDeviceOrientation, true);
  document.removeEventListener('visibilitychange', onVisibility);

  world?.traverse((node) => {
    const object = node as THREE.Mesh | THREE.Line | THREE.LineSegments | THREE.Points;
    object.geometry?.dispose?.();
    const material = object.material as THREE.Material | THREE.Material[];
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose?.();
  });
  renderer?.dispose();
  if (renderer?.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);

  renderer = null;
  scene = null;
  camera = null;
  world = null;
  particleField = null;
  grassField = null;
  treeGroup = null;
  bgMusic = null;
  grassRoots = null;
  grassTips = null;
  grassSeeds = null;
  leafInstances.length = 0;
  lastRenderAt = 0;
  frameTick = 0;
});
</script>

<style scoped>
.scroll-panel {
  position: relative;
}
</style>
