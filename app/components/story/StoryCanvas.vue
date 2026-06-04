<template>
  <div ref="mount" class="h-full w-full" aria-hidden="true" />
</template>

<script setup lang="ts">
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { StorySectionData } from '~/data/rumpelstiltskin';
import { createStoryWorld, sampleStoryCamera } from '~/composables/useStoryCamera';

type AnimationState = {
  elapsed: number;
  focus: number;
  sectionProgress: number;
  active: boolean;
};

type SceneInstance = {
  id: string;
  group: THREE.Group;
  animate: (state: AnimationState) => void;
};

type MeshOptions = {
  emissive?: number;
  metalness?: number;
  opacity?: number;
  roughness?: number;
  transparent?: boolean;
};

const props = defineProps<{
  sections: StorySectionData[];
  progress: number;
  activeSectionId: string;
  sectionProgress: Record<string, number>;
}>();

const mount = ref<HTMLElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;
let composer: EffectComposer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let frameId = 0;
let world = createStoryWorld(props.sections);
let sceneInstances: SceneInstance[] = [];
let dustField: THREE.Points | null = null;
let smoothedCameraPosition = new THREE.Vector3(0, 4, 12);
let smoothedCameraTarget = new THREE.Vector3();
let clock: THREE.Clock | null = null;

const lowPowerMode = typeof navigator !== 'undefined'
  ? ((navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number }).deviceMemory ?? 8) <= 4
    || ((navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number }).hardwareConcurrency ?? 8) <= 4
  : false;

const paperMaterial = (color: number, emissive = 0x000000) =>
  new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: emissive === 0x000000 ? 0 : 0.22,
    roughness: 0.92,
    metalness: 0.06,
  });

const makeMesh = (
  geometry: THREE.BufferGeometry,
  color: number,
  options: MeshOptions = {},
) => {
  const mesh = new THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>(
    geometry,
    paperMaterial(color, options.emissive),
  );
  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.roughness = options.roughness ?? 0.92;
    mesh.material.metalness = options.metalness ?? 0.06;
    mesh.material.transparent = options.transparent ?? false;
    mesh.material.opacity = options.opacity ?? 1;
  }
  return mesh;
};

const createBackdrop = (width: number, height: number, color: number, z = -5.8) => {
  const plane = makeMesh(new THREE.PlaneGeometry(width, height), color);
  plane.position.set(0, height * 0.46, z);
  return plane;
};

const createGround = (width: number, depth: number, color: number) => {
  const ground = makeMesh(new THREE.BoxGeometry(width, 0.45, depth), color);
  ground.position.y = -0.2;
  return ground;
};

const createTree = (scale = 1, trunkColor = 0x3a271d, crownColor = 0x172317) => {
  const group = new THREE.Group();
  const trunk = makeMesh(new THREE.CylinderGeometry(0.12 * scale, 0.17 * scale, 1.4 * scale, 6), trunkColor);
  trunk.position.y = 0.72 * scale;
  const crown = makeMesh(new THREE.ConeGeometry(0.72 * scale, 1.8 * scale, 7), crownColor, { emissive: 0x0c130d });
  crown.position.y = 1.92 * scale;
  group.add(trunk, crown);
  return group;
};

const createFigure = (
  cloakColor: number,
  accentColor: number,
  scale = 1,
  compact = false,
) => {
  const group = new THREE.Group();
  const body = makeMesh(
    new THREE.CylinderGeometry(compact ? 0.18 : 0.22, compact ? 0.28 : 0.34, 1.15 * scale, 8),
    cloakColor,
    { emissive: cloakColor },
  );
  const head = makeMesh(new THREE.SphereGeometry(0.2 * scale, 12, 12), accentColor);
  const arms = makeMesh(new THREE.BoxGeometry(0.75 * scale, 0.08 * scale, 0.08 * scale), accentColor);
  body.position.y = 0.72 * scale;
  head.position.y = 1.5 * scale;
  arms.position.y = 0.96 * scale;
  arms.rotation.z = 0.18;
  group.add(body, head, arms);
  return group;
};

