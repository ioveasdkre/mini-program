<template>
  <v-app>
    <v-app-bar app color="primary" dark height="64">
      <v-app-bar-title>
        <v-icon left> mdi-clock </v-icon>
        陳俊生小程式工具平台
      </v-app-bar-title>

      <v-spacer />

      <v-btn to="/" text class="mr-2">
        <v-icon left> mdi-home </v-icon>
        首頁
      </v-btn>

      <v-btn to="/time-calculator" text>
        <v-icon left> mdi-calculator </v-icon>
        工時計算器
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
