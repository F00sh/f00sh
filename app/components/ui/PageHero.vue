<template>
  <section class="page-hero relative isolate min-h-[calc(100svh-3.5rem)] overflow-hidden py-16 sm:min-h-[calc(100svh-4rem)] sm:py-24">
    <component :is="scene" v-if="scene" />
    <div v-else class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_22%,rgba(24,103,106,0.22),transparent_42%),#05070a]" />
    <div class="mx-auto w-[min(92%,82rem)]">
      <p class="foosh-reveal text-[0.61rem] font-medium uppercase tracking-[0.14em] text-[#c8ff63]">{{ eyebrow }}</p>
      <h1 class="foosh-reveal mt-4 max-w-4xl text-balance text-[clamp(2.25rem,4.4vw,4.1rem)] font-normal leading-[0.96] tracking-[-0.045em] text-[#f2f3ef] [--reveal-delay:70ms]">{{ title }}</h1>
      <p class="foosh-reveal mt-6 max-w-2xl text-[clamp(0.9rem,1.1vw,1.02rem)] leading-7 text-[#b9bfbc] [--reveal-delay:140ms]">{{ intro }}</p>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; intro: string; scene?: unknown }>();
</script>
