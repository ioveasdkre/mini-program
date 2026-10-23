const vuetifyConfig = {
  moduleOptions: {
    // Nuxt 4.6 內建 useLayout，與 Vuetify 的同名；本專案沒有使用 Vuetify composables
    importComposables: false,

    // check https://nuxt.vuetifyjs.com/guide/server-side-rendering.html
    ssrClientHints: {
      reloadOnFirstRequest: false,
      viewportSize: false,
      prefersColorScheme: false,

      prefersColorSchemeOptions: {
        useBrowserThemeOnly: false,
      },
    },

    // /* If customizing sass global variables ($utilities, $reset, $color-pack, $body-font-family, etc) */
    // disableVuetifyStyles: true,
    styles: {
      configFile: 'assets/settings.scss',
    },

    vuetifyOptions: '../../vuetify.config.ts', // <== you can omit it
  },
};

export default vuetifyConfig;
