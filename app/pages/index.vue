<template>
  <div>
    <!-- 歡迎區塊 -->
    <v-row class="mb-8">
      <v-col cols="12" class="text-center">
        <v-card color="primary" dark class="pa-8">
          <v-card-title class="text-h2 mb-4">
            <v-icon size="x-large" class="mr-4"> mdi-apps </v-icon>
            陳俊生小程式工具平台
          </v-card-title>
          <v-card-text class="text-h5"> 便捷實用的生活工具集合平台 </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 功能介紹 -->
    <v-row class="mb-6">
      <v-col cols="12" md="6" lg="3">
        <v-card class="h-100" elevation="3">
          <v-card-title class="text-center">
            <v-icon size="large" color="blue-darken-2" class="mb-2"> mdi-clock-time-four </v-icon>
            <div>工時計算器</div>
          </v-card-title>
          <v-card-text class="text-center">
            <p>根據21日-20日週期自動計算每月所需工作時數，準確統計工作日與假日。</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card class="h-100" elevation="3">
          <v-card-title class="text-center">
            <v-icon size="large" color="green-darken-2" class="mb-2"> mdi-piggy-bank </v-icon>
            <div>存錢計算器</div>
          </v-card-title>
          <v-card-text class="text-center">
            <p>計算複利存款的未來價值，幫助您規劃儲蓄目標，實現財務自由。</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card class="h-100" elevation="3">
          <v-card-title class="text-center">
            <v-icon size="large" color="orange-darken-2" class="mb-2"> mdi-tools </v-icon>
            <div>實用工具</div>
          </v-card-title>
          <v-card-text class="text-center">
            <p>集合各種日常實用小工具，讓您的生活更便利、工作更高效。</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card class="h-100" elevation="3">
          <v-card-title class="text-center">
            <v-icon size="large" color="purple-darken-2" class="mb-2"> mdi-speedometer </v-icon>
            <div>快速便捷</div>
          </v-card-title>
          <v-card-text class="text-center">
            <p>簡潔直觀的操作介面，無需複雜設定，即開即用的便捷體驗。</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 快速操作 -->
    <v-row>
      <v-col cols="12" class="text-center">
        <v-card class="pa-6" elevation="2">
          <v-card-title class="text-h4 mb-4"> 開始使用 </v-card-title>
          <v-card-text class="mb-4">
            <p class="text-h6">探索我們的實用小工具，提升您的生活效率</p>
          </v-card-text>
          <v-card-actions class="justify-center flex-wrap ga-4">
            <v-btn
              size="large"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-clock-time-four"
              to="/time-calculator">
              工時計算器
            </v-btn>
            <v-btn
              size="large"
              color="success"
              variant="elevated"
              prepend-icon="mdi-piggy-bank"
              to="/savings-calculator">
              存錢計算器
            </v-btn>
            <v-btn
              size="large"
              color="secondary"
              variant="elevated"
              prepend-icon="mdi-apps"
              disabled>
              更多工具 (即將推出)
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
// 設定頁面 SEO
useHead({
  title: '首頁 - 陳俊生小程式工具平台',
  meta: [
    {
      name: 'description',
      content:
        '便捷實用的生活工具集合平台，提供工時計算器等多種實用小工具，讓您的生活更便利、工作更高效。',
    },
  ],
});
</script>
