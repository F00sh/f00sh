<template>
  <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Creative categories">
    <li v-for="(category, index) in categories" :key="category">
      <button
        type="button"
        class="group w-full border border-neutral-800 px-4 py-3 text-left text-sm uppercase tracking-[0.18em] text-neutral-400 transition-all duration-300 hover:border-lime-400 hover:text-lime-400 focus-outline motion-reduce:transition-none"
        data-hero-category
        :data-index="index"
      >
        <span class="inline-block transition-[letter-spacing,transform] duration-300 group-hover:translate-x-1 group-hover:tracking-[0.3em] motion-reduce:transition-none">
          {{ category }}
        </span>
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  categories: string[];
}>();
</script>
