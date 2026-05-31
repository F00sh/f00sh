<template>
  <section ref="root" class="scroll-onepager relative isolate overflow-hidden bg-[#050704] text-neutral-50">
    <div ref="stage" class="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
    <div class="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_72%_18%,rgba(197,255,64,0.18),transparent_28%),radial-gradient(circle_at_15%_70%,rgba(45,212,191,0.14),transparent_24%),linear-gradient(120deg,rgba(5,7,4,0.35),rgba(5,7,4,0.9)_78%)]" />

    <div class="fixed bottom-5 left-1/2 z-30 hidden -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur md:block">
      <ol class="flex items-center gap-2" aria-label="Page sections">
        <li v-for="(panel, index) in panels" :key="panel.id">
          <a
            :href="`#${panel.id}`"
            class="section-dot block h-2.5 w-2.5 rounded-full border border-white/30 bg-white/10 transition-all duration-300 hover:border-lime-300 focus-outline motion-reduce:transition-none"
            :aria-label="panel.label"
            :data-dot="index"
          />
        </li>
      </ol>
    </div>

    <div class="relative z-10">
      <section
        id="home"
        class="scroll-panel grid min-h-screen items-end px-4 pb-14 pt-32 sm:px-8 lg:px-10"
        aria-labelledby="home-title"
        data-panel
      >
        <div class="mx-auto grid w-full max-w-[88rem] gap-10 lg:grid-cols-12 lg:items-end">
          <div class="lg:col-span-8">
            <p class="font-dm-mono text-xs uppercase tracking-[0.28em] text-lime-300" data-reveal>
              Three.js / GSAP / scroll system
            </p>
            <h1 id="home-title" class="mt-4 max-w-6xl font-archivo-black text-[clamp(4rem,14vw,13rem)] leading-[0.78] tracking-[-0.08em] text-white" data-reveal>
              f00sh in motion
            </h1>
          </div>

          <div class="max-w-md lg:col-span-4" data-reveal>
            <p class="text-base leading-7 text-neutral-200 sm:text-lg">
              A one-page interactive portfolio where the WebGL scene changes camera, materials, and layout as the page moves.
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
              <a href="#portfolio" class="rounded-full border border-lime-300 bg-lime-300 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-950 transition-transform hover:-translate-y-0.5 focus-outline motion-reduce:transition-none">
                Explore work
              </a>
              <a href="#contact" class="rounded-full border border-white/20 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:border-white/60 focus-outline">
                Start project
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        class="scroll-panel grid min-h-screen items-center px-4 py-24 sm:px-8 lg:px-10"
        aria-labelledby="about-title"
        data-panel
      >
        <div class="mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-12 lg:items-center">
          <div class="lg:col-span-5 lg:col-start-8">
            <p class="font-dm-mono text-xs uppercase tracking-[0.28em] text-teal-200" data-reveal>
              01 / creative system
            </p>
            <h2 id="about-title" class="mt-4 font-archivo-black text-5xl leading-[0.86] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl" data-reveal>
              Strategy becomes geometry.
            </h2>
            <p class="mt-7 text-base leading-7 text-neutral-200 sm:text-lg" data-reveal>
              Interfaces, product visuals, animation, 3D assets, and web builds are treated as one connected visual system.
            </p>
            <dl class="mt-8 grid grid-cols-2 gap-3" data-reveal>
              <div v-for="metric in metrics" :key="metric.label" class="border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                <dt class="text-xs uppercase tracking-[0.2em] text-neutral-400">{{ metric.label }}</dt>
                <dd class="mt-3 font-archivo-black text-4xl text-white">{{ metric.value }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        id="portfolio"
        class="scroll-panel grid min-h-screen items-center px-4 py-24 sm:px-8 lg:px-10"
        aria-labelledby="portfolio-title"
        data-panel
      >
        <div class="mx-auto grid w-full max-w-[88rem] gap-10 lg:grid-cols-12 lg:items-end">
          <div class="lg:col-span-5">
            <p class="font-dm-mono text-xs uppercase tracking-[0.28em] text-lime-300" data-reveal>
              02 / selected work
            </p>
            <h2 id="portfolio-title" class="mt-4 font-archivo-black text-5xl leading-[0.86] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl" data-reveal>
              Scroll through the archive.
            </h2>
            <p class="mt-7 max-w-lg text-base leading-7 text-neutral-200 sm:text-lg" data-reveal>
              The 3D cards use the same project imagery as the portfolio, then orbit into focus during this section.
            </p>
            <NuxtLink to="/portfolio" class="mt-8 inline-flex rounded-full border border-lime-300 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-lime-300 transition-colors hover:bg-lime-300 hover:text-neutral-950 focus-outline motion-reduce:transition-none" data-reveal>
              Full archive
            </NuxtLink>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:col-span-5 lg:col-start-8" data-reveal>
            <article
              v-for="project in homeProjects"
              :key="project.id"
              class="group border border-white/10 bg-black/30 p-4 backdrop-blur transition-colors hover:border-lime-300/70 motion-reduce:transition-none"
            >
              <p class="text-xs uppercase tracking-[0.2em] text-neutral-400">{{ project.category }}</p>
              <h3 class="mt-3 text-2xl font-black uppercase tracking-[-0.03em] text-white">{{ project.title }}</h3>
              <p class="mt-3 text-sm leading-6 text-neutral-300">{{ project.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <section
        id="contact"
        class="scroll-panel grid min-h-screen items-end px-4 pb-16 pt-24 sm:px-8 lg:px-10"
        aria-labelledby="contact-title"
        data-panel
      >
        <div class="mx-auto w-full max-w-[88rem]">
          <p class="font-dm-mono text-xs uppercase tracking-[0.28em] text-lime-300" data-reveal>
            03 / launch
          </p>
          <h2 id="contact-title" class="mt-4 max-w-6xl font-archivo-black text-[clamp(3.4rem,9vw,9rem)] leading-[0.82] tracking-[-0.07em] text-white" data-reveal>
            Build the strange idea cleanly.
          </h2>
          <div class="mt-10 grid gap-4 md:grid-cols-3" data-reveal>
            <a
              v-for="item in contactLinks"
              :key="item.href"
              :href="item.href"
              :target="item.external ? '_blank' : undefined"
              :rel="item.external ? 'noopener noreferrer' : undefined"
              class="group border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-lime-300/70 focus-outline motion-reduce:transition-none"
            >
              <span class="block text-xs uppercase tracking-[0.22em] text-neutral-400">{{ item.label }}</span>
              <span class="mt-3 block text-xl font-black uppercase text-white group-hover:text-lime-300 sm:text-2xl">{{ item.value }}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { homeProjects } from "~/data/projects";
import { useGsap } from "~/composables/useGsap";
import { usePrefersReducedMotion } from "~/composables/usePrefersReducedMotion";

const root = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
const { loadGsap, trackAnimation, addCleanup } = useGsap();
const { prefersReducedMotion } = usePrefersReducedMotion();

const panels = [
  { id: "home", label: "Intro" },
  { id: "about", label: "About" },
  { id: "portfolio", label: "Portfolio" },
  { id: "contact", label: "Contact" },
];

const metrics = [
  { label: "Disciplines", value: "08" },
  { label: "Modes", value: "3D" },
  { label: "Focus", value: "UI" },
  { label: "Flow", value: "GSAP" },
];

const contactLinks = [
  { label: "Email", value: "fooshmoola@gmail.com", href: "mailto:fooshmoola@gmail.com", external: false },
  { label: "Behance", value: "FOOSH", href: "https://www.behance.net/FOOSH", external: true },
  { label: "LinkedIn", value: "Marko Vilipic", href: "https://www.linkedin.com/in/marko-vilipi%C4%87-b06a20321/", external: true },
];

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let frameId = 0;
let isVisible = true;
let sceneRoot: THREE.Group | null = null;
let tiltRoot: THREE.Group | null = null;
let ringGroup: THREE.Group | null = null;
let cardsGroup: THREE.Group | null = null;
let coreMesh: THREE.Mesh | null = null;
let coreWire: THREE.LineSegments | null = null;
let particles: THREE.Points | null = null;
let pointerX = 0;
let pointerY = 0;
let clock = new THREE.Clock();
const cardMaterials: THREE.MeshStandardMaterial[] = [];
const loadedTextures: THREE.Texture[] = [];

const setOpacity = (group: THREE.Group | null, opacity: number) => {
  group?.traverse((node) => {
    const mesh = node as THREE.Mesh;
    const material = mesh.material;
    if (!material) return;

    const materials = Array.isArray(material) ? material : [material];
    for (const item of materials) {
      if ("opacity" in item) {
        item.transparent = true;
        item.opacity = opacity;
      }
    }
  });
};

const createParticles = () => {
  const count = 720;
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const radius = THREE.MathUtils.randFloat(3.8, 8.5);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    const positionIndex = index * 3;

    positions[positionIndex] = radius * Math.sin(phi) * Math.cos(theta);
    positions[positionIndex + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[positionIndex + 2] = radius * Math.cos(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xd9ff66,
    size: 0.025,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
};

const createRings = () => {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xd9ff66,
    emissive: 0x385a10,
    emissiveIntensity: 0.55,
    roughness: 0.24,
    metalness: 0.72,
    transparent: true,
    opacity: 0.72,
  });

  for (let index = 0; index < 4; index += 1) {
    const geometry = new THREE.TorusGeometry(1.65 + index * 0.34, 0.015 + index * 0.003, 12, 128);
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = Math.PI * 0.5 + index * 0.38;
    ring.rotation.y = index * 0.75;
    group.add(ring);
  }

  return group;
};

const createCards = () => {
  const textureLoader = new THREE.TextureLoader();
  const group = new THREE.Group();
  const cardGeometry = new THREE.PlaneGeometry(1.65, 1.18, 1, 1);
  const frameGeometry = new THREE.EdgesGeometry(cardGeometry);

  homeProjects.forEach((project, index) => {
    const cardGroup = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.62,
      metalness: 0.05,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const texture = textureLoader.load(project.image, (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy() ?? 4, 8);
      material.map = loaded;
      material.needsUpdate = true;
    });

    loadedTextures.push(texture);
    cardMaterials.push(material);

    const card = new THREE.Mesh(cardGeometry, material);
    const frame = new THREE.LineSegments(
      frameGeometry,
      new THREE.LineBasicMaterial({ color: 0xd9ff66, transparent: true, opacity: 0 }),
    );

    const angle = (index / homeProjects.length) * Math.PI * 2;
    cardGroup.position.set(Math.cos(angle) * 2.35, Math.sin(angle * 1.4) * 0.55, Math.sin(angle) * 2.35);
    cardGroup.rotation.y = -angle + Math.PI * 0.5;
    cardGroup.rotation.z = THREE.MathUtils.degToRad(index % 2 === 0 ? -4 : 4);
    cardGroup.add(card, frame);
    group.add(cardGroup);
  });

  group.scale.setScalar(0.85);
  setOpacity(group, 0);

  return group;
};

const setupScene = () => {
  if (!stage.value) return;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x050704, 0);
  stage.value.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050704, 0.045);

  camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.2, 8.2);

  const ambient = new THREE.AmbientLight(0x9fffa5, 0.55);
  const key = new THREE.DirectionalLight(0xe9ffab, 2.2);
  const rim = new THREE.PointLight(0x2dd4bf, 6, 24);
  key.position.set(3.4, 4, 5);
  rim.position.set(-3.2, -1.5, 4.5);
  scene.add(ambient, key, rim);

  sceneRoot = new THREE.Group();
  tiltRoot = new THREE.Group();
  ringGroup = createRings();
  cardsGroup = createCards();
  particles = createParticles();

  const coreGeometry = new THREE.IcosahedronGeometry(1.25, 5);
  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd7ff55,
    emissive: 0x1f3508,
    emissiveIntensity: 0.45,
    roughness: 0.18,
    metalness: 0.55,
    clearcoat: 0.5,
    transparent: true,
    opacity: 0.92,
  });
  const wireGeometry = new THREE.WireframeGeometry(coreGeometry);
  const wireMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.28,
  });

  coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
  coreWire = new THREE.LineSegments(wireGeometry, wireMaterial);

  sceneRoot.add(particles);
  sceneRoot.add(ringGroup);
  sceneRoot.add(coreMesh);
  sceneRoot.add(coreWire);
  sceneRoot.add(cardsGroup);
  tiltRoot.add(sceneRoot);
  scene.add(tiltRoot);
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
  if (!renderer || !scene || !camera || !sceneRoot || !tiltRoot) return;
  if (!isVisible) return;

  const elapsed = clock.getElapsedTime();
  const float = prefersReducedMotion.value ? 0 : Math.sin(elapsed * 0.75) * 0.045;

  tiltRoot.rotation.y += (pointerX * 0.2 - tiltRoot.rotation.y) * 0.06;
  tiltRoot.rotation.x += (-pointerY * 0.16 - tiltRoot.rotation.x) * 0.06;
  sceneRoot.position.y = float;

  if (coreMesh) {
    coreMesh.rotation.x += 0.0025;
    coreMesh.rotation.y += 0.0035;
  }

  if (coreWire) {
    coreWire.rotation.x -= 0.0015;
    coreWire.rotation.y += 0.002;
  }

  if (ringGroup) {
    ringGroup.rotation.z += 0.002;
    ringGroup.rotation.y -= 0.0014;
  }

  if (cardsGroup) {
    cardsGroup.rotation.y += 0.0016;
  }

  if (particles) {
    particles.rotation.y -= 0.0006;
  }

  camera.lookAt(0, 0, 0);
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

