<template>
  <ServiceDetail
    eyebrow="Services · 2D/3D Animation"
    title="Motion that gives the idea a pulse."
    intro="Purposeful 2D and 3D animation for products, brands, and digital stories—from short campaign loops to expressive reveal sequences."
    :deliverables="deliverables"
    cta="Create an animation"
  />
</template>
<script setup lang="ts">
import ServiceDetail from '~/components/ui/ServiceDetail.vue';
const deliverables = ['2D/3D product reveals and feature animation', 'Logo, identity, and campaign motion', 'Short-form loops for web and social channels'];
useSeoMeta({ title: '2D/3D Animation Services — FOOSH', description: '2D and 3D animation for products, brands, campaigns, and visual storytelling.' });
</script>
