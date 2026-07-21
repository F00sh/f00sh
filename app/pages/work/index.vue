<template>
  <div>
    <PageHero :scene="WorkScene" eyebrow="Work" title="Selected work in 3D, animation and interactive design." intro="Interactive websites, product visualization and motion systems built to be sharp and performant.">
      <div class="mt-10 grid border-l border-t border-white/15 md:grid-cols-2">
        <NuxtLink
          v-for="(project, index) in projects"
          :key="project.title"
          :to="project.link || '/work'"
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
useSeoMeta({ title: 'Work — FOOSH', description: 'Portfolio projects across 3D modeling, animation and interactive web experiences.' });
const projects = [
  { category: 'Interactive Web', title: 'Interactive Web Projects', text: 'Browser-based 3D experiences, audio-reactive scenes and WebGL interfaces.', link: '/work/interactive-web' },
  { category: 'Procedural WebGL', title: 'TOPO', text: 'A heightmap-driven cartography tool for layered wireframe terrain.', link: '/topo' },
  { category: 'Audio Reactive', title: 'Echo Sphere', text: 'Realtime deformation, particles, and microphone-driven visual feedback.', link: '/work/echo-sphere' },
  { category: 'Interactive Audio', title: 'Sound Surfer', text: 'A sound-driven surfing environment with responsive waves and motion.', link: '/work/sound-surfer' },
  { category: '3D Interaction', title: 'Kinetic Sphere', text: 'A tactile sphere pushed through an endless procedural environment.', link: '/work/kinetic-sphere' },
];
</script>
