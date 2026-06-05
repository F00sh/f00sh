<template>
  <section id="process" ref="root" class="relative h-[170vh] border-t border-[var(--foosh-line)]">
    <div class="sticky top-0 flex h-screen items-center px-4 sm:px-8 lg:px-10">
      <div class="mx-auto grid w-full max-w-[90rem] gap-10 lg:grid-cols-12 lg:items-center">
        <div class="lg:col-span-6">
          <p class="center-meta mb-3 text-xs uppercase tracking-[0.2em] text-[var(--foosh-muted)]">Process</p>
          <h2 class="center-meta font-josefin text-4xl leading-[0.95] uppercase text-[var(--foosh-text)] sm:text-6xl">
            Motion calibrated.<br />
            Object locked at 50%.
          </h2>
          <p class="center-meta mt-6 max-w-lg text-sm uppercase tracking-[0.14em] text-[var(--foosh-muted)]">
            Scroll percentage is calculated in real time. Once the timeline reaches 50%, the marker is held on the center line.
          </p>
        </div>

        <div class="lg:col-span-6">
          <div class="vapor-card relative h-[28rem]">
            <div class="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--foosh-cyan)]/45" />
            <div class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--foosh-cyan)]/45" />
            <div
              ref="orb"
              class="absolute left-1/2 top-1/2 flex size-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--foosh-cyan)] bg-[rgba(8,3,18,0.95)] font-josefin text-sm uppercase tracking-[0.24em] text-[var(--foosh-text)]"
            >
              f00sh
            </div>
            <div class="absolute bottom-4 left-4 border border-[var(--foosh-violet)]/70 bg-[rgba(8,3,18,0.82)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--foosh-text)]">
              Scroll: {{ progress }}%
            </div>
            <div class="absolute bottom-4 right-4 border border-[var(--foosh-violet)]/70 bg-[rgba(8,3,18,0.82)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--foosh-text)]">
              Lock: 50%
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { usePrefersReducedMotion } from "~/composables/usePrefersReducedMotion";
import { useGsap } from "~/composables/useGsap";

const root = ref<HTMLElement | null>(null);
const orb = ref<HTMLElement | null>(null);
const progress = ref(0);

const { prefersReducedMotion } = usePrefersReducedMotion();
const { loadGsap, addCleanup, trackAnimation } = useGsap();

onMounted(async () => {
  if (!root.value || !orb.value || prefersReducedMotion.value) {
    progress.value = 50;
    return;
  }

  const { ScrollTrigger, gsap } = await loadGsap();
  const textBlocks = root.value.querySelectorAll(".center-meta");

  trackAnimation(
    gsap.to(textBlocks, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      stagger: 0.12,
      ease: "power2.out",
      scrollTrigger: {
        trigger: root.value,
        start: "top 72%",
        once: true,
      },
    }),
  );

  gsap.set(orb.value, { y: -220 });

  const trigger = ScrollTrigger.create({
    trigger: root.value,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const pct = Math.round(self.progress * 100);
      progress.value = pct;
      const normalized = Math.min(pct / 50, 1);
      const y = gsap.utils.interpolate(-220, 0, normalized);
      gsap.set(orb.value, { y });
    },
  });

  addCleanup(() => trigger.kill());
});
</script>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .center-meta {
    opacity: 0;
    transform: translateY(18px);
  }
}
</style>
