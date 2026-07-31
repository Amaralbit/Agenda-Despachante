import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emplacamentosMobileApi } from '../api/emplacamentosMobile.api';
import { CreateEmplacamentoMobileVeiculo } from '../types';

const queryKey = (data: string) => ['emplacamentos-mobile', data];
const marcasQueryKey = ['emplacamentos-mobile', 'marcas'];

export function useMarcasEmplacamento() {
  return useQuery({ queryKey: marcasQueryKey, queryFn: emplacamentosMobileApi.listMarcas });
}

export function useCriarMarcaEmplacamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nome: string) => emplacamentosMobileApi.createMarca(nome),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: marcasQueryKey }),
  });
}

export function useAtualizarMarcaEmplacamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ativa }: { id: string; ativa: boolean }) =>
      emplacamentosMobileApi.updateMarca(id, ativa),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: marcasQueryKey }),
  });
}

export function useEmplacamentosMobile(data: string) {
  return useQuery({ queryKey: queryKey(data), queryFn: () => emplacamentosMobileApi.getByDate(data) });
}

export function useAdicionarVeiculoEmplacamento(data: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (veiculo: CreateEmplacamentoMobileVeiculo) => emplacamentosMobileApi.addVeiculo(data, veiculo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey(data) }),
  });
}

export function useRemoverVeiculoEmplacamento(data: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emplacamentosMobileApi.removeVeiculo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey(data) }),
  });
}
