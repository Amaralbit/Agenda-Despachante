import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { servicosApi } from '../api/servicos.api';
import { CreateServicoForm, StatusServico, TipoServico } from '../types';

const QUERY_KEY = 'servicos';

interface UseServicosParams {
  status?: StatusServico;
  tipo?: TipoServico;
  search?: string;
}

export function useServicos(params: UseServicosParams = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => servicosApi.list(params),
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusServico }) =>
      servicosApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useCreateServico() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServicoForm) => servicosApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteServico() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicosApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
