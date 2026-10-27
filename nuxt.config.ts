// https://nuxt.com/docs/api/configuration/nuxt-config
import {
  runtimeConfig,
  securityConfig,
  securityRouteRules,
  veeValidateConfig,
  vuetifyConfig,
} from './app/configs';

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
            // 只在 nuxt build 生效，dev 不壓縮
            compress: {
              dropConsole: true,
              dropDebugger: true,
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
  routeRules: securityRouteRules,
  security: securityConfig,
  veeValidate: veeValidateConfig,
  vuetify: vuetifyConfig,
  app: {
    baseURL,
  },
});
