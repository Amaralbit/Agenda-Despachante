import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { processosApi } from '../api/processos.api';
import {
  CreateProcessoMontagemForm,
  ProcessoAnexoUpload,
  StatusServico,
} from '../types';

const QUERY_KEY = 'processos';

export function useProcessos() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => processosApi.list(),
  });
}

export function useCreateProcesso() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProcessoMontagemForm) => processosApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateProcessoStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusServico }) =>
      processosApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useFinalizarProcesso() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, anexos }: { id: string; anexos: ProcessoAnexoUpload[] }) =>
      processosApi.finalizar(id, anexos),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useSalvarProcessoAnexos() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, anexos }: { id: string; anexos: ProcessoAnexoUpload[] }) =>
      processosApi.salvarAnexos(id, anexos),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteProcesso() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => processosApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
