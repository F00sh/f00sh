<template>
  <ServiceDetail
    eyebrow="Services · Interactive 3D"
    title="Realtime worlds made easy to explore."
    intro="Three.js and Nuxt experiences that use interaction to explain, reveal, and engage—without sacrificing clarity or performance."
    :deliverables="deliverables"
    cta="Build an interactive world"
  />
</template>
<script setup lang="ts">
import ServiceDetail from '~/components/ui/ServiceDetail.vue';
const deliverables = ['Interactive product viewers and configurators', 'WebGL landing pages and campaign experiences', 'Audio, pointer, and scroll-reactive environments'];
useSeoMeta({ title: 'Interactive 3D Websites — FOOSH', description: 'Interactive Three.js websites and browser-based 3D applications.' });
</script>
