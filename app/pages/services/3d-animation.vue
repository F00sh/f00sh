<template>
  <ServiceDetail
    eyebrow="Services · 3D Animation"
    title="Motion that gives the idea a pulse."
    intro="Purposeful animation for products, brands, and digital stories—from short campaign loops to expressive reveal sequences."
    :deliverables="deliverables"
    cta="Create an animation"
  />
</template>
<script setup lang="ts">
import ServiceDetail from '~/components/ui/ServiceDetail.vue';
const deliverables = ['Product reveals and feature animation', 'Logo, identity, and campaign motion', 'Short-form loops for web and social channels'];
useSeoMeta({ title: '3D Animation Services — FOOSH', description: '3D animation services for products, brands, and visual storytelling.' });
</script>
