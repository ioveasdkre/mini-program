import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { TimePeriodSaveDto, TimePeriodSaveInput } from '~~/shared/types/api';

const QUERY_KEY = ['time-periods'];

export const useTimePeriodsQuery = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => $fetch<TimePeriodSaveDto[]>('/api/time-periods'),
  });

export const useCreateTimePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TimePeriodSaveInput) =>
      $fetch<TimePeriodSaveDto[]>('/api/time-periods', { method: 'POST', body: input }),
    onSuccess: saved => queryClient.setQueryData(QUERY_KEY, saved),
  });
};

export const useRemoveTimePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      $fetch<TimePeriodSaveDto[]>(`/api/time-periods/${id}`, { method: 'DELETE' }),
    onSuccess: saved => queryClient.setQueryData(QUERY_KEY, saved),
  });
};
