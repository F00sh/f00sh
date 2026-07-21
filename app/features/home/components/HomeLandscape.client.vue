<template>
  <div ref="container" class="home-landscape pointer-events-none fixed inset-0 -z-20 overflow-hidden" aria-hidden="true" />
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { onBeforeUnmount, onMounted, ref } from 'vue';

type TelemetryPayload = { x: number; y: number; z: number; heading: number; progress: number; system: number; distance: number };
const emit = defineEmits<{ telemetry: [payload: TelemetryPayload] }>();

type PlanetState = { system: THREE.Group; stopIndex: number; mesh: THREE.Mesh; glow: THREE.Mesh; material: THREE.ShaderMaterial; speed: number };
type MoonState = { pivot: THREE.Group; moon: THREE.Mesh; speed: number; phase: number };
type PlanetOrbitState = { pivot: THREE.Group; speed: number; phase: number };
type SunState = { core: THREE.Mesh; halo: THREE.Mesh; baseScale: number; phase: number };
type GravityAttractor = { position: THREE.Vector3; strength: number };

const container = ref<HTMLElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let world: THREE.Group | null = null;
let nebulaMaterial: THREE.ShaderMaterial | null = null;
let travelPath: THREE.CurvePath<THREE.Vector3> | null = null;
let galaxyPoints: THREE.Points | null = null;
let resizeObserver: ResizeObserver | null = null;
let frameId = 0;
let visible = true;
let reducedMotion = false;
let lowPower = false;
let lastFrameAt = 0;
let lastAnimationAt = 0;
let animationElapsed = 0;
let pointerX = 0;
let pointerY = 0;
let currentPointerX = 0;
let currentPointerY = 0;
let lastTelemetryAt = -Infinity;

const planetStates: PlanetState[] = [];
const moonStates: MoonState[] = [];
const planetOrbitStates: PlanetOrbitState[] = [];
const sunStates: SunState[] = [];
const gravityAttractors: GravityAttractor[] = [];
const ownedGeometries = new Set<THREE.BufferGeometry>();
const ownedMaterials = new Set<THREE.Material>();
const cameraTarget = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const desiredQuaternion = new THREE.Quaternion();
const lookMatrix = new THREE.Matrix4();
const gravityDirection = new THREE.Vector3();
const rawCameraPoint = new THREE.Vector3();
const rawLookPoint = new THREE.Vector3();
const headingDirection = new THREE.Vector3();

const seededRandom = (() => {
  let seed = 918273;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
})();

const createTravelPath = () => {
  const anchors = [
    new THREE.Vector3(-1.0, 0.5, 20),
    new THREE.Vector3(2.2, -0.7, -20),
    new THREE.Vector3(-3.8, 1.4, -62),
    new THREE.Vector3(5.0, -1.0, -108),
    new THREE.Vector3(-4.2, 1.2, -154),
    new THREE.Vector3(3.0, 0.2, -206),
    new THREE.Vector3(24, 7.0, -166),
    new THREE.Vector3(30, -5.0, -84),
    new THREE.Vector3(17, 3.0, -8),
  ];
  const handles = anchors.map((anchor, index) => {
    const previous = anchors[(index - 1 + anchors.length) % anchors.length];
    const next = anchors[(index + 1) % anchors.length];
    const tangent = next.clone().sub(previous).multiplyScalar(0.14);
    tangent.x += (seededRandom() - 0.5) * 0.9;
    tangent.y += (seededRandom() - 0.5) * 0.55;
    return tangent;
  });
  const path = new THREE.CurvePath<THREE.Vector3>();
  for (let index = 0; index < anchors.length; index += 1) {
    const start = anchors[index];
    const end = anchors[(index + 1) % anchors.length];
    const controlA = start.clone().add(handles[index]);
    const controlB = end.clone().sub(handles[(index + 1) % anchors.length]);
    path.add(new THREE.CubicBezierCurve3(start, controlA, controlB, end));
  }
  return path;
};

