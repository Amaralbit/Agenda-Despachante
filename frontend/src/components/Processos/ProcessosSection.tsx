import React, { useMemo, useState } from 'react';
import { processosApi } from '../../api/processos.api';
import {
  useCreateProcesso,
  useDeleteProcesso,
  useFinalizarProcesso,
  useProcessos,
  useUpdateProcessoStatus,
} from '../../hooks/useProcessos';
import {
  CreateProcessoMontagemForm,
  ProcessoAnexo,
  ProcessoAnexoUpload,
  ProcessoMontagem,
  StatusServico,
  STATUS_LABELS,
} from '../../types';
import { FinalizarProcessoModal } from './FinalizarProcessoModal';
import { ProcessoModal } from './ProcessoModal';

const COLUMNS: StatusServico[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'];

const COLUMN_STYLES: Record<StatusServico, { header: string; dot: string; bg: string }> = {
  PENDENTE: {
    header: 'text-slate-700',
    dot: 'bg-slate-400',
    bg: 'bg-white/60 border-slate-200/80',
  },
  EM_ANDAMENTO: {
    header: 'text-amber-700',
    dot: 'bg-amber-400',
    bg: 'bg-amber-50/70 border-amber-100/80',
  },
  CONCLUIDO: {
    header: 'text-emerald-700',
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-50/70 border-emerald-100/80',
  },
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result ?? '');
      resolve(value.includes(',') ? value.split(',')[1] : value);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface ProcessoCardProps {
  processo: ProcessoMontagem;
  onStart: (id: string) => void;
  onFinalize: (processo: ProcessoMontagem) => void;
  onOpenAnexo: (processo: ProcessoMontagem, anexo: ProcessoAnexo) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

const ProcessoCard: React.FC<ProcessoCardProps> = ({
  processo,
  onStart,
  onFinalize,
  onOpenAnexo,
  onDelete,
  isUpdating,
}) => {
  return (
    <div className={`rounded-lg border border-white/80 bg-white/90 p-4 shadow-sm shadow-slate-200/70 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isUpdating ? 'pointer-events-none opacity-60' : ''}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-base font-black tracking-wide text-slate-950">{processo.placa}</p>
          <p className="text-xs text-slate-500">Atendimento {processo.numeroAtendimento}</p>
        </div>
        <span className="rounded-md bg-slate-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Detran
        </span>
      </div>

      <div className="mb-3 rounded-md bg-slate-50 px-2 py-1.5 text-xs text-slate-600">
        {processo.anexos.length} PDF{processo.anexos.length !== 1 ? 's' : ''} anexado{processo.anexos.length !== 1 ? 's' : ''}
      </div>

      {processo.status === 'CONCLUIDO' && processo.anexos.length > 0 && (
        <div className="mb-3 flex flex-col gap-1.5">
          {processo.anexos.map((anexo) => (
            <button
              key={anexo.id}
              onClick={() => onOpenAnexo(processo, anexo)}
              className="truncate rounded-md border border-slate-200 bg-white px-2 py-1.5 text-left text-xs font-medium text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-50"
              title={anexo.nome}
            >
              Abrir {anexo.nome}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          onClick={() => onDelete(processo.id)}
          className="text-xs font-medium text-red-400 hover:text-red-600"
        >
          Excluir
        </button>

        {processo.status === 'PENDENTE' && (
          <button
            onClick={() => onStart(processo.id)}
            className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Iniciar
          </button>
        )}

        {processo.status === 'EM_ANDAMENTO' && (
          <button
            onClick={() => onFinalize(processo)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            Concluir
          </button>
        )}
      </div>
    </div>
  );
};

export const ProcessosSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finalizando, setFinalizando] = useState<ProcessoMontagem | null>(null);

  const { data: processos = [], isLoading, isError } = useProcessos();
  const createProcesso = useCreateProcesso();
  const updateStatus = useUpdateProcessoStatus();
  const finalizarProcesso = useFinalizarProcesso();
  const deleteProcesso = useDeleteProcesso();

  const byStatus = useMemo(() => {
    const map: Record<StatusServico, ProcessoMontagem[]> = {
      PENDENTE: [],
      EM_ANDAMENTO: [],
      CONCLUIDO: [],
    };
    for (const processo of processos) map[processo.status].push(processo);
    return map;
  }, [processos]);

  function handleCreate(data: CreateProcessoMontagemForm) {
    createProcesso.mutate(data, { onSuccess: () => setIsModalOpen(false) });
  }

  function handleStart(id: string) {
    updateStatus.mutate({ id, status: 'EM_ANDAMENTO' });
  }

  async function handleFinalizar(files: File[]) {
    if (!finalizando) return;

    const anexos: ProcessoAnexoUpload[] = await Promise.all(
      files.map(async (file) => ({
        nome: file.name,
        mimeType: 'application/pdf',
        tamanho: file.size,
        conteudoBase64: await fileToBase64(file),
      })),
    );

    finalizarProcesso.mutate(
      { id: finalizando.id, anexos },
      { onSuccess: () => setFinalizando(null) },
    );
  }

  async function handleOpenAnexo(processo: ProcessoMontagem, anexo: ProcessoAnexo) {
    const blob = await processosApi.getAnexoBlob(processo.id, anexo.id);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  function handleDelete(id: string) {
    if (!window.confirm('Excluir esta montagem de processo e seus arquivos?')) return;
    deleteProcesso.mutate(id);
  }

  return (
    <section className="mt-2 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-950">Montagens de Processo</h2>
          <p className="text-xs text-slate-500">Controle por placa, atendimento Detran e PDFs anexados.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700"
        >
          <span className="text-lg leading-none">+</span>
          Montagem de Processo
        </button>
      </div>

      {isLoading && (
        <div className="py-10 text-center text-sm text-slate-400">Carregando montagens...</div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Falha ao carregar montagens de processo.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex items-start gap-6 overflow-x-auto px-1 pb-6">
          {COLUMNS.map((status) => {
            const style = COLUMN_STYLES[status];
            const items = byStatus[status];

            return (
              <div key={status} className="flex w-full min-w-[320px] max-w-sm flex-col">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <div className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  <h3 className={`text-sm font-semibold uppercase tracking-wide ${style.header}`}>
                    {STATUS_LABELS[status]}
                  </h3>
                  <span className="ml-auto rounded-full border border-white/80 bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm">
                    {items.length}
                  </span>
                </div>

                <div className={`min-h-[160px] flex-1 rounded-lg border p-3 shadow-sm shadow-slate-200/60 backdrop-blur-xl ${style.bg}`}>
                  <div className="flex flex-col gap-3">
                    {items.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slate-400">Nenhuma montagem</div>
                    ) : (
                      items.map((processo) => (
                        <ProcessoCard
                          key={processo.id}
                          processo={processo}
                          onStart={handleStart}
                          onFinalize={setFinalizando}
                          onOpenAnexo={handleOpenAnexo}
                          onDelete={handleDelete}
                          isUpdating={
                            updateStatus.isPending ||
                            finalizarProcesso.isPending ||
                            deleteProcesso.isPending
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <ProcessoModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
          isLoading={createProcesso.isPending}
        />
      )}

      {finalizando && (
        <FinalizarProcessoModal
          processo={finalizando}
          onClose={() => setFinalizando(null)}
          onSubmit={handleFinalizar}
          isLoading={finalizarProcesso.isPending}
        />
      )}
    </section>
  );
};
