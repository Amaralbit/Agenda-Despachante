import React, { FormEvent, useMemo, useState } from 'react';
import {
  useCreateLembrete,
  useDeleteLembrete,
  useLembretes,
  useUpdateLembreteConclusao,
} from '../hooks/useLembretes';
import { Lembrete } from '../types';

function dataComoChave(data: string) {
  return data.slice(0, 10);
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    .format(new Date(`${dataComoChave(data)}T12:00:00`));
}

function inicioDoDia() {
  const data = new Date();
  data.setHours(0, 0, 0, 0);
  return data;
}

const CartaoLembrete: React.FC<{
  lembrete: Lembrete;
  onConcluir: (lembrete: Lembrete) => void;
  onExcluir: (id: string) => void;
  isUpdating: boolean;
}> = ({ lembrete, onConcluir, onExcluir, isUpdating }) => {
  const atrasado = Boolean(
    lembrete.dataLembrete && !lembrete.concluido && new Date(`${dataComoChave(lembrete.dataLembrete)}T12:00:00`) < inicioDoDia(),
  );

  return (
    <article className={`rounded-xl border bg-white/90 p-4 shadow-sm shadow-slate-200/70 transition ${lembrete.concluido ? 'border-slate-200 opacity-70' : 'border-white/80 hover:shadow-md'}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={lembrete.concluido ? 'Marcar lembrete como pendente' : 'Marcar lembrete como concluído'}
          onClick={() => onConcluir(lembrete)}
          disabled={isUpdating}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
            lembrete.concluido ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 hover:border-indigo-500'
          }`}
        >
          {lembrete.concluido && '✓'}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`font-bold text-slate-900 ${lembrete.concluido ? 'line-through' : ''}`}>{lembrete.titulo}</h3>
            {lembrete.dataLembrete && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${atrasado ? 'bg-rose-100 text-rose-700' : 'bg-indigo-50 text-indigo-700'}`}>
                {atrasado ? 'Atrasado: ' : ''}{formatarData(lembrete.dataLembrete)}
              </span>
            )}
          </div>
          {lembrete.descricao && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{lembrete.descricao}</p>}
        </div>
        <button
          type="button"
          onClick={() => onExcluir(lembrete.id)}
          disabled={isUpdating}
          className="text-xs font-semibold text-slate-400 transition hover:text-red-600 disabled:opacity-50"
        >
          Excluir
        </button>
      </div>
    </article>
  );
};

export const Lembretes: React.FC = () => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataLembrete, setDataLembrete] = useState('');
  const { data: lembretes = [], isLoading, isError } = useLembretes();
  const criar = useCreateLembrete();
  const atualizarConclusao = useUpdateLembreteConclusao();
  const excluir = useDeleteLembrete();

  const { comData, semData } = useMemo(() => {
    const pendentes = lembretes.filter((lembrete) => !lembrete.concluido);
    return {
      comData: pendentes
        .filter((lembrete) => lembrete.dataLembrete)
        .sort((a, b) => dataComoChave(a.dataLembrete!) .localeCompare(dataComoChave(b.dataLembrete!))),
      semData: pendentes.filter((lembrete) => !lembrete.dataLembrete),
    };
  }, [lembretes]);
  const concluidos = useMemo(() => lembretes.filter((lembrete) => lembrete.concluido), [lembretes]);

  function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!titulo.trim()) return;
    criar.mutate(
      { titulo: titulo.trim(), ...(descricao.trim() && { descricao: descricao.trim() }), ...(dataLembrete && { dataLembrete }) },
      { onSuccess: () => { setTitulo(''); setDescricao(''); setDataLembrete(''); } },
    );
  }

  function alternarConclusao(lembrete: Lembrete) {
    atualizarConclusao.mutate({ id: lembrete.id, concluido: !lembrete.concluido });
  }

  function apagar(id: string) {
    if (window.confirm('Excluir este lembrete?')) excluir.mutate(id);
  }

  const emAlteracao = criar.isPending || atualizarConclusao.isPending || excluir.isPending;

  return (
    <section className="mx-auto flex w-full max-w-screen-xl flex-col gap-5">
      <div>
        <h2 className="text-xl font-black text-slate-950">Meus lembretes</h2>
        <p className="mt-1 text-sm text-slate-500">Cadastre tarefas para uma data específica ou deixe-as sem prazo.</p>
      </div>

      <form onSubmit={enviarFormulario} className="glass-panel grid gap-3 rounded-xl p-4 sm:grid-cols-2">
        <input
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          placeholder="O que você precisa lembrar?"
          maxLength={160}
          required
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <input
          type="date"
          value={dataLembrete}
          onChange={(event) => setDataLembrete(event.target.value)}
          title="Deixe em branco para criar um lembrete sem data"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <textarea
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          placeholder="Descrição opcional"
          maxLength={1000}
          rows={2}
          className="resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:col-span-2"
        />
        <div className="flex items-center justify-between gap-3 sm:col-span-2">
          <span className="text-xs text-slate-500">{dataLembrete ? 'Lembrete com data definida.' : 'Lembrete sem data definida.'}</span>
          <button
            type="submit"
            disabled={criar.isPending || !titulo.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {criar.isPending ? 'Salvando...' : 'Adicionar lembrete'}
          </button>
        </div>
      </form>

      {isLoading && <p className="py-12 text-center text-sm text-slate-400">Carregando lembretes...</p>}
      {isError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">Não foi possível carregar os lembretes.</p>}

      {!isLoading && !isError && (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Com data definida <span className="text-slate-400">({comData.length})</span></h3>
            {comData.length > 0 ? comData.map((lembrete) => <CartaoLembrete key={lembrete.id} lembrete={lembrete} onConcluir={alternarConclusao} onExcluir={apagar} isUpdating={emAlteracao} />) : <Vazio texto="Nenhum lembrete com data." />}
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Sem data definida <span className="text-slate-400">({semData.length})</span></h3>
            {semData.length > 0 ? semData.map((lembrete) => <CartaoLembrete key={lembrete.id} lembrete={lembrete} onConcluir={alternarConclusao} onExcluir={apagar} isUpdating={emAlteracao} />) : <Vazio texto="Nenhum lembrete sem data." />}
          </div>
        </div>
      )}

      {!isLoading && !isError && concluidos.length > 0 && (
        <details className="glass-panel rounded-xl p-4">
          <summary className="cursor-pointer text-sm font-bold text-slate-700">Concluídos ({concluidos.length})</summary>
          <div className="mt-4 flex flex-col gap-3">
            {concluidos.map((lembrete) => <CartaoLembrete key={lembrete.id} lembrete={lembrete} onConcluir={alternarConclusao} onExcluir={apagar} isUpdating={emAlteracao} />)}
          </div>
        </details>
      )}
    </section>
  );
};

const Vazio: React.FC<{ texto: string }> = ({ texto }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 px-4 py-10 text-center text-sm text-slate-400">{texto}</div>
);
