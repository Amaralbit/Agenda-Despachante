import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emplacamentosMobileApi } from '../api/emplacamentosMobile.api';
import { CreateEmplacamentoMobileVeiculo } from '../types';

const queryKey = (data: string) => ['emplacamentos-mobile', data];

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
