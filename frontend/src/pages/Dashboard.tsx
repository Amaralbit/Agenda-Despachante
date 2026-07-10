import React, { useMemo, useState } from 'react';
import { Filters } from '../components/Filters/Filters';
import { KanbanBoard } from '../components/KanbanBoard/KanbanBoard';
import { ProcessosSection } from '../components/Processos/ProcessosSection';
import { ServicoModal } from '../components/ServicoModal/ServicoModal';
import { useServicos, useUpdateStatus, useCreateServico, useDeleteServico } from '../hooks/useServicos';
import { CreateServicoForm, Servico, StatusServico, TipoServico } from '../types';

export const Dashboard: React.FC = () => {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
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
        (s.veiculo?.placa.toLowerCase().includes(searchLower) ?? false) ||
        (s.chassi?.toLowerCase().includes(searchLower) ?? false) ||
        s.cliente.cpfCnpj.toLowerCase().includes(searchLower);
      const matchesDate = !dateFilter || s.dataLimite.slice(0, 10) === dateFilter;

      return matchesTipo && matchesSearch && matchesDate;
    });
  }, [servicos, search, dateFilter, tipoFilter]);

  function handleStatusChange(id: string, status: StatusServico) {
    const servico = servicos.find((item) => item.id === id);
    if (servico?.status === status) return;

    if (status === 'CONCLUIDO') {
      const senhaConfirmacao = window.prompt('Digite sua senha para concluir o servico:');
      if (senhaConfirmacao === null) return;

      if (!senhaConfirmacao.trim()) {
        window.alert('Informe a senha para concluir o servico.');
        return;
      }

      updateStatus.mutate(
        { id, status, senhaConfirmacao },
        { onError: (error) => window.alert(error.message) },
      );
      return;
    }

    updateStatus.mutate(
      { id, status },
      { onError: (error) => window.alert(error.message) },
    );
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
            { label: 'Total',        value: servicos.length,                                              color: 'text-slate-900', accent: 'from-slate-950 to-slate-700' },
            { label: 'Para Fazer',   value: servicos.filter((s) => s.status === 'PENDENTE').length,        color: 'text-indigo-700', accent: 'from-indigo-500 to-sky-500' },
            { label: 'Em Andamento', value: servicos.filter((s) => s.status === 'EM_ANDAMENTO').length,    color: 'text-amber-600', accent: 'from-amber-400 to-orange-500' },
            { label: 'Atrasados',    value: totalAtrasados,                                                color: totalAtrasados > 0 ? 'text-red-600' : 'text-slate-400', accent: 'from-rose-500 to-red-500' },
          ].map((m) => (
            <div key={m.label} className="metric-card relative overflow-hidden rounded-lg px-4 py-3">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${m.accent}`} />
              <p className="text-xs font-medium text-slate-500">{m.label}</p>
              <p className={`mt-1 text-2xl font-black ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-0.5 flex shrink-0 items-center gap-2 self-end rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-slate-950/30"
        >
          <span className="text-lg leading-none">+</span>
          Novo Serviço
        </button>
      </div>

      {/* Filtros */}
      <div className="glass-panel rounded-lg px-4 py-3">
        <Filters
          search={search}
          onSearchChange={setSearch}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
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

      <ProcessosSection />

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
