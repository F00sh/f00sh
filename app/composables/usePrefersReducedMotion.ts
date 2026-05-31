import { ref, onMounted, onBeforeUnmount } from "vue";

export function usePrefersReducedMotion() {
  const prefersReducedMotion = ref(false);
  let mediaQuery: MediaQueryList | null = null;

  const updatePreference = () => {
    prefersReducedMotion.value = Boolean(mediaQuery?.matches);
  };

  onMounted(() => {
    mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
  });

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener("change", updatePreference);
  });

  return { prefersReducedMotion };
}
