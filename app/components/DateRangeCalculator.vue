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
      <v-btn
        color="primary"
        prepend-icon="mdi-timer-sand"
        size="large"
        @click="openCreateDialog('countdown')">
        新增倒數
      </v-btn>
      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-calendar-plus"
        size="large"
        @click="openCreateDialog('count')">
        新增數日子
      </v-btn>
    </v-card-text>
  </v-card>

  <!-- 倒數 / 數日子 分區列表 -->
  <v-card v-for="section in sections" :key="section.key" class="mb-6" elevation="3">
    <v-card-title class="section-title">
      <v-icon color="primary" class="mr-2"> {{ section.icon }} </v-icon>
      {{ section.title }}
      <v-chip class="ml-2" color="primary" variant="tonal">
        共 {{ section.records.length }} 筆
      </v-chip>
    </v-card-title>
    <v-card-subtitle class="text-wrap">{{ section.description }}</v-card-subtitle>

    <v-card-text>
      <v-row>
        <v-col v-for="record in section.records" :key="record.id" cols="12" md="6" lg="4">
          <v-card
            class="record-card"
            :class="{
              dragging: draggingId === record.id,
              'drag-over': dragOverId === record.id && draggingId !== record.id,
            }"
            elevation="2"
            border
            draggable="true"
            @dragstart="onDragStart($event, record)"
            @dragover="onDragOver($event, section.records, record)"
            @drop.prevent="onDrop(section.records, record)"
            @dragend="resetDrag">
            <v-card-title class="record-card-title d-flex justify-space-between align-center">
              <span class="record-title">
                <v-icon color="primary" class="mr-2"> {{ section.icon }} </v-icon>
                {{ record.title }}
                <v-tooltip v-if="mdAndUp" activator="parent" location="top" :text="record.title" />
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
              <div class="record-dates mb-2">
                {{ resolveStartDate(record) }}
                <v-icon size="small" class="mx-1"> mdi-arrow-right </v-icon>
                {{ resolveEndDate(record) }}
              </div>
              <div v-if="record.note" class="text-body-2 text-medium-emphasis note-text mb-2">
                {{ record.note }}
              </div>
              <div v-if="!isCountdown(record)" class="d-flex flex-wrap ga-2 mb-4">
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
              <div v-else class="mb-4" />

              <!-- 天數顯示 -->
              <v-divider class="mb-4" />
              <div class="days-display" :class="`days-${getDaysColor(getRecordDays(record))}`">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon class="mr-2"> mdi-clock-outline </v-icon>
                    <span class="days-label font-weight-medium">
                      {{ section.key === 'countdown' ? '剩餘天數' : '天數' }}
                    </span>
                  </div>
                  <div class="days-value font-weight-bold">
                    {{ getRecordDays(record) }}
                    <span class="days-label">天</span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 空狀態 -->
      <v-alert
        v-if="section.records.length === 0 && !isLoading"
        type="info"
        variant="tonal"
        class="text-center">
        <div>{{ section.emptyText }}</div>
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
            <div class="stat-value font-weight-bold text-blue">{{ records.length }}</div>
            <div class="text-body-2 text-grey">總記錄數</div>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="stat-item">
            <v-icon color="green" size="large" class="mb-2"> mdi-sigma </v-icon>
            <div class="stat-value font-weight-bold text-green">{{ totalDays }}</div>
            <div class="text-body-2 text-grey">總天數（最早起始日至最晚結束日）</div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- 新增 / 編輯視窗 -->
  <v-dialog v-model="dialogOpen" max-width="520" persistent>
    <v-card>
      <v-card-title>{{ dialogTitle }}</v-card-title>

      <v-card-text>
        <v-text-field
          v-model="form.title"
          label="名稱"
          variant="outlined"
          color="primary"
          maxlength="50"
          counter
          class="mb-2" />

        <template v-if="form.kind === 'countdown'">
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            起始日永遠為今天，到達結束日後剩餘天數為 0
          </v-alert>

          <v-text-field
            v-model="form.endDate"
            label="結束日期"
            type="date"
            variant="outlined"
            color="primary"
            class="mb-2" />
        </template>

        <template v-else>
          <v-text-field
            v-model="form.startDate"
            label="起始日期"
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
        </template>

        <v-textarea
          v-model="form.note"
          label="備註（選填）"
          variant="outlined"
          color="primary"
          rows="2"
          auto-grow
          maxlength="200"
          counter
          class="mt-4" />

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
import type {
  DateRangeEndMode,
  DateRangeStartMode,
  DateRecordDto,
  DateRecordInput,
} from '~~/shared/types/api';
import { useDisplay } from 'vuetify';

