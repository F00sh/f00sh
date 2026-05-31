<template>
  <main class="relative z-10 bg-neutral-950 text-neutral-50">
    <SiteHeader />
    <HeroFoosh />
    <AboutBlock />
    <HomePortfolioPreview />
    <ContactBlock />
    <SiteFooter />
  </main>
</template>

<script setup lang="ts">
useHead({
  title: "f00sh — creative solutions",
  meta: [
    {
      name: "description",
      content:
        "f00sh is a portfolio focused on design, development, art, and landscape work across product, web, and 3D.",
    },
  ],
});
</script>