const createStrawPile = (scale = 1) => {
  const group = new THREE.Group();
  for (let index = 0; index < 12; index += 1) {
    const stalk = makeMesh(
      new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, THREE.MathUtils.randFloat(0.8, 1.3) * scale, 5),
      0xb88b43,
    );
    stalk.position.set(
      THREE.MathUtils.randFloatSpread(0.9 * scale),
      THREE.MathUtils.randFloat(0.25, 0.72) * scale,
      THREE.MathUtils.randFloatSpread(0.75 * scale),
    );
    stalk.rotation.z = THREE.MathUtils.randFloatSpread(0.8);
    stalk.rotation.x = THREE.MathUtils.randFloatSpread(0.4);
    group.add(stalk);
  }
  return group;
};

const createSpinningWheel = () => {
  const group = new THREE.Group();
  const wheel = makeMesh(new THREE.TorusGeometry(0.86, 0.08, 8, 20), 0x7b5433, { emissive: 0x52381f });
  const axle = makeMesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8), 0x674226);
  axle.rotation.z = Math.PI / 2;
  const postLeft = makeMesh(new THREE.BoxGeometry(0.1, 1.5, 0.1), 0x5c3b23);
  const postRight = makeMesh(new THREE.BoxGeometry(0.1, 1.5, 0.1), 0x5c3b23);
  wheel.position.set(0, 1.3, 0);
  postLeft.position.set(-0.7, 0.78, 0);
  postRight.position.set(0.7, 0.78, 0);
  axle.position.set(0, 0.82, 0);
  group.add(wheel, axle, postLeft, postRight);
  return { group, wheel };
};

const createSparkleCluster = (count: number, color: number) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = THREE.MathUtils.randFloatSpread(2.2);
    positions[index * 3 + 1] = THREE.MathUtils.randFloat(0.2, 2.8);
    positions[index * 3 + 2] = THREE.MathUtils.randFloatSpread(1.8);
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color,
      size: lowPowerMode ? 0.08 : 0.11,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    }),
  );
};

const createTheaterFrame = () => {
  const frame = new THREE.Group();
  const materialColor = 0x120d0b;
  const top = makeMesh(new THREE.BoxGeometry(9.2, 0.28, 0.32), materialColor);
  const left = makeMesh(new THREE.BoxGeometry(0.28, 5.5, 0.32), materialColor);
  const right = makeMesh(new THREE.BoxGeometry(0.28, 5.5, 0.32), materialColor);
  const foot = makeMesh(new THREE.BoxGeometry(9.4, 0.4, 0.6), 0x1c130f);
  top.position.set(0, 5, 0.08);
  left.position.set(-4.45, 2.28, 0.08);
  right.position.set(4.45, 2.28, 0.08);
  foot.position.set(0, -0.3, 0.14);
  frame.add(top, left, right, foot);
  return frame;
};

const createRoomShell = (width: number, height: number, depth: number, color: number) => {
  const shell = new THREE.Group();
  const floor = makeMesh(new THREE.BoxGeometry(width, 0.25, depth), 0x3a2b24);
  const back = makeMesh(new THREE.BoxGeometry(width, height, 0.2), color);
  const left = makeMesh(new THREE.BoxGeometry(0.2, height, depth), color);
  const right = makeMesh(new THREE.BoxGeometry(0.2, height, depth), color);
  floor.position.y = -0.12;
  back.position.set(0, height * 0.48, -depth * 0.5);
  left.position.set(-width * 0.5, height * 0.48, 0);
  right.position.set(width * 0.5, height * 0.48, 0);
  shell.add(floor, back, left, right);
  return shell;
};

