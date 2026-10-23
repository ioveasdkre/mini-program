// 優先取伺服器回傳的錯誤訊息
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const data = (error as { data?: { message?: unknown } }).data;
    if (typeof data?.message === 'string') return data.message;
    if (error instanceof Error) return error.message;
  }
  return '發生未知錯誤';
};
