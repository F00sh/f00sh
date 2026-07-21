<template>
  <PageHero
    :scene="AboutScene"
    eyebrow="About"
    title="Versatile product design across physical, digital and interactive experiences."
    intro="FOOSH is the independent practice of Marko Vilipić, a Croatia-based designer with a bachelor’s degree in product design and a strong foundation in art and design. From precise product and graphic work to 3D, animation, UI/UX, web and games, every project is shaped around a clear idea and effective execution."
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
  'Product and graphic design',
  '3D modeling and product visualization',
  '2D/3D animation and visual storytelling',
  'Web design, UI/UX, HTML and CSS',
  'Game assets and mechanics design',
  'Adobe Creative Suite, Blender and Figma',
  'Revit and AutoCAD',
  'Croatia-based, remote-friendly collaboration',
];

useSeoMeta({ title: 'About — FOOSH', description: 'Meet FOOSH, a Croatia-based product designer working across graphic design, 3D, animation, UI/UX, web, and game design.' });
</script>
