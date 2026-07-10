import { authFetch, handleResponse } from '../lib/api';
import { API_BASE } from '../lib/config';
import {
  CreateProcessoMontagemForm,
  ProcessoAnexoUpload,
  ProcessoMontagem,
  StatusServico,
} from '../types';

const BASE = `${API_BASE}/api/processos`;

export const processosApi = {
  list(): Promise<ProcessoMontagem[]> {
    return authFetch(BASE).then((r) => handleResponse<ProcessoMontagem[]>(r));
  },

  create(data: CreateProcessoMontagemForm): Promise<ProcessoMontagem> {
    return authFetch(BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((r) => handleResponse<ProcessoMontagem>(r));
  },

  updateStatus(
    id: string,
    status: StatusServico,
    senhaConfirmacao?: string,
  ): Promise<ProcessoMontagem> {
    return authFetch(`${BASE}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...(senhaConfirmacao && { senhaConfirmacao }) }),
    }).then((r) => handleResponse<ProcessoMontagem>(r));
  },

  finalizar(
    id: string,
    anexos: ProcessoAnexoUpload[],
    senhaConfirmacao: string,
  ): Promise<ProcessoMontagem> {
    return authFetch(`${BASE}/${id}/finalizar`, {
      method: 'POST',
      body: JSON.stringify({ anexos, senhaConfirmacao }),
    }).then((r) => handleResponse<ProcessoMontagem>(r));
  },

  salvarAnexos(id: string, anexos: ProcessoAnexoUpload[]): Promise<ProcessoMontagem> {
    return authFetch(`${BASE}/${id}/anexos`, {
      method: 'POST',
      body: JSON.stringify({ anexos }),
    }).then((r) => handleResponse<ProcessoMontagem>(r));
  },

  async getAnexoBlob(id: string, anexoId: string): Promise<Blob> {
    const res = await authFetch(`${BASE}/${id}/anexos/${anexoId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro ao abrir arquivo' }));
      throw new Error(err.message ?? 'Erro ao abrir arquivo');
    }
    return res.blob();
  },

  remove(id: string): Promise<void> {
    return authFetch(`${BASE}/${id}`, { method: 'DELETE' }).then((r) => {
      if (!r.ok) throw new Error('Erro ao deletar montagem de processo');
    });
  },
};
