<template>
  <div ref="mount" class="topo-canvas" aria-label="Interactive topographic map">
    <div v-show="showUi" class="topo-readout">
      <span>{{ sourceLabel }}</span>
      <span>{{ settings.resolution }} x {{ settings.resolution }}</span>
      <span>{{ settings.mode }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { imageFileToHeightData } from '~/utils/topography/heightmap';
import { marchingSquares } from '~/utils/topography/marchingSquares';
import { generateTerrain, smoothTerrain, type HeightData } from '~/utils/topography/terrain';
import type { TopographySettings } from '~/utils/topography/types';

const props = withDefaults(defineProps<{ settings: TopographySettings; showUi?: boolean }>(), {
  showUi: true,
});
const mount = ref<HTMLElement | null>(null);
const sourceLabel = ref('Procedural terrain');

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let terrainGroup: THREE.Group | null = null;
let scanPlane: THREE.Mesh | null = null;
let frameId = 0;
let currentHeights: HeightData | null = null;
let sourceFile: File | null = null;
let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
let reducedMotion = false;

const disposeObject = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.Points) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
};

const terrainSize = 30;
const mapPoint = (x: number, y: number, height: number, columns: number, rows: number) => {
  return new THREE.Vector3(
    (x / Math.max(columns - 1, 1) - 0.5) * terrainSize,
    height * props.settings.verticalExaggeration,
    (y / Math.max(rows - 1, 1) - 0.5) * terrainSize,
  );
};

const buildTerrainMesh = (heights: HeightData, group: THREE.Group) => {
  if (!props.settings.showTerrain) return;
  const resolution = heights.length;
  const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, resolution - 1, resolution - 1);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const x = index % resolution;
    const y = Math.floor(index / resolution);
    const height = props.settings.mode === 'flat' ? 0 : heights[y][x];
    position.setY(index, height * props.settings.verticalExaggeration);
  }
  position.needsUpdate = true;

  group.add(new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color: 0x789487,
      wireframe: true,
      transparent: true,
      opacity: props.settings.terrainOpacity,
      depthWrite: false,
    }),
  ));
};

const buildContours = (heights: HeightData, group: THREE.Group) => {
  if (!props.settings.showContours) return;
  const positions: number[] = [];
  const levels = Math.max(1, Math.floor(props.settings.maxHeight / props.settings.contourStep));
  const rows = heights.length;
  const columns = heights[0]?.length ?? rows;

  for (let index = 1; index <= levels; index += 1) {
    const level = index * props.settings.contourStep;
    const segments = marchingSquares(heights, level);
    const displayHeight = props.settings.mode === 'flat' ? 0.05 : level;

    segments.forEach(([start, end]) => {
      const a = mapPoint(start[0], start[1], displayHeight, columns, rows);
      const b = mapPoint(end[0], end[1], displayHeight, columns, rows);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    });
  }

  if (!positions.length) return;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const color = props.settings.mode === 'scanner' ? 0xbfffd8 : 0xd5e9de;
  group.add(new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: props.settings.mode === 'sliced' ? 0.72 : 0.92 }),
  ));
};

