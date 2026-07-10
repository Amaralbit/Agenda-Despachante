import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { processosApi } from '../api/processos.api';
import {
  CreateProcessoMontagemForm,
  ProcessoAnexoUpload,
  StatusProcessoMontagem,
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
    mutationFn: ({
      id,
      status,
      senhaConfirmacao,
    }: {
      id: string;
      status: StatusProcessoMontagem;
      senhaConfirmacao?: string;
    }) => processosApi.updateStatus(id, status, senhaConfirmacao),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useFinalizarProcesso() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      anexos,
      senhaConfirmacao,
    }: {
      id: string;
      anexos: ProcessoAnexoUpload[];
      senhaConfirmacao: string;
    }) => processosApi.finalizar(id, anexos, senhaConfirmacao),
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
