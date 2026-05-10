import React, { useState } from 'react';
import { Veiculo } from '../../types';

interface Props {
  clienteNome: string;
  veiculo?: Veiculo | null;
  onClose: () => void;
  onSubmit: (data: { placa: string; modelo: string; renavam: string }) => void;
  isLoading: boolean;
}

export const VeiculoModal: React.FC<Props> = ({
  clienteNome,
  veiculo,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [placa, setPlaca]     = useState(veiculo?.placa ?? '');
  const [modelo, setModelo]   = useState(veiculo?.modelo ?? '');
  const [renavam, setRenavam] = useState(veiculo?.renavam ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ placa: placa.toUpperCase(), modelo, renavam });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">
              {veiculo ? 'Editar Veículo' : 'Novo Veículo'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Cliente: {clienteNome}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placa <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="ABC-1234 ou BRA2E24"
              maxLength={10}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modelo <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Honda Civic 2022"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RENAVAM <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={renavam}
              onChange={(e) => setRenavam(e.target.value.replace(/\D/g, ''))}
              placeholder="00000000000"
              maxLength={11}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

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
              {isLoading ? 'Salvando...' : veiculo ? 'Salvar' : 'Adicionar Veículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
