import React, { useState } from 'react';
import { ProcessoMontagem } from '../../types';

interface Props {
  processo: ProcessoMontagem;
  onClose: () => void;
  onSubmit: (files: File[]) => void;
  isLoading: boolean;
}

export const FinalizarProcessoModal: React.FC<Props> = ({
  processo,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [pdfObrigatorio, setPdfObrigatorio] = useState<File | null>(null);
  const [pdfOpcional, setPdfOpcional] = useState<File | null>(null);
  const [erro, setErro] = useState('');

  function validatePdf(file?: File) {
    if (!file) return true;
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    slot: 'obrigatorio' | 'opcional',
  ) {
    const file = e.target.files?.[0] ?? null;

    if (file && !validatePdf(file)) {
      setErro('Anexe somente arquivos PDF.');
      e.target.value = '';
      if (slot === 'obrigatorio') setPdfObrigatorio(null);
      if (slot === 'opcional') setPdfOpcional(null);
      return;
    }

    setErro('');
    if (slot === 'obrigatorio') setPdfObrigatorio(file);
    if (slot === 'opcional') setPdfOpcional(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const selectedFiles = [pdfObrigatorio, pdfOpcional].filter(Boolean) as File[];

    if (processo.anexos.length === 0 && !pdfObrigatorio) {
      setErro('Anexe o PDF obrigatório para concluir.');
      return;
    }

    onSubmit(selectedFiles);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-lg border border-white/80 bg-white/95 shadow-2xl shadow-slate-950/15 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Finalizar montagem</h2>
            <p className="text-xs text-slate-500">{processo.placa} - {processo.numeroAtendimento}</p>
          </div>
          <button onClick={onClose} className="text-xl font-light text-slate-400 hover:text-slate-600">
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          {processo.anexos.length > 0 && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {processo.anexos.length} PDF{processo.anexos.length !== 1 ? 's' : ''} ja anexado{processo.anexos.length !== 1 ? 's' : ''}.
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              PDF obrigatório <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              required={processo.anexos.length === 0}
              onChange={(e) => handleFileChange(e, 'obrigatorio')}
              className="w-full rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              PDF adicional <span className="text-slate-400">(opcional)</span>
            </label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => handleFileChange(e, 'opcional')}
              className="w-full rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
            />
          </div>

          {(pdfObrigatorio || pdfOpcional) && (
            <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3">
              {[pdfObrigatorio, pdfOpcional].filter(Boolean).map((file) => (
                <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-medium text-slate-700">{file.name}</span>
                  <span className="shrink-0 text-slate-400">{Math.ceil(file.size / 1024)} KB</span>
                </div>
              ))}
            </div>
          )}

          {erro && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </div>
          )}

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
              className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-emerald-300"
            >
              {isLoading ? 'Finalizando...' : 'Concluir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
