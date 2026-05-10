import React from 'react';
import { Link } from 'react-router-dom';
import { Servico, StatusServico, TIPO_LABELS } from '../../types';

const TIPO_BADGE: Record<string, string> = {
  INCLUSAO_VEICULO_NOVO: 'bg-blue-100 text-blue-700',
  TRANSFERENCIA:         'bg-purple-100 text-purple-700',
  INTENCAO_DE_VENDA:    'bg-amber-100 text-amber-700',
  OUTROS:                'bg-gray-100 text-gray-600',
};

const TIPO_BORDER: Record<string, string> = {
  INCLUSAO_VEICULO_NOVO: 'border-l-blue-500',
  TRANSFERENCIA:         'border-l-purple-500',
  INTENCAO_DE_VENDA:    'border-l-amber-500',
  OUTROS:                'border-l-gray-400',
};

const NEXT_STATUS: Partial<Record<StatusServico, StatusServico>> = {
  PENDENTE:     'EM_ANDAMENTO',
  EM_ANDAMENTO: 'CONCLUIDO',
};

const ACTION_LABEL: Partial<Record<StatusServico, string>> = {
  PENDENTE:     'Iniciar',
  EM_ANDAMENTO: 'Concluir',
};

interface Props {
  servico: Servico;
  onStatusChange: (id: string, status: StatusServico) => void;
  onEdit: (servico: Servico) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}

export const ServiceCard: React.FC<Props> = ({
  servico,
  onStatusChange,
  onEdit,
  onDelete,
  isPending,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limite = new Date(servico.dataLimite);
  const isOverdue = limite < today && servico.status !== 'CONCLUIDO';
  const isDueToday =
    limite.toDateString() === today.toDateString() && servico.status !== 'CONCLUIDO';

  const dataFormatada = limite.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  const nextStatus = NEXT_STATUS[servico.status];
  const actionLabel = ACTION_LABEL[servico.status];

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('servicoId', servico.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200 border-l-4
        ${TIPO_BORDER[servico.tipo]}
        p-4 cursor-grab active:cursor-grabbing hover:shadow-md
        transition-all duration-150 select-none
        ${isPending ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_BADGE[servico.tipo]}`}
        >
          {TIPO_LABELS[servico.tipo]}
        </span>

        <div className={`flex items-center gap-1 text-xs font-medium shrink-0 ${
          isOverdue  ? 'text-red-600' :
          isDueToday ? 'text-amber-600' :
                       'text-gray-400'
        }`}>
          {isOverdue  && <span>⚠</span>}
          {isDueToday && <span>!</span>}
          <span>{dataFormatada}</span>
        </div>
      </div>

      {/* Cliente */}
      <div className="mb-2">
        <p className="font-semibold text-gray-900 text-sm leading-tight">{servico.cliente.nome}</p>
        {servico.cliente.telefone && (
          <p className="text-xs text-gray-400 mt-0.5">{servico.cliente.telefone}</p>
        )}
      </div>

      {/* Veículo */}
      <div className="flex items-center gap-2 mb-3">
        <Link
          to={`/veiculos/${servico.veiculo.id}/historico`}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 hover:bg-gray-700 text-white text-xs font-mono font-bold px-2 py-0.5 rounded tracking-widest transition-colors"
        >
          {servico.veiculo.placa}
        </Link>
        <span className="text-xs text-gray-500 truncate">{servico.veiculo.modelo}</span>
      </div>

      {/* Observações */}
      {servico.observacoes && (
        <div className="mb-3 px-2 py-1.5 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800 leading-snug">
          <span className="font-semibold">Obs: </span>
          {servico.observacoes}
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(servico)}
            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
          >
            Editar
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => onDelete(servico.id)}
            className="text-xs text-red-400 hover:text-red-600 font-medium"
          >
            Excluir
          </button>
        </div>

        {nextStatus && actionLabel && (
          <button
            onClick={() => onStatusChange(servico.id, nextStatus)}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
          >
            {actionLabel} →
          </button>
        )}
      </div>
    </div>
  );
};
