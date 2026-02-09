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
      // Correct family name
      "Archivo Black": true,

      // Correct family name + choose weights you need
      "DM Mono": [400],

      "Atkinson Hyperlegible": [200, 400, 800],
    },
    display: "swap",
    subsets: ["latin"],
    preload: true,
    preconnect: true,
    prefetch: true,

    // If you use download:true, remove the manual head links (done here)
    download: true,
  },
});
