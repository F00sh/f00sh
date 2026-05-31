<template>
  <div ref="container" class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true" />
</template>

<script setup lang="ts">
import * as THREE from "three";
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import helvetikerBoldUrl from "three/examples/fonts/helvetiker_bold.typeface.json?url";
import { usePrefersReducedMotion } from "~/composables/usePrefersReducedMotion";

const container = ref<HTMLElement | null>(null);
const { prefersReducedMotion } = usePrefersReducedMotion();

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let lettersGroup: THREE.Group | null = null;
let letterMeshes: THREE.Mesh<TextGeometry, THREE.MeshStandardMaterial>[] = [];
let ambient: THREE.AmbientLight | null = null;
let directional: THREE.DirectionalLight | null = null;
let point: THREE.PointLight | null = null;
let letterMaterial: THREE.MeshStandardMaterial | null = null;
let frameId = 0;
let isVisible = true;
let mouseX = 0;
let mouseY = 0;
let onVisibilityChange: (() => void) | null = null;

const onPointerMove = (event: PointerEvent) => {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = (event.clientY / window.innerHeight) * 2 - 1;
  mouseX = x;
  mouseY = y;
};

const onResize = () => {
  if (!container.value || !renderer || !camera) return;

  const clientWidth = window.innerWidth;
  const clientHeight = window.innerHeight;
  camera.aspect = clientWidth / Math.max(clientHeight, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
};

const loop = () => {
  if (!renderer || !scene || !camera || !lettersGroup) return;
  if (!isVisible) return;

  const time = performance.now() * 0.001;

  lettersGroup.rotation.y += 0.002;
  lettersGroup.rotation.x += 0.0008;

  for (let i = 0; i < letterMeshes.length; i += 1) {
    const letter = letterMeshes[i];
    letter.position.y = Math.sin(time * 1.35 + i * 0.45) * 0.05;
    letter.rotation.y = Math.sin(time * 0.8 + i * 0.4) * 0.06;
  }

  camera.position.x += (mouseX * 0.35 - camera.position.x) * 0.03;
  camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  frameId = window.requestAnimationFrame(loop);
};

const start = () => {
  if (frameId !== 0) return;
  frameId = window.requestAnimationFrame(loop);
};

const stop = () => {
  if (frameId === 0) return;
  window.cancelAnimationFrame(frameId);
  frameId = 0;
};

const loadFont = () =>
  new Promise<Font>((resolve, reject) => {
    const loader = new FontLoader();
    loader.load(helvetikerBoldUrl, resolve, undefined, reject);
  });

const buildLetterGroup = (font: Font) => {
  const text = "FOOSH";
  const group = new THREE.Group();
  const meshes: THREE.Mesh<TextGeometry, THREE.MeshStandardMaterial>[] = [];
  const material = new THREE.MeshStandardMaterial({
    color: 0xa3e635,
    roughness: 0.32,
    metalness: 0.68,
    emissive: 0x1a1a1a,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.34,
  });

  let cursor = 0;
  for (const char of text) {
    const geometry = new TextGeometry(char, {
      font,
      size: 0.95,
      depth: 0.28,
      curveSegments: 10,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 2,
    });

    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    const width = box ? box.max.x - box.min.x : 0.6;

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = cursor;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
    meshes.push(mesh);
    cursor += width + 0.14;
  }

  group.position.x = -cursor * 0.5;
  group.position.y = -0.1;
  group.position.z = -0.2;

  return { group, meshes, material };
};

onMounted(() => {
  if (!container.value) return;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  container.value.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  ambient = new THREE.AmbientLight(0xffffff, 0.45);
  directional = new THREE.DirectionalLight(0xd4ff7a, 1.3);
  point = new THREE.PointLight(0xa3e635, 1.7, 15);
  directional.position.set(1.2, 1.8, 3.2);
  point.position.set(-2.5, 1.4, 3.6);
  scene.add(ambient, directional, point);

  loadFont()
    .then((font) => {
      if (!scene || !renderer || !camera) return;

      const textObject = buildLetterGroup(font);
      lettersGroup = textObject.group;
      letterMeshes = textObject.meshes;
      letterMaterial = textObject.material;
      scene.add(lettersGroup);

      onResize();
      if (prefersReducedMotion.value) {
        renderer.render(scene, camera);
      } else {
        start();
      }
    })
    .catch(() => {
      // Keep the page usable even if font loading fails.
    });

  onVisibilityChange = () => {
    isVisible = !document.hidden;
    if (prefersReducedMotion.value) return;
    if (isVisible) {
      start();
    } else {
      stop();
    }
  };

  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);

  watch(prefersReducedMotion, (isReduced) => {
    if (!renderer || !scene || !camera) return;
    if (isReduced) {
      stop();
      renderer.render(scene, camera);
      return;
    }
    if (isVisible) start();
  });

});

onBeforeUnmount(() => {
  stop();
  window.removeEventListener("resize", onResize);
  window.removeEventListener("pointermove", onPointerMove);
  if (onVisibilityChange) {
    document.removeEventListener("visibilitychange", onVisibilityChange);
  }

  if (lettersGroup) {
    for (const mesh of letterMeshes) {
      mesh.geometry.dispose();
    }
    scene?.remove(lettersGroup);
  }
  if (ambient) {
    scene?.remove(ambient);
  }
  if (directional) {
    scene?.remove(directional);
  }
  if (point) {
    scene?.remove(point);
  }

  letterMaterial?.dispose();

  renderer?.dispose();
  if (renderer?.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  lettersGroup = null;
  letterMeshes = [];
  letterMaterial = null;
  ambient = null;
  directional = null;
  point = null;
  onVisibilityChange = null;
  camera = null;
  scene = null;
  renderer = null;
});
</script>
