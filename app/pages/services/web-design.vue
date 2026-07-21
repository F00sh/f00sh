<template>
  <ServiceDetail
    eyebrow="Services · Web Design"
    title="Websites with a clear path and a distinct voice."
    intro="Responsive Nuxt websites that balance expressive art direction with accessible structure, useful motion, and practical performance."
    :deliverables="deliverables"
    cta="Design a better website"
  />
</template>
<script setup lang="ts">
import ServiceDetail from '~/components/ui/ServiceDetail.vue';
const deliverables = ['Visual direction and responsive interface design', 'Nuxt implementation and reusable UI systems', 'SEO-ready structure, accessibility, and performance polish'];
useSeoMeta({ title: 'Web Design Services — FOOSH', description: 'Web design and Nuxt development with strong visual direction and clean structure.' });
</script>
