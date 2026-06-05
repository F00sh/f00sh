<template>
  <StoryExperience />
</template>

<script setup lang="ts">
import StoryExperience from '~/features/story/components/StoryExperience.vue';

useSeoMeta({
  title: 'Rumpelstiltskin - FOOSH Interactive Storybook',
  description: 'A Nuxt and Three.js scrolling 3D retelling of the public-domain fairy tale Rumpelstiltskin.',
});
</script>
