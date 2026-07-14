import { authFetch, handleResponse } from '../lib/api';
import { API_BASE } from '../lib/config';

const BASE = `${API_BASE}/api/conta`;

export interface Equipe {
  id: string;
  nome: string;
  membros: Array<{
    id: string;
    papel: 'PROPRIETARIO' | 'MEMBRO';
    createdAt: string;
    usuario: { id: string; nome: string; email: string };
  }>;
  convites: Array<{ id: string; email: string; expiraEm: string; createdAt: string }>;
}

export const contaApi = {
  equipe: () => authFetch(BASE).then((r) => handleResponse<Equipe>(r)),
  criarConvite: (email: string) => authFetch(`${BASE}/convites`, {
    method: 'POST', body: JSON.stringify({ email }),
  }).then((r) => handleResponse<{ id: string; email: string; token: string; expiraEm: string }>(r)),
  cancelarConvite: (id: string) => authFetch(`${BASE}/convites/${id}`, { method: 'DELETE' }),
  aceitarConvite: (token: string) => authFetch(`${API_BASE}/api/auth/convites/${token}/aceitar`, { method: 'POST' }),
};
