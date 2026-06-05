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
let postScene: THREE.Scene | null = null;
let postCamera: THREE.OrthographicCamera | null = null;
let postQuad: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null = null;
let postTarget: THREE.WebGLRenderTarget | null = null;
let postPrevTarget: THREE.WebGLRenderTarget | null = null;
let frameId = 0;
let clock: THREE.Clock | null = null;
const cameraAnchor = new THREE.Vector3(0, 5.2, 10.7);
const cameraVelocity = new THREE.Vector3();
const cameraDistance = Math.sqrt(cameraAnchor.x ** 2 + cameraAnchor.y ** 2 + cameraAnchor.z ** 2);
const cameraPitchX = -Math.PI * 0.25;
let mouseYaw = 0;
let targetMouseYaw = 0;
const headbuttPulse = { value: 0 };

let terrainRoot: THREE.Group | null = null;
let sphere: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshBasicMaterial> | null = null;
let sphereWire: THREE.LineSegments<THREE.WireframeGeometry, THREE.LineBasicMaterial> | null = null;
let cloudGroup: THREE.Group | null = null;
let dustPoints: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null = null;
let dustMaterial: THREE.PointsMaterial | null = null;
let starPoints: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null;
let moonWire: THREE.LineLoop<THREE.BufferGeometry, THREE.LineBasicMaterial> | null = null;

const spherePos = new THREE.Vector3(0, 2.2, 0);
const sphereVelocity = new THREE.Vector3(0, 0, 0);
const sphereRadius = 1.08;
const gravity = -15.5;
const airDrag = 0.999;
const groundDrag = 0.992;
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
const dustCount = 84;
const dustPositions = new Float32Array(dustCount * 3);
const dustVelocities = new Float32Array(dustCount * 3);
const dustLife = new Float32Array(dustCount);
let dustActive = 0;
const starCount = 420;
const starFieldRadius = 3;
const starCellSize = 90;
let starCellX = Number.NaN;
let starCellZ = Number.NaN;

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

const ridged2 = (x: number, z: number) => {
  let value = 0;
  let amplitude = 0.9;
  let frequency = 1;
  for (let i = 0; i < 4; i += 1) {
    const n = noise2(x * frequency, z * frequency);
    const ridge = 1 - Math.abs(n * 2 - 1);
    value += ridge * ridge * amplitude;
    amplitude *= 0.55;
    frequency *= 2.05;
  }
  return value;
};

const terrace = (h: number, steps: number, sharpness: number) => {
  const s = Math.max(1, steps);
  const t = h * s;
  const b = Math.floor(t) / s;
  const f = t - Math.floor(t);
  const k = Math.pow(THREE.MathUtils.clamp(f, 0, 1), THREE.MathUtils.clamp(sharpness, 1, 5));
  return mix(b, b + 1 / s, k);
};

