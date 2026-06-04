import { ref } from 'vue';

const audio = ref<HTMLAudioElement | null>(null);
const isMuted = ref(false);

export function useBackgroundAudio() {
  const init = async (src: string, volume = 0.5) => {
    if (typeof window === 'undefined') return;
    if (!audio.value) {
      audio.value = new Audio(src);
      audio.value.loop = true;
      audio.value.preload = 'auto';
    }

    if (audio.value.src !== src) {
      audio.value.src = src;
    }

    audio.value.volume = volume;
    audio.value.muted = isMuted.value;

    try {
      await audio.value.play();
    } catch {
      // Autoplay can fail until user interaction.
    }
  };

  const toggleMute = async () => {
    if (!audio.value) return;

    const next = !isMuted.value;
    isMuted.value = next;
    audio.value.muted = next;

    if (!next && audio.value.paused) {
      try {
        await audio.value.play();
      } catch {
        // Requires explicit user gesture on some devices.
      }
    }
  };

  return {
    audio,
    isMuted,
    init,
    toggleMute,
  };
}
