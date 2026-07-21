<template>
  <SectionAtmosphere class="absolute inset-0 -z-10" :variant="variant" :density="170" :speed="0.5" />
</template>
<script setup lang="ts">
import SectionAtmosphere from '~/components/three/SectionAtmosphere.client.vue';

const route = useRoute();
const variant = computed<'services' | 'work' | 'about' | 'contact'>(() => {
  if (route.path.includes('3d-animation')) return 'work';
  if (route.path.includes('interactive-3d')) return 'about';
  if (route.path.includes('web-design')) return 'contact';
  return 'services';
});
</script>
