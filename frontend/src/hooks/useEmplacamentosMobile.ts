import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emplacamentosMobileApi } from '../api/emplacamentosMobile.api';
import { EmplacamentoMobileQuantidades } from '../types';

const queryKey = (data: string) => ['emplacamentos-mobile', data];

export function useEmplacamentosMobile(data: string) {
  return useQuery({ queryKey: queryKey(data), queryFn: () => emplacamentosMobileApi.getByDate(data) });
}

export function useSalvarEmplacamentosMobile(data: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quantidades: EmplacamentoMobileQuantidades) => emplacamentosMobileApi.save(data, quantidades),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey(data) }),
  });
}