const { mdAndUp } = useDisplay();

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

// 倒數：起始日永遠為今天（不可指定）且結束日為指定日期；其餘歸在數日子
const isCountdown = (record: DateRecordDto): boolean =>
  record.startMode === 'today' && record.endMode === 'fixed';

const sections = computed(() => [
  {
    key: 'countdown',
    icon: 'mdi-timer-sand',
    title: '倒數',
    description: '起始日為今天，計算距離指定結束日還剩幾天（可拖曳卡片調整順序）',
    emptyText: '目前沒有倒數，點擊上方「新增倒數」按鈕開始使用',
    records: records.value.filter(isCountdown),
  },
  {
    key: 'count',
    icon: 'mdi-calendar-check',
    title: '數日子',
    description: '計算起始日到結束日之間已經過了幾天（可拖曳卡片調整順序）',
    emptyText: '目前沒有數日子記錄，點擊上方「新增數日子」按鈕開始使用',
    records: records.value.filter(record => !isCountdown(record)),
  },
]);
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
  kind: 'countdown' | 'count';
  title: string;
  note: string;
  startMode: DateRangeStartMode;
  startDate: string;
  endMode: DateRangeEndMode;
  endDate: string;
  includeStartDay: boolean;
}

const createEmptyForm = (): FormState => {
  const today = getTodayString();
  return {
    id: null,
    kind: 'count',
    title: '',
    note: '',
    startMode: 'fixed',
    startDate: today,
    endMode: 'fixed',
    endDate: today,
    includeStartDay: true,
  };
};

const dialogOpen = ref(false);
const submitted = ref(false);
const form = reactive<FormState>(createEmptyForm());

const dialogTitle = computed(() => {
  const name = form.kind === 'countdown' ? '倒數' : '數日子';
  return `${form.id === null ? '新增' : '編輯'}${name}`;
});

const formError = computed((): string | null => {
  if (!form.title.trim()) return '請輸入名稱';
  if (form.kind === 'countdown') return form.endDate ? null : '請選擇結束日';
  if (!form.startDate) return '請選擇起始日';
  if (form.endMode === 'fixed') {
    if (!form.endDate) return '請選擇結束日';
    if (form.endDate < form.startDate) return '結束日不可早於起始日';
  }
  return null;
});

const openCreateDialog = (kind: FormState['kind']) => {
  Object.assign(form, createEmptyForm(), { kind });
  submitted.value = false;
  dialogOpen.value = true;
};

