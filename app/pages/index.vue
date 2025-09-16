<template>
  <div>
    <!-- 歡迎區塊 -->
    <v-row class="mb-8">
      <v-col cols="12" class="text-center">
        <v-card color="primary" dark class="pa-8">
          <v-card-title class="text-h2 mb-4">
            <v-icon size="x-large" class="mr-4"> mdi-clock </v-icon>
            工時管理系統
          </v-card-title>
          <v-card-text class="text-h5"> 專業的工時計算與管理解決方案 </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 功能介紹 -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="h-100" elevation="3">
          <v-card-title class="text-center">
            <v-icon size="large" color="blue-darken-2" class="mb-2"> mdi-calculator </v-icon>
            <div>工時計算</div>
          </v-card-title>
          <v-card-text class="text-center">
            <p>根據21日-20日週期自動計算每月所需工作時數，準確統計工作日與假日。</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="h-100" elevation="3">
          <v-card-title class="text-center">
            <v-icon size="large" color="green-darken-2" class="mb-2"> mdi-calendar-month </v-icon>
            <div>日曆視圖</div>
          </v-card-title>
          <v-card-text class="text-center">
            <p>直觀的月曆介面，清楚顯示工作日、假日，以及累計工時資訊。</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="h-100" elevation="3">
          <v-card-title class="text-center">
            <v-icon size="large" color="orange-darken-2" class="mb-2"> mdi-chart-bar </v-icon>
            <div>統計分析</div>
          </v-card-title>
          <v-card-text class="text-center">
            <p>提供詳細的工時統計，包括總工時、平均每週工時等重要數據。</p>
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
            <p class="text-h6">點擊下方按鈕開始計算您的工時</p>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn
              size="large"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-calculator"
              to="/time-calculator">
              開始計算工時
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
  title: '首頁 - 工時管理系統',
  meta: [
    {
      name: 'description',
      content:
        '專業的工時計算與管理解決方案，提供21日-20日週期的工時計算、日曆視圖和統計分析功能。',
    },
  ],
});
</script>
