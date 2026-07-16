import React, { FormEvent, useMemo, useState } from 'react';
import {
  useAdicionarVeiculoEmplacamento,
  useEmplacamentosMobile,
  useRemoverVeiculoEmplacamento,
} from '../hooks/useEmplacamentosMobile';
import { CreateEmplacamentoMobileVeiculo, EmplacamentoMobile, EmplacamentoMobileVeiculo } from '../types';

type Campo = Omit<CreateEmplacamentoMobileVeiculo, 'placa'> & { chave: keyof Pick<EmplacamentoMobile, 'peugeotPasseio' | 'peugeotUtilitario' | 'citroenPasseio' | 'citroenUtilitario'>; marcaLabel: string; categoriaLabel: string };

const campos: Campo[] = [
  { chave: 'peugeotPasseio', marca: 'PEUGEOT', categoria: 'PASSEIO', marcaLabel: 'Peugeot', categoriaLabel: 'Passeio' },
  { chave: 'peugeotUtilitario', marca: 'PEUGEOT', categoria: 'UTILITARIO', marcaLabel: 'Peugeot', categoriaLabel: 'Utilitário' },
  { chave: 'citroenPasseio', marca: 'CITROEN', categoria: 'PASSEIO', marcaLabel: 'Citroën', categoriaLabel: 'Passeio' },
  { chave: 'citroenUtilitario', marca: 'CITROEN', categoria: 'UTILITARIO', marcaLabel: 'Citroën', categoriaLabel: 'Utilitário' },
];

function hojeComoChave() {
  const hoje = new Date();
  const deslocamento = hoje.getTimezoneOffset() * 60_000;
  return new Date(hoje.getTime() - deslocamento).toISOString().slice(0, 10);
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    .format(new Date(`${data}T12:00:00`));
}

function formatarPlaca(placa: string) {
  const limpa = placa.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  return limpa.length > 3 ? `${limpa.slice(0, 3)}-${limpa.slice(3)}` : limpa;
}

