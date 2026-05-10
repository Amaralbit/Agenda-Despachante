import { authFetch, handleResponse } from '../lib/api';
import { CreateServicoForm, Servico, StatusServico, TipoServico } from '../types';

const BASE = '/api/servicos';

interface ListParams {
  status?: StatusServico;
  tipo?: TipoServico;
  search?: string;
}

export const servicosApi = {
  list(params: ListParams = {}): Promise<Servico[]> {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.tipo)   qs.set('tipo', params.tipo);
    if (params.search) qs.set('search', params.search);

    return authFetch(`${BASE}?${qs}`).then((r) => handleResponse<Servico[]>(r));
  },

  getById(id: string): Promise<Servico> {
    return authFetch(`${BASE}/${id}`).then((r) => handleResponse<Servico>(r));
  },

  create(data: CreateServicoForm): Promise<Servico> {
    return authFetch(BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Servico>(r));
  },

  updateStatus(id: string, status: StatusServico): Promise<Servico> {
    return authFetch(`${BASE}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }).then((r) => handleResponse<Servico>(r));
  },

  update(id: string, data: Partial<CreateServicoForm & { status: StatusServico }>): Promise<Servico> {
    return authFetch(`${BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then((r) => handleResponse<Servico>(r));
  },

  remove(id: string): Promise<void> {
    return authFetch(`${BASE}/${id}`, { method: 'DELETE' }).then((r) => {
      if (!r.ok) throw new Error('Erro ao deletar serviço');
    });
  },
};
