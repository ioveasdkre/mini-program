<template>
  <div class="time-calculator-container">
    <!-- 標題區塊 -->
    <div class="text-center mb-8">
      <h1 class="text-h3 font-weight-bold text-grey-darken-3 mb-2">
        <v-icon size="large" color="primary" class="mr-3"> mdi-clock </v-icon>
        工時計算器
      </h1>
      <p class="text-h6 text-grey-darken-1">計算每月需要的工作時數（21日-20日週期）</p>
    </div>

    <!-- 載入狀態和錯誤提示 -->
    <v-alert v-if="loadingHolidays" type="info" variant="tonal" class="mb-4" icon="mdi-loading">
      <template #prepend>
        <v-progress-circular indeterminate size="20" />
      </template>
      正在載入假日資料...
    </v-alert>

    <v-alert v-if="holidayError" type="warning" variant="tonal" class="mb-4">
      {{ holidayError }}
    </v-alert>

    <!-- 當前週期資訊 -->
    <v-card class="mb-6" elevation="3">
      <v-card-text>
        <div class="period-info-grid">
          <!-- 當前週期 -->
          <v-card color="blue-lighten-5" class="text-center pa-4">
            <v-card-title class="text-h6 text-blue-darken-2 mb-2"> 當前週期 </v-card-title>
            <v-card-text>
              <p class="text-blue-darken-1 text-h6">
                {{ currentPeriod.start }} - {{ currentPeriod.end }}
              </p>
              <p class="text-caption text-grey-darken-1 mt-2">{{ getDaysRemaining() }}天後重置</p>
            </v-card-text>
          </v-card>

          <!-- 需要工時 -->
          <v-card color="green-lighten-5" class="text-center pa-4">
            <v-card-title class="text-h6 text-green-darken-2 mb-2"> 需要工時 </v-card-title>
            <v-card-text>
              <p class="text-h3 font-weight-bold text-green-darken-1">{{ requiredHours }}</p>
              <p class="text-caption text-grey-darken-1">小時</p>
            </v-card-text>
          </v-card>

          <!-- 工作天數 -->
          <v-card color="orange-lighten-5" class="text-center pa-4">
            <v-card-title class="text-h6 text-orange-darken-2 mb-2"> 工作天數 </v-card-title>
            <v-card-text>
              <p class="text-h3 font-weight-bold text-orange-darken-1">{{ workingDays }}</p>
              <p class="text-caption text-grey-darken-1">天</p>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <!-- 詳細日曆 -->
    <v-card class="mb-6" elevation="3">
      <v-card-title>
        <v-icon color="primary" class="mr-2"> mdi-calendar </v-icon>
        工作日曆
      </v-card-title>

      <v-card-text>
        <!-- 月份選擇 -->
        <div class="month-navigation mb-4 d-flex justify-space-between align-center">
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-chevron-left"
            @click="previousMonth">
            上月
          </v-btn>
          <h3 class="text-h5 font-weight-medium">{{ formatPeriod(selectedDate) }}</h3>
          <v-btn
            color="primary"
            variant="elevated"
            append-icon="mdi-chevron-right"
            @click="nextMonth">
            下月
          </v-btn>
        </div>

        <!-- 日曆網格 -->
        <div class="calendar-grid mb-4">
          <!-- 星期標題 -->
          <div
            v-for="day in weekDays"
            :key="day"
            class="calendar-header text-center font-weight-bold text-grey-darken-2 py-2">
            {{ day }}
          </div>

          <!-- 日期格子 -->
          <v-card
            v-for="(day, index) in calendarDays"
            :key="index"
            :color="getDayColor(day)"
            :variant="day.isCurrentPeriod ? 'elevated' : 'elevated'"
            :elevation="day.isCurrentPeriod ? 2 : 1"
            :class="[
              'calendar-day text-center',
              {
                'non-current-period': !day.isCurrentPeriod,
                'focused-day': isFocused(day),
              },
            ]"
            @click="focusDay(day)">
            <v-card-text class="pa-2">
              <div class="font-weight-medium">{{ day.date }}</div>
              <div v-if="day.isWorkDay" class="text-caption text-green-darken-2 mt-1">
                <v-icon size="small" color="green-darken-2"> mdi-briefcase </v-icon>
                <div class="font-weight-bold">{{ day.cumulativeHours }}h</div>
              </div>
              <div v-else-if="day.isHoliday" class="text-caption text-red-darken-2 mt-1">
                <v-icon size="small" color="red-darken-2"> mdi-home </v-icon>
                <div v-if="day.holidayDescription" class="holiday-text">
                  {{ day.holidayDescription }}
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- 圖例 -->
        <v-row class="mt-4">
          <v-col cols="12">
            <div class="d-flex flex-wrap ga-4">
              <v-chip color="green-lighten-3" variant="outlined">
                <v-icon start>mdi-briefcase</v-icon>
                工作日
              </v-chip>
              <v-chip color="red-lighten-3" variant="outlined">
                <v-icon start>mdi-home</v-icon>
                假日
              </v-chip>
              <v-chip color="white" variant="outlined" class="grey-border">
                <v-icon start color="grey">mdi-calendar-blank</v-icon>
                <span class="text-grey">非本週期</span>
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 統計資訊 -->
    <v-card elevation="3">
      <v-card-title>
        <v-icon color="primary" class="mr-2"> mdi-chart-bar </v-icon>
        統計資訊
      </v-card-title>

      <v-card-text>
        <div class="stats-grid">
          <div>
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon color="grey-darken-2">mdi-calendar-range</v-icon>
                </template>
                <v-list-item-title>總天數：</v-list-item-title>
                <template #append>
                  <span class="font-weight-bold">{{ totalDays }} 天</span>
                </template>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="green-darken-2">mdi-briefcase</v-icon>
                </template>
                <v-list-item-title>工作天數：</v-list-item-title>
                <template #append>
                  <span class="font-weight-bold text-green-darken-2">{{ workingDays }} 天</span>
                </template>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="red-darken-2">mdi-home</v-icon>
                </template>
                <v-list-item-title>假日天數：</v-list-item-title>
                <template #append>
                  <span class="font-weight-bold text-red-darken-2">{{ holidayDays }} 天</span>
                </template>
              </v-list-item>
            </v-list>
          </div>

          <div>
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon color="grey-darken-2">mdi-clock</v-icon>
                </template>
                <v-list-item-title>每日工時：</v-list-item-title>
                <template #append>
                  <span class="font-weight-bold">8 小時</span>
                </template>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="blue-darken-2">mdi-calculator</v-icon>
                </template>
                <v-list-item-title>總需工時：</v-list-item-title>
                <template #append>
                  <span class="font-weight-bold text-blue-darken-2">{{ requiredHours }} 小時</span>
                </template>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="green-darken-2">mdi-chart-line</v-icon>
                </template>
                <v-list-item-title>平均每週：</v-list-item-title>
                <template #append>
                  <span class="font-weight-bold text-green-darken-2"
                    >{{ averageWeeklyHours }} 小時</span
                  >
                </template>
              </v-list-item>
            </v-list>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';

