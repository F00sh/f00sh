<template>
  <div>
    <PageHero :scene="ServicesScene" eyebrow="Services" title="Creative services for 3D, animation and interactive web." intro="FOOSH combines visual design, 3D production, animation and modern web development to create clear, memorable digital experiences.">
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
useSeoMeta({ title: 'Services — FOOSH', description: '3D modeling, animation, interactive 3D websites, and web design services by FOOSH.' });
const items = [
  { to: '/services/3d-modeling', title: '3D Modeling', text: 'Web-ready assets, product visualization, stylized models.' },
  { to: '/services/3d-animation', title: '3D Animation', text: 'Motion storytelling, product and logo animation.' },
  { to: '/services/interactive-3d-websites', title: 'Interactive 3D Websites', text: 'Three.js websites and browser-based 3D apps.' },
  { to: '/services/web-design', title: 'Web Design & Nuxt Development', text: 'Clean structure, motion, SEO and responsive delivery.' },
];
</script>
