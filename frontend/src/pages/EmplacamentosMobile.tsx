import React, { FormEvent, useMemo, useState } from 'react';
import {
  useAdicionarVeiculoEmplacamento,
  useAtualizarMarcaEmplacamento,
  useCriarMarcaEmplacamento,
  useEmplacamentosMobile,
  useMarcasEmplacamento,
  useRemoverVeiculoEmplacamento,
} from '../hooks/useEmplacamentosMobile';
import { EmplacamentoMobileVeiculo, MarcaEmplacamento } from '../types';

type Categoria = EmplacamentoMobileVeiculo['categoria'];
type RegistroSelecionado = { marca: MarcaEmplacamento; categoria: Categoria };
const EMPTY_VEICULOS: EmplacamentoMobileVeiculo[] = [];

const PALETAS = [
  { linha: 'from-violet-500 to-indigo-500', botao: 'bg-indigo-600 hover:bg-indigo-700', selo: 'bg-indigo-50 text-indigo-700' },
  { linha: 'from-cyan-500 to-sky-500', botao: 'bg-sky-600 hover:bg-sky-700', selo: 'bg-sky-50 text-sky-700' },
  { linha: 'from-emerald-500 to-teal-500', botao: 'bg-emerald-600 hover:bg-emerald-700', selo: 'bg-emerald-50 text-emerald-700' },
  { linha: 'from-amber-500 to-orange-500', botao: 'bg-amber-600 hover:bg-amber-700', selo: 'bg-amber-50 text-amber-700' },
] as const;