const terrainHeight = (x: number, z: number) => {
  const warpX = x + (fbm2(x * 0.028 + 19.3, z * 0.028 - 4.7) - 0.5) * 22;
  const warpZ = z + (fbm2(x * 0.028 - 7.1, z * 0.028 + 12.6) - 0.5) * 22;

  const megaMountains = (ridged2(warpX * 0.018, warpZ * 0.018) - 0.58) * 7.2;
  const mountainChains = (ridged2(warpX * 0.044 + 3.2, warpZ * 0.044 - 6.8) - 0.56) * 3.8;
  const broadValleys = (fbm2(warpX * 0.016 - 2.7, warpZ * 0.016 + 5.4) - 0.5) * 5.2;
  const canyonMask = ridged2(x * 0.012 - 11.3, z * 0.012 + 8.9);
  const canyons = (Math.pow(canyonMask, 2.7) - 0.28) * 4.8;
  const rough = fbm2(x * 0.3 + 2.1, z * 0.3 - 1.8) * 0.62 + fbm2(x * 0.8 - 6.3, z * 0.8 + 4.2) * 0.28;

  const wildBase = terrace(megaMountains * 0.42 + mountainChains * 0.35 - canyons * 0.28, 7, 1.9) * 3.9;
  const mildBase = (fbm2(warpX * 0.03 + 1.7, warpZ * 0.03 - 2.9) - 0.5) * 4.3 + broadValleys * 0.52;
  const blendMask = THREE.MathUtils.clamp(fbm2(x * 0.01 + 17.4, z * 0.01 - 9.6), 0, 1);
  const mixedBase = mix(mildBase, wildBase, blendMask * 0.7 + 0.15);
  const valleyFloor = broadValleys * 0.38;
  const tiltX45 = z;
  return -4.8 + mixedBase + valleyFloor + rough + tiltX45;
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
  const facePositions: number[] = [];
  const faceIndices: number[] = [];

  for (let zi = 0; zi <= chunkResolution; zi += 1) {
    const z = minZ + zi * step;
    for (let xi = 0; xi <= chunkResolution; xi += 1) {
      const x = minX + xi * step;
      facePositions.push(x, terrainHeight(x, z), z);
    }
  }

  for (let zi = 0; zi < chunkResolution; zi += 1) {
    for (let xi = 0; xi < chunkResolution; xi += 1) {
      const a = zi * (chunkResolution + 1) + xi;
      const b = a + 1;
      const c = a + (chunkResolution + 1);
      const d = c + 1;
      faceIndices.push(a, c, b, b, c, d);
    }
  }

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
  const faceGeometry = new THREE.BufferGeometry();
  faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(facePositions, 3));
  faceGeometry.setIndex(faceIndices);
  faceGeometry.computeVertexNormals();
  const faceMesh = new THREE.Mesh(
    faceGeometry,
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: false,
      opacity: 1,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  group.add(faceMesh);
  group.add(lines);

  const formationMat = new THREE.LineBasicMaterial({ color: 0xa4ff8b, transparent: true, opacity: 0.36 });
  const formationSeed = hash2(xIndex * 13.11, zIndex * 17.37);
  const formationCount = 2 + Math.floor(formationSeed * 4);
  for (let i = 0; i < formationCount; i += 1) {
    const sx = hash2(xIndex * 61.7 + i * 7.3, zIndex * 37.1 + i * 4.9);
    const sz = hash2(xIndex * 27.4 + i * 5.7, zIndex * 73.2 + i * 2.6);
    const px = minX + sx * chunkSize;
    const pz = minZ + sz * chunkSize;
    const baseY = terrainHeight(px, pz);
    const typeSel = hash2(xIndex * 91.2 + i * 3.1, zIndex * 46.5 + i * 9.7);

    if (typeSel < 0.58) {
      // Voxel-ish rock tower cluster.
      const tower = new THREE.Group();
      const levels = 2 + Math.floor(hash2(px * 0.19, pz * 0.23) * 5);
      for (let lv = 0; lv < levels; lv += 1) {
        const bw = 1.6 + Math.floor(hash2(px * 0.4 + lv, pz * 0.29 - lv) * 3) * 0.8;
        const bd = 1.6 + Math.floor(hash2(px * 0.35 - lv, pz * 0.32 + lv) * 3) * 0.8;
        const bh = 1.1 + hash2(px * 0.28 + lv * 1.7, pz * 0.41 - lv * 0.9) * 1.5;
        const geo = new THREE.BoxGeometry(bw, bh, bd);
        const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geo), formationMat);
        wire.position.set(
          (hash2(px * 0.73 + lv, pz * 0.21 - lv) - 0.5) * 1.2,
          lv * (bh * 0.78),
          (hash2(px * 0.27 - lv, pz * 0.67 + lv) - 0.5) * 1.2,
        );
        tower.add(wire);
      }
      tower.position.set(px, baseY + 0.8, pz);
      group.add(tower);
    } else {
      // Arch-like formation to suggest tunnel/overhang silhouettes.
      const archRadius = 1.8 + hash2(px * 0.12, pz * 0.09) * 2.6;
      const archTube = 0.55 + hash2(px * 0.18, pz * 0.22) * 0.55;
      const archGeo = new THREE.TorusGeometry(archRadius, archTube, 7, 10, Math.PI);
      const archWire = new THREE.LineSegments(new THREE.WireframeGeometry(archGeo), formationMat);
      archWire.rotation.y = hash2(px * 0.07, pz * 0.11) * Math.PI * 2;
      archWire.rotation.x = THREE.MathUtils.degToRad(90);
      archWire.position.set(px, baseY + archRadius * 0.95 + 0.7, pz);
      group.add(archWire);
    }
  }

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
      if (obj instanceof THREE.LineSegments) {
        obj.geometry.dispose();
        obj.material.dispose();
      } else if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
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

