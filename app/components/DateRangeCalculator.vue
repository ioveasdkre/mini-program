<template>
  <!-- 標題區塊 -->
  <PageHeader
    icon="mdi-calendar-range"
    title="日期範圍計算器"
    description="計算並管理多筆日期範圍與天數" />

  <!-- 操作按鈕區 -->
  <v-card class="mb-6" elevation="3">
    <v-card-text>
      <v-btn color="primary" prepend-icon="mdi-plus" size="large" @click="addNewRecord">
        新增記錄
      </v-btn>
    </v-card-text>
  </v-card>

  <!-- 記錄列表 -->
  <v-card elevation="3">
    <v-card-title>
      <v-icon color="primary" class="mr-2"> mdi-format-list-bulleted </v-icon>
      日期範圍列表
      <v-chip class="ml-2" color="primary" variant="tonal"> 共 {{ records.length }} 筆 </v-chip>
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col v-for="(record, index) in records" :key="record.id" cols="12" md="6" lg="4">
          <v-card class="record-card" elevation="2" border>
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="text-h6">
                <v-icon color="primary" class="mr-2"> mdi-calendar-check </v-icon>
                記錄 #{{ index + 1 }}
              </span>
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="deleteRecord(record.id)" />
            </v-card-title>

            <v-card-text class="pt-2">
              <!-- 起始日 -->
              <v-text-field
                v-model="record.startDate"
                label="起始日"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details
                class="mb-4 date-input-field"
                color="primary" />

              <!-- 結束日 -->
              <v-text-field
                v-model="record.endDate"
                label="結束日"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details
                class="mb-4 date-input-field"
                color="primary" />

              <!-- 天數顯示 -->
              <v-divider class="mb-4" />
              <div
                class="days-display"
                :class="`days-${getDaysColor(calculateDays(record.startDate, record.endDate))}`">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon class="mr-2"> mdi-clock-outline </v-icon>
                    <span class="text-body-1 font-weight-medium">天數</span>
                  </div>
                  <div class="text-h5 font-weight-bold">
                    {{ calculateDays(record.startDate, record.endDate) }}
                    <span class="text-body-1">天</span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 空狀態 -->
      <v-alert v-if="records.length === 0" type="info" variant="tonal" class="text-center">
        <v-icon size="large" class="mb-2"> mdi-information </v-icon>
        <div>目前沒有任何記錄，點擊上方「新增記錄」按鈕開始使用</div>
      </v-alert>
    </v-card-text>
  </v-card>

  <!-- 統計資訊 -->
  <v-card v-if="records.length > 0" class="mt-6" elevation="3">
    <v-card-title>
      <v-icon color="primary" class="mr-2"> mdi-chart-box </v-icon>
      統計資訊
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <div class="stat-item">
            <v-icon color="blue" size="large" class="mb-2"> mdi-counter </v-icon>
            <div class="text-h4 font-weight-bold text-blue">{{ records.length }}</div>
            <div class="text-body-2 text-grey">總記錄數</div>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="stat-item">
            <v-icon color="green" size="large" class="mb-2"> mdi-sigma </v-icon>
            <div class="text-h4 font-weight-bold text-green">{{ totalDays }}</div>
            <div class="text-body-2 text-grey">總天數（最早起始日至最晚結束日）</div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface DateRecord {
  id: number;
  startDate: string;
  endDate: string;
}

// 獲取今天的日期字串（YYYY-MM-DD 格式）
const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0] || '請選擇起訖日期';
};

// 初始化記錄，包含預設的兩筆資料
let nextId = 1;
const records = ref<DateRecord[]>([
  {
    id: nextId++,
    startDate: '2025-12-12',
    endDate: getTodayString(),
  },
  {
    id: nextId++,
    startDate: '2026-01-01',
    endDate: getTodayString(),
  },
]);

// 計算兩個日期之間的天數（只考慮日期，不考慮時間）
const calculateDays = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;

  // 創建日期對象並將時間設為午夜，只比較日期部分
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  // 計算時間差（毫秒）
  const diffTime = end.getTime() - start.getTime();

  // 轉換為天數（包含起始日和結束日，所以要 +1）
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // 如果結束日早於起始日，返回 0
  return diffDays > 0 ? diffDays : 0;
};

// 根據天數返回顏色
const getDaysColor = (days: number): string => {
  if (days === 0) return 'grey';
  if (days <= 7) return 'green';
  if (days <= 30) return 'blue';
  if (days <= 90) return 'orange';
  return 'purple';
};

// 新增記錄
const addNewRecord = () => {
  const today = getTodayString();
  records.value.push({
    id: nextId++,
    startDate: today,
    endDate: today,
  });
};

// 刪除記錄
const deleteRecord = (id: number) => {
  const index = records.value.findIndex(r => r.id === id);
  if (index !== -1) {
    records.value.splice(index, 1);
  }
};

// 統計資訊 - 總天數（最早起始日到最晚結束日之間的天數）
const totalDays = computed(() => {
  if (records.value.length === 0) return 0;

  // 找出所有記錄中最早的起始日
  let earliestStart: Date | null = null;
  let latestEnd: Date | null = null;

  for (const record of records.value) {
    if (record.startDate) {
      const startDate = new Date(record.startDate);
      if (!earliestStart || startDate < earliestStart) {
        earliestStart = startDate;
      }
    }

    if (record.endDate) {
      const endDate = new Date(record.endDate);
      if (!latestEnd || endDate > latestEnd) {
        latestEnd = endDate;
      }
    }
  }

  // 如果找不到有效的日期，返回 0
  if (!earliestStart || !latestEnd) return 0;

  // 計算最早起始日到最晚結束日之間的天數
  const startDateStr = earliestStart.toISOString().split('T')[0] || '';
  const endDateStr = latestEnd.toISOString().split('T')[0] || '';

  return calculateDays(startDateStr, endDateStr);
});
</script>

<style scoped>
.record-card {
  height: 100%;
  transition: all 0.3s ease;
}

.record-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.days-display {
  padding: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.days-grey {
  background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
  color: #616161;
}

.days-green {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
}

.days-blue {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
}

.days-orange {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
}

.days-purple {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #6a1b9a;
}

.stat-item {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

@media (max-width: 768px) {
  .stat-item {
    padding: 12px;
  }
}
</style>