export const EmplacamentosMobile: React.FC = () => {
  const [data, setData] = useState(hojeComoChave);
  const [campoSelecionado, setCampoSelecionado] = useState<Campo | null>(null);
  const [placa, setPlaca] = useState('');
  const { data: registro, isLoading, isError } = useEmplacamentosMobile(data);
  const adicionar = useAdicionarVeiculoEmplacamento(data);
  const remover = useRemoverVeiculoEmplacamento(data);

  const total = useMemo(() => registro ? registro.peugeotPasseio + registro.peugeotUtilitario + registro.citroenPasseio + registro.citroenUtilitario : 0, [registro]);
  const totalPeugeot = (registro?.peugeotPasseio ?? 0) + (registro?.peugeotUtilitario ?? 0);
  const totalCitroen = (registro?.citroenPasseio ?? 0) + (registro?.citroenUtilitario ?? 0);

  function abrirRegistro(campo: Campo) {
    setPlaca('');
    setCampoSelecionado(campo);
  }

  function salvarVeiculo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!campoSelecionado) return;
    adicionar.mutate(
      { placa, marca: campoSelecionado.marca, categoria: campoSelecionado.categoria },
      { onSuccess: () => { setCampoSelecionado(null); setPlaca(''); } },
    );
  }

  const veiculosPorCampo = (campo: Campo) => registro?.veiculos.filter((veiculo) => veiculo.marca === campo.marca && veiculo.categoria === campo.categoria) ?? [];

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Controle diário</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Emplacamentos Mobile</h2>
          <p className="mt-1 text-sm text-slate-500">Cada veículo emplacado é registrado com a sua placa.</p>
        </div>
        <label className="flex flex-col gap-1 text-xs font-bold text-slate-600">
          Data do emplacamento
          <input type="date" value={data} onChange={(event) => setData(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Resumo label="Total do dia" valor={total} classe="from-slate-950 to-slate-700" />
        <Resumo label="Peugeot" valor={totalPeugeot} classe="from-indigo-600 to-violet-500" />
        <Resumo label="Citroën" valor={totalCitroen} classe="from-cyan-600 to-teal-500" />
      </div>

      {isLoading && <p className="py-10 text-center text-sm text-slate-400">Carregando emplacamentos...</p>}
      {isError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">Não foi possível carregar os emplacamentos deste dia.</p>}

      {!isLoading && !isError && registro && (
        <>
          <div className="glass-panel rounded-2xl p-4 sm:p-6">
            <div className="mb-5">
              <h3 className="font-bold text-slate-900">Registro de {formatarData(data)}</h3>
              <p className="mt-1 text-xs text-slate-500">Para aumentar um total, informe a placa do veículo antes de salvar.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {campos.map((campo) => {
                const valor = registro[campo.chave];
                const isPeugeot = campo.marca === 'PEUGEOT';
                return (
                  <article key={campo.chave} className={`rounded-xl border p-4 ${isPeugeot ? 'border-indigo-100 bg-indigo-50/60' : 'border-cyan-100 bg-cyan-50/60'}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className={`text-xs font-black uppercase tracking-wider ${isPeugeot ? 'text-indigo-600' : 'text-cyan-700'}`}>{campo.marcaLabel}</p>
                        <h4 className="text-lg font-black text-slate-900">{campo.categoriaLabel}</h4>
                      </div>
                      <p className="text-3xl font-black text-slate-950">{valor}</p>
                    </div>
                    <button type="button" onClick={() => abrirRegistro(campo)} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white transition ${isPeugeot ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
                      <span className="text-lg leading-none">+</span> Adicionar placa
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          <section className="glass-panel rounded-2xl p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">Resumo do dia</h3>
                <p className="mt-1 text-xs text-slate-500">{registro.veiculos.length} placa{registro.veiculos.length === 1 ? '' : 's'} registrada{registro.veiculos.length === 1 ? '' : 's'}.</p>
              </div>
              {adicionar.isSuccess && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">Salvo</span>}
            </div>

            {registro.veiculos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400">Nenhuma placa registrada nesta data.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {campos.map((campo) => <GrupoResumo key={campo.chave} campo={campo} veiculos={veiculosPorCampo(campo)} onRemover={(id) => remover.mutate(id)} removendo={remover.isPending} />)}
              </div>
            )}
            {adicionar.isError && <p className="mt-4 text-sm font-medium text-red-600">Não foi possível salvar a placa. Verifique se ela já não foi registrada neste dia.</p>}
          </section>
        </>
      )}

      {campoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <form onSubmit={salvarVeiculo} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-wider text-indigo-600">Novo emplacamento</p>
            <h3 className="mt-1 text-xl font-black text-slate-950">{campoSelecionado.marcaLabel} · {campoSelecionado.categoriaLabel}</h3>
            <label className="mt-5 flex flex-col gap-1.5 text-sm font-bold text-slate-700">
              Placa do veículo
              <input autoFocus required value={placa} onChange={(event) => setPlaca(formatarPlaca(event.target.value))} placeholder="ABC-1D23" maxLength={8} className="rounded-lg border border-slate-300 px-3 py-2.5 uppercase text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </label>
            <p className="mt-2 text-xs text-slate-500">Aceita placas no formato antigo e Mercosul.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setCampoSelecionado(null)} disabled={adicionar.isPending} className="rounded-lg px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100">Cancelar</button>
              <button type="submit" disabled={adicionar.isPending || placa.replace(/[^A-Z0-9]/g, '').length !== 7} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{adicionar.isPending ? 'Salvando...' : 'Salvar no resumo'}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

const GrupoResumo: React.FC<{ campo: Campo; veiculos: EmplacamentoMobileVeiculo[]; onRemover: (id: string) => void; removendo: boolean }> = ({ campo, veiculos, onRemover, removendo }) => {
  const isPeugeot = campo.marca === 'PEUGEOT';
  return (
    <article className={`rounded-xl border p-4 ${isPeugeot ? 'border-indigo-100 bg-indigo-50/50' : 'border-cyan-100 bg-cyan-50/50'}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-black text-slate-900">{campo.marcaLabel} · {campo.categoriaLabel}</h4>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600">{veiculos.length}</span>
      </div>
      {veiculos.length === 0 ? <p className="text-xs text-slate-400">Nenhuma placa.</p> : <ul className="flex flex-wrap gap-2">{veiculos.map((veiculo) => <li key={veiculo.id} className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-black text-slate-700 shadow-sm"><span>{formatarPlaca(veiculo.placa)}</span><button type="button" onClick={() => onRemover(veiculo.id)} disabled={removendo} className="ml-1 text-slate-400 transition hover:text-red-600 disabled:opacity-50" aria-label={`Excluir placa ${veiculo.placa}`}>×</button></li>)}</ul>}
    </article>
  );
};

const Resumo: React.FC<{ label: string; valor: number; classe: string }> = ({ label, valor, classe }) => (
  <div className="metric-card relative overflow-hidden rounded-xl px-5 py-4">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${classe}`} />
    <p className="text-xs font-bold text-slate-500">{label}</p>
    <p className="mt-1 text-3xl font-black text-slate-950">{valor}</p>
  </div>
);
