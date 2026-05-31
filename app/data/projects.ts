export type HomeProject = {
  id: string;
  title: string;
  category: "Web" | "UI/UX" | "3D" | "Animation" | "Game" | "Landscape";
  description: string;
  image: string;
};

export const homeProjects: HomeProject[] = [
  {
    id: "studio-framework",
    title: "Studio Framework",
    category: "Web",
    description: "Portfolio platform design and build system for a visual studio.",
    image: "/img/bg/ap_fin_all_1.png",
  },
  {
    id: "signal-ui",
    title: "Signal UI",
    category: "UI/UX",
    description: "Interface direction focused on clarity, rhythm, and interaction depth.",
    image: "/img/bg/ap_fin_all_2.png",
  },
  {
    id: "terrain-assets",
    title: "Terrain Assets",
    category: "Game",
    description: "Game-ready props and mechanics studies for stylized environments.",
    image: "/img/bg/cvike4.png",
  },
  {
    id: "frame-sequence",
    title: "Frame Sequence",
    category: "Animation",
    description: "2D/3D motion tests blending product storytelling with kinetic detail.",
    image: "/img/bg/gallery1.png",
  },
];
