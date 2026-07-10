import React from 'react';
import { TipoServico, TIPO_LABELS } from '../../types';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  dateFilter: string;
  onDateChange: (v: string) => void;
  tipoFilter: TipoServico | '';
  onTipoChange: (v: TipoServico | '') => void;
}

export const Filters: React.FC<Props> = ({
  search,
  onSearchChange,
  dateFilter,
  onDateChange,
  tipoFilter,
  onTipoChange,
}) => {
  const tipos = Object.entries(TIPO_LABELS) as [TipoServico, string][];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Campo de busca */}
      <div className="relative min-w-[220px] max-w-xs flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar por chassi, placa, cliente ou CPF..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white/90 py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm shadow-slate-200/50 placeholder-slate-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
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

      <input
        type="date"
        value={dateFilter}
        onChange={(e) => onDateChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm shadow-slate-200/50 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
        title="Filtrar por data limite"
      />

      {/* Filtro por tipo */}
      <select
        value={tipoFilter}
        onChange={(e) => onTipoChange(e.target.value as TipoServico | '')}
        className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm shadow-slate-200/50 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <option value="">Todos os tipos</option>
        {tipos.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Limpar filtros */}
      {(search || dateFilter || tipoFilter) && (
        <button
          onClick={() => { onSearchChange(''); onDateChange(''); onTipoChange(''); }}
          className="text-xs text-indigo-500 hover:text-indigo-700 font-medium underline"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
};
