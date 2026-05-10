import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../api/clientes.api';

const KEY = 'clientes';

export function useClientes(search?: string) {
  return useQuery({
    queryKey: [KEY, search],
    queryFn: () => clientesApi.list(search),
  });
}

export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof clientesApi.update>[1] }) =>
      clientesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clientesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCreateVeiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clienteId, data }: { clienteId: string; data: { placa: string; modelo: string; renavam: string } }) =>
      clientesApi.createVeiculo(clienteId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
