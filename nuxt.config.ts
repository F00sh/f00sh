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
      "Josefin Sans": [400, 500, 600, 700],
      Montserrat: [400, 500, 600, 700, 800],
    },
    display: "swap",
    subsets: ["latin"],
    preload: true,
    preconnect: true,
    prefetch: true,
    download: true,
  },
});
