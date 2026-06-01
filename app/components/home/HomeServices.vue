<template>
  <section class="mx-auto w-[min(94%,76rem)] py-12">
    <h2 class="text-5xl tracking-[-0.04em] md:text-7xl">Services</h2>
    <div class="mt-8 grid gap-4 md:grid-cols-2">
      <NuxtLink v-for="service in services" :key="service.to" :to="service.to" class="border border-white/10 bg-white/[0.02] p-6 hover:border-lime-300/60">
        <p class="text-xs uppercase tracking-[0.22em] text-lime-300">{{ service.tag }}</p>
        <h3 class="mt-2 text-2xl">{{ service.title }}</h3>
        <p class="mt-2 text-neutral-300">{{ service.text }}</p>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const services = [
  { to: '/services/3d-modeling', tag: '3D', title: '3D Modeling', text: 'Custom models for products, games and web.' },
  { to: '/services/3d-animation', tag: 'Motion', title: '3D Animation', text: 'Product reveals, logo motion, social edits.' },
  { to: '/services/interactive-3d-websites', tag: 'WebGL', title: 'Interactive 3D Websites', text: 'Three.js and Nuxt browser experiences.' },
  { to: '/services/web-design', tag: 'Nuxt', title: 'Web Design & Development', text: 'Responsive and SEO-focused modern sites.' },
];
</script>