const createStars = () => {
  const positions = new Float32Array(starCount * 3);
  const phases = new Float32Array(starCount);
  const sizes = new Float32Array(starCount);
  for (let i = 0; i < starCount; i += 1) {
    const r = THREE.MathUtils.randFloat(90, 220);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const y = THREE.MathUtils.randFloat(20, 95);
    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * r - THREE.MathUtils.randFloat(20, 120);
    phases[i] = THREE.MathUtils.randFloat(0, Math.PI * 2);
    sizes[i] = THREE.MathUtils.randFloat(1.2, 3.6);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.9 },
    },
    vertexShader: `
      attribute float aPhase;
      attribute float aSize;
      varying float vTwinkle;
      uniform float uTime;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vTwinkle = 0.45 + 0.55 * sin(uTime * 1.7 + aPhase);
        gl_PointSize = aSize * (1.0 + vTwinkle * 0.75);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float vTwinkle;
      uniform float uOpacity;
      void main() {
        vec2 p = gl_PointCoord - vec2(0.5);
        float d = length(p);
        float alpha = smoothstep(0.5, 0.0, d) * (0.25 + vTwinkle * 0.75) * uOpacity;
        gl_FragColor = vec4(vec3(0.9, 0.98, 0.86), alpha);
      }
    `,
  });

  return new THREE.Points(geometry, material);
};

const refillStars = (centerCellX: number, centerCellZ: number) => {
  if (!starPoints) return;
  const posAttr = starPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
  const phaseAttr = starPoints.geometry.getAttribute('aPhase') as THREE.BufferAttribute;
  const sizeAttr = starPoints.geometry.getAttribute('aSize') as THREE.BufferAttribute;

  let i = 0;
  for (let cz = centerCellZ - starFieldRadius; cz <= centerCellZ + starFieldRadius; cz += 1) {
    for (let cx = centerCellX - starFieldRadius; cx <= centerCellX + starFieldRadius; cx += 1) {
      const cellSeed = hash2(cx * 19.37, cz * 47.11);
      const starsInCell = 6 + Math.floor(cellSeed * 4);
      for (let s = 0; s < starsInCell && i < starCount; s += 1) {
        const rx = hash2(cx * 73.2 + s * 1.7, cz * 51.4 + s * 2.9);
        const rz = hash2(cx * 31.8 + s * 3.3, cz * 93.7 + s * 0.8);
        const ry = hash2(cx * 61.3 + s * 4.1, cz * 27.5 + s * 5.7);
        const phase = hash2(cx * 41.2 + s * 0.6, cz * 78.9 + s * 1.3) * Math.PI * 2;
        const size = 1.2 + hash2(cx * 15.9 + s * 8.1, cz * 22.4 + s * 3.4) * 2.6;
        const x = (cx + rx) * starCellSize;
        const y = 22 + ry * 78;
        const z = (cz + rz) * starCellSize;
        posAttr.setXYZ(i, x, y, z);
        phaseAttr.setX(i, phase);
        sizeAttr.setX(i, size);
        i += 1;
      }
    }
  }
  while (i < starCount) {
    posAttr.setXYZ(i, 0, -9999, 0);
    phaseAttr.setX(i, 0);
    sizeAttr.setX(i, 0);
    i += 1;
  }
  posAttr.needsUpdate = true;
  phaseAttr.needsUpdate = true;
  sizeAttr.needsUpdate = true;
};

