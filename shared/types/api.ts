export type DateRangeEndMode = 'fixed' | 'today';

export interface DateRecordInput {
  // 沒有 id 代表新增
  id?: number;
  title: string;
  startDate: string;
  endMode: DateRangeEndMode;
  // endMode 為 today 時為 null
  endDate: string | null;
  // 是否計入起始當天（天數 +1）
  includeStartDay: boolean;
}

export interface DateRecordDto extends DateRecordInput {
  id: number;
}

export interface SaveDateRecordsInput {
  records: DateRecordInput[];
  deletedIds: number[];
}

export interface TimePeriodSaveDto {
  id: number;
  periodStart: string;
  name: string | null;
  createdBy: string;
  createdAt: string;
}

export interface TimePeriodSaveInput {
  periodStart: string;
  name?: string;
}

export interface SavingsScenarioInput {
  name: string;
  initialAmount: number;
  monthlyDeposit: number;
  annualRate: number;
  years: number;
}

export interface SavingsScenarioDto extends SavingsScenarioInput {
  id: number;
  updatedBy: string;
  updatedAt: string;
}
