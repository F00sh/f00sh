<template>
  <ServiceDetail
    eyebrow="Services · Game & Interactive Design"
    title="Interactive worlds built around clear, engaging mechanics."
    intro="Game assets, mechanics, and Three.js experiences designed to explain, reveal, and engage—without sacrificing clarity or performance."
    :deliverables="deliverables"
    cta="Build an interactive world"
  />
</template>
<script setup lang="ts">
import ServiceDetail from '~/components/ui/ServiceDetail.vue';
const deliverables = ['Game-ready assets and mechanics concepts', 'Interactive product viewers and configurators', 'Audio, pointer, and scroll-reactive WebGL environments'];
useSeoMeta({ title: 'Game & Interactive Design Services — FOOSH', description: 'Game assets, mechanics design, interactive Three.js websites, and browser-based 3D applications.' });
</script>
