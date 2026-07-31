import { authFetch, handleResponse } from '../lib/api';
import { API_BASE } from '../lib/config';
import {
  CreateEmplacamentoMobileVeiculo,
  EmplacamentoMobile,
  MarcaEmplacamento,
} from '../types';

const BASE = `${API_BASE}/api/emplacamentos-mobile`;

export const emplacamentosMobileApi = {
  listMarcas: () =>
    authFetch(`${BASE}/marcas`).then((res) => handleResponse<MarcaEmplacamento[]>(res)),
  createMarca: (nome: string) =>
    authFetch(`${BASE}/marcas`, {
      method: 'POST',
      body: JSON.stringify({ nome }),
    }).then((res) => handleResponse<MarcaEmplacamento>(res)),
  updateMarca: (id: string, ativa: boolean) =>
    authFetch(`${BASE}/marcas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ativa }),
    }).then((res) => handleResponse<MarcaEmplacamento>(res)),
  getByDate: (data: string) =>
    authFetch(`${BASE}?data=${encodeURIComponent(data)}`).then((res) => handleResponse<EmplacamentoMobile>(res)),
  addVeiculo: (data: string, veiculo: CreateEmplacamentoMobileVeiculo) =>
    authFetch(`${BASE}/${data}/veiculos`, {
      method: 'POST',
      body: JSON.stringify(veiculo),
    }).then((res) => handleResponse<EmplacamentoMobile>(res)),
  removeVeiculo: (id: string) =>
    authFetch(`${BASE}/veiculos/${id}`, { method: 'DELETE' }).then((res) => handleResponse<EmplacamentoMobile>(res)),
};
