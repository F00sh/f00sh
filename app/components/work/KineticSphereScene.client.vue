<template>
  <div ref="mount" class="h-full w-full" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import * as THREE from 'three';
import { useGsap } from '~/composables/useGsap';

const mount = ref<HTMLElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let frameId = 0;
let clock: THREE.Clock | null = null;
const cameraAnchor = new THREE.Vector3(0, 5.2, 11.5);
const cameraVelocity = new THREE.Vector3();
const cameraDistance = Math.sqrt(cameraAnchor.x ** 2 + cameraAnchor.y ** 2 + cameraAnchor.z ** 2);
let mouseYaw = 0;
let targetMouseYaw = 0;
const headbuttPulse = { value: 0 };

let terrainRoot: THREE.Group | null = null;
let sphere: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshBasicMaterial> | null = null;
let sphereWire: THREE.LineSegments<THREE.WireframeGeometry, THREE.LineBasicMaterial> | null = null;
let cloudGroup: THREE.Group | null = null;

const spherePos = new THREE.Vector3(0, 2.2, 0);
const sphereVelocity = new THREE.Vector3(0, 0, 0);
const sphereRadius = 1.08;
const gravity = -15.5;
const airDrag = 0.998;
const groundDrag = 0.972;
const maxStepHeight = 0.62;
const maxHorizontalSpeed = 17.5;
const maxVerticalSpeed = 16;

let pusherStrength = 0;
let pusherDepth = 5.5;
let pusherHalfWidth = 3.2;
const pushLerp = { value: 0 };
const pushTarget = { value: 0 };
const kickDirection = new THREE.Vector3(0, 0.22, -1).normalize();
const { loadGsap, trackAnimation } = useGsap();
let gsapRef: Awaited<ReturnType<typeof loadGsap>>['gsap'] | null = null;

type Chunk = {
  key: string;
  xIndex: number;
  zIndex: number;
  group: THREE.Group;
};

const chunks = new Map<string, Chunk>();
const chunkSize = 22;
const chunkResolution = 16;
const activeRadius = 2;

