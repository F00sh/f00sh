<template>
  <PageHero
    :scene="ContactScene"
    eyebrow="Contact"
    title="Have a 3D, animation or interactive web project?"
    intro="Send a short brief with the goal, timeline, and what already exists. You’ll get a direct, practical reply."
  >
    <div class="mt-10 grid border-l border-t border-white/15 md:grid-cols-[1.35fr_0.65fr]">
      <a href="mailto:fooshmoola@gmail.com" class="foosh-reveal group flex min-h-32 items-end justify-between gap-4 border-b border-r border-white/15 bg-[#05070a]/60 p-6 text-[#c8ff63] transition-colors hover:bg-[#c8ff63]/10 focus-outline [--reveal-delay:180ms]">
        <span class="break-all font-josefin text-[clamp(1.1rem,2.5vw,2rem)]">fooshmoola@gmail.com</span>
        <span class="text-xl" aria-hidden="true">↗</span>
      </a>
      <div class="foosh-reveal flex min-h-32 flex-col justify-end border-b border-r border-white/15 bg-[#05070a]/60 p-6 text-[#d7d9e7] [--reveal-delay:245ms]">
        <span class="text-[0.65rem] uppercase tracking-[0.18em] text-neutral-500">Location</span>
        <span class="mt-2">Croatia · Remote collaboration</span>
      </div>
    </div>
  </PageHero>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import PageHero from '~/components/ui/PageHero.vue';

const ContactScene = defineAsyncComponent(() => import('~/components/three/ContactScene.client.vue'));
useSeoMeta({ title: 'Contact — FOOSH', description: 'Contact FOOSH for 3D modeling, animation, and interactive web projects.' });
</script>
