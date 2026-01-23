export type PortfolioProject = {
    id: string
    title: string
    subtitle: string
    tag: string
    cover: string
    images: string[]
}

export const portfolioProjects: PortfolioProject[] = [
    {
        id: 'game-01',
        title: 'Neon Runner',
        subtitle: 'Game UI + asset set',
        tag: 'Game',
        cover: '/portfolio/neon-runner/cover.jpg',
        images: [
            '/portfolio/neon-runner/01.jpg',
            '/portfolio/neon-runner/02.jpg',
            '/portfolio/neon-runner/03.jpg'
        ]
    },
    {
        id: 'web-01',
        title: 'Studio Site',
        subtitle: 'Web design + UI system',
        tag: 'Web',
        cover: '/portfolio/studio-site/cover.jpg',
        images: [
            '/portfolio/studio-site/01.jpg',
            '/portfolio/studio-site/02.jpg',
            '/portfolio/studio-site/03.jpg'
        ]
    },
    {
        id: 'anim-01',
        title: 'Motion Study',
        subtitle: '2D/3D animation frames',
        tag: 'Animation',
        cover: '/portfolio/motion-study/cover.jpg',
        images: [
            '/portfolio/motion-study/01.jpg',
            '/portfolio/motion-study/02.jpg'
        ]
    }
]
