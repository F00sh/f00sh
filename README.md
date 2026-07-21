# FOOSH

## Application Structure

```text
app/
  assets/                 Global CSS, images, and audio
  components/
    layout/               Site-wide header and footer
    three/                Reusable Three.js scenes
    ui/                   Reusable interface components
  composables/            Shared application composables
  features/
    home/                 Home-page components and data
    portfolio/            Portfolio components and data
    topography/           Topography components and utilities
    work/                 Interactive work scenes
  layouts/                Nuxt layouts
  pages/                  URL and route structure
```

Route files stay small and import their implementation from the matching feature folder. Shared code belongs in `components/` or `composables/`.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
