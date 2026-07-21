<template>
  <ServiceDetail
    eyebrow="Services · Product & 3D Design"
    title="From product idea to precise, production-ready form."
    intro="Product design thinking, visualization, and 3D modeling for presentations, marketing, animation, realtime experiences, and games."
    :deliverables="deliverables"
    cta="Start a modeling project"
  />
</template>
<script setup lang="ts">
import ServiceDetail from '~/components/ui/ServiceDetail.vue';
const deliverables = ['Product concepts and presentation visuals', 'Web-ready and realtime-optimized 3D models', 'Stylized props, environments, and game-ready geometry'];
useSeoMeta({ title: 'Product & 3D Design Services — FOOSH', description: 'Product visualization and 3D modeling for presentations, websites, animation, and games.' });
</script>
