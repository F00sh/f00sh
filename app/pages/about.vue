<template>
  <PageHero
    :scene="AboutScene"
    eyebrow="About"
    title="Product design, 3D, animation and web—connected through visual thinking."
    intro="FOOSH is the independent creative practice of Marko Vilipić, combining product design experience with 3D production, motion, and interactive Nuxt development."
  >
    <ul class="mt-10 grid border-l border-t border-white/15 text-[#d7d9e7] md:grid-cols-2">
      <li
        v-for="(capability, index) in capabilities"
        :key="capability"
        class="foosh-reveal flex min-h-24 items-center gap-4 border-b border-r border-white/15 bg-[#05070a]/60 p-5 leading-6"
        :style="{ '--reveal-delay': `${180 + index * 55}ms` }"
      >
        <span class="h-2 w-2 shrink-0 bg-[#c8ff63]" aria-hidden="true" />
        {{ capability }}
      </li>
    </ul>
  </PageHero>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import PageHero from '~/components/ui/PageHero.vue';

const AboutScene = defineAsyncComponent(() => import('~/components/three/AboutScene.client.vue'));
const capabilities = [
  'Product and industrial design background',
  '3D visualization and web-ready assets',
  'Three.js and Nuxt interactive experiences',
  'Motion design and visual storytelling',
  'Croatia-based, remote-friendly collaboration',
  'Practical, performance-aware creative development',
];

useSeoMeta({ title: 'About — FOOSH', description: 'About FOOSH: product design background, 3D, animation, and interactive web development.' });
</script>
