<template>
  <v-app>
    <v-app-bar color="primary" height="64">
      <v-container fluid class="d-flex" style="height: 100%">
        <v-app-bar-title>
          <v-icon left> mdi-clock </v-icon>
          陳俊生小工具平台
        </v-app-bar-title>

        <v-spacer />

        <v-btn to="/" text class="mr-2">
          <v-icon left> mdi-home </v-icon>
          首頁
        </v-btn>

        <v-btn to="/time-calculator" text class="mr-2">
          <v-icon left> mdi-calculator </v-icon>
          工時計算器
        </v-btn>

        <v-btn to="/savings-calculator" text class="mr-2">
          <v-icon left> mdi-piggy-bank </v-icon>
          存錢計算器
        </v-btn>

        <v-btn to="/date-range-calculator" text>
          <v-icon left> mdi-calendar-range </v-icon>
          日期範圍計算器
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
