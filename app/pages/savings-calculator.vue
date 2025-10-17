<template>
  <div>
    <SavingsCalculator />
  </div>
</template>

<script setup lang="ts">
// 頁面 meta 資訊
useHead({
  title: '存錢計算器',
  meta: [
    {
      name: 'description',
      content: '計算複利存款的未來價值,幫助您規劃儲蓄目標',
    },
  ],
});
</script>
