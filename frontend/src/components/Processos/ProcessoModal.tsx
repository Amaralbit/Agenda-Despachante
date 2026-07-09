import React, { useState } from 'react';
import { CreateProcessoMontagemForm } from '../../types';

interface Props {
  onClose: () => void;
  onSubmit: (data: CreateProcessoMontagemForm) => void;
  isLoading: boolean;
}

export const ProcessoModal: React.FC<Props> = ({ onClose, onSubmit, isLoading }) => {
  const [placa, setPlaca] = useState('');
  const [numeroAtendimento, setNumeroAtendimento] = useState('');
  const [solicitantePa2, setSolicitantePa2] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      placa: placa.trim().toUpperCase(),
      numeroAtendimento: numeroAtendimento.trim(),
      solicitantePa2: solicitantePa2.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-lg border border-white/80 bg-white/95 shadow-2xl shadow-slate-950/15 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-950">Montagem de Processo</h2>
          <button onClick={onClose} className="text-xl font-light text-slate-400 hover:text-slate-600">
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Placa <span className="text-red-500">*</span>
            </label>
            <input
              required
              minLength={7}
              maxLength={10}
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="Ex: ABC1D23"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Atendimento Detran <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={numeroAtendimento}
              onChange={(e) => setNumeroAtendimento(e.target.value)}
              placeholder="Numero do atendimento"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Solicitante da montagem <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={solicitantePa2}
              onChange={(e) => setSolicitantePa2(e.target.value)}
              placeholder="Nome do solicitante"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-slate-950 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-400"
            >
              {isLoading ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
