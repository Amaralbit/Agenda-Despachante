import { authFetch, handleResponse } from '../lib/api';
import { API_BASE } from '../lib/config';
import { Cliente, Veiculo } from '../types';

const BASE = `${API_BASE}/api/clientes`;

export const clientesApi = {
  list(search?: string): Promise<(Cliente & { veiculos: Veiculo[] })[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return authFetch(`${BASE}${qs}`).then((r) => handleResponse(r));
  },

  getById(id: string): Promise<Cliente & { veiculos: Veiculo[] }> {
    return authFetch(`${BASE}/${id}`).then((r) => handleResponse(r));
  },

  create(data: { nome: string; telefone?: string; cpfCnpj: string }): Promise<Cliente> {
    return authFetch(BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((r) => handleResponse(r));
  },

  update(id: string, data: { nome?: string; telefone?: string; cpfCnpj?: string }): Promise<Cliente> {
    return authFetch(`${BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then((r) => handleResponse(r));
  },

  remove(id: string): Promise<void> {
    return authFetch(`${BASE}/${id}`, { method: 'DELETE' }).then((r) => {
      if (!r.ok) throw new Error('Erro ao deletar cliente');
    });
  },

  listVeiculos(clienteId: string): Promise<Veiculo[]> {
    return authFetch(`${BASE}/${clienteId}/veiculos`).then((r) => handleResponse(r));
  },

  createVeiculo(
    clienteId: string,
    data: { placa: string; modelo: string; renavam: string },
  ): Promise<Veiculo> {
    return authFetch(`${BASE}/${clienteId}/veiculos`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((r) => handleResponse(r));
  },
};
