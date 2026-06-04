import { onBeforeUnmount, ref } from 'vue';
import { useGsap } from '~/composables/useGsap';

type ScrollTriggerLike = {
  kill: () => void;
  refresh?: () => void;
};

export function useScrollProgress(sectionIds: string[]) {
  const root = ref<HTMLElement | null>(null);
  const progress = ref(0);
  const activeSectionId = ref(sectionIds[0] ?? '');
  const sectionProgress = ref<Record<string, number>>({});

  const sectionElements = new Map<string, HTMLElement>();
  const triggers: ScrollTriggerLike[] = [];
  const { loadGsap, addCleanup } = useGsap();

  const setSectionRef = (id: string, element: Element | null) => {
    if (element instanceof HTMLElement) {
      sectionElements.set(id, element);
      return;
    }

    sectionElements.delete(id);
  };

  const destroyTriggers = () => {
    while (triggers.length > 0) {
      triggers.pop()?.kill();
    }
  };

  const initializeScroll = async () => {
    destroyTriggers();

    if (!root.value || sectionElements.size === 0) return;

    const { ScrollTrigger } = await loadGsap();

    sectionProgress.value = Object.fromEntries(sectionIds.map((id) => [id, id === sectionIds[0] ? 1 : 0]));

    triggers.push(
      ScrollTrigger.create({
        trigger: root.value,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self: { progress: number }) => {
          progress.value = self.progress;
        },
      }),
    );

    for (const [index, id] of sectionIds.entries()) {
      const element = sectionElements.get(id);

      if (!element) continue;

      triggers.push(
        ScrollTrigger.create({
          trigger: element,
          start: 'top center',
          end: 'bottom center',
          onUpdate: (self: { progress: number; isActive: boolean }) => {
            sectionProgress.value = {
              ...sectionProgress.value,
              [id]: self.progress,
            };

            if (self.isActive || self.progress > 0.5 || (index === sectionIds.length - 1 && self.progress > 0.9)) {
              activeSectionId.value = id;
            }
          },
          onEnter: () => {
            activeSectionId.value = id;
          },
          onEnterBack: () => {
            activeSectionId.value = id;
          },
        }),
      );
    }

    ScrollTrigger.refresh();
  };

  addCleanup(destroyTriggers);
  onBeforeUnmount(destroyTriggers);

  return {
    root,
    progress,
    activeSectionId,
    sectionProgress,
    setSectionRef,
    initializeScroll,
  };
}
