<template>
  <div ref="mount" class="h-full w-full" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import * as THREE from 'three';

const mount = ref<HTMLElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let frameId = 0;
let clock: THREE.Clock | null = null;
let hero: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshBasicMaterial> | null = null;
let heroWire: THREE.LineSegments<THREE.WireframeGeometry, THREE.LineBasicMaterial> | null = null;

const heroPos = new THREE.Vector3(0, 1.8, 0);
const heroVel = new THREE.Vector3();
const gravity = -14.5;
const airDrag = 0.998;
const groundDrag = 0.99;
const bounce = 1.08;

const cameraDistance = 10.5;
const cameraHeight = 4.8;
const cameraSpring = 14;
const cameraDamping = 6.2;
const cameraVelocity = new THREE.Vector3();
let mouseYaw = 0;
let targetMouseYaw = 0;
const cameraPitchX = -Math.PI * 0.25;

const terrainHeight = (x: number, z: number) => {
  const n1 = Math.sin(x * 0.05) * 1.25 + Math.cos(z * 0.04) * 1.1;
  const n2 = Math.sin((x + z) * 0.09) * 0.55;
  return -2.5 + n1 + n2 + z * 0.35;
};

const onPointerMove = (e: PointerEvent) => {
  const nx = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
  targetMouseYaw = THREE.MathUtils.clamp(nx * 0.8, -0.8, 0.8);
};

const onKick = () => {
  if (!camera) return;
  const dir = heroPos.clone().sub(camera.position).setY(0).normalize();
  heroVel.addScaledVector(dir, 10.5);
  heroVel.y = Math.max(heroVel.y, 6.8);
};

const onResize = () => {
  if (!renderer || !camera || !mount.value) return;
  const w = mount.value.clientWidth;
  const h = mount.value.clientHeight;
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
};

const animate = () => {
  if (!renderer || !scene || !camera || !clock || !hero || !heroWire) return;
  const dt = Math.min(clock.getDelta(), 1 / 30);

  heroVel.y += gravity * dt;
  heroPos.addScaledVector(heroVel, dt);
  const groundY = terrainHeight(heroPos.x, heroPos.z) + 1.05;
  if (heroPos.y <= groundY) {
    heroPos.y = groundY;
    if (heroVel.y < 0) heroVel.y = -heroVel.y * bounce;
  }

  const drag = heroPos.y <= groundY + 0.05 ? groundDrag : airDrag;
  heroVel.x *= drag;
  heroVel.z *= drag;

  hero.position.copy(heroPos);
  heroWire.position.copy(heroPos);
  hero.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), (heroVel.length() * dt) / 1.05);
  heroWire.quaternion.copy(hero.quaternion);

  mouseYaw = THREE.MathUtils.lerp(mouseYaw, targetMouseYaw, 0.1);
  const orbit = new THREE.Vector3(0, cameraHeight, cameraDistance)
    .applyAxisAngle(new THREE.Vector3(1, 0, 0), cameraPitchX)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseYaw)
    .normalize()
    .multiplyScalar(cameraDistance);
  const desired = heroPos.clone().add(orbit);
  const toTarget = desired.sub(camera.position);
  cameraVelocity.addScaledVector(toTarget, cameraSpring * dt);
  cameraVelocity.addScaledVector(cameraVelocity.clone(), -cameraDamping * dt);
  camera.position.addScaledVector(cameraVelocity, dt);
  camera.lookAt(heroPos);

  renderer.render(scene, camera);
  frameId = requestAnimationFrame(animate);
};

onMounted(() => {
  if (!mount.value) return;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x040705, 0);
  mount.value.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x040705, 0.03);
  camera = new THREE.PerspectiveCamera(46, 1, 0.1, 400);
  camera.position.set(0, 5, 10);
  clock = new THREE.Clock();

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const heroGeo = new THREE.IcosahedronGeometry(1.05, 1);
  const heroMat = new THREE.MeshBasicMaterial({ color: 0x050605 });
  hero = new THREE.Mesh(heroGeo, heroMat);
  scene.add(hero);

  heroWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(heroGeo),
    new THREE.LineBasicMaterial({ color: 0xd8e0d6, transparent: true, opacity: 0.95 }),
  );
  scene.add(heroWire);

  const moonGeo = new THREE.RingGeometry(1.6, 1.66, 48);
  const moon = new THREE.LineSegments(
    new THREE.WireframeGeometry(moonGeo),
    new THREE.LineBasicMaterial({ color: 0xbec9c0, transparent: true, opacity: 0.9 }),
  );
  moon.position.set(28, 34, -60);
  scene.add(moon);

  onResize();
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onKick, { passive: true });
  frameId = requestAnimationFrame(animate);
});

onBeforeUnmount(() => {
  if (frameId) cancelAnimationFrame(frameId);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerdown', onKick);
  renderer?.dispose();
  scene = null;
  camera = null;
  renderer = null;
});
</script>
