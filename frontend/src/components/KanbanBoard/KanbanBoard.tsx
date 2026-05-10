import React, { useMemo } from 'react';
import { Servico, StatusServico } from '../../types';
import { KanbanColumn } from './KanbanColumn';

const COLUMNS: StatusServico[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'];

interface Props {
  servicos: Servico[];
  onStatusChange: (id: string, status: StatusServico) => void;
  onEdit: (servico: Servico) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

export const KanbanBoard: React.FC<Props> = ({
  servicos,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdating,
}) => {
  const byStatus = useMemo(() => {
    const map: Record<StatusServico, Servico[]> = {
      PENDENTE:     [],
      EM_ANDAMENTO: [],
      CONCLUIDO:    [],
    };
    for (const s of servicos) map[s.status].push(s);
    return map;
  }, [servicos]);

  return (
    <div className="flex gap-6 items-start overflow-x-auto pb-6 px-1">
      {COLUMNS.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          servicos={byStatus[status]}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
};