const hash2 = (x: number, z: number) => {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a * (1 - t) + b * t;

const noise2 = (x: number, z: number) => {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = smooth(x - ix);
  const fz = smooth(z - iz);
  const n00 = hash2(ix, iz);
  const n10 = hash2(ix + 1, iz);
  const n01 = hash2(ix, iz + 1);
  const n11 = hash2(ix + 1, iz + 1);
  const nx0 = mix(n00, n10, fx);
  const nx1 = mix(n01, n11, fx);
  return mix(nx0, nx1, fz);
};

const fbm2 = (x: number, z: number) => {
  let value = 0;
  let amplitude = 0.55;
  let frequency = 1;
  for (let i = 0; i < 4; i += 1) {
    value += noise2(x * frequency, z * frequency) * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
};

const terrainHeight = (x: number, z: number) => {
  const macro = fbm2(x * 0.052, z * 0.052) * 4.6;
  const detail = fbm2(x * 0.24 + 9.2, z * 0.24 - 5.1) * 1.5;
  const micro = fbm2(x * 0.55 - 2.4, z * 0.55 + 3.1) * 0.55;
  return -2.8 + macro + detail + micro;
};

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

const createChunk = (xIndex: number, zIndex: number) => {
  const minX = xIndex * chunkSize;
  const minZ = zIndex * chunkSize;
  const step = chunkSize / chunkResolution;
  const positions: number[] = [];

  for (let zi = 0; zi <= chunkResolution; zi += 1) {
    const z = minZ + zi * step;
    for (let xi = 0; xi < chunkResolution; xi += 1) {
      const xA = minX + xi * step;
      const xB = minX + (xi + 1) * step;
      positions.push(xA, terrainHeight(xA, z), z, xB, terrainHeight(xB, z), z);
    }
  }

  for (let xi = 0; xi <= chunkResolution; xi += 1) {
    const x = minX + xi * step;
    for (let zi = 0; zi < chunkResolution; zi += 1) {
      const zA = minZ + zi * step;
      const zB = minZ + (zi + 1) * step;
      positions.push(x, terrainHeight(x, zA), zA, x, terrainHeight(x, zB), zB);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const lines = new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({ color: 0x9eff7a, transparent: true, opacity: 0.42 }),
  );
  const group = new THREE.Group();
  group.add(lines);

  const key = `${xIndex}:${zIndex}`;
  return { key, xIndex, zIndex, group };
};

const ensureChunks = () => {
  if (!terrainRoot) return;
  const centerX = Math.floor(spherePos.x / chunkSize);
  const centerZ = Math.floor(spherePos.z / chunkSize);
  const needed = new Set<string>();

  for (let dz = -activeRadius; dz <= activeRadius; dz += 1) {
    for (let dx = -activeRadius; dx <= activeRadius; dx += 1) {
      const xIndex = centerX + dx;
      const zIndex = centerZ + dz;
      const key = `${xIndex}:${zIndex}`;
      needed.add(key);
      if (chunks.has(key)) continue;
      const chunk = createChunk(xIndex, zIndex);
      chunks.set(key, chunk);
      terrainRoot.add(chunk.group);
    }
  }

  chunks.forEach((chunk, key) => {
    if (needed.has(key)) return;
    chunk.group.traverse((obj) => {
      if (!(obj instanceof THREE.LineSegments)) return;
      obj.geometry.dispose();
      obj.material.dispose();
    });
    terrainRoot?.remove(chunk.group);
    chunks.delete(key);
  });
};

const applyWallPush = () => {
  if (!camera) return;
  const toSphere = spherePos.clone().sub(camera.position).normalize();
  const wallNormal = toSphere.lengthSq() > 0.0001 ? toSphere : new THREE.Vector3(0, 0, -1);
  const wallRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), wallNormal).normalize();
  const wallCenter = spherePos.clone().sub(wallNormal.clone().multiplyScalar(pusherDepth));
  const rel = spherePos.clone().sub(wallCenter);
  const depthCoord = rel.dot(wallNormal);
  const widthCoord = rel.dot(wallRight);
  const insideDepth = depthCoord > 0 && depthCoord < pusherDepth + sphereRadius * 0.75;
  const insideWidth = Math.abs(widthCoord) < pusherHalfWidth + sphereRadius;

  if (insideDepth && insideWidth) {
    const dist = Math.max(depthCoord, 0.22);
    const pushScale = 1 / (dist * dist);
    const kick = kickDirection.clone().multiplyScalar(pusherStrength * pushScale);
    // Keep the kick aligned with wall normal (camera-facing vector) plus user steer.
    kick.add(wallNormal.clone().multiplyScalar(pusherStrength * pushScale * 0.85));
    sphereVelocity.add(kick);
    const horizontalSpeed = Math.hypot(sphereVelocity.x, sphereVelocity.z);
    if (horizontalSpeed > maxHorizontalSpeed) {
      const scale = maxHorizontalSpeed / horizontalSpeed;
      sphereVelocity.x *= scale;
      sphereVelocity.z *= scale;
    }
    sphereVelocity.y = THREE.MathUtils.clamp(sphereVelocity.y, -maxVerticalSpeed, maxVerticalSpeed);
  }
};

const createClouds = () => {
  const group = new THREE.Group();
  const count = 11;
  for (let i = 0; i < count; i += 1) {
    const cloud = new THREE.Group();
    const cx = THREE.MathUtils.randFloatSpread(140);
    const cy = THREE.MathUtils.randFloat(18, 34);
    const cz = THREE.MathUtils.randFloat(-180, 40);
    const lobes = THREE.MathUtils.randInt(3, 5);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xd7f6df,
      transparent: true,
      opacity: 0.11,
    });
    for (let j = 0; j < lobes; j += 1) {
      const blob = new THREE.Mesh(
        new THREE.IcosahedronGeometry(THREE.MathUtils.randFloat(1.8, 3.8), 1),
        mat,
      );
      blob.position.set(
        THREE.MathUtils.randFloatSpread(4.2),
        THREE.MathUtils.randFloatSpread(1.4),
        THREE.MathUtils.randFloatSpread(3.6),
      );
      cloud.add(blob);
    }
    cloud.position.set(cx, cy, cz);
    group.add(cloud);
  }
  return group;
};

const updateSpherePhysics = (dt: number) => {
  sphereVelocity.y += gravity * dt;
  applyWallPush();
  spherePos.addScaledVector(sphereVelocity, dt);

  const groundY = terrainHeight(spherePos.x, spherePos.z) + sphereRadius;
  const onGround = spherePos.y <= groundY + maxStepHeight;
  if (onGround) {
    spherePos.y = groundY;
    const normal = terrainNormal(spherePos.x, spherePos.z);
    const vn = sphereVelocity.dot(normal);
    if (vn < 0) {
      const restitution = 0.9;
      sphereVelocity.addScaledVector(normal, -(1 + restitution) * vn);
      const tangentDamping = 0.99;
      const tangent = sphereVelocity.clone().sub(normal.clone().multiplyScalar(sphereVelocity.dot(normal)));
      sphereVelocity.copy(tangent.multiplyScalar(tangentDamping).add(normal.multiplyScalar(sphereVelocity.dot(normal))));
    }
  }
  const drag = onGround ? groundDrag : airDrag;
  sphereVelocity.x *= drag;
  sphereVelocity.z *= drag;
  sphereVelocity.y = THREE.MathUtils.clamp(sphereVelocity.y, -maxVerticalSpeed, maxVerticalSpeed);

  const slopeNormal = terrainNormal(spherePos.x, spherePos.z);
  const rollDir = new THREE.Vector3(sphereVelocity.z, 0, -sphereVelocity.x).normalize();
  const speed = Math.hypot(sphereVelocity.x, sphereVelocity.z);
  if (sphere && speed > 0.001) {
    sphere.rotateOnWorldAxis(rollDir.dot(slopeNormal) === 0 ? rollDir : slopeNormal.clone().cross(rollDir).normalize(), speed * dt * 0.9);
  }
};

