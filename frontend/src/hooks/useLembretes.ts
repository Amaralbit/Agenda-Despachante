import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lembretesApi } from '../api/lembretes.api';
import { CreateLembreteForm } from '../types';

const QUERY_KEY = ['lembretes'];

export function useLembretes() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: lembretesApi.list });
}

export function useCreateLembrete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLembreteForm) => lembretesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateLembreteConclusao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, concluido }: { id: string; concluido: boolean }) =>
      lembretesApi.updateConclusao(id, concluido),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteLembrete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lembretesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
