<template>
  <div>
    <TimeCalculator />
  </div>
</template>

<script setup lang="ts">
// 設定頁面 SEO
useHead({
  title: '工時計算器 - 工時管理系統',
  meta: [
    {
      name: 'description',
      content: '計算每月需要的工作時數（21日-20日週期），提供詳細的工作日曆和統計資訊。',
    },
  ],
});
</script>
