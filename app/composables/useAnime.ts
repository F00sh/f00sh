import { onBeforeUnmount } from "vue";

type AnimeControl = {
  pause?: () => void;
};

export function useAnime() {
  const controls: AnimeControl[] = [];

  const track = <T extends AnimeControl>(control: T) => {
    controls.push(control);
    return control;
  };

  const loadAnime = async () => {
    return await import("animejs");
  };

  onBeforeUnmount(() => {
    for (const control of controls) {
      control.pause?.();
    }
  });

  return {
    loadAnime,
    track,
  };
}
