<template>
  <main class="min-h-screen bg-purple-600">
    <div class="mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-16 pt-8">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 rounded-full bg-black/50 text-white border border-white/20 px-4 py-2 hover:bg-black/70"
      >
        Home
      </NuxtLink>
    </div>

    <PortfolioGrid />
  </main>
</template>

<script setup>
import PortfolioGrid from '~/components/PortfolioGrid.vue'
</script>
