<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          @click="drawer = false" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="primary" height="64">
      <v-container fluid class="d-flex align-center" style="height: 100%">
        <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />

        <v-app-bar-title>
          <v-icon left> mdi-clock </v-icon>
          陳俊生小工具平台
        </v-app-bar-title>

        <v-spacer />

        <v-btn
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          text
          class="mr-2 d-none d-md-flex">
          <v-icon left> {{ item.icon }} </v-icon>
          {{ item.title }}
        </v-btn>

        <v-chip v-if="user" variant="outlined" class="mx-2 d-none d-sm-flex">
          <v-icon start> mdi-account-circle </v-icon>
          {{ user.name }}
        </v-chip>
        <v-btn v-if="user" icon="mdi-logout" title="登出" @click="logout" />
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container>
        <slot />
      </v-container>
    </v-main>

    <v-snackbar v-model="notifyState.show" :color="notifyState.color" :timeout="3000">
      {{ notifyState.text }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession();
const { state: notifyState } = useNotify();

const drawer = ref(false);

const navItems = [
  { to: '/', icon: 'mdi-home', title: '首頁' },
  { to: '/time-calculator', icon: 'mdi-calculator', title: '工時計算器' },
  { to: '/savings-calculator', icon: 'mdi-piggy-bank', title: '存錢計算器' },
  { to: '/date-range-calculator', icon: 'mdi-calendar-range', title: '日期範圍計算器' },
];

const logout = async () => {
  await clear();
  // 整頁重新載入，清除前端快取的資料
  await navigateTo('/login', { external: true });
};
</script>
