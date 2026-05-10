import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientesApi } from '../../api/clientes.api';
import { CreateServicoForm, Servico, TIPO_LABELS, TipoServico } from '../../types';

interface Props {
  servico?: Servico | null;
  onClose: () => void;
  onSubmit: (data: CreateServicoForm) => void;
  isLoading: boolean;
}

const TIPOS = Object.entries(TIPO_LABELS) as [TipoServico, string][];

export const ServicoModal: React.FC<Props> = ({ servico, onClose, onSubmit, isLoading }) => {
  const [clienteId, setClienteId] = useState(servico?.clienteId ?? '');
  const [veiculoId, setVeiculoId] = useState(servico?.veiculoId ?? '');
  const [tipo, setTipo] = useState<TipoServico>(servico?.tipo ?? 'TRANSFERENCIA');
  const [dataLimite, setDataLimite] = useState(
    servico ? servico.dataLimite.split('T')[0] : '',
  );
  const [observacoes, setObservacoes] = useState(servico?.observacoes ?? '');

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesApi.list(),
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos', clienteId],
    queryFn: () => clientesApi.listVeiculos(clienteId),
    enabled: !!clienteId,
  });

  useEffect(() => {
    setVeiculoId('');
  }, [clienteId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ tipo, dataLimite, observacoes: observacoes || undefined, clienteId, veiculoId });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header do modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">
            {servico ? 'Editar Serviço' : 'Novo Serviço'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-light"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Tipo de serviço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Serviço <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoServico)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {TIPOS.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Selecione um cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome} — {c.cpfCnpj}</option>
              ))}
            </select>
          </div>

          {/* Veículo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Veículo <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={veiculoId}
              onChange={(e) => setVeiculoId(e.target.value)}
              disabled={!clienteId}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {clienteId ? 'Selecione um veículo...' : 'Selecione um cliente primeiro'}
              </option>
              {veiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.modelo}
                </option>
              ))}
            </select>
          </div>

          {/* Data Limite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Limite <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Ex: Aguardando documento X do cliente..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-medium text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
            >
              {isLoading ? 'Salvando...' : servico ? 'Salvar alterações' : 'Criar Serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