const planetVertexShader = `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vPosition;

  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const planetFragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform float uType;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uAccent;
  uniform vec3 uSunPosition;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vPosition;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + vec3(7.1, 3.4, 5.8);
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 color = uColorB;

    vec3 lightDirection = normalize(uSunPosition - vWorldPosition);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float diffuse = max(dot(normalize(vWorldNormal), lightDirection), 0.0);
    float hardLight = step(0.24, diffuse);
    float rim = pow(1.0 - max(dot(normalize(vWorldNormal), viewDirection), 0.0), 2.2);
    color *= mix(0.012, 0.95 + diffuse * 0.34, hardLight);
    color += uAccent * rim * 0.16;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const nebulaVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const nebulaFragmentShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = p * 2.04 + vec2(5.2, 1.3);
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    float time = uTime * 0.008;
    float cloudA = fbm(p * 1.25 + vec2(time, -time * 0.5));
    float cloudB = fbm(p * 2.2 + vec2(6.0, 2.0) - time * 0.6);
    float veil = smoothstep(0.24, 0.7, cloudA * 0.72 + cloudB * 0.38);
    vec3 base = vec3(0.009, 0.011, 0.018);
    vec3 cool = vec3(0.04, 0.28, 0.31);
    vec3 warm = vec3(0.3, 0.08, 0.18);
    vec3 color = base + mix(cool, warm, cloudB) * veil * 0.92;
    float dust = smoothstep(0.58, 0.83, fbm(p * 6.5 + vec2(-time * 1.4, time)));
    color += mix(cool, warm, cloudA) * dust * 0.13;
    vec2 farCell = floor(uv * uResolution);
    vec2 nearCell = floor(uv * uResolution / 1.75);
    float farStar = step(0.9988, hash(farCell));
    float nearStar = step(0.99935, hash(nearCell));
    color += vec3(0.48, 0.58, 0.62) * farStar * 0.42;
    color += vec3(0.78, 0.88, 0.9) * nearStar * (0.38 + hash(nearCell + 2.0) * 0.45);
    float vignette = smoothstep(0.95, 0.22, length(vUv - 0.5));
    color *= 0.5 + vignette * 0.62;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const createNebula = () => {
  const geometry = new THREE.PlaneGeometry(2, 2);
  nebulaMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    },
    vertexShader: nebulaVertexShader,
    fragmentShader: nebulaFragmentShader,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, nebulaMaterial);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  ownedGeometries.add(geometry);
  ownedMaterials.add(nebulaMaterial);
  return mesh;
};

const createProceduralGalaxy = () => {
  const count = lowPower ? 850 : 1900;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const coreColor = new THREE.Color(0xd9e9df);
  const armColor = new THREE.Color(0x6f9e9d);
  const dustColor = new THREE.Color(0x8d5270);

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const radius = Math.pow(seededRandom(), 0.62) * 28;
    const arm = index % 4;
    const angle = arm * Math.PI * 0.5 + radius * 0.31 + (seededRandom() - 0.5) * 0.5;
    const thickness = (seededRandom() - 0.5) * (0.35 + radius * 0.055);
    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = Math.sin(angle) * radius * 0.42 + thickness;
    positions[offset + 2] = -108 + (seededRandom() - 0.5) * (3.5 + radius * 0.16);

    const color = radius < 4
      ? coreColor
      : armColor.clone().lerp(dustColor, Math.min(radius / 28, 1) * 0.52 + seededRandom() * 0.12);
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: lowPower ? 0.035 : 0.052,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  ownedGeometries.add(geometry);
  ownedMaterials.add(material);
  galaxyPoints = new THREE.Points(geometry, material);
  return galaxyPoints;
};

const createDistantStars = () => {
  const count = lowPower ? 2600 : 6200;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const cool = new THREE.Color(0xb9d9de);
  const warm = new THREE.Color(0xd8c9b0);
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const angle = seededRandom() * Math.PI * 2;
    const radius = 28 + Math.pow(seededRandom(), 0.7) * 92;
    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = Math.sin(angle) * radius * 0.58 + (seededRandom() - 0.5) * 18;
    positions[offset + 2] = 38 - seededRandom() * 292;
    const color = cool.clone().lerp(warm, seededRandom());
    const intensity = 0.45 + seededRandom() * 0.55;
    colors[offset] = color.r * intensity;
    colors[offset + 1] = color.g * intensity;
    colors[offset + 2] = color.b * intensity;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: lowPower ? 0.008 : 0.014,
    vertexColors: true,
    transparent: true,
    opacity: 0.68,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  ownedGeometries.add(geometry);
  ownedMaterials.add(material);
  return new THREE.Points(geometry, material);
};

const createOrbitLine = (radius: number, color: number, opacity = 0.2) => {
  const points: THREE.Vector3[] = [];
  for (let index = 0; index < 96; index += 1) {
    const angle = index / 96 * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  ownedGeometries.add(geometry);
  ownedMaterials.add(material);
  return new THREE.LineLoop(geometry, material);
};

const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const atmosphereFragmentShader = `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
    gl_FragColor = vec4(0.18, 0.72, 0.78, rim * 0.48);
  }
