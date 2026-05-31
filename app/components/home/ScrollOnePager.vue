<template>
  <section ref="root" class="scroll-onepager relative isolate overflow-hidden bg-[#030604] text-neutral-50">
    <div ref="stage" class="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
    <div class="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_76%_18%,rgba(197,255,64,0.13),transparent_27%),radial-gradient(circle_at_18%_72%,rgba(45,212,191,0.12),transparent_25%),linear-gradient(110deg,rgba(3,6,4,0.18),rgba(3,6,4,0.72)_78%)]" />

    <div class="fixed bottom-5 left-1/2 z-30 hidden -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur md:block">
      <ol class="flex items-center gap-2" aria-label="Flight path sections">
        <li v-for="(item, index) in flightItems" :key="item.id">
          <a
            :href="`#${item.id}`"
            class="section-dot block h-2.5 w-2.5 rounded-full border border-white/30 bg-white/10 transition-all duration-300 hover:border-lime-300 focus-outline motion-reduce:transition-none"
            :aria-label="item.navLabel"
            :data-dot="index"
          />
        </li>
      </ol>
    </div>

    <div class="relative z-10">
      <section
        v-for="(item, index) in flightItems"
        :id="item.id"
        :key="item.id"
        class="scroll-panel grid min-h-screen items-center px-4 py-24 sm:px-8 lg:px-10"
        :aria-labelledby="`${item.id}-title`"
        data-panel
      >
        <div class="mx-auto grid w-full max-w-[88rem] gap-8 lg:grid-cols-12 lg:items-end">
          <div :class="index % 2 === 0 ? 'lg:col-span-5' : 'lg:col-span-5 lg:col-start-8'">
            <p class="font-dm-mono text-xs uppercase tracking-[0.28em] text-lime-300" data-reveal>
              {{ item.eyebrow }}
            </p>
            <h1
              v-if="index === 0"
              :id="`${item.id}-title`"
              class="mt-4 max-w-5xl font-archivo-black text-[clamp(4rem,13vw,12rem)] leading-[0.78] tracking-[-0.08em] text-white"
              data-reveal
            >
              {{ item.title }}
            </h1>
            <h2
              v-else
              :id="`${item.id}-title`"
              class="mt-4 max-w-4xl font-archivo-black text-5xl leading-[0.86] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl"
              data-reveal
            >
              {{ item.title }}
            </h2>
            <p class="mt-7 max-w-xl text-base leading-7 text-neutral-200 sm:text-lg" data-reveal>
              {{ item.description }}
            </p>

            <div class="mt-8 flex flex-wrap gap-3" data-reveal>
              <NuxtLink
                v-if="item.link"
                :to="item.link.href"
                class="rounded-full border border-lime-300 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-lime-300 transition-colors hover:bg-lime-300 hover:text-neutral-950 focus-outline motion-reduce:transition-none"
              >
                {{ item.link.label }}
              </NuxtLink>
              <a
                v-if="item.email"
                :href="item.email.href"
                class="rounded-full border border-lime-300 bg-lime-300 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-950 transition-transform hover:-translate-y-0.5 focus-outline motion-reduce:transition-none"
              >
                {{ item.email.label }}
              </a>
              <span class="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-xs uppercase tracking-[0.2em] text-neutral-300 backdrop-blur">
                {{ item.category }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useGsap } from "~/composables/useGsap";
import { usePrefersReducedMotion } from "~/composables/usePrefersReducedMotion";

type FlightItem = {
  id: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  category: string;
  image: string;
  link?: { label: string; href: string };
  email?: { label: string; href: string };
};

type FlightPoint = {
  plane: { x: number; y: number; z: number };
  camera: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
};

type FlightPlane = {
  group: THREE.Group;
  imageMaterial: THREE.MeshBasicMaterial;
  frameMaterial: THREE.LineBasicMaterial;
  glowMaterial: THREE.MeshBasicMaterial;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
  floatOffset: number;
};

const root = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
const { loadGsap, trackAnimation, addCleanup } = useGsap();
const { prefersReducedMotion } = usePrefersReducedMotion();