const setupScroll = async () => {
  if (!root.value || prefersReducedMotion.value || !camera || !sceneRoot || !ringGroup || !cardsGroup || !coreMesh || !particles) {
    return;
  }

  const { gsap, ScrollTrigger } = await loadGsap();
  const panelElements = Array.from(root.value.querySelectorAll<HTMLElement>("[data-panel]"));
  const dotElements = Array.from(root.value.querySelectorAll<HTMLElement>("[data-dot]"));
  const coreMaterial = coreMesh.material as THREE.MeshPhysicalMaterial;
  const particleMaterial = particles.material as THREE.PointsMaterial;

  gsap.set(dotElements[0], { scale: 1.65, backgroundColor: "#d9ff66", borderColor: "#d9ff66" });

  const master = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: root.value,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.1,
    },
  });

  master
    .to(camera.position, { x: -1.15, y: 0.28, z: 6.1, duration: 1 }, 0)
    .to(sceneRoot.rotation, { x: -0.35, y: 0.85, z: 0.12, duration: 1 }, 0)
    .to(ringGroup.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 1 }, 0)
    .to(coreMaterial.color, { r: 0.19, g: 0.84, b: 0.75, duration: 1 }, 0)
    .to(particleMaterial.color, { r: 0.55, g: 1, b: 0.84, duration: 1 }, 0)
    .to(camera.position, { x: 1.35, y: 0.1, z: 7.4, duration: 1 }, 1)
    .to(sceneRoot.rotation, { x: 0.24, y: -1.05, z: -0.08, duration: 1 }, 1)
    .to(coreMesh.scale, { x: 0.54, y: 0.54, z: 0.54, duration: 1 }, 1)
    .to(ringGroup.scale, { x: 0.78, y: 0.78, z: 0.78, duration: 1 }, 1)
    .to(cardsGroup.scale, { x: 1.06, y: 1.06, z: 1.06, duration: 1 }, 1)
    .to(cardMaterials, { opacity: 0.9, duration: 0.55, stagger: 0.04 }, 1.1)
    .to(
      cardsGroup.children
        .flatMap((child) => child.children)
        .map((child) => child as THREE.LineSegments)
        .filter((child) => child.material instanceof THREE.LineBasicMaterial)
        .map((child) => child.material as THREE.LineBasicMaterial),
      { opacity: 0.65, duration: 0.55, stagger: 0.04 },
      1.1,
    )
    .to(camera.position, { x: 0, y: 0.36, z: 5.4, duration: 1 }, 2)
    .to(sceneRoot.rotation, { x: 0.05, y: 0.25, z: 0.35, duration: 1 }, 2)
    .to(coreMesh.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 1 }, 2)
    .to(cardsGroup.scale, { x: 0.48, y: 0.48, z: 0.48, duration: 1 }, 2)
    .to(cardMaterials, { opacity: 0.28, duration: 0.5 }, 2)
    .to(coreMaterial.color, { r: 0.85, g: 1, b: 0.34, duration: 1 }, 2)
    .to(particles.scale, { x: 1.38, y: 1.38, z: 1.38, duration: 1 }, 2)
    .to(particleMaterial, { opacity: 0.95, duration: 1 }, 2);

  trackAnimation(master);

  panelElements.forEach((panel, index) => {
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

    const active = ScrollTrigger.create({
      trigger: panel,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (!self.isActive) return;

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

  sceneRoot?.traverse(disposeNode);
  loadedTextures.forEach((texture) => texture.dispose());
  renderer?.dispose();

  if (renderer?.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  renderer = null;
  scene = null;
  camera = null;
  sceneRoot = null;
  tiltRoot = null;
  ringGroup = null;
  cardsGroup = null;
  coreMesh = null;
  coreWire = null;
  particles = null;
  cardMaterials.length = 0;
  loadedTextures.length = 0;
});
</script>

<style scoped>
.scroll-onepager {
  min-height: 400vh;
}

.scroll-panel {
  position: relative;
}

.scroll-panel::before {
  content: "";
  position: absolute;
  inset: 9rem 1rem 2rem;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.055);
  opacity: 0.75;
}

@media (max-width: 767px) {
  .scroll-panel::before {
    inset: 7rem 0.75rem 1rem;
  }
}
</style>
