import React, { useMemo, useState } from 'react';
import { processosApi } from '../../api/processos.api';
import {
  useCreateProcesso,
  useDeleteProcesso,
  useFinalizarProcesso,
  useProcessos,
  useSalvarProcessoAnexos,
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

function dateOnly(value: string) {
  return value.slice(0, 10);
}

interface ProcessoCardProps {
  processo: ProcessoMontagem;
  onStart: (id: string) => void;
  onFinalize: (processo: ProcessoMontagem) => void;
  onReopen: (processo: ProcessoMontagem) => void;
  onOpenAnexo: (processo: ProcessoMontagem, anexo: ProcessoAnexo) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

const ProcessoCard: React.FC<ProcessoCardProps> = ({
  processo,
  onStart,
  onFinalize,
  onReopen,
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
          <p className="text-xs font-medium text-slate-700">Solicitante: {processo.solicitantePa2 || '-'}</p>
        </div>
        <span className="rounded-md bg-slate-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Detran
        </span>
      </div>

      <div className="mb-3 rounded-md bg-slate-50 px-2 py-1.5 text-xs text-slate-600">
        {processo.anexos.length} PDF{processo.anexos.length !== 1 ? 's' : ''} anexado{processo.anexos.length !== 1 ? 's' : ''}
      </div>

      {processo.anexos.length > 0 && (
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

        {processo.status === 'CONCLUIDO' && (
          <button
            onClick={() => onReopen(processo)}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
          >
            Reabrir
          </button>
        )}
      </div>
    </div>
  );
};

export const ProcessosSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finalizando, setFinalizando] = useState<ProcessoMontagem | null>(null);
  const [searchPlaca, setSearchPlaca] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  const { data: processos = [], isLoading, isError } = useProcessos();
  const createProcesso = useCreateProcesso();
  const updateStatus = useUpdateProcessoStatus();
  const finalizarProcesso = useFinalizarProcesso();
  const salvarAnexos = useSalvarProcessoAnexos();
  const deleteProcesso = useDeleteProcesso();

  const filteredProcessos = useMemo(() => {
    const search = searchPlaca.trim().toLowerCase();

    return processos.filter((processo) => {
      const matchesPlaca = !search || processo.placa.toLowerCase().includes(search);
      const matchesDate = !dateFilter || dateOnly(processo.createdAt) === dateFilter;

      return matchesPlaca && matchesDate;
    });
  }, [processos, searchPlaca, dateFilter]);

  const byStatus = useMemo(() => {
    const map: Record<StatusServico, ProcessoMontagem[]> = {
      PENDENTE: [],
      EM_ANDAMENTO: [],
      CONCLUIDO: [],
    };
    for (const processo of filteredProcessos) map[processo.status].push(processo);
    map.CONCLUIDO.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return map;
  }, [filteredProcessos]);

  function handleCreate(data: CreateProcessoMontagemForm) {
    createProcesso.mutate(data, { onSuccess: () => setIsModalOpen(false) });
  }

  function handleStart(id: string) {
    updateStatus.mutate({ id, status: 'EM_ANDAMENTO' });
  }

  function handleReopen(processo: ProcessoMontagem) {
    const senhaConfirmacao = window.prompt('Digite sua senha para reabrir a montagem:');
    if (senhaConfirmacao === null) return;

    if (!senhaConfirmacao.trim()) {
      window.alert('Informe a senha para reabrir a montagem.');
      return;
    }

    updateStatus.mutate(
      { id: processo.id, status: 'EM_ANDAMENTO', senhaConfirmacao },
      { onError: (error) => window.alert(error.message) },
    );
  }

  async function handleFinalizar(files: File[], senhaConfirmacao: string) {
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
      { id: finalizando.id, anexos, senhaConfirmacao },
      { onSuccess: () => setFinalizando(null) },
    );
  }

  async function handleSalvarAnexos(files: File[]) {
    if (!finalizando) return;

    const anexos: ProcessoAnexoUpload[] = await Promise.all(
      files.map(async (file) => ({
        nome: file.name,
        mimeType: 'application/pdf',
        tamanho: file.size,
        conteudoBase64: await fileToBase64(file),
      })),
    );

    salvarAnexos.mutate(
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

      <div className="glass-panel flex flex-wrap items-center gap-3 rounded-lg px-4 py-3">
        <div className="relative min-w-[220px] max-w-xs flex-1">
          <input
            type="text"
            placeholder="Buscar montagem por placa..."
            value={searchPlaca}
            onChange={(e) => setSearchPlaca(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-sm shadow-slate-200/50 placeholder-slate-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {searchPlaca && (
            <button
              type="button"
              onClick={() => setSearchPlaca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              x
            </button>
          )}
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm shadow-slate-200/50 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
          title="Filtrar pela data de criacao"
        />

        {(searchPlaca || dateFilter) && (
          <button
            type="button"
            onClick={() => { setSearchPlaca(''); setDateFilter(''); }}
            className="text-xs font-medium text-indigo-500 underline hover:text-indigo-700"
          >
            Limpar filtros
          </button>
        )}
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
            const visibleItems =
              status === 'CONCLUIDO' && !showAllCompleted ? items.slice(0, 5) : items;
            const hiddenCount = items.length - visibleItems.length;

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
                      visibleItems.map((processo) => (
                        <ProcessoCard
                          key={processo.id}
                          processo={processo}
                          onStart={handleStart}
                          onFinalize={setFinalizando}
                          onReopen={handleReopen}
                          onOpenAnexo={handleOpenAnexo}
                          onDelete={handleDelete}
                          isUpdating={
                            updateStatus.isPending ||
                            finalizarProcesso.isPending ||
                            salvarAnexos.isPending ||
                            deleteProcesso.isPending
                          }
                        />
                      ))
                    )}

                    {status === 'CONCLUIDO' && items.length > 5 && (
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
          onSave={handleSalvarAnexos}
          isLoading={finalizarProcesso.isPending}
          isSaving={salvarAnexos.isPending}
          errorMessage={finalizarProcesso.error?.message}
        />
      )}
    </section>
  );
};
