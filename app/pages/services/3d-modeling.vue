<template>
  <ServiceDetail
    eyebrow="Services · 3D Modeling"
    title="3D models built to look sharp and work hard."
    intro="Custom product visualization, stylized assets, and optimized models for realtime, marketing, and animation workflows."
    :deliverables="deliverables"
    cta="Start a modeling project"
  />
</template>
<script setup lang="ts">
import ServiceDetail from '~/components/ui/ServiceDetail.vue';
const deliverables = ['Web-ready and realtime-optimized models', 'Product and campaign visualization assets', 'Stylized props, environments, and game-ready geometry'];
useSeoMeta({ title: '3D Modeling Services — FOOSH', description: '3D modeling for products, websites, games, and visual stories.' });
</script>
