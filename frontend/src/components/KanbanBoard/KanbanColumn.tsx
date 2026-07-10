import React, { useState } from 'react';
import { Servico, StatusServico, STATUS_LABELS } from '../../types';
import { ServiceCard } from '../ServiceCard/ServiceCard';

const COLUMN_STYLES: Record<StatusServico, { header: string; dot: string; bg: string }> = {
  PENDENTE: {
    header: 'text-slate-700',
    dot:    'bg-slate-400',
    bg:     'bg-white/60 border-slate-200/80',
  },
  EM_ANDAMENTO: {
    header: 'text-amber-700',
    dot:    'bg-amber-400',
    bg:     'bg-amber-50/70 border-amber-100/80',
  },
  CONCLUIDO: {
    header: 'text-emerald-700',
    dot:    'bg-emerald-400',
    bg:     'bg-emerald-50/70 border-emerald-100/80',
  },
};

interface Props {
  status: StatusServico;
  servicos: Servico[];
  onStatusChange: (id: string, status: StatusServico) => void;
  onEdit: (servico: Servico) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

export const KanbanColumn: React.FC<Props> = ({
  status,
  servicos,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdating,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const style = COLUMN_STYLES[status];
  const isCompleted = status === 'CONCLUIDO';
  const visibleServicos = isCompleted && !showAllCompleted ? servicos.slice(0, 5) : servicos;
  const hiddenCount = servicos.length - visibleServicos.length;

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const servicoId = e.dataTransfer.getData('servicoId');
    if (servicoId) onStatusChange(servicoId, status);
  }

  const overdueCount = servicos.filter((s) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return new Date(s.dataLimite) < hoje && s.status !== 'CONCLUIDO';
  }).length;

  return (
    <div className="flex flex-col min-w-[320px] w-full max-w-sm">
      {/* Cabeçalho da coluna */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
        <h2 className={`font-semibold text-sm uppercase tracking-wide ${style.header}`}>
          {STATUS_LABELS[status]}
        </h2>
        <span className="ml-auto rounded-full border border-white/80 bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm">
          {servicos.length}
        </span>
        {overdueCount > 0 && (
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {overdueCount} atrasado{overdueCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Área de drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          min-h-[200px] flex-1 rounded-lg border p-3 shadow-sm shadow-slate-200/60 backdrop-blur-xl transition-all duration-200
          ${style.bg}
          ${isDragOver ? 'scale-[1.01] ring-2 ring-indigo-400 ring-offset-2 ring-offset-white/60' : ''}
        `}
      >
        <div className="flex flex-col gap-3">
          {servicos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="text-3xl mb-2">
                {status === 'PENDENTE' ? '📋' : status === 'EM_ANDAMENTO' ? '⚡' : '✅'}
              </div>
              <p className="text-xs text-center">
                {isDragOver ? 'Solte aqui para mover' : 'Nenhum serviço'}
              </p>
            </div>
          ) : (
            visibleServicos.map((servico) => (
              <ServiceCard
                key={servico.id}
                servico={servico}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
                isPending={isUpdating}
              />
            ))
          )}

          {isCompleted && servicos.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllCompleted((current) => !current)}
              className="rounded-lg border border-emerald-200 bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              {showAllCompleted ? 'Fechar' : `Abrir tudo (${hiddenCount} oculto${hiddenCount !== 1 ? 's' : ''})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