const flightItems: FlightItem[] = [
  {
    id: "home",
    navLabel: "Intro",
    eyebrow: "Three.js flight path",
    title: "fly through the work",
    description: "Scroll forward and the camera moves through a field of image planes, landing on one piece at a time.",
    category: "3D onepager",
    image: "/img/bg/ap_fin_all_1.png",
    link: { label: "Enter archive", href: "/portfolio" },
  },
  {
    id: "about",
    navLabel: "About",
    eyebrow: "01 / visual systems",
    title: "images as spatial landmarks",
    description: "Each plane sits at a different depth, angle, and scale so the page behaves more like a camera move than a flat scroll.",
    category: "design + web",
    image: "/img/bg/ap_fin_all_2.png",
  },
  {
    id: "portfolio",
    navLabel: "Portfolio",
    eyebrow: "02 / selected work",
    title: "pass the first frame",
    description: "Project imagery becomes the navigation surface: foreground planes move past while distant frames wait in the fog.",
    category: "portfolio",
    image: "/img/bg/gallery1.png",
    link: { label: "Full archive", href: "/portfolio" },
  },
  {
    id: "motion",
    navLabel: "Motion",
    eyebrow: "03 / motion study",
    title: "drift, rotate, approach",
    description: "GSAP scrubs camera position and look-at targets while Three.js handles depth, parallax, image planes, and starfield motion.",
    category: "GSAP scroll",
    image: "/img/bg/cvike4.png",
  },
  {
    id: "field",
    navLabel: "Field",
    eyebrow: "04 / depth field",
    title: "the archive keeps going",
    description: "Extra frames sit off-axis to make the space feel larger than the viewport, with pointer movement adding a small handheld camera offset.",
    category: "interactive 3D",
    image: "/img/bg/cvike6.png",
  },
  {
    id: "contact",
    navLabel: "Contact",
    eyebrow: "05 / final approach",
    title: "land the idea",
    description: "The last camera stop pulls the field into alignment and leaves a clear action point for new work.",
    category: "contact",
    image: "/img/bg/ap_fin_wh_3.png",
    email: { label: "Start a project", href: "mailto:fooshmoola@gmail.com" },
  },
];

const flightPath: FlightPoint[] = [
  {
    plane: { x: -1.35, y: 0.35, z: -4.2 },
    camera: { x: -0.18, y: 0.22, z: 1.9 },
    rotation: { x: 0.02, y: 0.24, z: -0.06 },
  },
  {
    plane: { x: 2.35, y: -0.55, z: -10.4 },
    camera: { x: 1.85, y: -0.4, z: -5.75 },
    rotation: { x: -0.04, y: -0.34, z: 0.08 },
  },
  {
    plane: { x: -2.6, y: 1.0, z: -16.7 },
    camera: { x: -2.0, y: 0.78, z: -12.2 },
    rotation: { x: 0.03, y: 0.38, z: -0.05 },
  },
  {
    plane: { x: 3.15, y: 0.7, z: -23.2 },
    camera: { x: 2.48, y: 0.6, z: -18.85 },
    rotation: { x: -0.02, y: -0.42, z: 0.05 },
  },
  {
    plane: { x: -1.85, y: -1.05, z: -30.0 },
    camera: { x: -1.45, y: -0.86, z: -25.55 },
    rotation: { x: 0.05, y: 0.25, z: 0.1 },
  },
  {
    plane: { x: 0.35, y: 0.04, z: -37.5 },
    camera: { x: 0.1, y: 0.02, z: -33.0 },
    rotation: { x: 0.0, y: -0.05, z: -0.03 },
  },
];

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let galleryRoot: THREE.Group | null = null;
let starField: THREE.Points | null = null;
let frameId = 0;
let isVisible = true;
let pointerX = 0;
let pointerY = 0;
let clock = new THREE.Clock();
const cameraTarget = new THREE.Vector3(flightPath[0].plane.x, flightPath[0].plane.y, flightPath[0].plane.z);
const lookAtTarget = new THREE.Vector3();
const flightPlanes: FlightPlane[] = [];
const loadedTextures: THREE.Texture[] = [];

