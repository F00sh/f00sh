export type PortfolioProject = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  year: string;
  location: string;
  services: string[];
  cover: string;
  images: string[];
};

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "game-01",
    title: "Neon Runner",
    subtitle: "Game UI + asset set",
    description: "A fast, high-contrast game interface and asset direction package built around readable motion, modular screens, and stylized world details.",
    tag: "Game",
    year: "2026",
    location: "Remote",
    services: ["Game UI", "Asset Direction", "Motion"],
    cover: "/portfolio/neon-runner/cover.jpg",
    images: [
      "/portfolio/neon-runner/01.jpg",
      "/portfolio/neon-runner/02.jpg",
      "/portfolio/neon-runner/03.jpg",
    ],
  },
  {
    id: "web-01",
    title: "Studio Site",
    subtitle: "Web design + UI system",
    description: "A portfolio and studio web system focused on sharp typography, reusable interface patterns, and a direct path from visual concept to implementation.",
    tag: "Web",
    year: "2026",
    location: "Remote",
    services: ["Web Design", "UI System", "Frontend"],
    cover: "/portfolio/studio-site/cover.jpg",
    images: [
      "/portfolio/studio-site/01.jpg",
      "/portfolio/studio-site/02.jpg",
      "/portfolio/studio-site/03.jpg",
    ],
  },
  {
    id: "anim-01",
    title: "Motion Study",
    subtitle: "2D/3D animation frames",
    description: "A sequence of motion studies exploring product rhythm, 3D staging, and expressive frame-by-frame transitions for digital campaigns.",
    tag: "Animation",
    year: "2026",
    location: "Remote",
    services: ["Animation", "3D Staging", "Art Direction"],
    cover: "/portfolio/motion-study/cover.jpg",
    images: [
      "/portfolio/motion-study/01.jpg",
      "/portfolio/motion-study/02.jpg",
    ],
  },
];

export const portfolioProjectById = Object.fromEntries(
  portfolioProjects.map((project) => [project.id, project]),
) as Record<string, PortfolioProject>;
