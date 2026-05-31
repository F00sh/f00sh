import { onBeforeUnmount } from "vue";

type Cleanup = () => void;

type Killable = {
  kill?: () => void;
};

let registered = false;

export function useGsap() {
  const cleanups: Cleanup[] = [];

  const trackAnimation = <T extends Killable>(animation: T) => {
    cleanups.push(() => animation.kill?.());
    return animation;
  };

  const addCleanup = (cleanup: Cleanup) => {
    cleanups.push(cleanup);
  };

  const loadGsap = async () => {
    const gsapModule = await import("gsap");
    const triggerModule = await import("gsap/ScrollTrigger");
    const gsap = gsapModule.gsap ?? gsapModule.default;
    const ScrollTrigger = triggerModule.ScrollTrigger ?? triggerModule.default;

    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }

    return { gsap, ScrollTrigger };
  };

  onBeforeUnmount(() => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  });

  return {
    loadGsap,
    trackAnimation,
    addCleanup,
  };
}