function hojeComoChave() {
  const hoje = new Date();
  const deslocamento = hoje.getTimezoneOffset() * 60_000;
  return new Date(hoje.getTime() - deslocamento).toISOString().slice(0, 10);
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${data}T12:00:00`));
}

function formatarPlaca(placa: string) {
  const limpa = placa.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  return limpa.length > 3 ? `${limpa.slice(0, 3)}-${limpa.slice(3)}` : limpa;
}

export const EmplacamentosMobile: React.FC = () => {
  const [data, setData] = useState(hojeComoChave);
  const [registroSelecionado, setRegistroSelecionado] = useState<RegistroSelecionado | null>(null);
  const [gerenciandoMarcas, setGerenciandoMarcas] = useState(false);
  const [placa, setPlaca] = useState('');
  const { data: registro, isLoading, isError } = useEmplacamentosMobile(data);
  const { data: marcas = [], isLoading: carregandoMarcas } = useMarcasEmplacamento();
  const adicionar = useAdicionarVeiculoEmplacamento(data);
  const remover = useRemoverVeiculoEmplacamento(data);

  const marcasAtivas = useMemo(() => marcas.filter((marca) => marca.ativa), [marcas]);
  const veiculos = registro?.veiculos ?? EMPTY_VEICULOS;
  const veiculosPorMarca = useMemo(() => {
    const agrupados = new Map<string, EmplacamentoMobileVeiculo[]>();
    for (const veiculo of veiculos) {
      const grupo = agrupados.get(veiculo.marcaId);
      if (grupo) grupo.push(veiculo);
      else agrupados.set(veiculo.marcaId, [veiculo]);
    }
    return agrupados;
  }, [veiculos]);
  const totalPasseio = veiculos.filter((veiculo) => veiculo.categoria === 'PASSEIO').length;
  const totalUtilitario = veiculos.length - totalPasseio;

  function abrirRegistro(marca: MarcaEmplacamento, categoria: Categoria) {
    setPlaca('');
    setRegistroSelecionado({ marca, categoria });
  }

  function salvarVeiculo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!registroSelecionado) return;
    adicionar.mutate(
      {
        placa,
        marcaId: registroSelecionado.marca.id,
        categoria: registroSelecionado.categoria,
      },
      {
        onSuccess: () => {
          setRegistroSelecionado(null);
          setPlaca('');
        },
      },
    );
  }

  const aguardando = isLoading || carregandoMarcas;

  return (
    <section className="mx-auto flex w-full max-w-screen-xl flex-col gap-6">
      <div className="page-intro">
        <div>
          <p className="page-kicker">Controle diário</p>
          <h2 className="page-title">Emplacamento</h2>
          <p className="page-description">
            Registre cada placa nas marcas atendidas pela sua equipe e acompanhe o volume do dia.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="field-label">
            Data do emplacamento
            <input
              type="date"
              value={data}
              onChange={(event) => setData(event.target.value)}
              className="field-control"
            />
          </label>
          <button
            type="button"
            onClick={() => setGerenciandoMarcas(true)}
            className="secondary-action h-[42px]"
          >
            Gerenciar marcas
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Resumo label="Total do dia" valor={veiculos.length} detalhe={formatarData(data)} classe="from-indigo-500 to-violet-500" />
        <Resumo label="Veículos de passeio" valor={totalPasseio} detalhe="Placas registradas" classe="from-emerald-500 to-teal-500" />
        <Resumo label="Utilitários" valor={totalUtilitario} detalhe={`${marcasAtivas.length} marca${marcasAtivas.length === 1 ? '' : 's'} ativa${marcasAtivas.length === 1 ? '' : 's'}`} classe="from-amber-500 to-orange-500" />
      </div>

      {aguardando ? <Estado texto="Carregando emplacamentos..." /> : null}
      {isError ? <div className="error-banner">Não foi possível carregar os emplacamentos deste dia.</div> : null}

      {!aguardando && !isError && marcasAtivas.length === 0 ? (
        <div className="surface-panel flex flex-col items-center rounded-2xl px-6 py-14 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-black text-indigo-700">01</div>
          <h3 className="text-lg font-bold text-slate-950">Cadastre a primeira marca atendida</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            As marcas não vêm mais preenchidas. Adicione somente as montadoras com as quais sua equipe trabalha.
          </p>
          <button type="button" onClick={() => setGerenciandoMarcas(true)} className="primary-action mt-5">
            Cadastrar marca
          </button>
        </div>
      ) : null}

      {!aguardando && !isError && marcasAtivas.length > 0 ? (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {marcasAtivas.map((marca, indice) => {
            const paleta = PALETAS[indice % PALETAS.length];
            const veiculosDaMarca = veiculosPorMarca.get(marca.id) ?? [];
            const passeio = veiculosDaMarca.filter((veiculo) => veiculo.categoria === 'PASSEIO').length;
            const utilitario = veiculosDaMarca.length - passeio;

            return (
              <article key={marca.id} className="surface-panel relative overflow-hidden rounded-2xl p-5">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${paleta.linha}`} />
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${paleta.selo}`}>
                      Marca atendida
                    </span>
                    <h3 className="mt-2 text-xl font-black text-slate-950">{marca.nome}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black tracking-tight text-slate-950">{veiculosDaMarca.length}</p>
                    <p className="text-xs font-medium text-slate-500">no dia</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <CategoriaCard
                    label="Passeio"
                    valor={passeio}
                    onAdicionar={() => abrirRegistro(marca, 'PASSEIO')}
                    botaoClasse={paleta.botao}
                  />
                  <CategoriaCard
                    label="Utilitário"
                    valor={utilitario}
                    onAdicionar={() => abrirRegistro(marca, 'UTILITARIO')}
                    botaoClasse={paleta.botao}
                  />
                </div>
              </article>
            );
          })}
        </div>
      ) : null}

      {!aguardando && !isError ? (
        <section className="surface-panel rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="page-kicker">Detalhamento</p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">Placas de {formatarData(data)}</h3>
            </div>
            <span className="count-badge">{veiculos.length} registro{veiculos.length === 1 ? '' : 's'}</span>
          </div>

          {veiculos.length === 0 ? (
            <div className="empty-state">Nenhuma placa registrada nesta data.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {marcas
                .filter((marca) => (veiculosPorMarca.get(marca.id)?.length ?? 0) > 0)
                .map((marca) => (
                  <GrupoResumo
                    key={marca.id}
                    marca={marca}
                    veiculos={veiculosPorMarca.get(marca.id) ?? []}
                    onRemover={(id) => remover.mutate(id)}
                    removendo={remover.isPending}
                  />
                ))}
            </div>
          )}
          {adicionar.isError ? (
            <div className="error-banner mt-4">{adicionar.error.message}</div>
          ) : null}
        </section>
      ) : null}

      {registroSelecionado ? (
        <RegistroModal
          registro={registroSelecionado}
          placa={placa}
          onPlacaChange={(valor) => setPlaca(formatarPlaca(valor))}
          onClose={() => setRegistroSelecionado(null)}
          onSubmit={salvarVeiculo}
          salvando={adicionar.isPending}
        />
      ) : null}

      {gerenciandoMarcas ? (
        <GerenciarMarcasModal marcas={marcas} onClose={() => setGerenciandoMarcas(false)} />
      ) : null}
    </section>
  );
};

const CategoriaCard: React.FC<{
  label: string;
  valor: number;
  onAdicionar: () => void;
  botaoClasse: string;
}> = ({ label, valor, onAdicionar, botaoClasse }) => (
  <div className="soft-panel rounded-xl p-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-bold text-slate-700">{label}</p>
      <span className="text-2xl font-black text-slate-950">{valor}</span>
    </div>
    <button
      type="button"
      onClick={onAdicionar}
      className={`mt-4 w-full rounded-lg px-3 py-2 text-xs font-bold text-white transition ${botaoClasse}`}
    >
      + Adicionar placa
    </button>
  </div>
);

const GrupoResumo: React.FC<{
  marca: MarcaEmplacamento;
  veiculos: EmplacamentoMobileVeiculo[];
  onRemover: (id: string) => void;
  removendo: boolean;
}> = ({ marca, veiculos, onRemover, removendo }) => (
  <article className="soft-panel rounded-xl p-4">
    <div className="mb-3 flex items-center justify-between gap-3">
      <h4 className="text-sm font-black text-slate-900">{marca.nome}</h4>
      <span className="count-badge">{veiculos.length}</span>
    </div>
    <ul className="flex flex-wrap gap-2">
      {veiculos.map((veiculo) => (
        <li key={veiculo.id} className="plate-chip">
          <span>{formatarPlaca(veiculo.placa)}</span>
          <span className="text-[10px] font-semibold text-slate-400">
            {veiculo.categoria === 'PASSEIO' ? 'Passeio' : 'Utilitário'}
          </span>
          <button
            type="button"
            onClick={() => onRemover(veiculo.id)}
            disabled={removendo}
            className="ml-1 text-slate-400 transition hover:text-red-600 disabled:opacity-50"
            aria-label={`Excluir placa ${veiculo.placa}`}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  </article>
);

const RegistroModal: React.FC<{
  registro: RegistroSelecionado;
  placa: string;
  onPlacaChange: (placa: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  salvando: boolean;
}> = ({ registro, placa, onPlacaChange, onClose, onSubmit, salvando }) => (
  <div className="modal-backdrop" role="presentation">
    <form onSubmit={onSubmit} className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="registro-title">
      <p className="page-kicker">Novo emplacamento</p>
      <h3 id="registro-title" className="mt-1 text-xl font-black text-slate-950">
        {registro.marca.nome} · {registro.categoria === 'PASSEIO' ? 'Passeio' : 'Utilitário'}
      </h3>
      <label className="field-label mt-5">
        Placa do veículo
        <input
          autoFocus
          required
          value={placa}
          onChange={(event) => onPlacaChange(event.target.value)}
          placeholder="ABC-1D23"
          maxLength={8}
          className="field-control uppercase"
        />
      </label>
      <p className="mt-2 text-xs text-slate-500">Aceita placas no formato antigo e Mercosul.</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} disabled={salvando} className="secondary-action">Cancelar</button>
        <button
          type="submit"
          disabled={salvando || placa.replace(/[^A-Z0-9]/g, '').length !== 7}
          className="primary-action disabled:cursor-not-allowed disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : 'Salvar emplacamento'}
        </button>
      </div>
    </form>
  </div>
);

const GerenciarMarcasModal: React.FC<{ marcas: MarcaEmplacamento[]; onClose: () => void }> = ({ marcas, onClose }) => {
  const [nome, setNome] = useState('');
  const criar = useCriarMarcaEmplacamento();
  const atualizar = useAtualizarMarcaEmplacamento();

  function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nome.trim()) return;
    criar.mutate(nome.trim(), { onSuccess: () => setNome('') });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-panel max-w-lg" role="dialog" aria-modal="true" aria-labelledby="marcas-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="page-kicker">Configuração</p>
            <h3 id="marcas-title" className="mt-1 text-xl font-black text-slate-950">Marcas atendidas</h3>
            <p className="mt-1 text-sm text-slate-500">Cadastre somente as marcas que fazem parte da sua operação.</p>
          </div>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Fechar">×</button>
        </div>

        <form onSubmit={cadastrar} className="mt-6 flex gap-2">
          <input
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            placeholder="Ex.: Volkswagen"
            maxLength={60}
            className="field-control min-w-0 flex-1"
            aria-label="Nome da marca"
          />
          <button type="submit" disabled={criar.isPending || nome.trim().length < 2} className="primary-action disabled:opacity-50">
            Adicionar
          </button>
        </form>
        {criar.isError ? <div className="error-banner mt-3">{criar.error.message}</div> : null}

        <div className="mt-5 max-h-72 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
          {marcas.length === 0 ? (
            <div className="empty-state">Nenhuma marca cadastrada.</div>
          ) : marcas.map((marca) => (
            <div key={marca.id} className="soft-panel flex items-center justify-between gap-3 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{marca.nome}</p>
                <p className="text-xs text-slate-500">{marca.ativa ? 'Disponível para novos registros' : 'Oculta para novos registros'}</p>
              </div>
              <button
                type="button"
                onClick={() => atualizar.mutate({ id: marca.id, ativa: !marca.ativa })}
                disabled={atualizar.isPending}
                className={marca.ativa ? 'status-toggle-active' : 'status-toggle-inactive'}
                aria-pressed={marca.ativa}
              >
                {marca.ativa ? 'Ativa' : 'Inativa'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Resumo: React.FC<{ label: string; valor: number; detalhe: string; classe: string }> = ({ label, valor, detalhe, classe }) => (
  <div className="metric-card relative overflow-hidden rounded-2xl px-5 py-4">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${classe}`} />
    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{valor}</p>
    <p className="mt-1 text-xs text-slate-400">{detalhe}</p>
  </div>
);

const Estado: React.FC<{ texto: string }> = ({ texto }) => (
  <div className="surface-panel rounded-2xl py-14 text-center text-sm text-slate-400">{texto}</div>
);