const emitDustBurst = () => {
  if (!sphere || !dustPoints || !dustMaterial) return;
  const center = spherePos.clone();
  const q = sphere.quaternion;
  const move = sphereVelocity.clone();
  const moveLen = move.length();
  const moveDir = moveLen > 0.001 ? move.multiplyScalar(1 / moveLen) : kickDirection.clone().normalize();

  for (let i = 0; i < dustCount; i += 1) {
    const idx = i * 3;
    const local = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(2),
      THREE.MathUtils.randFloatSpread(2),
      THREE.MathUtils.randFloatSpread(2),
    ).normalize().multiplyScalar(sphereRadius);
    const surface = local.clone().applyQuaternion(q);
    const outward = surface.clone().normalize();
    const drift = moveDir.clone().multiplyScalar(THREE.MathUtils.randFloat(1.1, 3.8));
    const puff = outward.multiplyScalar(THREE.MathUtils.randFloat(2.4, 6.4));

    dustPositions[idx] = center.x + surface.x;
    dustPositions[idx + 1] = center.y + surface.y;
    dustPositions[idx + 2] = center.z + surface.z;

    dustVelocities[idx] = puff.x + drift.x + THREE.MathUtils.randFloatSpread(0.45);
    dustVelocities[idx + 1] = Math.max(0.35, puff.y * 0.5 + THREE.MathUtils.randFloat(0.25, 1.6));
    dustVelocities[idx + 2] = puff.z + drift.z + THREE.MathUtils.randFloatSpread(0.45);
    dustLife[i] = THREE.MathUtils.randFloat(0.42, 0.86);
  }

  dustActive = dustCount;
  dustPoints.geometry.attributes.position.needsUpdate = true;
  dustMaterial.opacity = 0.56;
};

const updateDust = (dt: number) => {
  if (!dustPoints || !dustMaterial || dustActive === 0) return;
  let alive = 0;
  let maxLife = 0;
  for (let i = 0; i < dustCount; i += 1) {
    if (dustLife[i] <= 0) continue;
    const idx = i * 3;
    dustLife[i] -= dt;
    if (dustLife[i] <= 0) {
      dustPositions[idx + 1] = -9999;
      continue;
    }
    alive += 1;
    if (dustLife[i] > maxLife) maxLife = dustLife[i];
    dustVelocities[idx + 1] += gravity * 0.18 * dt;
    dustVelocities[idx] *= 0.987;
    dustVelocities[idx + 2] *= 0.987;
    dustPositions[idx] += dustVelocities[idx] * dt;
    dustPositions[idx + 1] += dustVelocities[idx + 1] * dt;
    dustPositions[idx + 2] += dustVelocities[idx + 2] * dt;
  }
  dustActive = alive;
  dustMaterial.opacity = Math.min(0.56, maxLife * 0.85);
  dustPoints.geometry.attributes.position.needsUpdate = true;
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
      const restitution = 1.12;
      sphereVelocity.addScaledVector(normal, -(1 + restitution) * vn);
      const tangentDamping = 0.998;
      const tangent = sphereVelocity.clone().sub(normal.clone().multiplyScalar(sphereVelocity.dot(normal)));
      sphereVelocity.copy(tangent.multiplyScalar(tangentDamping).add(normal.multiplyScalar(sphereVelocity.dot(normal))));
    }
  }
  const drag = onGround ? groundDrag : airDrag;
  sphereVelocity.x *= drag;
  sphereVelocity.z *= drag;
  sphereVelocity.y = THREE.MathUtils.clamp(sphereVelocity.y, -maxVerticalSpeed, maxVerticalSpeed);

  const slopeNormal = terrainNormal(spherePos.x, spherePos.z);
  // Roll axis is perpendicular to both ground normal and travel direction.
  const tangentVelocity = sphereVelocity.clone().sub(slopeNormal.clone().multiplyScalar(sphereVelocity.dot(slopeNormal)));
  const speed = tangentVelocity.length();
  if (sphere && speed > 0.001) {
    const moveDir = tangentVelocity.normalize();
    const rollAxis = slopeNormal.clone().cross(moveDir).normalize();
    const rollAngle = (speed * dt) / sphereRadius;
    sphere.rotateOnWorldAxis(rollAxis, rollAngle);
  }
};

