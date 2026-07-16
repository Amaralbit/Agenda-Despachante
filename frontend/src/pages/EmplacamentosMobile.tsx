import React, { useEffect, useMemo, useState } from 'react';
import { useEmplacamentosMobile, useSalvarEmplacamentosMobile } from '../hooks/useEmplacamentosMobile';
import { EmplacamentoMobileQuantidades } from '../types';

const campos: Array<{ chave: keyof EmplacamentoMobileQuantidades; marca: 'Peugeot' | 'Citroën'; tipo: 'Passeio' | 'Utilitário' }> = [
  { chave: 'peugeotPasseio', marca: 'Peugeot', tipo: 'Passeio' },
  { chave: 'peugeotUtilitario', marca: 'Peugeot', tipo: 'Utilitário' },
  { chave: 'citroenPasseio', marca: 'Citroën', tipo: 'Passeio' },
  { chave: 'citroenUtilitario', marca: 'Citroën', tipo: 'Utilitário' },
];

const zerado: EmplacamentoMobileQuantidades = {
  peugeotPasseio: 0,
  peugeotUtilitario: 0,
  citroenPasseio: 0,
  citroenUtilitario: 0,
};

function hojeComoChave() {
  const hoje = new Date();
  const deslocamento = hoje.getTimezoneOffset() * 60_000;
  return new Date(hoje.getTime() - deslocamento).toISOString().slice(0, 10);
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    .format(new Date(`${data}T12:00:00`));
}

export const EmplacamentosMobile: React.FC = () => {
  const [data, setData] = useState(hojeComoChave);
  const [quantidades, setQuantidades] = useState<EmplacamentoMobileQuantidades>(zerado);
  const { data: registro, isLoading, isError } = useEmplacamentosMobile(data);
  const salvar = useSalvarEmplacamentosMobile(data);

  useEffect(() => {
    if (registro) {
      setQuantidades({
        peugeotPasseio: registro.peugeotPasseio,
        peugeotUtilitario: registro.peugeotUtilitario,
        citroenPasseio: registro.citroenPasseio,
        citroenUtilitario: registro.citroenUtilitario,
      });
    }
  }, [registro]);

  const total = useMemo(() => Object.values(quantidades).reduce((soma, quantidade) => soma + quantidade, 0), [quantidades]);
  const totalPeugeot = quantidades.peugeotPasseio + quantidades.peugeotUtilitario;
  const totalCitroen = quantidades.citroenPasseio + quantidades.citroenUtilitario;

  function alterarQuantidade(chave: keyof EmplacamentoMobileQuantidades, valor: number) {
    setQuantidades((atual) => ({ ...atual, [chave]: Math.max(0, Number.isFinite(valor) ? Math.floor(valor) : 0) }));
  }

  function salvarRegistro() {
    salvar.mutate(quantidades);
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Controle diário</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Emplacamentos Mobile</h2>
          <p className="mt-1 text-sm text-slate-500">Atualize os veículos emplacados por marca e categoria.</p>
        </div>
        <label className="flex flex-col gap-1 text-xs font-bold text-slate-600">
          Data do emplacamento
          <input
            type="date"
            value={data}
            onChange={(event) => setData(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Resumo label="Total do dia" valor={total} classe="from-slate-950 to-slate-700" />
        <Resumo label="Peugeot" valor={totalPeugeot} classe="from-indigo-600 to-violet-500" />
        <Resumo label="Citroën" valor={totalCitroen} classe="from-cyan-600 to-teal-500" />
      </div>

      {isLoading && <p className="py-10 text-center text-sm text-slate-400">Carregando emplacamentos...</p>}
      {isError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">Não foi possível carregar os emplacamentos deste dia.</p>}

      {!isLoading && !isError && (
        <div className="glass-panel rounded-2xl p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900">Registro de {formatarData(data)}</h3>
              <p className="text-xs text-slate-500">Use os botões ou digite a quantidade de veículos.</p>
            </div>
            {salvar.isSuccess && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">Atualizado</span>}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {campos.map((campo) => {
              const valor = quantidades[campo.chave];
              const isPeugeot = campo.marca === 'Peugeot';
              return (
                <article key={campo.chave} className={`rounded-xl border p-4 ${isPeugeot ? 'border-indigo-100 bg-indigo-50/60' : 'border-cyan-100 bg-cyan-50/60'}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-black uppercase tracking-wider ${isPeugeot ? 'text-indigo-600' : 'text-cyan-700'}`}>{campo.marca}</p>
                      <h4 className="text-lg font-black text-slate-900">{campo.tipo}</h4>
                    </div>
                    <span className="rounded-lg bg-white/80 px-2 py-1 text-[11px] font-bold text-slate-500 shadow-sm">veículos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => alterarQuantidade(campo.chave, valor - 1)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-xl font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50" aria-label={`Diminuir ${campo.marca} ${campo.tipo}`}>−</button>
                    <input
                      type="number"
                      min="0"
                      value={valor}
                      onChange={(event) => alterarQuantidade(campo.chave, event.target.valueAsNumber)}
                      className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-center text-lg font-black text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                    <button type="button" onClick={() => alterarQuantidade(campo.chave, valor + 1)} className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl font-bold text-white transition ${isPeugeot ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-cyan-600 hover:bg-cyan-700'}`} aria-label={`Aumentar ${campo.marca} ${campo.tipo}`}>+</button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200/80 pt-4">
            <p className="text-xs text-slate-500">As informações ficam disponíveis para toda a equipe.</p>
            <button
              type="button"
              onClick={salvarRegistro}
              disabled={salvar.isPending}
              className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvar.isPending ? 'Salvando...' : 'Salvar atualização'}
            </button>
          </div>
          {salvar.isError && <p className="mt-3 text-sm font-medium text-red-600">Não foi possível salvar. Tente novamente.</p>}
        </div>
      )}
    </section>
  );
};

const Resumo: React.FC<{ label: string; valor: number; classe: string }> = ({ label, valor, classe }) => (
  <div className="metric-card relative overflow-hidden rounded-xl px-5 py-4">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${classe}`} />
    <p className="text-xs font-bold text-slate-500">{label}</p>
    <p className="mt-1 text-3xl font-black text-slate-950">{valor}</p>
  </div>
);
