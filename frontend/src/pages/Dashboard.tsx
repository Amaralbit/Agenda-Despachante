import React, { useMemo, useState } from 'react';
import { Filters } from '../components/Filters/Filters';
import { KanbanBoard } from '../components/KanbanBoard/KanbanBoard';
import { ServicoModal } from '../components/ServicoModal/ServicoModal';
import { useServicos, useUpdateStatus, useCreateServico, useDeleteServico } from '../hooks/useServicos';
import { CreateServicoForm, Servico, StatusServico, TipoServico } from '../types';

export const Dashboard: React.FC = () => {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<TipoServico | ''>('');
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: servicos = [], isLoading, isError } = useServicos();
  const updateStatus  = useUpdateStatus();
  const createServico = useCreateServico();
  const deleteServico = useDeleteServico();

  const filtered = useMemo(() => {
    return servicos.filter((s) => {
      const matchesTipo   = !tipoFilter || s.tipo === tipoFilter;
      const searchLower   = search.toLowerCase();
      const matchesSearch = !search ||
        s.cliente.nome.toLowerCase().includes(searchLower) ||
        s.veiculo.placa.toLowerCase().includes(searchLower) ||
        s.cliente.cpfCnpj.toLowerCase().includes(searchLower);

      return matchesTipo && matchesSearch;
    });
  }, [servicos, search, tipoFilter]);

  function handleStatusChange(id: string, status: StatusServico) {
    updateStatus.mutate({ id, status });
  }

  function handleEdit(servico: Servico) {
    setEditingServico(servico);
    setIsModalOpen(true);
  }

  function handleDelete(id: string) {
    if (!window.confirm('Confirma a exclusão deste serviço?')) return;
    deleteServico.mutate(id);
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setEditingServico(null);
  }

  function handleSubmit(data: CreateServicoForm) {
    createServico.mutate(data, { onSuccess: handleModalClose });
  }

  const totalAtrasados = servicos.filter((s) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return new Date(s.dataLimite) < hoje && s.status !== 'CONCLUIDO';
  }).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Botão novo serviço + métricas */}
      <div className="flex items-start justify-between gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          {[
            { label: 'Total',        value: servicos.length,                                              color: 'text-gray-700' },
            { label: 'Para Fazer',   value: servicos.filter((s) => s.status === 'PENDENTE').length,        color: 'text-slate-600' },
            { label: 'Em Andamento', value: servicos.filter((s) => s.status === 'EM_ANDAMENTO').length,    color: 'text-amber-600' },
            { label: 'Atrasados',    value: totalAtrasados,                                                color: totalAtrasados > 0 ? 'text-red-600' : 'text-gray-400' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-400 font-medium">{m.label}</p>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm shrink-0 self-end mb-0.5"
        >
          <span className="text-lg leading-none">+</span>
          Novo Serviço
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
        <Filters
          search={search}
          onSearchChange={setSearch}
          tipoFilter={tipoFilter}
          onTipoChange={setTipoFilter}
        />
      </div>

      {/* Kanban */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <span className="animate-pulse text-sm">Carregando serviços...</span>
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center text-red-500">
            <p className="text-2xl mb-2">⚠</p>
            <p className="font-semibold">Falha ao carregar serviços</p>
            <p className="text-sm text-gray-400 mt-1">Verifique se o servidor está rodando.</p>
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <KanbanBoard
          servicos={filtered}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isUpdating={updateStatus.isPending}
        />
      )}

      {isModalOpen && (
        <ServicoModal
          servico={editingServico}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          isLoading={createServico.isPending}
        />
      )}
    </div>
  );
};