const buildConnectors = (heights: HeightData, group: THREE.Group) => {
  if (!props.settings.showConnectors && props.settings.mode !== 'scanner') return;
  const positions: number[] = [];
  const rows = heights.length;
  const columns = heights[0]?.length ?? rows;
  const stride = Math.max(4, Math.round(rows / 12));

  for (let y = 0; y < rows; y += stride) {
    for (let x = 0; x < columns; x += stride) {
      const top = mapPoint(x, y, heights[y][x], columns, rows);
      positions.push(top.x, 0, top.z, top.x, top.y, top.z);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  group.add(new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({ color: 0x7db99a, transparent: true, opacity: 0.18, depthWrite: false }),
  ));
};

const buildSlices = (heights: HeightData, group: THREE.Group) => {
  if (props.settings.mode !== 'sliced') return;
  const material = new THREE.MeshBasicMaterial({
    color: 0xa7c9b6,
    transparent: true,
    opacity: 0.025,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  for (let level = props.settings.contourStep; level < props.settings.maxHeight; level += props.settings.contourStep) {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(terrainSize, terrainSize), material.clone());
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = level * props.settings.verticalExaggeration;
    group.add(plane);
  }
};

const buildScanPlane = (group: THREE.Group) => {
  if (!props.settings.scanLine && props.settings.mode !== 'scanner') return;
  scanPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(terrainSize * 1.1, terrainSize * 1.1),
    new THREE.MeshBasicMaterial({ color: 0xaaffcc, transparent: true, opacity: 0.045, side: THREE.DoubleSide, depthWrite: false }),
  );
  scanPlane.rotation.x = -Math.PI / 2;
  group.add(scanPlane);
};

const rebuild = (heights = currentHeights) => {
  if (!scene || !heights) return;
  if (terrainGroup) {
    scene.remove(terrainGroup);
    disposeObject(terrainGroup);
  }
  terrainGroup = new THREE.Group();
  scanPlane = null;
  buildTerrainMesh(heights, terrainGroup);
  buildContours(heights, terrainGroup);
  buildConnectors(heights, terrainGroup);
  buildSlices(heights, terrainGroup);
  buildScanPlane(terrainGroup);
  scene.add(terrainGroup);
};

const regenerate = (resetSource = false) => {
  if (resetSource) sourceFile = null;
  sourceLabel.value = 'Procedural terrain';
  currentHeights = smoothTerrain(generateTerrain(props.settings), props.settings.smoothing);
  rebuild();
};

const loadHeightmap = async (file: File) => {
  if (!file.type.startsWith('image/')) throw new Error('Select a PNG or JPG heightmap.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Heightmap must be smaller than 15 MB.');
  sourceFile = file;
  currentHeights = smoothTerrain(
    await imageFileToHeightData(file, props.settings.resolution, props.settings.maxHeight),
    props.settings.smoothing,
  );
  sourceLabel.value = file.name;
  rebuild();
};

const resetCamera = () => {
  camera?.position.set(25, 22, 29);
  controls?.target.set(0, props.settings.maxHeight * props.settings.verticalExaggeration * 0.28, 0);
  controls?.update();
};

const screenshot = () => {
  if (!renderer) return;
  renderer.render(scene!, camera!);
  const link = document.createElement('a');
  link.download = `topo-${Date.now()}.png`;
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
};

const onResize = () => {
  if (!renderer || !camera) return;
  const width = window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
};

const animate = (time = 0) => {
  if (!renderer || !scene || !camera || !controls) return;
  controls.autoRotate = props.settings.autoRotate && !reducedMotion;
  controls.update();
  if (scanPlane) {
    const travel = props.settings.maxHeight * props.settings.verticalExaggeration;
    scanPlane.position.y = reducedMotion ? travel * 0.5 : ((time * 0.00012) % 1) * travel;
  }
  renderer.render(scene, camera);
  frameId = requestAnimationFrame(animate);
};

watch(() => props.settings, () => {
  if (rebuildTimer) clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    if (sourceFile) void loadHeightmap(sourceFile);
    else regenerate();
  }, 140);
}, { deep: true });

onMounted(() => {
  if (!mount.value) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030706);
  scene.fog = new THREE.FogExp2(0x030706, 0.022);

  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 180);
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = 'block';
  mount.value.appendChild(renderer.domElement);
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.autoRotateSpeed = 0.35;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.minDistance = 14;
  controls.maxDistance = 68;

  const grid = new THREE.GridHelper(90, 30, 0x385247, 0x17231e);
  grid.position.y = -0.02;
  scene.add(grid);

  const stars = new THREE.BufferGeometry();
  const starPositions = Array.from({ length: 420 * 3 }, () => (Math.random() - 0.5) * 110);
  stars.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xa6bdb1, size: 0.07, transparent: true, opacity: 0.42 })));

  resetCamera();
  regenerate();
  onResize();
  window.addEventListener('resize', onResize);
  window.visualViewport?.addEventListener('resize', onResize);
  frameId = requestAnimationFrame(animate);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId);
  if (rebuildTimer) clearTimeout(rebuildTimer);
  window.removeEventListener('resize', onResize);
  window.visualViewport?.removeEventListener('resize', onResize);
  controls?.dispose();
  if (scene) disposeObject(scene);
  renderer?.dispose();
});

defineExpose({ loadHeightmap, regenerate, resetCamera, screenshot });
</script>

<style scoped>
.topo-canvas { position: fixed; z-index: 0; inset: 0; width: 100vw; height: 100dvh; overflow: hidden; }
.topo-canvas :deep(canvas) { display: block; width: 100vw !important; max-width: none !important; height: 100dvh !important; }
.topo-readout { position: fixed; z-index: 10; right: 1rem; bottom: 3.75rem; display: flex; gap: 1rem; color: #9db1a7; font: 500 9px/1 "Montserrat", sans-serif; letter-spacing: .13em; text-transform: uppercase; pointer-events: none; }
@media (max-width: 640px) { .topo-readout span:first-child { display: none; } }
</style>
