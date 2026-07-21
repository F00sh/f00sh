<template>
  <div ref="container" class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true" />
</template>

<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { usePrefersReducedMotion } from "~/composables/usePrefersReducedMotion";

const container = ref<HTMLElement | null>(null);
const { prefersReducedMotion } = usePrefersReducedMotion();

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let root: THREE.Group | null = null;
let terrain: THREE.Mesh | null = null;
let grass: THREE.LineSegments | null = null;
let treeGroup: THREE.Group | null = null;
let bushGroup: THREE.Group | null = null;
let frameId = 0;
let isVisible = true;
let t = 0;
let animationElapsed = 0;
let lastAnimationAt = 0;
let stopMotionWatch: (() => void) | null = null;
let onVisibilityChange: (() => void) | null = null;

let grassPositions: Float32Array | null = null;
let grassRoots: Float32Array | null = null;
let grassTips: Float32Array | null = null;
let grassSeeds: Float32Array | null = null;

const terrainHeight = (x: number, z: number) => {
  const ridge = Math.sin(z * 0.12 + x * 0.08) * 0.5;
  const waves = Math.sin(x * 0.22) * 0.22 + Math.cos(z * 0.18) * 0.18;
  return -1.9 + ridge + waves;
};

const createTerrain = () => {
  const size = 160;
  const segments = 140;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, terrainHeight(x, z));
  }
  pos.needsUpdate = true;

  const material = new THREE.MeshBasicMaterial({
    color: 0x62f0c2,
    wireframe: true,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  return mesh;
};

const createGrass = () => {
  const bladeCount = 14000;
  grassPositions = new Float32Array(bladeCount * 6);
  grassRoots = new Float32Array(bladeCount * 3);
  grassTips = new Float32Array(bladeCount * 3);
  grassSeeds = new Float32Array(bladeCount);

  for (let i = 0; i < bladeCount; i += 1) {
    const ri = i * 3;
    const pi = i * 6;
    const radius = Math.sqrt(Math.random()) * 74;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = terrainHeight(x, z) + 0.02;
    const h = THREE.MathUtils.randFloat(0.1, 0.34);

    grassRoots[ri] = x;
    grassRoots[ri + 1] = y;
    grassRoots[ri + 2] = z;

    grassTips[ri] = x + THREE.MathUtils.randFloatSpread(0.04);
    grassTips[ri + 1] = y + h;
    grassTips[ri + 2] = z + THREE.MathUtils.randFloatSpread(0.04);
    grassSeeds[i] = Math.random() * Math.PI * 2;

    grassPositions[pi] = grassRoots[ri];
    grassPositions[pi + 1] = grassRoots[ri + 1];
    grassPositions[pi + 2] = grassRoots[ri + 2];
    grassPositions[pi + 3] = grassTips[ri];
    grassPositions[pi + 4] = grassTips[ri + 1];
    grassPositions[pi + 5] = grassTips[ri + 2];
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(grassPositions, 3));

  return new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({
      color: 0xc0ff75,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
  );
};

const addBranch = (parent: THREE.Group, length: number, depth: number, maxDepth: number) => {
  const pivot = new THREE.Group();
  pivot.rotation.set(
    depth === 0 ? THREE.MathUtils.randFloat(-0.05, 0.05) : THREE.MathUtils.randFloat(-0.7, 0.7),
    depth === 0 ? THREE.MathUtils.randFloat(-0.08, 0.08) : THREE.MathUtils.randFloat(0, Math.PI * 2),
    depth === 0 ? THREE.MathUtils.randFloat(-0.05, 0.05) : THREE.MathUtils.randFloat(-0.35, 0.35),
  );
  parent.add(pivot);

  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0)]),
    new THREE.LineBasicMaterial({ color: depth <= 1 ? 0xa0ff90 : 0x79db9c, transparent: true, opacity: 0.78 - depth * 0.12 }),
  );
  pivot.add(line);

  const tip = new THREE.Group();
  tip.position.y = length;
  pivot.add(tip);

  if (depth >= maxDepth) {
    return;
  }

  const childCount = depth === 0 ? THREE.MathUtils.randInt(4, 6) : THREE.MathUtils.randInt(2, 4);
  for (let i = 0; i < childCount; i += 1) {
    addBranch(tip, length * THREE.MathUtils.randFloat(0.5, 0.8), depth + 1, maxDepth);
  }
};

const createTrees = () => {
  const group = new THREE.Group();
  const treeCount = 22;

  for (let i = 0; i < treeCount; i += 1) {
    const tree = new THREE.Group();
    const radius = Math.sqrt(Math.random()) * 70;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    tree.position.set(x, terrainHeight(x, z), z);
    tree.rotation.y = Math.random() * Math.PI * 2;
    addBranch(tree, THREE.MathUtils.randFloat(1.8, 3.1), 0, THREE.MathUtils.randInt(3, 4));
    group.add(tree);
  }

  return group;
};

const createBushes = () => {
  const group = new THREE.Group();
  const bushCount = 36;

  for (let i = 0; i < bushCount; i += 1) {
    const bush = new THREE.Group();
    const radius = Math.sqrt(Math.random()) * 72;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = terrainHeight(x, z) + 0.06;

    for (let j = 0; j < 8; j += 1) {
      const ring = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
          Array.from({ length: 7 }, (_, k) => {
            const a = (k / 7) * Math.PI * 2;
            const r = THREE.MathUtils.randFloat(0.16, 0.34);
            return new THREE.Vector3(Math.cos(a) * r, THREE.MathUtils.randFloatSpread(0.12), Math.sin(a) * r);
          }),
        ),
        new THREE.LineBasicMaterial({ color: 0x7fffd4, transparent: true, opacity: 0.45 }),
      );
      ring.position.set(THREE.MathUtils.randFloatSpread(0.2), THREE.MathUtils.randFloatSpread(0.12), THREE.MathUtils.randFloatSpread(0.2));
      bush.add(ring);
    }

    bush.position.set(x, y, z);
    group.add(bush);
  }

  return group;
};