// 響應式數據
const selectedDate = ref(new Date());
const focusedDate = ref<Date | null>(null);

// 基礎數據
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// TypeScript 介面定義
interface CalendarDay {
  date: number;
  isCurrentPeriod: boolean;
  isWorkDay: boolean;
  isHoliday: boolean;
  fullDate: Date;
  cumulativeHours: number;
  holidayDescription?: string;
}

// 假日資料獲取函數
const fetchHolidays = async (year: number): Promise<Record<string, string>> => {
  const response = await fetch(
    `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // 將 API 回傳的日期格式轉換為 MM-dd 格式，並儲存描述
  const holidays: Record<string, string> = {};

  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === 'object' && 'date' in item && 'isHoliday' in item) {
        const dateItem = item as { date: string; isHoliday: boolean; description?: string };
        if (dateItem.isHoliday && dateItem.date) {
          // 將 YYYYMMDD 格式轉換為 MM-DD
          const dateStr = dateItem.date;
          if (dateStr.length === 8) {
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            const monthDay = `${month}-${day}`;
            holidays[monthDay] = dateItem.description || '假日';
          }
        }
      }
    }
  }

  return holidays;
};

// 工具函數
const getPeriodForDate = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  let startDate: Date, endDate: Date;

  if (day >= 21) {
    // 如果日期 >= 21，本月21日到下月20日
    startDate = new Date(year, month, 21);
    endDate = new Date(year, month + 1, 20);
  } else {
    // 如果日期 < 21，上月21日到本月20日
    startDate = new Date(year, month - 1, 21);
    endDate = new Date(year, month, 20);
  }

  return {
    startDate,
    endDate,
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
};

const formatDate = (date: Date) => {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(
    date.getDate(),
  ).padStart(2, '0')}`;
};

// 獲取需要載入的年份
const getRequiredYears = (date: Date) => {
  const period = getPeriodForDate(date);
  const startYear = period.startDate.getFullYear();
  const endYear = period.endDate.getFullYear();
  return Array.from(new Set([startYear, endYear]));
};

// 使用 Vue Query 獲取假日資料
const requiredYears = computed(() => getRequiredYears(selectedDate.value));

// 預先創建所有可能需要的年份查詢（當前年份和前後一年）
const currentYear = new Date().getFullYear();
const yearsToLoad = [currentYear - 1, currentYear, currentYear + 1];

// 為每個年份創建查詢
const holidayQueries = yearsToLoad.map(year =>
  useQuery({
    queryKey: ['holidays', year],
    queryFn: () => fetchHolidays(year),
    staleTime: 1000 * 60 * 60 * 24, // 24 小時
    retry: 2,
  }),
);

// 創建假日資料的對應表
const holidayDataMap = computed(() => {
  const map = new Map<number, Record<string, string>>();

  holidayQueries.forEach((query, index) => {
    const year = yearsToLoad[index];
    if (year !== undefined && query.data.value) {
      map.set(year, query.data.value);
    }
  });

  return map;
});

// 合併所需年份的假日資料
const allHolidays = computed(() => {
  const merged: Record<string, string> = {};
  const needed = requiredYears.value;

  for (const year of needed) {
    const yearData = holidayDataMap.value.get(year);
    if (yearData) {
      Object.assign(merged, yearData);
    }
  }

  return merged;
});

// 載入狀態和錯誤
const loadingHolidays = computed(() => {
  const needed = requiredYears.value;
  return holidayQueries.some((query, index) => {
    const year = yearsToLoad[index];
    return year !== undefined && needed.includes(year) && query.isLoading.value;
  });
});

const holidayError = computed(() => {
  const needed = requiredYears.value;
  const errorQuery = holidayQueries.find((query, index) => {
    const year = yearsToLoad[index];
    return year !== undefined && needed.includes(year) && query.error.value;
  });
  return errorQuery?.error.value?.message || null;
});

// 計算屬性
const currentPeriod = computed(() => {
  const today = new Date();
  return getPeriodForDate(today);
});

const selectedPeriod = computed(() => {
  return getPeriodForDate(selectedDate.value);
});

const calendarDays = computed((): CalendarDay[] => {
  const period = selectedPeriod.value;
  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);

  // 取得第一天是星期幾
  const firstDayOfWeek = startDate.getDay();

  // 建立日曆陣列
  const days: CalendarDay[] = [];

  // 添加前面的空白天數
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevDate = new Date(startDate);
    prevDate.setDate(startDate.getDate() - (firstDayOfWeek - i));
    days.push({
      date: prevDate.getDate(),
      isCurrentPeriod: false,
      isWorkDay: false,
      isHoliday: false,
      fullDate: new Date(prevDate),
      cumulativeHours: 0,
    });
  }

  // 添加本週期的天數，並計算累計工時
  const currentDate = new Date(startDate);
  let cumulativeHours = 0;

  while (currentDate <= endDate) {
    const isWorkDay = isWorkingDay(currentDate);
    const isHoliday = isHolidayDay(currentDate);
    const holidayDescription = getHolidayDescription(currentDate);

    if (isWorkDay) {
      cumulativeHours += 8;
    }

    days.push({
      date: currentDate.getDate(),
      isCurrentPeriod: true,
      isWorkDay: isWorkDay,
      isHoliday: isHoliday,
      fullDate: new Date(currentDate),
      cumulativeHours: cumulativeHours,
      holidayDescription: holidayDescription || undefined,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 補足到完整的週
  while (days.length % 7 !== 0) {
    const nextDate = new Date(endDate);
    nextDate.setDate(endDate.getDate() + ((days.length % 7) - 6));
    days.push({
      date: nextDate.getDate(),
      isCurrentPeriod: false,
      isWorkDay: false,
      isHoliday: false,
      fullDate: new Date(nextDate),
      cumulativeHours: 0,
    });
  }

  return days;
});

const workingDays = computed(() => {
  const period = selectedPeriod.value;
  let count = 0;
  const currentDate = new Date(period.startDate);

  while (currentDate <= period.endDate) {
    if (isWorkingDay(currentDate)) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
});

const totalDays = computed(() => {
  const period = selectedPeriod.value;
  const diffTime = period.endDate.getTime() - period.startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

const holidayDays = computed(() => {
  return totalDays.value - workingDays.value;
});

const requiredHours = computed(() => {
  return workingDays.value * 8;
});

const averageWeeklyHours = computed(() => {
  const weeks = totalDays.value / 7;
  return Math.round(requiredHours.value / weeks);
});

const isWorkingDay = (date: Date) => {
  // 週六日不是工作日
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // 檢查是否為假日
  return !isHolidayDay(date);
};

const isHolidayDay = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${month}-${day}`;

  // 檢查週末
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true;
  }

  // 檢查假日列表（使用 Vue Query 資料）
  return dateString in allHolidays.value;
};

const getHolidayDescription = (date: Date): string | null => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${month}-${day}`;

  return allHolidays.value[dateString] || null;
};

const formatPeriod = (date: Date) => {
  const period = getPeriodForDate(date);
  return `${period.start} ~ ${period.end}`;
};

const getDaysRemaining = () => {
  const today = new Date();
  const period = currentPeriod.value;
  const diffTime = period.endDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

const getDayColor = (day: CalendarDay) => {
  if (!day.isCurrentPeriod) {
    return 'white';
  }

  if (day.isWorkDay) {
    return 'green-lighten-4';
  } else if (day.isHoliday) {
    return 'red-lighten-4';
  }

  return 'grey-lighten-3';
};

const previousMonth = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  selectedDate.value = newDate;
};

const nextMonth = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  selectedDate.value = newDate;
};

// 聚焦功能
const focusDay = (day: CalendarDay) => {
  // 如果點擊的是已經聚焦的日期，則取消聚焦
  if (isFocused(day)) {
    focusedDate.value = null;
  } else {
    focusedDate.value = new Date(day.fullDate);
  }
};

const isFocused = (day: CalendarDay): boolean => {
  if (!focusedDate.value) return false;

  const focused = focusedDate.value;
  const dayDate = day.fullDate;

  return (
    focused.getDate() === dayDate.getDate() &&
    focused.getMonth() === dayDate.getMonth() &&
    focused.getFullYear() === dayDate.getFullYear()
  );
};
</script>

<style scoped>
.time-calculator-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 16px;
}

.period-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  max-width: 700px;
  margin: 0 auto;
}

.calendar-header {
  padding: 8px 4px;
}

.calendar-day {
  aspect-ratio: 1;
  min-height: 90px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
}

.calendar-day:hover:not(.focused-day) {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.calendar-day:active {
  transform: scale(0.98);
}

.non-current-period {
  border: 1px solid rgb(158, 158, 158) !important;
  opacity: 1;
}

/* 非本週期 hover 效果 - 與其他格子相同 */
.non-current-period:hover:not(.focused-day) {
  background-color: rgba(0, 0, 0, 0.04) !important;
}

.non-current-period:hover:not(.focused-day) .v-card-text {
  color: rgb(66, 66, 66) !important;
}

.non-current-period:hover:not(.focused-day) .font-weight-medium {
  color: rgb(33, 33, 33) !important;
}

.non-current-period .v-card-text {
  color: rgb(117, 117, 117) !important;
}

.non-current-period .font-weight-medium {
  font-weight: 500 !important;
  color: rgb(97, 97, 97) !important;
}

.non-current-period .v-icon {
  color: rgb(158, 158, 158) !important;
}

.non-current-period .text-caption {
  color: rgb(117, 117, 117) !important;
}

.grey-border {
  border-color: rgb(158, 158, 158) !important;
}

.text-grey {
  color: rgb(117, 117, 117) !important;
}

/* 假日文字樣式 */
.holiday-text {
  font-size: 0.7rem !important;
  font-weight: 500;
  line-height: 1.1;
  margin-top: 2px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-height: 28px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 聚焦日期樣式 */
.focused-day {
  border: 3px solid #1976d2 !important;
  box-shadow:
    0 0 0 1px #1976d2,
    0 4px 12px rgba(25, 118, 210, 0.3) !important;
  transform: scale(1.05);
  z-index: 10;
  transition: all 0.2s ease-in-out;
}

.focused-day .v-card-text {
  padding: 6px 8px !important;
}

/* 非本週期且聚焦的樣式 - 與其他格子相同 */
.non-current-period.focused-day {
  background-color: rgba(25, 118, 210, 0.05) !important;
}

.non-current-period.focused-day .v-card-text {
  color: rgb(66, 66, 66) !important;
}

.non-current-period.focused-day .font-weight-medium {
  color: rgb(33, 33, 33) !important;
  font-weight: 600 !important;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .time-calculator-container {
    padding: 0 8px;
  }

  .period-info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .calendar-grid {
    gap: 4px;
    max-width: 100%;
  }

  .calendar-day {
    min-height: 70px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .period-info-grid {
    gap: 12px;
  }
}
</style>
