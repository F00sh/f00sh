<template>
  <section id="home" ref="heroRoot" class="relative flex min-h-screen items-end overflow-hidden px-4 pb-12 pt-28 sm:px-8 lg:px-10" aria-labelledby="hero-title">
    <HeroScene />
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(163,230,53,0.16),_transparent_40%),linear-gradient(to_bottom,_rgba(10,10,10,0.2),_rgba(10,10,10,1)_78%)]" />

    <div class="relative z-10 mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-12 lg:items-end">
      <div class="lg:col-span-8">
        <p class="hero-meta font-dm-mono text-xs uppercase tracking-[0.2em] text-lime-400">
          creative solutions
        </p>

        <h1 id="hero-title" aria-label="f00sh" class="mt-3 overflow-hidden font-archivo-black lowercase leading-[0.82] text-[clamp(4.8rem,19vw,17rem)] text-neutral-50">
          <span class="sr-only">f00sh</span>
          <span
            v-for="(letter, index) in heroLetters"
            :key="`${letter}-${index}`"
            aria-hidden="true"
            class="hero-letter inline-block"
          >
            {{ letter }}
          </span>
        </h1>
      </div>

      <div class="lg:col-span-4">
        <p class="hero-meta mb-4 max-w-sm text-sm text-neutral-300">
          Design and production across product design, interfaces, web, animation, and game assets.
        </p>
        <CategoryNav :categories="categories" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import HeroScene from "~/components/three/HeroScene.client.vue";
import CategoryNav from "~/components/home/CategoryNav.vue";
import { useAnime } from "~/composables/useAnime";
import { usePrefersReducedMotion } from "~/composables/usePrefersReducedMotion";

const heroRoot = ref<HTMLElement | null>(null);
const heroLetters = Array.from("f00sh");
const categories = ["design", "development", "art", "landscape"];

const { loadAnime, track } = useAnime();
const { prefersReducedMotion } = usePrefersReducedMotion();

onMounted(async () => {
  if (prefersReducedMotion.value || !heroRoot.value) return;

  const { animate, stagger } = await loadAnime();

  const letters = heroRoot.value.querySelectorAll(".hero-letter");
  const meta = heroRoot.value.querySelectorAll(".hero-meta");
  const categoryItems = heroRoot.value.querySelectorAll("[data-hero-category]");

  track(
    animate(letters, {
      translateY: ["1.2em", 0],
      opacity: [0, 1],
      rotateZ: [-1, 0],
      duration: 900,
      delay: stagger(75),
      ease: "outExpo",
    }),
  );

  track(
    animate(meta, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 700,
      delay: stagger(90, { start: 250 }),
      ease: "outCubic",
    }),
  );

  track(
    animate(categoryItems, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
      delay: stagger(70, { start: 380 }),
      ease: "outExpo",
    }),
  );
});
</script>

<style scoped>
.hero-letter {
  opacity: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .hero-letter {
    opacity: 0;
  }

  .hero-meta,
  [data-hero-category] {
    opacity: 0;
  }
}
</style>
