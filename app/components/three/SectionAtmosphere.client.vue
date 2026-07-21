<template>
  <div ref="container" class="section-atmosphere" :class="`section-atmosphere--${variant}`" aria-hidden="true" />
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{
  variant?: 'services' | 'work' | 'about' | 'contact';
  density?: number;
  speed?: number;
}>(), { variant: 'services', density: 120, speed: 0.3 });

const container = ref<HTMLElement | null>(null);
let renderer: THREE.WebGLRenderer | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let scene: THREE.Scene | null = null;
let rig: THREE.Group | null = null;
let frameId = 0;
let resizeObserver: ResizeObserver | null = null;
let lastFrame = 0;
let visible = true;
const geometries = new Set<THREE.BufferGeometry>();
const materials = new Set<THREE.Material>();
const orbiters: Array<{ pivot: THREE.Group; speed: number }> = [];

const palettes = {
  services: [0xc8ff63, 0x61736d],
  work: [0xff6b55, 0x8b665f],
  about: [0x8dd9e8, 0x526f79],
  contact: [0xd2b277, 0x827964],
} as const;

const wireMaterial = (color: number, opacity = 0.68) => {
  const material = new THREE.MeshBasicMaterial({
    color,
    wireframe: false,
    transparent: true,
    opacity: Math.min(opacity, 0.42),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  materials.add(material);
  return material;
};

const addMesh = (geometry: THREE.BufferGeometry, material: THREE.Material, position: [number, number, number], scale = 1) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.setScalar(scale);
  geometries.add(geometry);
  rig?.add(mesh);
  return mesh;
};

const orbitLine = (radius: number, color: number, tilt = 0) => {
  const points: THREE.Vector3[] = [];
  for (let index = 0; index < 96; index += 1) {
    const angle = index / 96 * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.28, depthWrite: false });
  const line = new THREE.LineLoop(geometry, material);
  line.rotation.z = tilt;
  geometries.add(geometry);
  materials.add(material);
  rig?.add(line);
  return line;
};

const addMoon = (distance: number, radius: number, color: number, speed: number, tilt = 0, centerX = 0) => {
  const orbit = orbitLine(distance, color, tilt);
  orbit.position.x = centerX;
  const pivot = new THREE.Group();
  pivot.position.x = centerX;
  pivot.rotation.z = tilt;
  const moon = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 8), wireMaterial(color, 0.82));
  moon.position.x = distance;
  pivot.add(moon);
  rig?.add(pivot);
  geometries.add(moon.geometry);
  orbiters.push({ pivot, speed });
};

const buildVariant = () => {
  if (!rig) return;
  const [primary, secondary] = palettes[props.variant];

  if (props.variant === 'services') {
    addMesh(new THREE.IcosahedronGeometry(0.72, 2), wireMaterial(primary), [1.9, 0.55, 0]);
    addMesh(new THREE.OctahedronGeometry(0.34, 1), wireMaterial(secondary), [3.25, -0.65, -0.4]);
    addMesh(new THREE.TorusGeometry(0.48, 0.08, 8, 40), wireMaterial(primary, 0.42), [0.55, -1.05, -0.8]);
  } else if (props.variant === 'work') {
    const knot = addMesh(new THREE.TorusKnotGeometry(0.78, 0.2, 90, 10), wireMaterial(primary), [2.25, 0.05, 0]);
    knot.rotation.x = 0.7;
    addMoon(1.65, 0.14, secondary, 0.45, 0.18, 2.25);
  } else if (props.variant === 'about') {
    const crystal = addMesh(new THREE.IcosahedronGeometry(0.82, 1), wireMaterial(primary), [2.2, 0, 0]);
    crystal.scale.set(0.65, 1.35, 0.65);
    addMoon(1.4, 0.12, secondary, 0.34, -0.22, 2.2);
    addMoon(1.85, 0.08, primary, -0.5, 0.3, 2.2);
  } else {
    const planet = addMesh(new THREE.SphereGeometry(0.82, 24, 16), wireMaterial(primary), [2.2, 0, 0]);
    planet.scale.y = 0.78;
    const ring = addMesh(new THREE.RingGeometry(1.05, 1.5, 64), wireMaterial(secondary, 0.42), [2.2, 0, 0]);
    ring.rotation.set(1.1, 0.1, -0.2);
    addMoon(1.8, 0.13, primary, 0.3, -0.2, 2.2);
  }
};

