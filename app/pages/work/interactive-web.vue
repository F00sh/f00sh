<template>
  <div>
    <PageHero
      :scene="WorkScene"
      eyebrow="Work"
      title="Interactive Web Projects"
      intro="Realtime 3D and interactive experiences built for speed, clarity, and visual impact."
    >
      <div class="mt-10 grid border-l border-t border-white/15 md:grid-cols-2">
        <NuxtLink
          v-for="(project, index) in projects"
          :key="project.title"
          :to="project.link"
          class="foosh-reveal block min-h-48 border-b border-r border-white/15 bg-[#05070a]/60 p-6 transition-colors hover:bg-[#c8ff63]/10 focus-outline"
          :style="{ '--reveal-delay': `${180 + index * 65}ms` }"
        >
          <p class="text-xs font-bold uppercase tracking-[0.12em] text-[#c8ff63]">{{ project.category }}</p>
          <h2 class="mt-3 text-2xl font-bold tracking-[-0.04em]">{{ project.title }}</h2>
          <p class="mt-2 leading-7 text-[#a9afac]">{{ project.text }}</p>
        </NuxtLink>
      </div>
    </PageHero>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import PageHero from '~/components/ui/PageHero.vue';

const WorkScene = defineAsyncComponent(() => import('~/components/three/WorkScene.client.vue'));

useSeoMeta({
  title: 'Interactive Web Projects — FOOSH',
  description: 'Interactive web projects by FOOSH, including Echo Sphere, Sound Surfer, TOPO, and realtime 3D experiences.',
});

const projects = [
  {
    category: 'Procedural WebGL Tool',
    title: 'TOPO',
    text: 'A procedural and heightmap-driven cartography tool that turns elevation data into layered wireframe terrain.',
    link: '/topo',
  },
  {
    category: 'Interactive 3D Application',
    title: 'Echo Sphere',
    text: 'Audio-reactive wireframe sphere with realtime deformation, particles, and microphone input.',
    link: '/work/echo-sphere',
  },
  {
    category: 'Interactive Audio Experience',
    title: 'Sound Surfer',
    text: 'An audio-reactive surfing experience where sound energy drives motion, waves, and visual feedback.',
    link: '/work/sound-surfer',
  },
  {
    category: 'Interactive 3D Game',
    title: 'Kinetic Sphere',
    text: 'Click-driven interaction pushes a sphere through endless procedural wireframe terrain.',
    link: '/work/kinetic-sphere',
  },
];
</script>
