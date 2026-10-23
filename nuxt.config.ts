// https://nuxt.com/docs/api/configuration/nuxt-config
import { runtimeConfig, securityConfig, veeValidateConfig, vuetifyConfig } from './app/configs';

const baseURL = runtimeConfig.public.baseUrl;

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  ssr: true,
  typescript: {
    typeCheck: true,
  },
  vite: {
    build: {
      rolldownOptions: {
        output: {
          minify: {
            compress: {
              dropConsole: runtimeConfig.public.isProduction,
              dropDebugger: runtimeConfig.public.isProduction,
            },
          },
        },
      },
    },
  },
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vee-validate/nuxt',
    'vuetify-nuxt-module',
    'nuxt-security',
    'nuxt-auth-utils',
  ],
  runtimeConfig,
  security: securityConfig,
  veeValidate: veeValidateConfig,
  vuetify: vuetifyConfig,
  app: {
    baseURL,
  },
});
