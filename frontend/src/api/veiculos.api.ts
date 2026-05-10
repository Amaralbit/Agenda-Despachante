import { authFetch, handleResponse } from '../lib/api';
import { Servico, Veiculo } from '../types';

const BASE = '/api/veiculos';

export interface VeiculoComHistorico extends Veiculo {
  cliente: import('../types').Cliente;
  servicos: (Servico & { cliente: import('../types').Cliente })[];
}

export const veiculosApi = {
  getById(id: string): Promise<VeiculoComHistorico> {
    return authFetch(`${BASE}/${id}`).then((r) => handleResponse(r));
  },

  update(id: string, data: { placa?: string; modelo?: string; renavam?: string }): Promise<Veiculo> {
    return authFetch(`${BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then((r) => handleResponse(r));
  },

  remove(id: string): Promise<void> {
    return authFetch(`${BASE}/${id}`, { method: 'DELETE' }).then((r) => {
      if (!r.ok) throw new Error('Erro ao deletar veículo');
    });
  },
};