const onPush = () => {
  if (camera) {
    kickDirection.copy(spherePos).sub(camera.position).normalize();
  }
  // Ensure each kick produces an instant hop/bounce response.
  sphereVelocity.y = Math.max(sphereVelocity.y, 6.8);
  emitDustBurst();
  if (!gsapRef) {
    pushTarget.value = 1;
    return;
  }
  gsapRef.killTweensOf(pushTarget);
  pushTarget.value = 1;
  trackAnimation(gsapRef.to(pushTarget, { value: 0, duration: 0.46, ease: 'power2.out' }));
  gsapRef.killTweensOf(headbuttPulse);
  headbuttPulse.value = 1;
  gsapRef.set(headbuttPulse, { value: 0 });
  const headbuttTl = gsapRef.timeline();
  headbuttTl
    .to(headbuttPulse, { value: 2.05, duration: 0.07, ease: 'power3.out' })
    .to(headbuttPulse, { value: 2.05, duration: 0.15, ease: 'none' })
    .to(headbuttPulse, { value: 0, duration: 0.62, ease: 'power2.out' });
  trackAnimation(headbuttTl);
};

const onPointerMove = (event: PointerEvent) => {
  const nx = (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
  targetMouseYaw = THREE.MathUtils.clamp(nx * 0.8, -0.8, 0.8);
};

const resize = () => {
  if (!renderer || !camera || !mount.value) return;
  const w = mount.value.clientWidth;
  const h = mount.value.clientHeight;
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  postTarget?.setSize(w, h);
  postPrevTarget?.setSize(w, h);
  if (postQuad) {
    postQuad.material.uniforms.uResolution.value.set(w, h);
  }
  const dpr = window.matchMedia('(max-width: 900px)').matches ? 1 : 1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dpr));
};

