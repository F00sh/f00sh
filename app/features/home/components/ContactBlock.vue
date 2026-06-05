<template>
  <section id="contact" ref="contactRoot" class="border-t border-neutral-800 px-4 py-20 sm:px-8 lg:px-10">
    <div class="mx-auto w-full max-w-[88rem]">
      <p class="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">Contact</p>
      <h2 class="max-w-5xl font-archivo-black text-4xl leading-[0.98] text-neutral-50 sm:text-5xl lg:text-6xl">
        Have a project that needs sharp visuals, clean execution, or a strange idea made real?
      </h2>

      <div class="mt-12 grid gap-4 md:grid-cols-2">
        <a
          v-for="item in contactLinks"
          :key="item.href"
          :href="item.href"
          :target="item.external ? '_blank' : undefined"
          :rel="item.external ? 'noopener noreferrer' : undefined"
          class="contact-link group border border-neutral-800 px-5 py-5 text-neutral-100 transition-colors hover:border-lime-400 hover:text-lime-400 focus-outline motion-reduce:transition-none"
        >
          <span class="block text-[0.65rem] uppercase tracking-[0.22em] text-neutral-500 transition-colors group-hover:text-lime-400">
            {{ item.label }}
          </span>
          <span class="mt-2 block text-2xl font-black uppercase sm:text-3xl">
            {{ item.value }}
          </span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useAnime } from "~/composables/useAnime";
import { usePrefersReducedMotion } from "~/composables/usePrefersReducedMotion";

const contactRoot = ref<HTMLElement | null>(null);
const { loadAnime, track } = useAnime();
const { prefersReducedMotion } = usePrefersReducedMotion();
const listenerCleanups: Array<() => void> = [];

const contactLinks = [
  { label: "Start a project", value: "fooshmoola@gmail.com", href: "mailto:fooshmoola@gmail.com", external: false },
  { label: "Send email", value: "Direct message", href: "mailto:fooshmoola@gmail.com", external: false },
  { label: "View work", value: "Behance", href: "https://www.behance.net/FOOSH", external: true },
  { label: "Book a call", value: "LinkedIn", href: "https://www.linkedin.com/in/marko-vilipi%C4%87-b06a20321/", external: true },
];

onMounted(async () => {
  if (prefersReducedMotion.value || !contactRoot.value) return;

  const { animate } = await loadAnime();
  const links = contactRoot.value.querySelectorAll(".contact-link");

  for (const link of links) {
    const onEnter = () => {
      track(
        animate(link, {
          translateY: -3,
          duration: 300,
          ease: "outCubic",
        }),
      );
    };

    const onLeave = () => {
      track(
        animate(link, {
          translateY: 0,
          duration: 300,
          ease: "outCubic",
        }),
      );
    };

    link.addEventListener("pointerenter", onEnter);
    link.addEventListener("pointerleave", onLeave);
    listenerCleanups.push(() => {
      link.removeEventListener("pointerenter", onEnter);
      link.removeEventListener("pointerleave", onLeave);
    });
  }
});

onBeforeUnmount(() => {
  for (const cleanup of listenerCleanups) {
    cleanup();
  }
});
</script>
