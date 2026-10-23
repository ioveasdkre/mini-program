<template>
  <v-container class="fill-height" style="max-width: 480px">
    <v-card class="w-100" elevation="3">
      <v-card-text class="text-center pa-8">
        <v-icon color="primary" size="64" class="mb-4"> mdi-lock-outline </v-icon>
        <h1 class="text-h5 mb-2">陳俊生小工具平台</h1>
        <p class="text-body-2 text-grey mb-6">僅限授權帳號登入</p>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-6">
          {{ errorMessage }}
        </v-alert>

        <v-btn href="/auth/google" color="primary" size="large" block prepend-icon="mdi-google">
          使用 Google 登入
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' });

useHead({ title: '登入 - 陳俊生小工具平台' });

const route = useRoute();

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: '此 Google 帳號沒有使用權限',
  oauth: 'Google 登入失敗，請再試一次',
};

const errorMessage = computed(() => {
  const code = route.query['error'];
  return typeof code === 'string' ? (ERROR_MESSAGES[code] ?? null) : null;
});
</script>
