import React from 'react';

interface Props {
  onNewServico: () => void;
}

export const Header: React.FC<Props> = ({ onNewServico }) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            D
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg leading-tight">Agenda Despachante</h1>
            <p className="text-gray-400 text-xs">Gestão de Serviços Veiculares</p>
          </div>
        </div>

        <button
          onClick={onNewServico}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          Novo Serviço
        </button>
      </div>
    </header>
  );
};