const createStarField = () => {
  const count = 1500;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const colorA = new THREE.Color(0xd9ff66);
  const colorB = new THREE.Color(0x74f7d0);

  for (let index = 0; index < count; index += 1) {
    const positionIndex = index * 3;
    const depth = THREE.MathUtils.randFloat(-43, 2);
    const spread = THREE.MathUtils.mapLinear(depth, 2, -43, 7, 18);
    positions[positionIndex] = THREE.MathUtils.randFloatSpread(spread);
    positions[positionIndex + 1] = THREE.MathUtils.randFloatSpread(spread * 0.55);
    positions[positionIndex + 2] = depth;

    const color = colorA.clone().lerp(colorB, Math.random());
    colors[positionIndex] = color.r;
    colors[positionIndex + 1] = color.g;
    colors[positionIndex + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.74,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
};

const createImagePlane = (item: FlightItem, point: FlightPoint, index: number) => {
  const textureLoader = new THREE.TextureLoader();
  const group = new THREE.Group();
  const basePosition = new THREE.Vector3(point.plane.x, point.plane.y, point.plane.z);
  const baseRotation = new THREE.Euler(point.rotation.x, point.rotation.y, point.rotation.z);
  const planeGeometry = new THREE.PlaneGeometry(4.35, 2.75, 1, 1);
  const glowGeometry = new THREE.PlaneGeometry(4.85, 3.22, 1, 1);
  const frameGeometry = new THREE.EdgesGeometry(planeGeometry);

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: index % 2 === 0 ? 0xd9ff66 : 0x64f4d0,
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const imageMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: index === 0 ? 0.98 : 0.52,
    side: THREE.DoubleSide,
  });
  const frameMaterial = new THREE.LineBasicMaterial({
    color: index % 2 === 0 ? 0xd9ff66 : 0x64f4d0,
    transparent: true,
    opacity: index === 0 ? 0.82 : 0.28,
  });

  const texture = textureLoader.load(item.image, (loaded) => {
    loaded.colorSpace = THREE.SRGBColorSpace;
    loaded.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy() ?? 4, 8);
    imageMaterial.map = loaded;
    imageMaterial.needsUpdate = true;
  });

  loadedTextures.push(texture);

  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  const image = new THREE.Mesh(planeGeometry, imageMaterial);
  const frame = new THREE.LineSegments(frameGeometry, frameMaterial);
  glow.position.z = -0.04;
  frame.position.z = 0.025;

  group.position.copy(basePosition);
  group.rotation.copy(baseRotation);
  group.scale.setScalar(index === 0 ? 1.08 : 0.84);
  group.add(glow, image, frame);

  galleryRoot?.add(group);

  return {
    group,
    imageMaterial,
    frameMaterial,
    glowMaterial,
    basePosition,
    baseRotation,
    floatOffset: index * 0.84,
  } satisfies FlightPlane;
};

const setupScene = () => {
  if (!stage.value) return;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x030604, 0);
  stage.value.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030604, 0.026);

  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 90);
  camera.position.set(flightPath[0].camera.x, flightPath[0].camera.y, flightPath[0].camera.z);

  const ambient = new THREE.AmbientLight(0xffffff, 0.38);
  const laneLight = new THREE.PointLight(0xd9ff66, 4.5, 38);
  const cyanLight = new THREE.PointLight(0x64f4d0, 3.2, 34);
  laneLight.position.set(-2, 2, -8);
  cyanLight.position.set(3, -1.6, -18);
  scene.add(ambient, laneLight, cyanLight);

  galleryRoot = new THREE.Group();
  starField = createStarField();
  galleryRoot.add(starField);
  scene.add(galleryRoot);

  flightItems.forEach((item, index) => {
    flightPlanes.push(createImagePlane(item, flightPath[index], index));
  });
};

const resize = () => {
  if (!renderer || !camera) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
};

const render = () => {
  if (!renderer || !scene || !camera || !galleryRoot) return;
  if (!isVisible) return;

  const elapsed = clock.getElapsedTime();
  const pointerLift = prefersReducedMotion.value ? 0 : 1;

  galleryRoot.rotation.y += (pointerX * 0.035 - galleryRoot.rotation.y) * 0.04;
  galleryRoot.rotation.x += (-pointerY * 0.025 - galleryRoot.rotation.x) * 0.04;

  flightPlanes.forEach((plane, index) => {
    const float = Math.sin(elapsed * 0.72 + plane.floatOffset) * 0.045 * pointerLift;
    plane.group.position.y = plane.basePosition.y + float;
    plane.group.rotation.x = plane.baseRotation.x + Math.sin(elapsed * 0.45 + index) * 0.01 * pointerLift;
    plane.group.rotation.y = plane.baseRotation.y + Math.cos(elapsed * 0.38 + index) * 0.012 * pointerLift;
  });

  if (starField) {
    starField.rotation.y -= 0.00045;
    starField.rotation.x += 0.00018;
  }

  lookAtTarget.set(
    cameraTarget.x + pointerX * 0.22,
    cameraTarget.y - pointerY * 0.16,
    cameraTarget.z,
  );
  camera.lookAt(lookAtTarget);
  renderer.render(scene, camera);
  frameId = window.requestAnimationFrame(render);
};

const start = () => {
  if (frameId !== 0) return;
  frameId = window.requestAnimationFrame(render);
};

const stop = () => {
  if (frameId === 0) return;
  window.cancelAnimationFrame(frameId);
  frameId = 0;
};

