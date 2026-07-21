<template>
  <PageHero :scene="ServicesScene" :eyebrow="eyebrow" :title="title" :intro="intro">
    <div class="mt-10 grid border-l border-t border-white/15 md:grid-cols-3">
      <div
        v-for="(item, index) in deliverables"
        :key="item"
        class="foosh-reveal min-h-48 border-b border-r border-white/15 bg-[#05070a]/60 p-5"
        :style="{ '--reveal-delay': `${180 + index * 65}ms` }"
      >
        <span class="text-[0.58rem] font-medium uppercase tracking-[0.12em] text-[#c8ff63]">0{{ index + 1 }}</span>
        <p class="mt-7 leading-7 text-[#d2d5d3]">{{ item }}</p>
      </div>
    </div>
    <div class="foosh-reveal mt-5 flex flex-wrap items-center justify-between gap-4 border-y border-white/15 py-5 [--reveal-delay:390ms]">
      <p class="text-sm leading-6 text-[#a5aba8]">Have a goal in mind? Send the scope, timeline, and references you already have.</p>
      <NuxtLink to="/contact" class="focus-outline inline-flex border border-[#c8ff63] bg-[#c8ff63] px-5 py-3 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[#080b09]">
        {{ cta }} <span class="ml-2" aria-hidden="true">↗</span>
      </NuxtLink>
    </div>
  </PageHero>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import PageHero from '~/components/ui/PageHero.vue';

defineProps<{ eyebrow: string; title: string; intro: string; deliverables: string[]; cta: string }>();
const ServicesScene = defineAsyncComponent(() => import('~/components/three/ServicesScene.client.vue'));
</script>
