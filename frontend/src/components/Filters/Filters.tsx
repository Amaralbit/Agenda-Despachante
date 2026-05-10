import React from 'react';
import { TipoServico, TIPO_LABELS } from '../../types';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  tipoFilter: TipoServico | '';
  onTipoChange: (v: TipoServico | '') => void;
}

export const Filters: React.FC<Props> = ({
  search,
  onSearchChange,
  tipoFilter,
  onTipoChange,
}) => {
  const tipos = Object.entries(TIPO_LABELS) as [TipoServico, string][];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Campo de busca */}
      <div className="relative flex-1 min-w-[220px] max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar por placa, cliente ou CPF..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-gray-400"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filtro por tipo */}
      <select
        value={tipoFilter}
        onChange={(e) => onTipoChange(e.target.value as TipoServico | '')}
        className="text-sm border border-gray-300 rounded-lg bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
      >
        <option value="">Todos os tipos</option>
        {tipos.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Limpar filtros */}
      {(search || tipoFilter) && (
        <button
          onClick={() => { onSearchChange(''); onTipoChange(''); }}
          className="text-xs text-indigo-500 hover:text-indigo-700 font-medium underline"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
};
