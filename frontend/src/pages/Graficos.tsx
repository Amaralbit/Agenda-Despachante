import React, { useMemo, useState } from 'react';
import { useProcessos } from '../hooks/useProcessos';

type Periodo = 7 | 30;

interface DiaDoGrafico {
  chave: string;
  rotulo: string;
  enviados: number;
  concluidos: number;
}

function chaveDaData(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function rotuloDaData(data: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(data);
}

function dadosDoPeriodo(periodo: Periodo, processos: ReturnType<typeof useProcessos>['data'] = []) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dias: DiaDoGrafico[] = Array.from({ length: periodo }, (_, indice) => {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - (periodo - 1 - indice));
    return { chave: chaveDaData(data), rotulo: rotuloDaData(data), enviados: 0, concluidos: 0 };
  });

  const porChave = new Map(dias.map((dia) => [dia.chave, dia]));
  processos.forEach((processo) => {
    const enviado = porChave.get(chaveDaData(new Date(processo.createdAt)));
    if (enviado) enviado.enviados += 1;

    if (processo.concluidoEm) {
      const concluido = porChave.get(chaveDaData(new Date(processo.concluidoEm)));
      if (concluido) concluido.concluidos += 1;
    }
  });

  return dias;
}

const GraficoBarras: React.FC<{ dias: DiaDoGrafico[] }> = ({ dias }) => {
  const largura = 800;
  const altura = 300;
  const topo = 24;
  const base = 238;
  const alturaUtil = base - topo;
  const margem = 32;
  const larguraGrupo = (largura - margem * 2) / dias.length;
  const larguraBarra = Math.max(3, Math.min(16, larguraGrupo * 0.28));
  const maximo = Math.max(1, ...dias.flatMap((dia) => [dia.enviados, dia.concluidos]));
  const linhas = 4;

  return (
    <div className="overflow-x-auto pb-2">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="min-w-[620px] w-full"
        role="img"
        aria-label="Gráfico diário de processos enviados e concluídos"
      >
        {Array.from({ length: linhas + 1 }, (_, indice) => {
          const valor = Math.round((maximo / linhas) * (linhas - indice));
          const y = topo + (alturaUtil / linhas) * indice;
          return (
            <g key={valor}>
              <line x1={margem} x2={largura - margem} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={margem - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
                {valor}
              </text>
            </g>
          );
        })}

        {dias.map((dia, indice) => {
          const centro = margem + larguraGrupo * indice + larguraGrupo / 2;
          const alturaEnviados = (dia.enviados / maximo) * alturaUtil;
          const alturaConcluidos = (dia.concluidos / maximo) * alturaUtil;
          const exibirRotulo = dias.length <= 7 || indice % 3 === 0 || indice === dias.length - 1;

          return (
            <g key={dia.chave}>
              <title>{`${dia.rotulo}: ${dia.enviados} enviados, ${dia.concluidos} concluídos`}</title>
              <rect x={centro - larguraBarra - 2} y={base - alturaEnviados} width={larguraBarra} height={alturaEnviados} rx="3" fill="#4f46e5" />
              <rect x={centro + 2} y={base - alturaConcluidos} width={larguraBarra} height={alturaConcluidos} rx="3" fill="#10b981" />
              {exibirRotulo && (
                <text x={centro} y={base + 22} textAnchor="middle" className="fill-slate-500 text-[10px]">
                  {dia.rotulo}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const Graficos: React.FC = () => {
  const [periodo, setPeriodo] = useState<Periodo>(7);
  const { data: processos = [], isLoading, isError } = useProcessos();
  const dias = useMemo(() => dadosDoPeriodo(periodo, processos), [periodo, processos]);
  const hoje = dias[dias.length - 1];
  const enviadosPeriodo = dias.reduce((total, dia) => total + dia.enviados, 0);
  const concluidosPeriodo = dias.reduce((total, dia) => total + dia.concluidos, 0);

  return (
    <section className="mx-auto flex w-full max-w-screen-xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">Processos por dia</h2>
          <p className="mt-1 text-sm text-slate-500">Acompanhe as montagens criadas e as efetivamente concluídas.</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {([7, 30] as Periodo[]).map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => setPeriodo(opcao)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                periodo === opcao ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {opcao} dias
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Resumo label="Enviados hoje" valor={hoje.enviados} classe="text-indigo-700" />
        <Resumo label="Concluídos hoje" valor={hoje.concluidos} classe="text-emerald-700" />
        <Resumo label={`Enviados em ${periodo} dias`} valor={enviadosPeriodo} classe="text-slate-900" />
        <Resumo label={`Concluídos em ${periodo} dias`} valor={concluidosPeriodo} classe="text-slate-900" />
      </div>

      <div className="glass-panel rounded-xl p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm bg-indigo-600" />Enviados</span>
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm bg-emerald-500" />Concluídos</span>
        </div>

        {isLoading && <p className="py-20 text-center text-sm text-slate-400">Carregando dados dos processos...</p>}
        {isError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">Não foi possível carregar os gráficos.</p>}
        {!isLoading && !isError && <GraficoBarras dias={dias} />}
      </div>

      <p className="text-xs text-slate-500">Enviados considera a data de criação da montagem. Concluídos considera a data em que ela foi finalizada.</p>
    </section>
  );
};

const Resumo: React.FC<{ label: string; valor: number; classe: string }> = ({ label, valor, classe }) => (
  <div className="metric-card rounded-lg px-4 py-3">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className={`mt-1 text-2xl font-black ${classe}`}>{valor}</p>
  </div>
);
