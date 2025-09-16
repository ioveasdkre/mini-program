// https://nuxt.com/docs/api/configuration/nuxt-config
import { runtimeConfig, securityConfig, veeValidateConfig, vuetifyConfig } from './app/configs';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  ssr: false,
  typescript: {
    typeCheck: true,
  },
  vite: {
    esbuild: {
      drop: runtimeConfig.public.isProduction ? ['console', 'debugger'] : [],
    },
  },
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vee-validate/nuxt',
    'vuetify-nuxt-module',
    'nuxt-security',
  ],
  runtimeConfig,
  security: securityConfig,
  veeValidate: veeValidateConfig,
  vuetify: vuetifyConfig,
});
