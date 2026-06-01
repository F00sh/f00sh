<template>
  <div ref="mount" class="h-[56vh] min-h-[24rem] w-full" />
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useBackgroundAudio } from '~/composables/useBackgroundAudio';

const mount = ref<HTMLElement | null>(null);
const { audio } = useBackgroundAudio();

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let mesh: THREE.Mesh<THREE.IcosahedronGeometry, THREE.ShaderMaterial> | null = null;
let particleSystem: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null = null;
let frame = 0;
let analyser: AnalyserNode | null = null;
let freqData: Uint8Array | null = null;
let audioContext: AudioContext | null = null;
let particleBaseDirs: Float32Array | null = null;
const shaderUniforms = {
  uTime: { value: 0 },
  uAudioIntensity: { value: 0 },
  uAudioDisplacementBoost: { value: 1.8 }
};

const mediaSourceMap = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
const sphereRadius = 2.2;

const hash3 = (x: number, y: number, z: number) => {
  let px = ((x * 0.3183099) + 0.1) % 1;
  let py = ((y * 0.3183099) + 0.2) % 1;
  let pz = ((z * 0.3183099) + 0.3) % 1;
  if (px < 0) px += 1;
  if (py < 0) py += 1;
  if (pz < 0) pz += 1;
  px *= 17;
  py *= 17;
  pz *= 17;
  const h = px * py * pz * (px + py + pz);
  return h - Math.floor(h);
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a * (1 - t) + b * t;

const noise3 = (x: number, y: number, z: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const fz = smooth(z - iz);

  const n000 = hash3(ix, iy, iz);
  const n100 = hash3(ix + 1, iy, iz);
  const n010 = hash3(ix, iy + 1, iz);
  const n110 = hash3(ix + 1, iy + 1, iz);
  const n001 = hash3(ix, iy, iz + 1);
  const n101 = hash3(ix + 1, iy, iz + 1);
  const n011 = hash3(ix, iy + 1, iz + 1);
  const n111 = hash3(ix + 1, iy + 1, iz + 1);

  const nx00 = mix(n000, n100, fx);
  const nx10 = mix(n010, n110, fx);
  const nx01 = mix(n001, n101, fx);
  const nx11 = mix(n011, n111, fx);
  const nxy0 = mix(nx00, nx10, fy);
  const nxy1 = mix(nx01, nx11, fy);
  return mix(nxy0, nxy1, fz);
};

const fbm = (x: number, y: number, z: number) => {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < 4; i += 1) {
    value += amplitude * noise3(x * frequency, y * frequency, z * frequency);
    frequency *= 2;
    amplitude *= 0.5;
  }
  return value;
};

const setupAudioAnalyser = async () => {
  if (!audio.value) return;
  try {
    audioContext = new AudioContext();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    let source = mediaSourceMap.get(audio.value);
    if (!source) {
      source = audioContext.createMediaElementSource(audio.value);
      mediaSourceMap.set(audio.value, source);
    }

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.85;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    freqData = new Uint8Array(analyser.frequencyBinCount);
  } catch {
    analyser = null;
    freqData = null;
  }
};

const getAudioEnergy = () => {
  if (!analyser || !freqData) return 0;
  analyser.getByteFrequencyData(freqData);
  let sum = 0;
  for (let i = 0; i < freqData.length; i += 1) sum += freqData[i];
  return (sum / freqData.length) / 255;
};

const resize = () => {
  if (!renderer || !camera || !mount.value) return;
  const w = mount.value.clientWidth;
  const h = mount.value.clientHeight;
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
};

const animate = () => {
  if (!renderer || !scene || !camera || !mesh) return;

  const t = performance.now() * 0.001;
  const rawEnergy = getAudioEnergy();
  const energy = Math.min(1, Math.pow(rawEnergy * 1.9, 1.35));
  shaderUniforms.uTime.value = t;
  shaderUniforms.uAudioIntensity.value = energy;

  if (particleSystem && particleBaseDirs) {
    const pAttr = particleSystem.geometry.attributes.position as THREE.BufferAttribute;
    const pArr = pAttr.array as Float32Array;
    const follow = Math.min(0.16 + energy * 0.12, 0.28);
    const flow = t * 0.5;
    const intensity = energy * shaderUniforms.uAudioDisplacementBoost.value;
    for (let i = 0; i < pAttr.count; i += 1) {
      const idx = i * 3;
      const nx = particleBaseDirs[idx];
      const ny = particleBaseDirs[idx + 1];
      const nz = particleBaseDirs[idx + 2];
      const px = nx * sphereRadius;
      const py = ny * sphereRadius;
      const pz = nz * sphereRadius;
      const n = fbm(
        px * 1.5 + flow,
        py * 1.5 + flow * 0.7,
        pz * 1.5 - flow * 0.9
      );
      const signedNoise = n * 2 - 1;
      const disp = signedNoise * intensity * 1.7;
      const tx = px + nx * disp;
      const ty = py + ny * disp;
      const tz = pz + nz * disp;
      pArr[idx] += (tx - pArr[idx]) * follow;
      pArr[idx + 1] += (ty - pArr[idx + 1]) * follow;
      pArr[idx + 2] += (tz - pArr[idx + 2]) * follow;
    }
    pAttr.needsUpdate = true;
  }

  mesh.rotation.y += 0.003 + energy * 0.02;
  mesh.rotation.x += 0.0012;

  renderer.render(scene, camera);
  frame = requestAnimationFrame(animate);
};