const addAtmosphereParticles = () => {
  if (!rig) return;
  const [primary] = palettes[props.variant];
  const starCount = 720;
  const starPositions = new Float32Array(starCount * 3);
  for (let index = 0; index < starCount; index += 1) {
    const offset = index * 3;
    starPositions[offset] = THREE.MathUtils.randFloatSpread(18);
    starPositions[offset + 1] = THREE.MathUtils.randFloatSpread(10);
    starPositions[offset + 2] = THREE.MathUtils.randFloat(-9, -2.5);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: 0xe6eeee,
    size: 0.012,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  rig.add(stars);
  geometries.add(starGeometry);
  materials.add(starMaterial);

  const dustCount = 260;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let index = 0; index < dustCount; index += 1) {
    const offset = index * 3;
    const angle = Math.random() * Math.PI * 2;
    const radius = THREE.MathUtils.randFloat(0.5, 3.2);
    dustPositions[offset] = 2 + Math.cos(angle) * radius;
    dustPositions[offset + 1] = Math.sin(angle) * radius * 0.42 + THREE.MathUtils.randFloatSpread(0.35);
    dustPositions[offset + 2] = THREE.MathUtils.randFloat(-1.6, 0.5);
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({ color: primary, size: 0.035, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.rotation.z = -0.16;
  rig.add(dust);
  geometries.add(dustGeometry);
  materials.add(dustMaterial);
};

const resize = () => {
  if (!renderer || !camera || !container.value) return;
  const { width, height } = container.value.getBoundingClientRect();
  camera.aspect = width / Math.max(height, 1);
  camera.fov = width < 640 ? 56 : 46;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
};

const animate = (now: number) => {
  if (!renderer || !scene || !camera || !rig || !visible) { frameId = 0; return; }
  frameId = requestAnimationFrame(animate);
  if (now - lastFrame < 1000 / 30) return;
  const elapsed = now * 0.001;
  rig.rotation.y = elapsed * props.speed * 0.18;
  rig.rotation.x = Math.sin(elapsed * 0.16) * 0.04;
  orbiters.forEach(({ pivot, speed }) => { pivot.rotation.y = elapsed * speed; });
  renderer.render(scene, camera);
  lastFrame = now;
};

const onVisibility = () => {
  visible = !document.hidden;
  if (visible && !frameId) frameId = requestAnimationFrame(animate);
  else if (!visible && frameId) { cancelAnimationFrame(frameId); frameId = 0; }
};

onMounted(() => {
  if (!container.value) return;
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.value.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(46, 1, 0.1, 30);
  camera.position.set(0, 0, 6);
  rig = new THREE.Group();
  rig.scale.setScalar(0.56);
  scene.add(rig);
  buildVariant();
  addAtmosphereParticles();
  resize();
  renderer.render(scene, camera);
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container.value);
  document.addEventListener('visibilitychange', onVisibility);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) frameId = requestAnimationFrame(animate);
});

onBeforeUnmount(() => {
  if (frameId) cancelAnimationFrame(frameId);
  resizeObserver?.disconnect();
  document.removeEventListener('visibilitychange', onVisibility);
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  renderer?.dispose();
  renderer?.forceContextLoss();
  if (renderer?.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
});
</script>

<style scoped>
.section-atmosphere { position: fixed; inset: 0; width: 100dvw; height: 100dvh; min-width: 100vw; min-height: 100vh; overflow: hidden; background: #05070a; }
.section-atmosphere canvas { position: absolute; inset: 0; display: block; width: 100% !important; height: 100% !important; }
.section-atmosphere--services canvas { background: radial-gradient(ellipse at 78% 30%, rgba(82,125,105,.16), transparent 36%), linear-gradient(110deg,#05070a 48%,#0a100d); }
.section-atmosphere--work canvas { background: radial-gradient(ellipse at 80% 25%, rgba(125,65,57,.18), transparent 36%), linear-gradient(110deg,#05070a 48%,#120a0a); }
.section-atmosphere--about canvas { background: radial-gradient(ellipse at 76% 35%, rgba(65,112,125,.18), transparent 38%), linear-gradient(110deg,#05070a 48%,#081014); }
.section-atmosphere--contact canvas { background: radial-gradient(ellipse at 80% 28%, rgba(123,105,70,.18), transparent 38%), linear-gradient(110deg,#05070a 48%,#100e09); }
</style>
