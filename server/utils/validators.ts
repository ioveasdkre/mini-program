import type { H3Event } from 'h3';

// 中文訊息放在 message，statusMessage 只能是 ASCII
const invalid = (message: string) => createError({ statusCode: 400, message });

export const asRecord = (value: unknown, label = '內容'): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw invalid(`${label}格式錯誤`);
  }
  return value as Record<string, unknown>;
};

export const asArray = (value: unknown, label: string, maxLength: number): unknown[] => {
  if (!Array.isArray(value)) throw invalid(`${label}格式錯誤`);
  if (value.length > maxLength) throw invalid(`${label}最多 ${maxLength} 筆`);
  return value;
};

export const asIsoDate = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw invalid(`${label}格式錯誤`);
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw invalid(`${label}不是有效日期`);
  }
  return value;
};

export const asText = (value: unknown, label: string, maxLength: number): string => {
  if (typeof value !== 'string') throw invalid(`${label}格式錯誤`);
  const text = value.trim();
  if (text.length === 0) throw invalid(`${label}不可為空`);
  if (text.length > maxLength) throw invalid(`${label}最多 ${maxLength} 字`);
  return text;
};

export const asNumber = (
  value: unknown,
  label: string,
  min: number,
  max: number,
  integer = false,
): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid(`${label}必須是數字`);
  if (integer && !Number.isInteger(value)) throw invalid(`${label}必須是整數`);
  if (value < min || value > max) throw invalid(`${label}必須介於 ${min} 到 ${max}`);
  return value;
};

export const asBoolean = (value: unknown, label: string): boolean => {
  if (typeof value !== 'boolean') throw invalid(`${label}格式錯誤`);
  return value;
};

export const asOneOf = <T extends string>(
  value: unknown,
  label: string,
  options: readonly T[],
): T => {
  const match = options.find(option => option === value);
  if (match === undefined) throw invalid(`${label}格式錯誤`);
  return match;
};

export const asRouteId = (event: H3Event): number => {
  const id = Number(getRouterParam(event, 'id'));
  if (!Number.isInteger(id) || id <= 0) throw invalid('編號格式錯誤');
  return id;
};
