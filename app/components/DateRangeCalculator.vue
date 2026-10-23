<template>
  <!-- 標題區塊 -->
  <PageHeader
    icon="mdi-calendar-range"
    title="日期範圍計算器"
    description="計算並管理多筆日期範圍與天數" />

  <!-- 載入狀態與錯誤提示 -->
  <v-progress-linear v-if="isLoading" indeterminate class="mb-4" />
  <v-alert v-if="loadError" type="error" variant="tonal" class="mb-4">
    {{ loadError }}
  </v-alert>

  <!-- 操作按鈕區 -->
  <v-card class="mb-6" elevation="3">
    <v-card-text class="d-flex flex-wrap align-center ga-3">
      <v-btn color="primary" prepend-icon="mdi-plus" size="large" @click="openCreateDialog">
        新增日期範圍
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
        <v-col v-for="record in records" :key="record.id" cols="12" md="6" lg="4">
          <v-card class="record-card" elevation="2" border>
            <v-card-title class="d-flex justify-space-between align-center">
              <span class="text-h6 text-truncate">
                <v-icon color="primary" class="mr-2"> mdi-calendar-check </v-icon>
                {{ record.title }}
              </span>
              <span class="flex-shrink-0">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  title="編輯"
                  @click="openEditDialog(record)" />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  color="error"
                  variant="text"
                  title="刪除"
                  @click="deleteRecord(record.id)" />
              </span>
            </v-card-title>

            <v-card-text class="pt-2">
              <div class="text-body-1 mb-2">
                {{ record.startDate }}
                <v-icon size="small" class="mx-1"> mdi-arrow-right </v-icon>
                {{
                  record.endMode === 'today' ? `今天（${resolveEndDate(record)}）` : record.endDate
                }}
              </div>
              <div class="d-flex flex-wrap ga-2 mb-4">
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="record.endMode === 'today' ? 'primary' : undefined">
                  {{ record.endMode === 'today' ? '結束日：永遠為今天' : '結束日：指定日期' }}
                </v-chip>
                <v-chip size="small" variant="tonal">
                  {{ record.includeStartDay ? '計入起始當天 (+1)' : '不計入起始當天' }}
                </v-chip>
              </div>

              <!-- 天數顯示 -->
              <v-divider class="mb-4" />
              <div class="days-display" :class="`days-${getDaysColor(getRecordDays(record))}`">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon class="mr-2"> mdi-clock-outline </v-icon>
                    <span class="text-body-1 font-weight-medium">天數</span>
                  </div>
                  <div class="text-h5 font-weight-bold">
                    {{ getRecordDays(record) }}
                    <span class="text-body-1">天</span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 空狀態 -->
      <v-alert
        v-if="records.length === 0 && !isLoading"
        type="info"
        variant="tonal"
        class="text-center">
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

  <!-- 新增 / 編輯視窗 -->
  <v-dialog v-model="dialogOpen" max-width="520" persistent>
    <v-card>
      <v-card-title>{{ form.id === null ? '新增日期範圍' : '編輯日期範圍' }}</v-card-title>

      <v-card-text>
        <v-text-field
          v-model="form.title"
          label="名稱"
          variant="outlined"
          color="primary"
          maxlength="50"
          counter
          class="mb-2" />

        <v-text-field
          v-model="form.startDate"
          label="起始日"
          type="date"
          variant="outlined"
          color="primary"
          class="mb-2" />

        <v-radio-group v-model="form.endMode" label="結束日" inline hide-details class="mb-2">
          <v-radio label="指定日期" value="fixed" />
          <v-radio label="永遠為今天" value="today" />
        </v-radio-group>

        <v-text-field
          v-if="form.endMode === 'fixed'"
          v-model="form.endDate"
          label="結束日期"
          type="date"
          variant="outlined"
          color="primary"
          class="mb-2" />

        <v-switch
          v-model="form.includeStartDay"
          label="計入起始當天（天數 +1）"
          color="primary"
          hide-details />

        <v-alert v-if="submitted && formError" type="error" variant="tonal" class="mt-4">
          {{ formError }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="saving" @click="dialogOpen = false">取消</v-btn>
        <v-btn color="primary" variant="flat" :loading="saving" @click="confirmDialog">
          確定
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { DateRangeEndMode, DateRecordDto, DateRecordInput } from '~~/shared/types/api';

// 以本地時區產生 YYYY-MM-DD，避免 toISOString 在凌晨取到前一天
const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const getTodayString = (): string => toIsoDate(new Date());

const { data: savedRecords, isLoading, error: queryError } = useDateRecordsQuery();
const { mutateAsync: saveToServer, isPending: saving } = useSaveDateRecords();
const { notify } = useNotify();

const records = computed(() => savedRecords.value ?? []);
const loadError = computed(() => (queryError.value ? getErrorMessage(queryError.value) : null));

// 每次只送出單筆變更，避免覆蓋其他人的資料
const submit = async (
  changes: { records?: DateRecordInput[]; deletedIds?: number[] },
  message: string,
): Promise<boolean> => {
  try {
    await saveToServer({ records: changes.records ?? [], deletedIds: changes.deletedIds ?? [] });
    notify(message);
    return true;
  } catch (error) {
    notify(getErrorMessage(error), 'error');
    return false;
  }
};

interface FormState {
  id: number | null;
  title: string;
  startDate: string;
  endMode: DateRangeEndMode;
  endDate: string;
  includeStartDay: boolean;
}

const createEmptyForm = (): FormState => {
  const today = getTodayString();
  return {
    id: null,
    title: '',
    startDate: today,
    endMode: 'fixed',
    endDate: today,
    includeStartDay: true,
  };
};

const dialogOpen = ref(false);
const submitted = ref(false);
const form = reactive<FormState>(createEmptyForm());

const formError = computed((): string | null => {
  if (!form.title.trim()) return '請輸入名稱';
  if (!form.startDate) return '請選擇起始日';
  if (form.endMode === 'fixed') {
    if (!form.endDate) return '請選擇結束日';
    if (form.endDate < form.startDate) return '結束日不可早於起始日';
  }
  return null;
});

const openCreateDialog = () => {
  Object.assign(form, createEmptyForm());
  submitted.value = false;
  dialogOpen.value = true;
};

const openEditDialog = (record: DateRecordDto) => {
  Object.assign(form, {
    id: record.id,
    title: record.title,
    startDate: record.startDate,
    endMode: record.endMode,
    endDate: record.endDate ?? getTodayString(),
    includeStartDay: record.includeStartDay,
  });
  submitted.value = false;
  dialogOpen.value = true;
};

const confirmDialog = async () => {
  submitted.value = true;
  if (formError.value) return;

  const isEdit = form.id !== null;
  const saved = await submit(
    {
      records: [
        {
          id: form.id ?? undefined,
          title: form.title.trim(),
          startDate: form.startDate,
          endMode: form.endMode,
          endDate: form.endMode === 'fixed' ? form.endDate : null,
          includeStartDay: form.includeStartDay,
        },
      ],
    },
    isEdit ? '已更新' : '已新增',
  );
  if (saved) dialogOpen.value = false;
};

const deleteRecord = async (id: number) => {
  await submit({ deletedIds: [id] }, '已刪除');
};

// 「永遠為今天」的結束日每次顯示時重新取得
const resolveEndDate = (record: DateRecordDto): string =>
  record.endMode === 'today' ? getTodayString() : (record.endDate ?? record.startDate);

// 計算兩個日期之間的天數（只考慮日期），計入起始當天時 +1
const calculateDays = (startDate: string, endDate: string, includeStartDay: boolean): number => {
  if (!startDate || !endDate) return 0;

  const diffMs =
    new Date(`${endDate}T00:00:00`).getTime() - new Date(`${startDate}T00:00:00`).getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + (includeStartDay ? 1 : 0);

  return days > 0 ? days : 0;
};

const getRecordDays = (record: DateRecordDto): number =>
  calculateDays(record.startDate, resolveEndDate(record), record.includeStartDay);

// 根據天數返回顏色
const getDaysColor = (days: number): string => {
  if (days === 0) return 'grey';
  if (days <= 7) return 'green';
  if (days <= 30) return 'blue';
  if (days <= 90) return 'orange';
  return 'purple';
};

// 統計資訊 - 總天數（最早起始日到最晚結束日之間的天數，含頭尾）
const totalDays = computed(() => {
  if (records.value.length === 0) return 0;

  const earliestStart = records.value
    .map(record => record.startDate)
    .reduce((a, b) => (b < a ? b : a));
  const latestEnd = records.value.map(resolveEndDate).reduce((a, b) => (b > a ? b : a));

  return calculateDays(earliestStart, latestEnd, true);
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
