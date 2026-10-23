import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { SavingsScenarioDto, SavingsScenarioInput } from '~~/shared/types/api';

const QUERY_KEY = ['savings-scenarios'];

export const useSavingsScenariosQuery = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => $fetch<SavingsScenarioDto[]>('/api/savings-scenarios'),
  });

export const useCreateSavingsScenario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SavingsScenarioInput) =>
      $fetch<SavingsScenarioDto[]>('/api/savings-scenarios', { method: 'POST', body: input }),
    onSuccess: saved => queryClient.setQueryData(QUERY_KEY, saved),
  });
};

export const useUpdateSavingsScenario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: number; input: SavingsScenarioInput }) =>
      $fetch<SavingsScenarioDto[]>(`/api/savings-scenarios/${params.id}`, {
        method: 'PUT',
        body: params.input,
      }),
    onSuccess: saved => queryClient.setQueryData(QUERY_KEY, saved),
  });
};

export const useRemoveSavingsScenario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      $fetch<SavingsScenarioDto[]>(`/api/savings-scenarios/${id}`, { method: 'DELETE' }),
    onSuccess: saved => queryClient.setQueryData(QUERY_KEY, saved),
  });
};
