<template>
  <section id="about" class="border-t border-neutral-800 px-4 py-20 sm:px-8 lg:px-10">
    <div class="mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-12">
      <div class="lg:col-span-7">
        <p class="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">About</p>
        <h2 class="max-w-4xl font-archivo-black text-4xl leading-[0.98] text-neutral-50 sm:text-5xl lg:text-6xl">
          Product design,<br />
          with range.
        </h2>
      </div>

      <div class="lg:col-span-5">
        <p class="max-w-xl text-base text-neutral-300 sm:text-lg">
          I design visual systems, interfaces, 3D assets, animations, and digital experiences that feel clean, functional, and sharp.
        </p>
        <p class="mt-5 max-w-xl text-base text-neutral-300 sm:text-lg">
          From concept to shipped output, I move between design, development, and craft without losing clarity.
        </p>

        <ul class="mt-8 grid grid-cols-1 gap-2 text-sm uppercase tracking-[0.14em] text-neutral-400 sm:grid-cols-2">
          <li v-for="service in services" :key="service" class="border-b border-neutral-800 pb-2">
            {{ service }}
          </li>
        </ul>

        <p class="mt-8 text-xs uppercase tracking-[0.2em] text-neutral-500">
          Based in Croatia · Available for remote collaboration
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const services = [
  "Product Design",
  "Graphic Design",
  "UI/UX",
  "Web",
  "3D Modeling",
  "2D/3D Animation",
  "Game Assets",
  "Mechanics",
];
</script>
