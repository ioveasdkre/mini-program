import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { DateRecordDto, SaveDateRecordsInput } from '~~/shared/types/api';

const QUERY_KEY = ['date-records'];

export const useDateRecordsQuery = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => $fetch<DateRecordDto[]>('/api/date-records'),
  });

export const useSaveDateRecords = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveDateRecordsInput) =>
      $fetch<DateRecordDto[]>('/api/date-records', { method: 'PUT', body: input }),
    onSuccess: saved => queryClient.setQueryData(QUERY_KEY, saved),
  });
};