const animate = () => {
  if (!renderer || !scene || !camera || !clock || !sphere || !sphereWire) return;
  const dt = Math.min(clock.getDelta(), 0.033);
  const t = clock.elapsedTime;

  pushTarget.value *= 0.88;
  pushLerp.value += (pushTarget.value - pushLerp.value) * 0.22;
  // Kick from behind: short impulse burst only after click/tap.
  pusherStrength = 118 * pushLerp.value;

  updateSpherePhysics(dt);
  updateDust(dt);
  ensureChunks();

  sphere.position.copy(spherePos);
  sphereWire.position.copy(spherePos);
  sphereWire.quaternion.copy(sphere.quaternion);
  if (starPoints) {
    const nextCellX = Math.floor(spherePos.x / starCellSize);
    const nextCellZ = Math.floor(spherePos.z / starCellSize);
    if (nextCellX !== starCellX || nextCellZ !== starCellZ) {
      starCellX = nextCellX;
      starCellZ = nextCellZ;
      refillStars(starCellX, starCellZ);
    }
    starPoints.position.set(0, 0, 0);
    starPoints.material.uniforms.uTime.value = t;
  }
  if (moonWire) {
    moonWire.position.set(spherePos.x * 0.1 + 34, 42, spherePos.z * 0.1 - 72);
  }

  mouseYaw = THREE.MathUtils.lerp(mouseYaw, targetMouseYaw, 0.08);
  const dynamicAnchor = cameraAnchor
    .clone()
    .applyAxisAngle(new THREE.Vector3(1, 0, 0), cameraPitchX)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseYaw);
  const headbuttDistance = cameraDistance - headbuttPulse.value * 3.0;
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

  if (postTarget && postScene && postCamera && postQuad) {
    renderer.setRenderTarget(postTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    postQuad.material.uniforms.uScene.value = postTarget.texture;
    postQuad.material.uniforms.uPrevScene.value = postPrevTarget?.texture ?? postTarget.texture;
    postQuad.material.uniforms.uMotionBlur.value = THREE.MathUtils.clamp(headbuttPulse.value * 0.42, 0, 0.42);
    renderer.render(postScene, postCamera);
    if (postPrevTarget) {
      const tmp = postPrevTarget;
      postPrevTarget = postTarget;
      postTarget = tmp;
    }
  } else {
    renderer.render(scene, camera);
  }
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
  postScene = new THREE.Scene();
  postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  postTarget = new THREE.WebGLRenderTarget(1, 1, {
    depthBuffer: true,
    stencilBuffer: false,
  });
  postPrevTarget = new THREE.WebGLRenderTarget(1, 1, {
    depthBuffer: true,
    stencilBuffer: false,
  });
  const postMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uScene: { value: null },
      uPrevScene: { value: null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uStrength: { value: 0.11 },
      uMotionBlur: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D uScene;
      uniform sampler2D uPrevScene;
      uniform vec2 uResolution;
      uniform float uStrength;
      uniform float uMotionBlur;
      void main() {
        vec2 uv = vUv;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= uResolution.x / max(uResolution.y, 1.0);
        float r = length(p);
        float k = 1.0 + uStrength * r * r;
        vec2 warped = p / k;
        warped.x /= uResolution.x / max(uResolution.y, 1.0);
        warped = warped * 0.5 + 0.5;
        if (warped.x < 0.0 || warped.x > 1.0 || warped.y < 0.0 || warped.y > 1.0) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
          vec4 curr = texture2D(uScene, warped);
          vec4 prev = texture2D(uPrevScene, warped);
          gl_FragColor = mix(curr, prev, uMotionBlur);
        }
      }
    `,
  });
  postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial);
  postScene.add(postQuad);

  const ambient = new THREE.AmbientLight(0xffffff, 0.45);
  const key = new THREE.DirectionalLight(0xc8ff8d, 0.6);
  key.position.set(-8, 12, 6);
  scene.add(ambient, key);

  terrainRoot = new THREE.Group();
  scene.add(terrainRoot);
  cloudGroup = createClouds();
  scene.add(cloudGroup);
  starPoints = createStars();
  scene.add(starPoints);
  starCellX = Math.floor(spherePos.x / starCellSize);
  starCellZ = Math.floor(spherePos.z / starCellSize);
  refillStars(starCellX, starCellZ);

  const moonGeometry = new THREE.CircleGeometry(7.4, 48);
  moonGeometry.deleteAttribute('normal');
  moonGeometry.deleteAttribute('uv');
  moonGeometry.setIndex(null);
  const moonPositions = moonGeometry.attributes.position.array as ArrayLike<number>;
  const moonLinePoints: THREE.Vector3[] = [];
  for (let i = 3; i < moonPositions.length; i += 3) {
    moonLinePoints.push(new THREE.Vector3(moonPositions[i], moonPositions[i + 1], moonPositions[i + 2]));
  }
  const moonLineGeometry = new THREE.BufferGeometry().setFromPoints(moonLinePoints);
  moonWire = new THREE.LineLoop(
    moonLineGeometry,
    new THREE.LineBasicMaterial({ color: 0xe7f3c5, transparent: true, opacity: 0.75 }),
  );
  moonWire.position.set(34, 42, -72);
  scene.add(moonWire);

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

  const dustGeometry = new THREE.BufferGeometry();
  for (let i = 0; i < dustCount; i += 1) dustPositions[i * 3 + 1] = -9999;
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustMaterial = new THREE.PointsMaterial({
    color: 0xded8b9,
    size: 0.15,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  dustPoints = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dustPoints);

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
      if (obj instanceof THREE.LineSegments) {
        obj.geometry.dispose();
        obj.material.dispose();
      } else if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    });
  });
  chunks.clear();
  cloudGroup?.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.geometry.dispose();
    obj.material.dispose();
  });
  cloudGroup = null;
  starPoints?.geometry.dispose();
  starPoints?.material.dispose();
  starPoints = null;
  moonWire?.geometry.dispose();
  moonWire?.material.dispose();
  moonWire = null;
  postQuad?.geometry.dispose();
  postQuad?.material.dispose();
  postTarget?.dispose();
  postPrevTarget?.dispose();
  postQuad = null;
  postTarget = null;
  postPrevTarget = null;
  postScene = null;
  postCamera = null;

  sphere?.geometry.dispose();
  sphere?.material.dispose();
  sphereWire?.geometry.dispose();
  sphereWire?.material.dispose();
  dustPoints?.geometry.dispose();
  dustMaterial?.dispose();
  renderer?.dispose();
  if (renderer?.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);

  renderer = null;
  scene = null;
  camera = null;
  clock = null;
  sphere = null;
  sphereWire = null;
  dustPoints = null;
  dustMaterial = null;
  terrainRoot = null;
  gsapRef = null;
});
</script>