`;

const createPlanetGeometry = (type: number, radius: number) => {
  if (type === 2) {
    const geometry = new THREE.IcosahedronGeometry(radius, lowPower ? 3 : 5);
    const positions = geometry.getAttribute('position');
    const point = new THREE.Vector3();
    for (let index = 0; index < positions.count; index += 1) {
      point.fromBufferAttribute(positions, index).normalize();
      const distortion = 1 + (Math.sin(point.x * 11) + Math.sin(point.y * 17) + Math.sin(point.z * 13)) * 0.035;
      positions.setXYZ(index, point.x * radius * distortion, point.y * radius * distortion, point.z * radius * distortion);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }
  if (type === 3) return new THREE.IcosahedronGeometry(radius, lowPower ? 2 : 3);
  return new THREE.SphereGeometry(radius, lowPower ? 20 : 32, lowPower ? 14 : 20);
};

const createPlanet = ({
  position,
  radius,
  type,
  colors,
  moons,
  ring,
  stopIndex,
  sunPosition,
}: {
  position: [number, number, number];
  radius: number;
  type: number;
  colors: [number, number, number];
  moons: Array<{ radius: number; distance: number; speed: number; phase: number }>;
  ring?: { inner: number; outer: number; color: number };
  stopIndex: number;
  sunPosition: THREE.Vector3;
}) => {
  const group = new THREE.Group();
  group.position.set(...position);

  const geometry = createPlanetGeometry(type, radius);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uType: { value: type },
      uColorA: { value: new THREE.Color(colors[0]) },
      uColorB: { value: new THREE.Color(colors[1]) },
      uAccent: { value: new THREE.Color(colors[2]) },
      uSunPosition: { value: sunPosition.clone() },
    },
    vertexShader: planetVertexShader,
    fragmentShader: planetFragmentShader,
    wireframe: false,
    transparent: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  if (type === 1) mesh.scale.set(1.08, 0.78, 1.08);
  if (type === 2) mesh.scale.set(1.04, 0.92, 0.98);
  if (type === 3) mesh.scale.set(0.9, 1.08, 0.96);
  if (type === 4) mesh.scale.set(1.06, 0.86, 1.06);
  mesh.rotation.z = type === 1 ? 0.12 : type === 3 ? -0.14 : type === 4 ? 0.08 : 0;
  group.add(mesh);
  ownedGeometries.add(geometry);
  ownedMaterials.add(material);

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: colors[2],
    wireframe: false,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const glowShell = new THREE.Mesh(geometry, glowMaterial);
  glowShell.scale.copy(mesh.scale).multiplyScalar(1.12);
  glowShell.rotation.copy(mesh.rotation);
  group.add(glowShell);
  ownedMaterials.add(glowMaterial);
  planetStates.push({ system: group, stopIndex, mesh, glow: glowShell, material, speed: THREE.MathUtils.randFloat(0.025, 0.055) });

  if (type === 0) {
    const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.045, lowPower ? 20 : 28, lowPower ? 14 : 18);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      wireframe: false,
    });
    group.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));
    ownedGeometries.add(atmosphereGeometry);
    ownedMaterials.add(atmosphereMaterial);
  }

  if (ring) {
    const ringGeometry = new THREE.RingGeometry(radius * ring.inner, radius * ring.outer, lowPower ? 72 : 120);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: ring.color, side: THREE.DoubleSide, transparent: true, opacity: 0.26, depthWrite: false, wireframe: false });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.set(1.12, 0.18, -0.22);
    group.add(ringMesh);
    ownedGeometries.add(ringGeometry);
    ownedMaterials.add(ringMaterial);
  }

  const moonGeometry = new THREE.SphereGeometry(1, lowPower ? 10 : 16, lowPower ? 7 : 10);
  const moonColors = [0x9f9b86, 0xc0c6c5, 0x494443, 0x88a3aa, 0xaaa18f];
  const moonMaterial = new THREE.MeshBasicMaterial({ color: moonColors[type] || 0x9aa0a4, wireframe: false, transparent: true, opacity: 0.9 });
  ownedGeometries.add(moonGeometry);
  ownedMaterials.add(moonMaterial);

  moons.forEach((moonData, index) => {
    const orbit = createOrbitLine(moonData.distance, 0x91a0a8, 0.16);
    orbit.rotation.z = (index - 0.5) * 0.18;
    group.add(orbit);

    const pivot = new THREE.Group();
    pivot.rotation.z = orbit.rotation.z;
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.scale.setScalar(moonData.radius);
    moon.position.x = moonData.distance;
    pivot.add(moon);
    group.add(pivot);
    moonStates.push({ pivot, moon, speed: moonData.speed, phase: moonData.phase });
  });

  group.scale.setScalar(0.2);
  return group;
};

type SolarPlanetConfig = {
  orbit: number;
  orbitSpeed: number;
  phase: number;
  tilt: number;
  radius: number;
  type: number;
  colors: [number, number, number];
  moons?: Array<{ radius: number; distance: number; speed: number; phase: number }>;
  ring?: { inner: number; outer: number; color: number };
};

const createSun = (radius: number, color: number, phase: number) => {
  const geometry = new THREE.IcosahedronGeometry(radius, lowPower ? 2 : 3);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff8dc,
    wireframe: false,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const haloMaterial = new THREE.MeshBasicMaterial({
    color,
    wireframe: false,
    transparent: true,
    opacity: 0.48,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const group = new THREE.Group();
  const core = new THREE.Mesh(geometry, coreMaterial);
  const halo = new THREE.Mesh(geometry, haloMaterial);
  const baseScale = 1.38;
  halo.scale.setScalar(baseScale);
  group.add(core, halo);
  sunStates.push({ core, halo, baseScale, phase });
  ownedGeometries.add(geometry);
  ownedMaterials.add(coreMaterial);
  ownedMaterials.add(haloMaterial);
  return group;
};

const createSolarSystem = ({
  center,
  sunRadius,
  sunColor,
  gravity,
  planets,
}: {
  center: [number, number, number];
  sunRadius: number;
  sunColor: number;
  gravity: number;
  planets: SolarPlanetConfig[];
}) => {
  const root = new THREE.Group();
  const centerVector = new THREE.Vector3(...center);
  root.position.copy(centerVector);
  root.add(createSun(sunRadius, sunColor, seededRandom() * Math.PI * 2));
  gravityAttractors.push({ position: centerVector, strength: gravity });

  planets.forEach((planet, index) => {
    const orbit = createOrbitLine(planet.orbit, sunColor, 0.1 + index * 0.025);
    orbit.rotation.z = planet.tilt;
    root.add(orbit);

    const pivot = new THREE.Group();
    pivot.rotation.z = planet.tilt;
    pivot.add(createPlanet({
      position: [planet.orbit, 0, 0],
      radius: planet.radius,
      type: planet.type,
      colors: planet.colors,
      moons: planet.moons || [],
      ring: planet.ring,
      stopIndex: index,
      sunPosition: centerVector,
    }));
    root.add(pivot);
    planetOrbitStates.push({ pivot, speed: planet.orbitSpeed, phase: planet.phase });
  });

  return root;
};

const updatePointer = (event: PointerEvent) => {
  if (event.pointerType === 'touch') return;
  pointerX = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 0.55;
  pointerY = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 0.35;
};

const resize = () => {
  if (!renderer || !camera || !container.value) return;
  const { width, height } = container.value.getBoundingClientRect();
  camera.aspect = width / Math.max(height, 1);
  camera.fov = width < 640 ? 57 : 46;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 1.4));
  nebulaMaterial?.uniforms.uResolution.value.set(width, height);
  if (reducedMotion) renderStatic();
};

const applyGravityWarp = (source: THREE.Vector3, target: THREE.Vector3) => {
  target.copy(source);
  gravityAttractors.forEach(({ position, strength }) => {
    gravityDirection.subVectors(position, source);
    const distanceSquared = gravityDirection.lengthSq();
    const pull = Math.min(strength / (distanceSquared + 22), 1.15);
    if (distanceSquared > 0.0001) target.addScaledVector(gravityDirection.normalize(), pull);
  });
  return target;
};

const updateCamera = (elapsed: number, positionDamping = 1, rotationDamping = 1) => {
  if (!camera || !travelPath) return;
  const progress = reducedMotion ? 0 : (elapsed / 180) % 1;
  const lookProgress = (progress + 0.006) % 1;
  travelPath.getPointAt(progress, rawCameraPoint);
  travelPath.getPointAt(lookProgress, rawLookPoint);
  applyGravityWarp(rawCameraPoint, cameraTarget);
  applyGravityWarp(rawLookPoint, lookTarget);
  cameraTarget.x += currentPointerX;
  cameraTarget.y -= currentPointerY;
  lookTarget.x += currentPointerX * 0.18;
  lookTarget.y -= currentPointerY * 0.12;
  camera.position.lerp(cameraTarget, positionDamping);
  lookMatrix.lookAt(camera.position, lookTarget, camera.up);
  desiredQuaternion.setFromRotationMatrix(lookMatrix);
  camera.quaternion.slerp(desiredQuaternion, rotationDamping);

  if (elapsed - lastTelemetryAt >= 0.25 || reducedMotion) {
    let nearestSystem = 0;
    let nearestDistanceSquared = Infinity;
    gravityAttractors.forEach(({ position }, index) => {
      const distanceSquared = camera!.position.distanceToSquared(position);
      if (distanceSquared < nearestDistanceSquared) {
        nearestDistanceSquared = distanceSquared;
        nearestSystem = index;
      }
    });
    headingDirection.subVectors(lookTarget, camera.position).normalize();
    emit('telemetry', {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      heading: (THREE.MathUtils.radToDeg(Math.atan2(headingDirection.x, -headingDirection.z)) + 360) % 360,
      progress,
      system: nearestSystem,
      distance: Math.sqrt(nearestDistanceSquared),
    });
    lastTelemetryAt = elapsed;
  }
};

const updateMotion = (elapsed: number, delta: number) => {
  nebulaMaterial && (nebulaMaterial.uniforms.uTime.value = elapsed);
  planetStates.forEach(({ mesh, glow, material, speed }) => {
    mesh.rotation.y += speed * delta;
    glow.rotation.copy(mesh.rotation);
    material.uniforms.uTime.value = elapsed;
  });
  moonStates.forEach(({ pivot, moon, speed, phase }) => {
    pivot.rotation.y = elapsed * speed + phase;
    moon.rotation.y += delta * 0.18;
  });
  planetOrbitStates.forEach(({ pivot, speed, phase }) => {
    pivot.rotation.y = elapsed * speed + phase;
  });
  sunStates.forEach(({ core, halo, baseScale, phase }) => {
    core.rotation.y += delta * 0.13;
    core.rotation.x += delta * 0.035;
    halo.rotation.y -= delta * 0.08;
    halo.scale.setScalar(baseScale + Math.sin(elapsed * 1.15 + phase) * 0.08);
  });
  if (galaxyPoints) galaxyPoints.rotation.z += delta * 0.006;
};

const renderStatic = () => {
  if (!renderer || !scene || !camera) return;
  currentPointerX = pointerX;
  currentPointerY = pointerY;
  updateCamera(0, 1);
  updateMotion(0, 0);
  renderer.render(scene, camera);
};

const animate = (now: number) => {
  if (!renderer || !scene || !camera || !visible || reducedMotion) {
    frameId = 0;
    return;
  }
  frameId = window.requestAnimationFrame(animate);
  const frameInterval = lowPower ? 1000 / 24 : 1000 / 30;
  if (now - lastFrameAt < frameInterval) return;
  const delta = Math.min((now - (lastAnimationAt || now)) / 1000, 0.05);
  lastFrameAt = now;
  lastAnimationAt = now;
  animationElapsed += delta;
  const cameraAlpha = 1 - Math.exp(-1.15 * delta);
  const rotationAlpha = 1 - Math.exp(-0.38 * delta);
  const pointerAlpha = 1 - Math.exp(-1.4 * delta);
  currentPointerX = THREE.MathUtils.lerp(currentPointerX, pointerX, pointerAlpha);
  currentPointerY = THREE.MathUtils.lerp(currentPointerY, pointerY, pointerAlpha);
  updateCamera(animationElapsed, cameraAlpha, rotationAlpha);
  updateMotion(animationElapsed, delta);
  renderer.render(scene, camera);
};

const start = () => {
  if (!frameId && visible && !reducedMotion) frameId = window.requestAnimationFrame(animate);
};

const stop = () => {
  if (frameId) window.cancelAnimationFrame(frameId);
  frameId = 0;
  lastAnimationAt = 0;
};

const handleVisibility = () => {
  visible = !document.hidden;
  if (visible) start();
  else stop();
};

onMounted(() => {
  if (!container.value) return;
  const hints = navigator as Navigator & { deviceMemory?: number };
  lowPower = window.matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4 || (hints.deviceMemory || 8) <= 4;
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  try {
    renderer = new THREE.WebGLRenderer({ alpha: false, antialias: !lowPower, powerPreference: 'high-performance' });
  } catch {
    return;
  }

  renderer.setClearColor(0x05070a, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.value.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(44, 1, 0.1, 340);
  world = new THREE.Group();
  travelPath = createTravelPath();
  scene.add(createNebula());

  world.add(
    createDistantStars(),
    createProceduralGalaxy(),
    createSolarSystem({
      center: [7.0, 0.5, -10], sunRadius: 0.42, sunColor: 0xffd56a, gravity: 78,
      planets: [
        { orbit: 3.8, orbitSpeed: 0.12, phase: 0.2, tilt: 0.08, radius: 1.05, type: 2, colors: [0x100f10, 0x3a2421, 0xff6738] },
        { orbit: 7.0, orbitSpeed: 0.072, phase: 2.1, tilt: -0.12, radius: 1.7, type: 0, colors: [0x061f2b, 0x117788, 0x87c98f], moons: [{ radius: 0.28, distance: 2.25, speed: 0.5, phase: 0.4 }] },
        { orbit: 11.5, orbitSpeed: 0.043, phase: 4.5, tilt: 0.18, radius: 2.15, type: 1, colors: [0x4b2417, 0xc57543, 0xf1c27c], ring: { inner: 1.25, outer: 1.55, color: 0xd1ae74 } },
      ],
    }),
    createSolarSystem({
      center: [-9.0, -0.8, -58], sunRadius: 0.52, sunColor: 0xff8b55, gravity: 86,
      planets: [
        { orbit: 4.2, orbitSpeed: 0.105, phase: 1.3, tilt: -0.08, radius: 1.3, type: 4, colors: [0x3c3026, 0xb59a68, 0x82c9c2] },
        { orbit: 8.0, orbitSpeed: 0.061, phase: 3.2, tilt: 0.14, radius: 2.35, type: 1, colors: [0x4b2417, 0xc57543, 0xf1c27c], moons: [{ radius: 0.25, distance: 2.8, speed: -0.44, phase: 0.9 }] },
        { orbit: 13.0, orbitSpeed: 0.036, phase: 5.1, tilt: -0.2, radius: 1.85, type: 3, colors: [0x263743, 0x9cb4bd, 0xe5f2ef], moons: [{ radius: 0.2, distance: 2.65, speed: 0.62, phase: 2.5 }] },
      ],
    }),
    createSolarSystem({
      center: [11.0, 2.0, -110], sunRadius: 0.46, sunColor: 0xc8ff63, gravity: 92,
      planets: [
        { orbit: 4.0, orbitSpeed: 0.11, phase: 0.7, tilt: 0.2, radius: 1.1, type: 2, colors: [0x111211, 0x353b35, 0xc8ff63] },
        { orbit: 7.6, orbitSpeed: 0.064, phase: 2.8, tilt: -0.1, radius: 1.6, type: 0, colors: [0x071c28, 0x176b78, 0x8dd9e8], moons: [{ radius: 0.24, distance: 2.2, speed: 0.55, phase: 1.2 }] },
        { orbit: 12.4, orbitSpeed: 0.038, phase: 4.2, tilt: 0.12, radius: 2.45, type: 4, colors: [0x342c25, 0xa98462, 0xd2b277], ring: { inner: 1.25, outer: 1.7, color: 0x9e876f } },
      ],
    }),
    createSolarSystem({
      center: [-10.0, 1.8, -158], sunRadius: 0.38, sunColor: 0x8dd9e8, gravity: 82,
      planets: [
        { orbit: 3.5, orbitSpeed: 0.115, phase: 2.2, tilt: -0.16, radius: 0.95, type: 3, colors: [0x263743, 0x9cb4bd, 0xe5f2ef] },
        { orbit: 7.0, orbitSpeed: 0.067, phase: 4.6, tilt: 0.11, radius: 1.55, type: 0, colors: [0x061f2b, 0x117788, 0x87c98f], moons: [{ radius: 0.2, distance: 2.1, speed: -0.58, phase: 0.4 }, { radius: 0.15, distance: 2.75, speed: 0.72, phase: 2.3 }] },
        { orbit: 11.5, orbitSpeed: 0.04, phase: 0.4, tilt: -0.08, radius: 1.9, type: 2, colors: [0x100f10, 0x3a2421, 0xff6738] },
      ],
    }),
    createSolarSystem({
      center: [9.0, -2.0, -208], sunRadius: 0.58, sunColor: 0xffb36c, gravity: 98,
      planets: [
        { orbit: 4.5, orbitSpeed: 0.095, phase: 0.5, tilt: 0.07, radius: 1.2, type: 4, colors: [0x3c3026, 0xb59a68, 0x82c9c2] },
        { orbit: 8.5, orbitSpeed: 0.055, phase: 3.5, tilt: -0.16, radius: 2.75, type: 1, colors: [0x4b2417, 0xc57543, 0xf1c27c], moons: [{ radius: 0.3, distance: 3.2, speed: 0.42, phase: 1.7 }], ring: { inner: 1.22, outer: 1.58, color: 0xb6a98d } },
        { orbit: 13.8, orbitSpeed: 0.033, phase: 5.6, tilt: 0.2, radius: 1.65, type: 3, colors: [0x263743, 0x9cb4bd, 0xe5f2ef] },
      ],
    }),
  );
  scene.add(world);

  scene.add(new THREE.AmbientLight(0xd8e1e3, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-4, 8, 10);
  scene.add(key);

  resize();
  renderStatic();
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container.value);
  window.addEventListener('pointermove', updatePointer, { passive: true });
  document.addEventListener('visibilitychange', handleVisibility);
  start();
});

onBeforeUnmount(() => {
  stop();
  resizeObserver?.disconnect();
  window.removeEventListener('pointermove', updatePointer);
  document.removeEventListener('visibilitychange', handleVisibility);
  ownedGeometries.forEach((geometry) => geometry.dispose());
  ownedMaterials.forEach((material) => material.dispose());
  ownedGeometries.clear();
  ownedMaterials.clear();
  planetStates.length = 0;
  moonStates.length = 0;
  planetOrbitStates.length = 0;
  sunStates.length = 0;
  gravityAttractors.length = 0;
  renderer?.dispose();
  renderer?.forceContextLoss();
  if (renderer?.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  renderer = null;
  scene = null;
  camera = null;
  world = null;
  nebulaMaterial = null;
  travelPath = null;
  galaxyPoints = null;
});
</script>

<style scoped>
.home-landscape {
  width: 100dvw;
  height: 100dvh;
  min-width: 100vw;
  min-height: 100vh;
  background: #05070a;
}

.home-landscape :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
