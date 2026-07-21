<template>
  <ServiceDetail
    eyebrow="Services · Web Design & UI/UX"
    title="Websites with a clear path and a distinct voice."
    intro="Responsive websites and interfaces that balance expressive art direction with intuitive UI/UX, accessible structure, useful motion, and practical performance."
    :deliverables="deliverables"
    cta="Design a better website"
  />
</template>
<script setup lang="ts">
import ServiceDetail from '~/components/ui/ServiceDetail.vue';
const deliverables = ['Figma-based UI/UX and responsive interface design', 'HTML, CSS, Nuxt, and reusable UI systems', 'SEO-ready structure, accessibility, and performance polish'];
useSeoMeta({ title: 'Web Design & UI/UX Services — FOOSH', description: 'Web design and UI/UX with Figma, HTML, CSS, Nuxt, strong visual direction, and clean structure.' });
</script>
