// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL || "http://localhost:3000",
      cacheServiceUrl: "http://localhost:2222",
      tokenID: 1,
    },
  },
});
