<template>
  <div ref="container" class="pointer-events-none" aria-hidden="true" />
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { usePrefersReducedMotion } from '~/composables/usePrefersReducedMotion';

const props = withDefaults(defineProps<{ density?: number; speed?: number }>(), { density: 100, speed: 0.4 });
const container = ref<HTMLElement | null>(null);
const { prefersReducedMotion } = usePrefersReducedMotion();
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let points: THREE.Points | null = null;
let frame = 0;

const resize = () => {
  if (!renderer || !camera || !container.value) return;
  const rect = container.value.getBoundingClientRect();
  camera.aspect = rect.width / Math.max(rect.height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.4));
};

const animate = () => {
  if (!renderer || !scene || !camera || !points) return;
  points.rotation.y += 0.0008 * props.speed;
  points.rotation.x += 0.00035 * props.speed;
  renderer.render(scene, camera);
  frame = requestAnimationFrame(animate);
};

onMounted(() => {
  if (!container.value) return;
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  container.value.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.z = 9;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(props.density * 3);
  for (let i = 0; i < props.density; i += 1) {
    const o = i * 3;
    positions[o] = THREE.MathUtils.randFloatSpread(20);
    positions[o + 1] = THREE.MathUtils.randFloatSpread(12);
    positions[o + 2] = THREE.MathUtils.randFloatSpread(20);
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xb8ff6c, size: 0.06, transparent: true, opacity: 0.55, depthWrite: false });
  points = new THREE.Points(geometry, material);
  scene.add(points);

  resize();
  window.addEventListener('resize', resize);
  if (prefersReducedMotion.value) renderer.render(scene, camera);
  else animate();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  window.removeEventListener('resize', resize);
  if (points) {
    points.geometry.dispose();
    (points.material as THREE.Material).dispose();
  }
  renderer?.dispose();
  if (renderer?.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
});
</script>
