// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss", "@nuxt/ui"],
  app: {
    head: {
      // Font Family
      link: [
        {
          rel: "stylesheet",
          href: "https://rsms.me/inter/inter.css",
        },
      ],
    },
  },
  css: ["~/assets/css/main.css", "~/assets/css/style.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
    },
  },
  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL || "http://localhost:3000",
      cacheServiceUrl: "http://localhost:2222",
      tokenID: 1,
    },
  },
});