const onPush = () => {
  if (camera) {
    kickDirection.copy(spherePos).sub(camera.position).normalize();
  }
  // Ensure each kick produces an instant hop/bounce response.
  sphereVelocity.y = Math.max(sphereVelocity.y, 6.8);
  if (!gsapRef) {
    pushTarget.value = 1;
    return;
  }
  gsapRef.killTweensOf(pushTarget);
  pushTarget.value = 1;
  trackAnimation(gsapRef.to(pushTarget, { value: 0, duration: 0.46, ease: 'power2.out' }));
  gsapRef.killTweensOf(headbuttPulse);
  headbuttPulse.value = 1;
  trackAnimation(gsapRef.to(headbuttPulse, { value: 0, duration: 0.32, ease: 'power2.out' }));
};

const onPointerMove = (event: PointerEvent) => {
  const nx = (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
  targetMouseYaw = THREE.MathUtils.clamp(nx * 0.45, -0.45, 0.45);
};

const resize = () => {
  if (!renderer || !camera || !mount.value) return;
  const w = mount.value.clientWidth;
  const h = mount.value.clientHeight;
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  const dpr = window.matchMedia('(max-width: 900px)').matches ? 1 : 1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dpr));
};

const animate = () => {
  if (!renderer || !scene || !camera || !clock || !sphere || !sphereWire) return;
  const dt = Math.min(clock.getDelta(), 0.033);

  pushTarget.value *= 0.88;
  pushLerp.value += (pushTarget.value - pushLerp.value) * 0.22;
  // Kick from behind: short impulse burst only after click/tap.
  pusherStrength = 96 * pushLerp.value;

  updateSpherePhysics(dt);
  ensureChunks();

  sphere.position.copy(spherePos);
  sphereWire.position.copy(spherePos);
  sphereWire.quaternion.copy(sphere.quaternion);

  mouseYaw = THREE.MathUtils.lerp(mouseYaw, targetMouseYaw, 0.08);
  const anchorXZ = new THREE.Vector3(cameraAnchor.x, 0, cameraAnchor.z)
    .normalize()
    .multiplyScalar(Math.hypot(cameraAnchor.x, cameraAnchor.z))
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseYaw);
  const dynamicAnchor = new THREE.Vector3(anchorXZ.x, cameraAnchor.y, anchorXZ.z);
  const headbuttDistance = cameraDistance - headbuttPulse.value * 1.4;
  const desired = spherePos.clone().add(dynamicAnchor.clone().normalize().multiplyScalar(headbuttDistance));
  const toTarget = desired.sub(camera.position);
  const spring = 18;
  const damping = 7.5;
  cameraVelocity.addScaledVector(toTarget, spring * dt);
  cameraVelocity.addScaledVector(cameraVelocity.clone(), -damping * dt);
  camera.position.addScaledVector(cameraVelocity, dt);
  const radial = camera.position.clone().sub(spherePos).normalize().multiplyScalar(headbuttDistance);
  camera.position.copy(spherePos.clone().add(radial));
  camera.lookAt(spherePos);

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
  camera.position.set(0, 6, 11);
  clock = new THREE.Clock();

  const ambient = new THREE.AmbientLight(0xffffff, 0.45);
  const key = new THREE.DirectionalLight(0xc8ff8d, 0.6);
  key.position.set(-8, 12, 6);
  scene.add(ambient, key);

  terrainRoot = new THREE.Group();
  scene.add(terrainRoot);
  cloudGroup = createClouds();
  scene.add(cloudGroup);

  const sphereGeometry = new THREE.IcosahedronGeometry(sphereRadius, 1);
  sphere = new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshBasicMaterial({ color: 0x213028, transparent: true, opacity: 0.22 }),
  );
  sphere.position.copy(spherePos);
  scene.add(sphere);

  sphereWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(sphereGeometry),
    new THREE.LineBasicMaterial({ color: 0xd8ff86, transparent: true, opacity: 0.95 }),
  );
  sphereWire.position.copy(spherePos);
  scene.add(sphereWire);

  ensureChunks();
  resize();
  frameId = requestAnimationFrame(animate);

  void (async () => {
    const { gsap } = await loadGsap();
    gsapRef = gsap;
  })();

  window.addEventListener('resize', resize);
  window.addEventListener('pointerdown', onPush, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('touchstart', onPush, { passive: true });
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId);
  window.removeEventListener('resize', resize);
  window.removeEventListener('pointerdown', onPush);
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('touchstart', onPush);

  chunks.forEach((chunk) => {
    chunk.group.traverse((obj) => {
      if (!(obj instanceof THREE.LineSegments)) return;
      obj.geometry.dispose();
      obj.material.dispose();
    });
  });
  chunks.clear();
  cloudGroup?.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.geometry.dispose();
    obj.material.dispose();
  });
  cloudGroup = null;

  sphere?.geometry.dispose();
  sphere?.material.dispose();
  sphereWire?.geometry.dispose();
  sphereWire?.material.dispose();
  renderer?.dispose();
  if (renderer?.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);

  renderer = null;
  scene = null;
  camera = null;
  clock = null;
  sphere = null;
  sphereWire = null;
  terrainRoot = null;
  gsapRef = null;
});
</script>
