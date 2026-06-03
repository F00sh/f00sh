<template>
  <article
    class="relative overflow-hidden border border-white/12 bg-[rgba(16,12,10,0.72)] p-5 text-neutral-100 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-all duration-500 sm:p-7"
    :class="active ? 'translate-y-0 border-amber-200/28 bg-[rgba(22,16,13,0.78)]' : 'translate-y-2'"
  >
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(230,194,129,0.14),transparent_42%),linear-gradient(160deg,rgba(255,255,255,0.06),transparent_55%)]" />
    <div class="pointer-events-none absolute inset-[10px] border border-white/8" />

    <div class="relative">
      <div class="flex items-center justify-between gap-3 text-[0.62rem] uppercase tracking-[0.28em] text-amber-100/75">
        <span>Scene {{ String(index + 1).padStart(2, '0') }}</span>
        <span>{{ cue }}</span>
      </div>

      <h2 class="mt-4 font-josefin text-3xl leading-none text-stone-50 sm:text-4xl">
        {{ title }}
      </h2>

      <p class="mt-4 max-w-[32rem] text-sm leading-7 text-stone-200/88 sm:text-base">
        {{ text }}
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  active: boolean;
  cue: string;
  index: number;
  text: string;
  title: string;
}>();
</script>