const openEditDialog = (record: DateRecordDto) => {
  Object.assign(form, {
    id: record.id,
    kind: isCountdown(record) ? 'countdown' : 'count',
    title: record.title,
    note: record.note,
    startMode: 'fixed',
    startDate: record.startMode === 'today' ? getTodayString() : record.startDate,
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
  const isCountdownForm = form.kind === 'countdown';
  const saved = await submit(
    {
      records: [
        {
          id: form.id ?? undefined,
          title: form.title.trim(),
          note: form.note.trim(),
          startMode: isCountdownForm ? 'today' : 'fixed',
          startDate: form.startDate,
          endMode: isCountdownForm ? 'fixed' : form.endMode,
          endDate: isCountdownForm || form.endMode === 'fixed' ? form.endDate : null,
          includeStartDay: isCountdownForm ? false : form.includeStartDay,
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

// 拖曳放下後重新排列，沿用原本的 sortOrder 值並只送出有變動的卡片
const draggingId = ref<number | null>(null);
const dragOverId = ref<number | null>(null);

const resetDrag = () => {
  draggingId.value = null;
  dragOverId.value = null;
};

const onDragStart = (event: DragEvent, record: DateRecordDto) => {
  draggingId.value = record.id;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    // Firefox 需要設定資料才會觸發拖曳
    event.dataTransfer.setData('text/plain', String(record.id));
  }
};

// 只允許在同一個區塊內拖曳
const onDragOver = (event: DragEvent, list: DateRecordDto[], record: DateRecordDto) => {
  if (draggingId.value === null || !list.some(item => item.id === draggingId.value)) return;
  event.preventDefault();
  dragOverId.value = record.id;
};

const onDrop = async (list: DateRecordDto[], target: DateRecordDto) => {
  const fromId = draggingId.value;
  resetDrag();
  if (fromId === null || fromId === target.id || saving.value) return;

  const fromIndex = list.findIndex(item => item.id === fromId);
  const toIndex = list.findIndex(item => item.id === target.id);
  if (fromIndex < 0 || toIndex < 0) return;

  const reordered = [...list];
  const [moved] = reordered.splice(fromIndex, 1);
  if (!moved) return;
  reordered.splice(toIndex, 0, moved);

  const orders = list.map(item => item.sortOrder);
  const changed = reordered
    .map((item, index) => ({ ...item, sortOrder: orders[index] ?? item.sortOrder }))
    .filter(item => item.sortOrder !== list.find(old => old.id === item.id)?.sortOrder);

  if (changed.length > 0) await submit({ records: changed }, '已調整順序');
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

// 「永遠為今天」的起始日不會超過固定結束日；今天到達結束日後即停止推移（倒數用）
const resolveStartDate = (record: DateRecordDto): string => {
  if (record.startMode !== 'today') return record.startDate;
  const today = getTodayString();
  return record.endMode === 'fixed' && record.endDate !== null && today > record.endDate
    ? record.endDate
    : today;
};

const getRecordDays = (record: DateRecordDto): number =>
  calculateDays(resolveStartDate(record), resolveEndDate(record), record.includeStartDay);

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

  const earliestStart = records.value.map(resolveStartDate).reduce((a, b) => (b < a ? b : a));
  const latestEnd = records.value.map(resolveEndDate).reduce((a, b) => (b > a ? b : a));

  return calculateDays(earliestStart, latestEnd, true);
});
</script>

<style scoped>
.record-card {
  height: 100%;
  cursor: grab;
  transition: all 0.3s ease;
}

.record-card:active {
  cursor: grabbing;
}

.record-card.dragging {
  opacity: 0.4;
}

.record-card.drag-over {
  outline: 2px dashed rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.record-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.note-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.record-title {
  min-width: 0;
  font-size: 1.25rem;
  font-weight: 500;
  overflow-wrap: anywhere;
  white-space: normal;
}

.record-dates {
  font-size: 1rem;
  overflow-wrap: anywhere;
}

.days-label {
  font-size: 1rem;
}

.days-value {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 2.125rem;
}

/* 桌面版名稱超過寬度時截斷，完整內容由 tooltip 顯示 */
@media (min-width: 960px) {
  .record-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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

  .section-title,
  .record-card-title {
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .record-title {
    font-size: 1.05rem;
  }

  .record-dates,
  .days-label {
    font-size: 0.875rem;
  }

  .days-value {
    font-size: 1.25rem;
  }

  .days-display {
    padding: 12px;
  }

  .stat-value {
    font-size: 1.75rem;
  }
}
</style>
