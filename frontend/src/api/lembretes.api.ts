import { authFetch, handleResponse } from '../lib/api';
import { API_BASE } from '../lib/config';
import { CreateLembreteForm, Lembrete } from '../types';

const BASE = `${API_BASE}/api/lembretes`;

export const lembretesApi = {
  list: () => authFetch(BASE).then((res) => handleResponse<Lembrete[]>(res)),
  create: (data: CreateLembreteForm) =>
    authFetch(BASE, { method: 'POST', body: JSON.stringify(data) }).then((res) => handleResponse<Lembrete>(res)),
  updateConclusao: (id: string, concluido: boolean) =>
    authFetch(`${BASE}/${id}/conclusao`, {
      method: 'PATCH',
      body: JSON.stringify({ concluido }),
    }).then((res) => handleResponse<Lembrete>(res)),
  remove: (id: string) => authFetch(`${BASE}/${id}`, { method: 'DELETE' }),
};