const updateGrass = (elapsed: number) => {
  if (!grass || !grassPositions || !grassRoots || !grassTips || !grassSeeds) return;

  const count = grassSeeds.length;
  for (let i = 0; i < count; i += 1) {
    const ri = i * 3;
    const pi = i * 6;
    const seed = grassSeeds[i];
    const swayX = Math.sin(elapsed * 1.6 + seed) * 0.026;
    const swayZ = Math.cos(elapsed * 1.4 + seed * 1.3) * 0.026;

    grassPositions[pi] = grassRoots[ri];
    grassPositions[pi + 1] = grassRoots[ri + 1];
    grassPositions[pi + 2] = grassRoots[ri + 2];
    grassPositions[pi + 3] = grassTips[ri] + swayX;
    grassPositions[pi + 4] = grassTips[ri + 1];
    grassPositions[pi + 5] = grassTips[ri + 2] + swayZ;
  }

  const attr = grass.geometry.getAttribute("position") as THREE.BufferAttribute;
  attr.needsUpdate = true;
};

const updateCamera = (phase: number) => {
  if (!camera) return;

  const radius = 22;
  const camX = Math.sin(phase) * radius;
  const camZ = Math.cos(phase) * radius;
  const camY = terrainHeight(camX, camZ) + 4.2 + Math.sin(phase * 2.2) * 0.28;
  camera.position.set(camX, camY, camZ);

  const lookT = phase + 0.2;
  const lookX = Math.sin(lookT) * radius;
  const lookZ = Math.cos(lookT) * radius;
  const lookY = terrainHeight(lookX, lookZ) + 2.4;
  camera.lookAt(lookX, lookY, lookZ);
};

const animate = (now: number) => {
  if (!renderer || !scene || !camera || !root) return;
  if (!isVisible) return;

  const delta = lastAnimationAt ? Math.min((now - lastAnimationAt) / 1000, 0.05) : 0;
  lastAnimationAt = now;
  animationElapsed += delta;
  t += prefersReducedMotion.value ? 0 : delta * 0.15;
  updateCamera(t);

  if (treeGroup) {
    treeGroup.rotation.y += delta * 0.039;
  }
  if (bushGroup) {
    bushGroup.rotation.y -= delta * 0.027;
  }

  updateGrass(animationElapsed);
  renderer.render(scene, camera);
  frameId = window.requestAnimationFrame(animate);
};

const start = () => {
  if (frameId !== 0) return;
  frameId = window.requestAnimationFrame(animate);
};

const stop = () => {
  if (frameId === 0) return;
  window.cancelAnimationFrame(frameId);
  frameId = 0;
  lastAnimationAt = 0;
};

const onResize = () => {
  if (!renderer || !camera) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
};

onMounted(() => {
  if (!container.value) return;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x010403, 0);
  container.value.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x010403, 0.035);

  camera = new THREE.PerspectiveCamera(46, 1, 0.1, 220);
  root = new THREE.Group();

  terrain = createTerrain();
  grass = createGrass();
  treeGroup = createTrees();
  bushGroup = createBushes();

  root.add(terrain, grass, treeGroup, bushGroup);
  scene.add(root);

  const ambient = new THREE.AmbientLight(0xffffff, 0.34);
  const key = new THREE.DirectionalLight(0xb7ffd2, 0.58);
  key.position.set(-4, 8, 3);
  scene.add(ambient, key);

  onResize();
  updateCamera(0);
  updateGrass(0);
  renderer.render(scene, camera);
  isVisible = !document.hidden;

  onVisibilityChange = () => {
    isVisible = !document.hidden;
    if (prefersReducedMotion.value) {
      if (renderer && scene && camera) renderer.render(scene, camera);
      return;
    }
    if (isVisible) start();
    else stop();
  };

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("resize", onResize);

  stopMotionWatch = watch(prefersReducedMotion, (reduced) => {
    if (reduced) {
      stop();
      if (renderer && scene && camera) renderer.render(scene, camera);
    } else if (isVisible) {
      start();
    }
  });

  if (prefersReducedMotion.value) {
    renderer.render(scene, camera);
  } else {
    start();
  }
});

onBeforeUnmount(() => {
  stop();
  window.removeEventListener("resize", onResize);
  if (onVisibilityChange) document.removeEventListener("visibilitychange", onVisibilityChange);
  if (stopMotionWatch) stopMotionWatch();

  root?.traverse((node) => {
    const mesh = node as THREE.Mesh;
    const line = node as THREE.Line;
    const geometry = mesh.geometry ?? line.geometry;
    const material = mesh.material ?? line.material;
    geometry?.dispose?.();
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose?.();
  });

  renderer?.dispose();
  if (renderer?.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);

  renderer = null;
  scene = null;
  camera = null;
  root = null;
  terrain = null;
  grass = null;
  treeGroup = null;
  bushGroup = null;
  grassPositions = null;
  grassRoots = null;
  grassTips = null;
  grassSeeds = null;
});
</script>
