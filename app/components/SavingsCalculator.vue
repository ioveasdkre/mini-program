<template>
  <div class="savings-calculator-container">
    <!-- 標題區塊 -->
    <div class="text-center mb-8">
      <h1 class="text-h3 font-weight-bold text-grey-darken-3 mb-2">
        <v-icon size="large" color="primary" class="mr-3"> mdi-piggy-bank </v-icon>
        存錢計算器
      </h1>
      <p class="text-h6 text-grey-darken-1">計算複利存款的未來價值</p>
    </div>

    <!-- 輸入表單 -->
    <v-card class="mb-6" elevation="3">
      <v-card-title>
        <v-icon color="primary" class="mr-2"> mdi-calculator </v-icon>
        設定參數
      </v-card-title>

      <v-card-text>
        <v-form>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="initialAmount"
                label="初始金額"
                type="number"
                prefix="NT$"
                variant="outlined"
                color="primary"
                :min="0"
                hint="一開始已有的存款金額"
                persistent-hint />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="monthlyDeposit"
                label="每月存款金額"
                type="number"
                prefix="NT$"
                variant="outlined"
                color="primary"
                :min="0"
                hint="每個月固定存入的金額"
                persistent-hint />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="annualInterestRate"
                label="年利率"
                type="number"
                suffix="%"
                variant="outlined"
                color="primary"
                :min="0"
                :max="100"
                :step="0.1"
                hint="年化利率（百分比）"
                persistent-hint />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="years"
                label="存款年數"
                type="number"
                suffix="年"
                variant="outlined"
                color="primary"
                :min="1"
                hint="計劃存款的年數"
                persistent-hint />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- 計算結果 -->
    <v-card class="mb-6" elevation="3">
      <v-card-text>
        <div class="result-grid">
          <!-- 最終總額 -->
          <v-card color="green-lighten-5" class="text-center pa-4">
            <v-card-title class="text-h6 text-green-darken-2 mb-2">
              <v-icon class="mr-2">mdi-cash-multiple</v-icon>
              最終總額
            </v-card-title>
            <v-card-text>
              <p class="text-h3 font-weight-bold text-green-darken-1">
                {{ formatCurrency(result.finalAmount) }}
              </p>
              <p class="text-caption text-grey-darken-1">{{ years }} 年後的總金額</p>
            </v-card-text>
          </v-card>

          <!-- 總本金 -->
          <v-card color="blue-lighten-5" class="text-center pa-4">
            <v-card-title class="text-h6 text-blue-darken-2 mb-2">
              <v-icon class="mr-2">mdi-hand-coin</v-icon>
              總投入本金
            </v-card-title>
            <v-card-text>
              <p class="text-h3 font-weight-bold text-blue-darken-1">
                {{ formatCurrency(result.totalPrincipal) }}
              </p>
              <p class="text-caption text-grey-darken-1">實際存入的金額</p>
            </v-card-text>
          </v-card>

          <!-- 總利息 -->
          <v-card color="orange-lighten-5" class="text-center pa-4">
            <v-card-title class="text-h6 text-orange-darken-2 mb-2">
              <v-icon class="mr-2">mdi-trending-up</v-icon>
              總利息收益
            </v-card-title>
            <v-card-text>
              <p class="text-h3 font-weight-bold text-orange-darken-1">
                {{ formatCurrency(result.totalInterest) }}
              </p>
              <p class="text-caption text-grey-darken-1">複利產生的收益</p>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <!-- 詳細統計 -->
    <v-card elevation="3">
      <v-card-title>
        <v-icon color="primary" class="mr-2"> mdi-chart-bar </v-icon>
        詳細統計
      </v-card-title>

      <v-card-text>
        <v-list>
          <v-list-item>
            <template #prepend>
              <v-icon color="grey-darken-2">mdi-calendar-clock</v-icon>
            </template>
            <v-list-item-title>存款期間：</v-list-item-title>
            <template #append>
              <span class="font-weight-bold">{{ years }} 年 ({{ years * 12 }} 個月)</span>
            </template>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon color="blue-darken-2">mdi-cash</v-icon>
            </template>
            <v-list-item-title>初始金額：</v-list-item-title>
            <template #append>
              <span class="font-weight-bold text-blue-darken-2">{{
                formatCurrency(initialAmount)
              }}</span>
            </template>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon color="blue-darken-2">mdi-calendar-month</v-icon>
            </template>
            <v-list-item-title>每月存款：</v-list-item-title>
            <template #append>
              <span class="font-weight-bold text-blue-darken-2">{{
                formatCurrency(monthlyDeposit)
              }}</span>
            </template>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon color="green-darken-2">mdi-percent</v-icon>
            </template>
            <v-list-item-title>年利率：</v-list-item-title>
            <template #append>
              <span class="font-weight-bold text-green-darken-2">{{ annualInterestRate }}%</span>
            </template>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon color="green-darken-2">mdi-percent-outline</v-icon>
            </template>
            <v-list-item-title>月利率：</v-list-item-title>
            <template #append>
              <span class="font-weight-bold text-green-darken-2"
                >{{ (annualInterestRate / 12).toFixed(4) }}%</span
              >
            </template>
          </v-list-item>

          <v-list-item>
            <template #prepend>
              <v-icon color="orange-darken-2">mdi-chart-line</v-icon>
            </template>
            <v-list-item-title>收益率：</v-list-item-title>
            <template #append>
              <span class="font-weight-bold text-orange-darken-2">{{ result.returnRate }}%</span>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
// 響應式數據
const initialAmount = ref(0); // 初始金額
const monthlyDeposit = ref(3000); // 每月存款金額
const annualInterestRate = ref(6); // 年利率（百分比）
const years = ref(40); // 存款年數

// 計算結果介面
interface CalculationResult {
  finalAmount: number;
  totalPrincipal: number;
  totalInterest: number;
  returnRate: string;
}

// 使用 computed 自動計算結果
const result = computed<CalculationResult>(() => {
  const months = years.value * 12;
  const monthlyInterestRate = annualInterestRate.value / 12 / 100;
  let totalAmount = initialAmount.value;
  let totalPrincipal = initialAmount.value;

  for (let i = 0; i < months; i++) {
    totalAmount = (totalAmount + monthlyDeposit.value) * (1 + monthlyInterestRate);
    totalPrincipal += monthlyDeposit.value;
  }

  const totalInterest = totalAmount - totalPrincipal;
  const returnRate =
    totalPrincipal > 0 ? ((totalInterest / totalPrincipal) * 100).toFixed(2) : '0.00';

  return {
    finalAmount: totalAmount,
    totalPrincipal: totalPrincipal,
    totalInterest: totalInterest,
    returnRate: returnRate,
  };
});

// 格式化貨幣
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
</script>

<style scoped>
.savings-calculator-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 16px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .savings-calculator-container {
    padding: 0 8px;
  }

  .result-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .result-grid {
    gap: 12px;
  }
}
</style>
