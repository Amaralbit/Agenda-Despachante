import { authFetch, handleResponse } from '../lib/api';
import { API_BASE } from '../lib/config';
import { EmplacamentoMobile, EmplacamentoMobileQuantidades } from '../types';

const BASE = `${API_BASE}/api/emplacamentos-mobile`;

export const emplacamentosMobileApi = {
  getByDate: (data: string) =>
    authFetch(`${BASE}?data=${encodeURIComponent(data)}`).then((res) => handleResponse<EmplacamentoMobile>(res)),
  save: (data: string, quantidades: EmplacamentoMobileQuantidades) =>
    authFetch(`${BASE}/${data}`, {
      method: 'PUT',
      body: JSON.stringify(quantidades),
    }).then((res) => handleResponse<EmplacamentoMobile>(res)),
};
