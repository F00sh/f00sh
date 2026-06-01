import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ["@nuxtjs/google-fonts"],

  googleFonts: {
    families: {
      "Space Grotesk": [400, 500, 700],
      Manrope: [400, 500, 700, 800],
      "IBM Plex Mono": [400, 500],
    },
    display: "swap",
    subsets: ["latin"],
    preload: true,
    preconnect: true,
    prefetch: true,
    download: true,
  },
});