const setActivePlane = (index: number, gsap: Awaited<ReturnType<typeof loadGsap>>["gsap"]) => {
  flightPlanes.forEach((plane, planeIndex) => {
    const isActive = planeIndex === index;
    gsap.to(plane.group.scale, {
      x: isActive ? 1.16 : 0.82,
      y: isActive ? 1.16 : 0.82,
      z: isActive ? 1.16 : 0.82,
      duration: 0.45,
      ease: "power2.out",
      overwrite: true,
    });
    gsap.to(plane.imageMaterial, {
      opacity: isActive ? 0.98 : 0.5,
      duration: 0.45,
      overwrite: true,
    });
    gsap.to(plane.frameMaterial, {
      opacity: isActive ? 0.88 : 0.24,
      duration: 0.45,
      overwrite: true,
    });
    gsap.to(plane.glowMaterial, {
      opacity: isActive ? 0.18 : 0.055,
      duration: 0.45,
      overwrite: true,
    });
  });
};

const setupScroll = async () => {
  if (!root.value || !camera || !galleryRoot || flightPlanes.length === 0) return;

  const { gsap, ScrollTrigger } = await loadGsap();
  const panelElements = Array.from(root.value.querySelectorAll<HTMLElement>("[data-panel]"));
  const dotElements = Array.from(root.value.querySelectorAll<HTMLElement>("[data-dot]"));

  gsap.set(dotElements[0], { scale: 1.65, backgroundColor: "#d9ff66", borderColor: "#d9ff66" });
  setActivePlane(0, gsap);

  if (!prefersReducedMotion.value) {
    const master = gsap.timeline({
      defaults: { ease: "power1.inOut" },
      scrollTrigger: {
        trigger: root.value,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.15,
      },
    });

    flightPath.slice(1).forEach((point, index) => {
      const position = index;
      master
        .to(camera.position, { ...point.camera, duration: 1 }, position)
        .to(cameraTarget, { ...point.plane, duration: 1 }, position)
        .to(galleryRoot.rotation, { z: index % 2 === 0 ? -0.025 : 0.025, duration: 1 }, position);
    });

    trackAnimation(master);
  }

  panelElements.forEach((panel, index) => {
    if (!prefersReducedMotion.value) {
      const revealItems = panel.querySelectorAll("[data-reveal]");
      const reveal = gsap.fromTo(
        revealItems,
        { autoAlpha: 0, y: 34, filter: "blur(10px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: panel,
            start: "top 62%",
            end: "top 18%",
            toggleActions: "play none none reverse",
          },
        },
      );
      trackAnimation(reveal);
    }

    const active = ScrollTrigger.create({
      trigger: panel,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (!self.isActive) return;

        setActivePlane(index, gsap);
        dotElements.forEach((dot, dotIndex) => {
          gsap.to(dot, {
            scale: dotIndex === index ? 1.65 : 1,
            backgroundColor: dotIndex === index ? "#d9ff66" : "rgba(255,255,255,0.1)",
            borderColor: dotIndex === index ? "#d9ff66" : "rgba(255,255,255,0.3)",
            duration: 0.25,
            overwrite: true,
          });
        });
      },
    });
    addCleanup(() => active.kill());
  });

  requestAnimationFrame(() => ScrollTrigger.refresh());
};

const onPointerMove = (event: PointerEvent) => {
  pointerX = (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
  pointerY = (event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
};

const onVisibilityChange = () => {
  isVisible = !document.hidden;
  if (isVisible) {
    start();
  } else {
    stop();
  }
};

const disposeNode = (node: THREE.Object3D) => {
  const mesh = node as THREE.Mesh;
  const line = node as THREE.LineSegments;
  const points = node as THREE.Points;
  const geometry = mesh.geometry ?? line.geometry ?? points.geometry;
  const material = mesh.material ?? line.material ?? points.material;

  geometry?.dispose?.();

  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
  } else {
    material?.dispose?.();
  }
};

onMounted(async () => {
  setupScene();
  resize();
  start();
  await setupScroll();

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
});

onBeforeUnmount(() => {
  stop();
  window.removeEventListener("resize", resize);
  window.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("visibilitychange", onVisibilityChange);

  galleryRoot?.traverse(disposeNode);
  loadedTextures.forEach((texture) => texture.dispose());
  renderer?.dispose();

  if (renderer?.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  renderer = null;
  scene = null;
  camera = null;
  galleryRoot = null;
  starField = null;
  flightPlanes.length = 0;
  loadedTextures.length = 0;
});
</script>

<style scoped>
.scroll-onepager {
  min-height: 600vh;
}

.scroll-panel {
  position: relative;
}

.scroll-panel::before {
  content: "";
  position: absolute;
  inset: 8rem 1rem 2rem;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.055);
  opacity: 0.64;
}

.scroll-panel::after {
  content: "";
  position: absolute;
  inset: auto 1rem 2rem;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(217, 255, 102, 0.42), transparent);
}

@media (max-width: 767px) {
  .scroll-panel::before {
    inset: 7rem 0.75rem 1rem;
  }
}
</style>
