<template>
  <div>
    <PageHero :scene="ServicesScene" eyebrow="Services" title="Multidisciplinary design from product concept to digital experience." intro="FOOSH brings together product and graphic design, 3D modeling, animation, UI/UX, web, and game design to deliver clear, precise, and memorable work.">
      <div class="mt-10 grid border-l border-t border-white/15 md:grid-cols-2">
        <NuxtLink v-for="(item, index) in items" :key="item.to" :to="item.to" class="foosh-reveal min-h-48 border-b border-r border-white/15 bg-[#05070a]/60 p-6 transition-colors hover:bg-[#c8ff63]/10 focus-outline" :style="{ '--reveal-delay': `${180 + index * 65}ms` }"><span class="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#c8ff63]">Service 0{{ index + 1 }}</span><h2 class="mt-7 text-2xl font-bold tracking-[-0.04em]">{{ item.title }}</h2><p class="mt-2 leading-7 text-[#a9afac]">{{ item.text }}</p></NuxtLink>
      </div>
    </PageHero>
  </div>
</template>
<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import PageHero from '~/components/ui/PageHero.vue';
const ServicesScene = defineAsyncComponent(() => import('~/components/three/ServicesScene.client.vue'));
useSeoMeta({ title: 'Design Services — FOOSH', description: 'Product and graphic design, 3D modeling, 2D/3D animation, UI/UX, web design, and game asset and mechanics design.' });
const items = [
  { to: '/services/3d-modeling', title: 'Product & 3D Design', text: 'Product visualization, precise models, stylized forms, and game-ready assets.' },
  { to: '/services/3d-animation', title: '2D/3D Animation', text: 'Product animation, campaign motion, visual storytelling, and polished loops.' },
  { to: '/services/interactive-3d-websites', title: 'Game & Interactive Design', text: 'Game assets, mechanics, and responsive realtime experiences for the browser.' },
  { to: '/services/web-design', title: 'Web Design & UI/UX', text: 'Clear user journeys, responsive interfaces, and focused front-end delivery.' },
];
</script>