const buildScene = (section: StorySectionData, anchor: THREE.Vector3, tangent: THREE.Vector3): SceneInstance => {
  const group = new THREE.Group();
  group.position.copy(anchor);
  group.rotation.y = Math.atan2(tangent.x, -tangent.z) * 0.28;
  group.add(createTheaterFrame());

  switch (section.sceneType) {
    case 'mill-stream': {
      const ground = createGround(8.4, 8.2, 0x1e2419);
      const stream = makeMesh(new THREE.BoxGeometry(1.4, 0.06, 7.8), 0x3d6275, { emissive: 0x29475a });
      const mill = new THREE.Group();
      const house = makeMesh(new THREE.BoxGeometry(2.2, 1.8, 1.8), 0x5f4635);
      const roof = makeMesh(new THREE.ConeGeometry(1.7, 1.2, 4), 0x2a1614);
      const wheel = makeMesh(new THREE.TorusGeometry(0.58, 0.12, 8, 16), 0x8d693d);
      house.position.set(-1.8, 0.95, -0.3);
      roof.position.set(-1.8, 2.35, -0.3);
      roof.rotation.y = Math.PI * 0.25;
      wheel.position.set(-0.5, 0.82, 0.92);
      mill.add(house, roof, wheel);
      for (const position of [[2.5, 0, -2.1], [3.4, 0, -0.2], [-3.2, 0, -2.4], [-3.6, 0, 1.8]] as const) {
        const tree = createTree(THREE.MathUtils.randFloat(0.82, 1.24));
        tree.position.set(position[0], 0, position[2]);
        group.add(tree);
      }
      stream.position.set(1.6, 0.12, 0);
      group.add(createBackdrop(9.8, 6.4, 0x101712), ground, stream, mill);

      return {
        id: section.id,
        group,
        animate: ({ elapsed, focus }) => {
          wheel.rotation.z = elapsed * (0.4 + focus * 0.8);
          stream.material.emissiveIntensity = 0.15 + Math.sin(elapsed * 1.4) * 0.04 + focus * 0.18;
        },
      };
    }
    case 'king-arrival': {
      const ground = createGround(8.6, 8.5, 0x26251a);
      const path = makeMesh(new THREE.BoxGeometry(1.8, 0.05, 7.5), 0x4b3b2b);
      const rider = createFigure(0x3d2230, 0xe8cfac, 1.1);
      const standard = makeMesh(new THREE.BoxGeometry(0.08, 1.8, 0.08), 0x6f5329);
      const banner = makeMesh(new THREE.PlaneGeometry(0.8, 1.1), 0x5b1524, { emissive: 0x320a16 });
      banner.position.set(0.38, 1.2, 0);
      standard.position.set(0, 0.9, 0);
      const forest = new THREE.Group();
      for (const position of [[-3.5, 0, -2.4], [-2.4, 0, -1.6], [2.5, 0, -2.8], [3.3, 0, -0.8]] as const) {
        const tree = createTree(THREE.MathUtils.randFloat(0.86, 1.16), 0x372719, 0x101a11);
        tree.position.set(position[0], 0, position[2]);
        forest.add(tree);
      }
      rider.position.set(0.2, 0, 1.3);
      path.position.set(0, 0.08, 0.35);
      standard.add(banner);
      standard.position.set(1.5, 0, 1);
      group.add(createBackdrop(9.8, 6.5, 0x0f120d), ground, path, forest, rider, standard);

      return {
        id: section.id,
        group,
        animate: ({ elapsed, focus }) => {
          rider.position.z = 1.3 + Math.sin(elapsed * 1.5) * 0.25 * focus;
          rider.rotation.y = Math.sin(elapsed * 0.8) * 0.12;
          banner.rotation.y = Math.sin(elapsed * 1.3) * 0.38;
        },
      };
    }
    case 'straw-chamber': {
      const room = createRoomShell(8, 5.4, 7.2, 0x362a2d);
      const girl = createFigure(0x55646f, 0xe7d1be, 1.02);
      girl.position.set(-1.5, 0, 1.1);
      const piles = new THREE.Group();
      for (const position of [[0.5, 0, 1.5], [2, 0, -0.5], [-2.3, 0, -1.1], [0.2, 0, -1.9]] as const) {
        const pile = createStrawPile(1.1);
        pile.position.set(position[0], 0, position[2]);
        piles.add(pile);
      }
      const moonBeam = makeMesh(new THREE.PlaneGeometry(1.8, 4.6), 0x8faec2, { transparent: true, opacity: 0.18, emissive: 0x7aa5bf });
      moonBeam.position.set(2.2, 2.4, -2.8);
      moonBeam.rotation.z = 0.2;
      group.add(room, girl, piles, moonBeam);

      return {
        id: section.id,
        group,
        animate: ({ elapsed, focus }) => {
          moonBeam.material.opacity = 0.12 + Math.sin(elapsed * 1.2) * 0.03 + focus * 0.08;
          girl.rotation.z = Math.sin(elapsed * 0.9) * 0.05;
        },
      };
    }
    case 'gold-spinning': {
      const room = createRoomShell(8, 5.2, 7.2, 0x302624);
      const dwarf = createFigure(0x584013, 0xe2c895, 0.78, true);
      const wheelAssembly = createSpinningWheel();
      const goldLight = new THREE.PointLight(0xffc65c, 1.6, 8, 2.2);
      const goldRibbons = createSparkleCluster(lowPowerMode ? 24 : 44, 0xf9cf65);
      dwarf.position.set(-1.6, 0, 0.8);
      wheelAssembly.group.position.set(0.8, 0.1, 0.2);
      goldRibbons.position.set(0.8, 0.8, 0.2);
      goldLight.position.set(1.1, 2.6, 1.2);
      group.add(room, dwarf, wheelAssembly.group, goldRibbons, goldLight);

      return {
        id: section.id,
        group,
        animate: ({ elapsed, focus }) => {
          wheelAssembly.wheel.rotation.z = elapsed * (1.8 + focus * 4.2);
          dwarf.position.y = Math.sin(elapsed * 2.6) * 0.08 * focus;
          goldLight.intensity = 1.2 + Math.sin(elapsed * 3.1) * 0.16 + focus * 0.9;
          goldRibbons.rotation.y = elapsed * 0.6;
        },
      };
    }
    case 'greed-chamber': {
      const room = createRoomShell(8.8, 5.6, 8.4, 0x3b2620);
      const king = createFigure(0x2f1720, 0xefdbb9, 1.15);
      const goldStacks = new THREE.Group();
      for (const position of [[-2.5, 0, -1], [-0.6, 0, 1.3], [1.4, 0, -0.2], [2.7, 0, 1.1]] as const) {
        const stack = makeMesh(new THREE.CylinderGeometry(0.52, 0.66, THREE.MathUtils.randFloat(0.8, 1.8), 6), 0xb78b2d, { emissive: 0x7d5c15 });
        stack.position.set(position[0], stack.geometry.parameters.height * 0.5, position[2]);
        goldStacks.add(stack);
      }
      const crown = makeMesh(new THREE.CylinderGeometry(0.62, 0.72, 0.48, 8, 1, true), 0xd5af4a, { emissive: 0x89651b });
      king.position.set(0, 0, 2);
      crown.position.set(0, 2.5, -1.9);
      group.add(room, king, goldStacks, crown);

      return {
        id: section.id,
        group,
        animate: ({ elapsed, focus }) => {
          king.rotation.y = Math.sin(elapsed * 0.7) * 0.1;
          crown.rotation.y += 0.004 + focus * 0.006;
          goldStacks.children.forEach((child, index) => {
            child.position.y = ((child as THREE.Mesh).geometry as THREE.CylinderGeometry).parameters.height * 0.5 + Math.sin(elapsed * 1.1 + index) * 0.04 * focus;
          });
        },
      };
    }
    case 'dwarf-bargain': {
      const room = createRoomShell(7.8, 5.2, 7, 0x2c2322);
      const girl = createFigure(0x4e6570, 0xf0d3bb, 1);
      const dwarf = createFigure(0x61430f, 0xe3ca8c, 0.74, true);
      const candle = new THREE.PointLight(0xffcb7b, 1.25, 6, 2.2);
      const candleBody = makeMesh(new THREE.CylinderGeometry(0.08, 0.1, 0.62, 8), 0xd8cbaf);
      girl.position.set(-1.2, 0, 1.2);
      dwarf.position.set(1.3, 0, 0.8);
      candle.position.set(0.2, 1.8, 0.5);
      candleBody.position.set(0.2, 0.31, 0.5);
      group.add(room, girl, dwarf, candle, candleBody);

      return {
        id: section.id,
        group,
        animate: ({ elapsed, focus }) => {
          candle.intensity = 1 + Math.sin(elapsed * 8) * 0.15 + focus * 0.45;
          dwarf.rotation.y = Math.sin(elapsed * 2) * 0.24;
          girl.rotation.z = -Math.sin(elapsed * 1.4) * 0.04;
        },
      };
    }
    case 'queen-and-child': {
      const room = createRoomShell(8.2, 5.4, 7.4, 0x3a2b33);
      const queen = createFigure(0x6f5163, 0xf2dac2, 1.08);
      const cradle = makeMesh(new THREE.BoxGeometry(1.5, 0.72, 0.9), 0x6c4a35);
      const baby = makeMesh(new THREE.SphereGeometry(0.2, 12, 12), 0xe8d6bf);
      const fireLight = new THREE.PointLight(0xffbb73, 1.4, 7, 2);
      const drapeLeft = makeMesh(new THREE.PlaneGeometry(1.2, 3.6), 0x2b1020, { emissive: 0x1b0914 });
      const drapeRight = makeMesh(new THREE.PlaneGeometry(1.2, 3.6), 0x2b1020, { emissive: 0x1b0914 });
      queen.position.set(-1.4, 0, 1.2);
      cradle.position.set(1.2, 0.35, 0.7);
      baby.position.set(1.2, 0.92, 0.7);
      fireLight.position.set(-2.1, 1.8, 1.4);
      drapeLeft.position.set(-2.9, 2.6, -2.6);
      drapeRight.position.set(2.9, 2.6, -2.6);
      group.add(room, queen, cradle, baby, fireLight, drapeLeft, drapeRight);

      return {
        id: section.id,
        group,
        animate: ({ elapsed, focus }) => {
          fireLight.intensity = 1.1 + Math.sin(elapsed * 4.6) * 0.12 + focus * 0.6;
          cradle.rotation.z = Math.sin(elapsed * 1.5) * 0.08 * focus;
          drapeLeft.rotation.z = Math.sin(elapsed * 0.9) * 0.03;
          drapeRight.rotation.z = -Math.sin(elapsed * 1) * 0.03;
        },
      };
    }
    case 'messengers': {
      const ground = createGround(9.2, 9.2, 0x23231d);
      const hills = new THREE.Group();
      for (const layer of [
        { width: 9, height: 2.4, z: -3.6, y: 1.2, color: 0x1a2118 },
        { width: 8.2, height: 1.9, z: -2.8, y: 0.98, color: 0x222a1f },
        { width: 7.4, height: 1.5, z: -1.9, y: 0.8, color: 0x2c3527 },
      ]) {
        const hill = makeMesh(new THREE.PlaneGeometry(layer.width, layer.height), layer.color);
        hill.position.set(0, layer.y, layer.z);
        hills.add(hill);
      }
      const riders = [createFigure(0x3d2c41, 0xe3d1bb, 0.76), createFigure(0x263a52, 0xe2cfbb, 0.76), createFigure(0x57312b, 0xe4ceb7, 0.76)];
      const riderBaseX = [-2.4, 0, 2.2];
      const riderBaseZ = [0.8, -0.1, 1.2];
      riders[0].position.set(-2.4, 0, 0.8);
      riders[1].position.set(0, 0, -0.1);
      riders[2].position.set(2.2, 0, 1.2);
      group.add(createBackdrop(10.4, 6.8, 0x121412), ground, hills, ...riders);

      return {
        id: section.id,
        group,
        animate: ({ elapsed, focus }) => {
          riders.forEach((rider, index) => {
            rider.position.x = riderBaseX[index]! + Math.sin(elapsed * 1.15 + index * 0.8) * 0.34 * (0.4 + focus);
            rider.position.y = Math.sin(elapsed * 3 + index) * 0.05 * focus;
            rider.position.z = riderBaseZ[index]! + Math.cos(elapsed * 0.92 + index) * 0.18 * focus;
          });
        },
      };
    }
    case 'forest-hut': {
      const ground = createGround(8.8, 8.8, 0x1f2316);
      const hutBase = makeMesh(new THREE.BoxGeometry(2.6, 1.6, 2.3), 0x5c3d25);
      const hutRoof = makeMesh(new THREE.ConeGeometry(2.1, 1.3, 4), 0x241610);
      const fire = makeMesh(new THREE.ConeGeometry(0.42, 1.1, 8), 0xf59b3b, { emissive: 0xb95e19 });
      const fireLight = new THREE.PointLight(0xff9b4d, 1.8, 8, 2.4);
      const dwarf = createFigure(0x6b4a11, 0xe1c27f, 0.78, true);
      hutBase.position.set(-1.4, 0.82, -0.4);
      hutRoof.position.set(-1.4, 2.22, -0.4);
      fire.position.set(1.3, 0.62, 0.5);
      fireLight.position.set(1.3, 1.5, 0.5);
      dwarf.position.set(1.5, 0, -0.8);
      group.add(createBackdrop(10, 6.7, 0x0e120d), ground, hutBase, hutRoof, fire, fireLight, dwarf);
      for (const position of [[-3.2, 0, -2.1], [3.1, 0, -2.5], [3.6, 0, 1.8], [-3.5, 0, 1.7]] as const) {
        const tree = createTree(THREE.MathUtils.randFloat(0.88, 1.18), 0x3a291b, 0x111711);
        tree.position.set(position[0], 0, position[2]);
        group.add(tree);
      }

      return {
        id: section.id,
        group,
        animate: ({ elapsed, focus }) => {
          fire.scale.y = 1 + Math.sin(elapsed * 7) * 0.12 + focus * 0.14;
          fireLight.intensity = 1.2 + Math.sin(elapsed * 7.5) * 0.3 + focus * 0.85;
          dwarf.position.x = 1.5 + Math.cos(elapsed * 2.4) * 0.35 * focus;
          dwarf.position.z = -0.8 + Math.sin(elapsed * 2.4) * 0.35 * focus;
          dwarf.rotation.y = elapsed * (0.8 + focus * 1.8);
        },
      };
    }
    case 'name-reveal': {
      const room = createRoomShell(8.4, 5.6, 7.6, 0x342127);
      const throne = makeMesh(new THREE.BoxGeometry(1.8, 1.8, 1.2), 0x6f4e33, { emissive: 0x4b311c });
      const dwarf = createFigure(0x5e4016, 0xe1c996, 0.78, true);
      const letters = new THREE.Group();
      for (const [index, letter] of Array.from('RUMPEL').entries()) {
        const glyph = makeMesh(new THREE.BoxGeometry(0.36, 0.55, 0.12), 0xe0be63, { emissive: 0xa77b1d });
        glyph.position.set(-1.5 + index * 0.54, 3.3 + (letter.charCodeAt(0) % 3) * 0.06, 0.7);
        letters.add(glyph);
      }
      throne.position.set(0, 0.9, -2.1);
      dwarf.position.set(0, 0, 1.2);
      group.add(room, throne, dwarf, letters);

      return {
        id: section.id,
        group,
        animate: ({ elapsed, focus, active }) => {
          letters.children.forEach((child, index) => {
            child.position.y = 3.3 + Math.sin(elapsed * 2 + index * 0.5) * 0.12 * (0.3 + focus);
          });
          dwarf.rotation.y = Math.sin(elapsed * 3) * 0.25 * (0.4 + focus);
          group.position.y = anchor.y + (active ? Math.sin(elapsed * 1.2) * 0.06 : 0);
        },
      };
    }
    case 'floor-escape': {
      const room = createRoomShell(8, 5.2, 7.2, 0x291d20);
      const dwarf = createFigure(0x5a3911, 0xe1c186, 0.8, true);
      const crackA = makeMesh(new THREE.BoxGeometry(2.2, 0.04, 0.12), 0x090808);
      const crackB = makeMesh(new THREE.BoxGeometry(1.6, 0.04, 0.12), 0x090808);
      const crackC = makeMesh(new THREE.BoxGeometry(1.1, 0.04, 0.12), 0x090808);
      const embers = createSparkleCluster(lowPowerMode ? 18 : 28, 0xff9955);
      dwarf.position.set(0.1, 0, 0.6);
      crackA.position.set(0, 0.02, 0.5);
      crackB.position.set(-0.4, 0.02, 0.1);
      crackB.rotation.y = 0.9;
      crackC.position.set(0.7, 0.02, 0.2);
      crackC.rotation.y = -0.7;
      embers.position.set(0, 0.4, 0.35);
      group.add(room, dwarf, crackA, crackB, crackC, embers);

      return {
        id: section.id,
        group,
        animate: ({ elapsed, focus, sectionProgress }) => {
          const stomp = Math.max(focus, sectionProgress);
          dwarf.position.y = Math.abs(Math.sin(elapsed * 6.4)) * 0.4 * stomp;
          dwarf.rotation.z = Math.sin(elapsed * 5.6) * 0.22 * stomp;
          crackA.scale.x = 1 + stomp * 0.22;
          crackB.scale.x = 1 + stomp * 0.18;
          crackC.scale.x = 1 + stomp * 0.14;
          embers.rotation.y = elapsed * 0.8;
        },
      };
    }
  }

  return {
    id: section.id,
    group,
    animate: () => undefined,
  };
};

