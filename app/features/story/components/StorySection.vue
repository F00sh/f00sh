<template>
  <section
    :ref="sectionRef"
    class="relative flex min-h-[100vh] min-h-[100svh] items-center px-4 py-20 sm:px-6 sm:py-24 lg:px-10"
    :class="index === 0 ? 'pt-32' : ''"
  >
    <div class="mx-auto grid w-full max-w-6xl">
      <div :class="cardWrapClass">
        <StoryTextCard
          :active="active"
          :cue="section.animationCue"
          :index="index"
          :text="section.text"
          :title="section.title"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StoryTextCard from '~/features/story/components/StoryTextCard.vue';
import type { StorySectionData } from '~/features/story/data/rumpelstiltskin';

const props = defineProps<{
  active: boolean;
  index: number;
  section: StorySectionData;
  sectionRef?: (element: Element | null) => void;
}>();

const cardWrapClass = computed(() => {
  if (props.index % 3 === 1) return 'justify-self-end w-full max-w-xl lg:mr-6';
  if (props.index % 3 === 2) return 'justify-self-center w-full max-w-2xl';
  return 'justify-self-start w-full max-w-xl lg:ml-6';
});
</script>