onMounted(async () => {
  if (!mount.value) return;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x040705, 0);
  mount.value.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const geometry = new THREE.IcosahedronGeometry(sphereRadius, 4);
  const material = new THREE.ShaderMaterial({
    uniforms: shaderUniforms,
    transparent: true,
    wireframe: true,
    vertexShader: `
      uniform float uTime;
      uniform float uAudioIntensity;
      uniform float uAudioDisplacementBoost;
      varying float vDispSigned;

      float hash(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise3(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        float n000 = hash(i + vec3(0.0, 0.0, 0.0));
        float n100 = hash(i + vec3(1.0, 0.0, 0.0));
        float n010 = hash(i + vec3(0.0, 1.0, 0.0));
        float n110 = hash(i + vec3(1.0, 1.0, 0.0));
        float n001 = hash(i + vec3(0.0, 0.0, 1.0));
        float n101 = hash(i + vec3(1.0, 0.0, 1.0));
        float n011 = hash(i + vec3(0.0, 1.0, 1.0));
        float n111 = hash(i + vec3(1.0, 1.0, 1.0));

        float nx00 = mix(n000, n100, f.x);
        float nx10 = mix(n010, n110, f.x);
        float nx01 = mix(n001, n101, f.x);
        float nx11 = mix(n011, n111, f.x);
        float nxy0 = mix(nx00, nx10, f.y);
        float nxy1 = mix(nx01, nx11, f.y);
        return mix(nxy0, nxy1, f.z);
      }

      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise3(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec3 n = normalize(normal);
        float flow = uTime * 0.5;
        float noiseValue = fbm(position * 1.5 + vec3(flow, flow * 0.7, -flow * 0.9));
        float signedNoise = noiseValue * 2.0 - 1.0;
        float displacement = signedNoise * (uAudioIntensity * uAudioDisplacementBoost);
        vec3 displaced = position + n * displacement;
        vDispSigned = signedNoise * uAudioIntensity;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: `
      varying float vDispSigned;
      void main() {
        float neutral = 0.28;
        float shade = clamp(neutral + vDispSigned * 0.18, 0.12, 0.42);
        gl_FragColor = vec4(vec3(shade), 0.9);
      }
    `
  });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const particleCount = 4200;
  particleBaseDirs = new Float32Array(particleCount * 3);
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const nx = Math.sin(phi) * Math.cos(theta);
    const ny = Math.sin(phi) * Math.sin(theta);
    const nz = Math.cos(phi);
    const idx = i * 3;
    particleBaseDirs[idx] = nx;
    particleBaseDirs[idx + 1] = ny;
    particleBaseDirs[idx + 2] = nz;
    particlePositions[idx] = nx * sphereRadius;
    particlePositions[idx + 1] = ny * sphereRadius;
    particlePositions[idx + 2] = nz * sphereRadius;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xcfd2d5,
    size: 0.022,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.78
  });
  particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  await setupAudioAnalyser();
  resize();
  window.addEventListener('resize', resize);
  frame = requestAnimationFrame(animate);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  window.removeEventListener('resize', resize);

  mesh?.geometry.dispose();
  mesh?.material.dispose();
  particleSystem?.geometry.dispose();
  particleSystem?.material.dispose();
  renderer?.dispose();
  if (renderer?.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);

  if (audioContext && audioContext.state !== 'closed') {
    void audioContext.close();
  }

  renderer = null;
  scene = null;
  camera = null;
  mesh = null;
  particleSystem = null;
  analyser = null;
  freqData = null;
  audioContext = null;
  particleBaseDirs = null;
});
</script>