const createDustField = () => {
  const count = lowPowerMode ? 180 : 340;
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = THREE.MathUtils.randFloatSpread(72);
    positions[index * 3 + 1] = THREE.MathUtils.randFloat(0.5, 15);
    positions[index * 3 + 2] = THREE.MathUtils.randFloat(-190, 12);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xe4cfb1,
      size: lowPowerMode ? 0.06 : 0.085,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    }),
  );
};

const getVignettePass = () =>
  new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      offset: { value: 0.96 },
      darkness: { value: 1.24 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float offset;
      uniform float darkness;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        float dist = distance(vUv, vec2(0.5));
        float vignette = smoothstep(0.15, offset, dist * darkness);
        color.rgb *= mix(1.0, 0.22, vignette);
        gl_FragColor = color;
      }
    `,
  });

const createSceneGraph = () => {
  if (!scene) return;
  world = createStoryWorld(props.sections);
  sceneInstances = props.sections.map((section, index) => {
    const ratio = props.sections.length > 1 ? index / (props.sections.length - 1) : 0;
    const tangent = world.curve.getTangentAt(ratio);
    const instance = buildScene(section, world.anchors[index]!, tangent);
    scene?.add(instance.group);
    return instance;
  });
  dustField = createDustField();
  scene.add(dustField);
};

const resize = () => {
  if (!mount.value || !renderer || !camera || !composer) return;
  const width = mount.value.clientWidth;
  const height = mount.value.clientHeight;
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPowerMode ? 1.2 : 1.7));
  renderer.setSize(width, height);
  composer.setSize(width, height);
};

const render = () => {
  if (!scene || !camera || !renderer || !composer || !clock) return;

  const elapsed = clock.getElapsedTime();
  const activeIndex = props.sections.findIndex((section) => section.id === props.activeSectionId);
  const progressIndex = props.progress * Math.max(1, props.sections.length - 1);
  const cameraState = sampleStoryCamera(props.sections, world, props.progress);

  smoothedCameraPosition.lerp(cameraState.position, 0.08);
  smoothedCameraTarget.lerp(cameraState.target, 0.09);

  camera.position.copy(smoothedCameraPosition);
  camera.position.y += Math.sin(elapsed * 0.25 + progressIndex) * 0.12;
  camera.lookAt(smoothedCameraTarget);

  if (dustField) {
    dustField.rotation.y = elapsed * 0.015;
    dustField.position.x = Math.sin(elapsed * 0.08) * 3;
  }

  sceneInstances.forEach((instance, index) => {
    const focus = THREE.MathUtils.clamp(1 - Math.abs(progressIndex - index), 0, 1);
    const active = activeIndex === index;
    instance.group.position.y = world.anchors[index]!.y + focus * 0.08;
    instance.animate({
      elapsed,
      focus,
      sectionProgress: props.sectionProgress[instance.id] ?? 0,
      active,
    });
  });

  composer.render();
  frameId = window.requestAnimationFrame(render);
};

const setup = () => {
  if (!mount.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070403);
  scene.fog = new THREE.FogExp2(0x070403, 0.048);

  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 260);
  renderer = new THREE.WebGLRenderer({
    antialias: !lowPowerMode,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  mount.value.appendChild(renderer.domElement);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), lowPowerMode ? 0.35 : 0.58, 0.8, 0.72));
  composer.addPass(getVignettePass());

  scene.add(new THREE.AmbientLight(0xc6d0dd, 0.75));
  const moonLight = new THREE.DirectionalLight(0x90a6b5, 1.15);
  moonLight.position.set(-8, 12, 9);
  const warmLight = new THREE.DirectionalLight(0xffd4a5, 0.4);
  warmLight.position.set(7, 5, 5);
  scene.add(moonLight, warmLight);

  createSceneGraph();
  clock = new THREE.Clock();
  resize();

  const initialState = sampleStoryCamera(props.sections, world, props.progress);
  smoothedCameraPosition.copy(initialState.position);
  smoothedCameraTarget.copy(initialState.target);
  render();
};

const teardown = () => {
  window.cancelAnimationFrame(frameId);
  sceneInstances.forEach((instance) => {
    scene?.remove(instance.group);
  });
  sceneInstances = [];
  dustField?.geometry.dispose();
  if (dustField?.material instanceof THREE.Material) {
    dustField.material.dispose();
  }
  dustField = null;
  const disposableComposer = composer as EffectComposer & { dispose?: () => void };
  disposableComposer?.dispose?.();
  renderer?.dispose();
  renderer?.domElement.remove();
  composer = null;
  renderer = null;
  camera = null;
  scene = null;
  clock = null;
};

onMounted(() => {
  setup();
  window.addEventListener('resize', resize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  teardown();
});
</script>
