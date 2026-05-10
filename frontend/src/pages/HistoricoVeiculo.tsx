import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { veiculosApi } from '../api/veiculos.api';
import { Servico, STATUS_LABELS, TIPO_LABELS } from '../types';

const STATUS_COLOR: Record<string, string> = {
  PENDENTE:     'bg-slate-100 text-slate-700',
  EM_ANDAMENTO: 'bg-amber-100 text-amber-700',
  CONCLUIDO:    'bg-emerald-100 text-emerald-700',
};

const STATUS_DOT: Record<string, string> = {
  PENDENTE:     'bg-slate-400',
  EM_ANDAMENTO: 'bg-amber-400',
  CONCLUIDO:    'bg-emerald-500',
};

const TIPO_COLOR: Record<string, string> = {
  INCLUSAO_VEICULO_NOVO: 'bg-blue-100 text-blue-700',
  TRANSFERENCIA:         'bg-purple-100 text-purple-700',
  INTENCAO_DE_VENDA:    'bg-amber-100 text-amber-700',
  OUTROS:                'bg-gray-100 text-gray-600',
};

export const HistoricoVeiculo: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: veiculo, isLoading, isError } = useQuery({
    queryKey: ['veiculo-historico', id],
    queryFn: () => veiculosApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="text-center py-16 text-gray-400">Carregando histórico...</div>;
  }

  if (isError || !veiculo) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl mb-2">⚠</p>
        <p className="text-red-500 font-semibold">Veículo não encontrado.</p>
        <Link to="/clientes" className="text-indigo-500 text-sm mt-2 inline-block">← Voltar para Clientes</Link>
      </div>
    );
  }

  const servicos = veiculo.servicos as (Servico & { cliente: { nome: string } })[];

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Breadcrumb */}
      <Link to="/clientes" className="text-sm text-indigo-500 hover:text-indigo-700 font-medium self-start">
        ← Voltar para Clientes
      </Link>

      {/* Card do veículo */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-gray-900 text-white font-mono font-bold text-sm px-3 py-1 rounded tracking-widest">
                {veiculo.placa}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-2">{veiculo.modelo}</p>
            <p className="text-sm text-gray-400">RENAVAM: {veiculo.renavam}</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Proprietário</p>
            <p className="font-semibold text-gray-900">{veiculo.cliente.nome}</p>
            {veiculo.cliente.telefone && (
              <p className="text-sm text-gray-400">{veiculo.cliente.telefone}</p>
            )}
            <p className="text-xs text-gray-400">{veiculo.cliente.cpfCnpj}</p>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: 'Total de Serviços', value: servicos.length },
            { label: 'Em Aberto',  value: servicos.filter((s) => s.status !== 'CONCLUIDO').length },
            { label: 'Concluídos', value: servicos.filter((s) => s.status === 'CONCLUIDO').length },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{m.value}</p>
              <p className="text-xs text-gray-400">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline de serviços */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Histórico de Serviços
        </h2>

        {servicos.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p>Nenhum serviço registrado para este veículo.</p>
          </div>
        ) : (
          <div className="relative flex flex-col gap-0">
            {/* Linha vertical da timeline */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />

            {servicos.map((s, idx) => {
              const limite = new Date(s.dataLimite);
              const isOverdue = limite < hoje && s.status !== 'CONCLUIDO';

              return (
                <div key={s.id} className="relative flex gap-5 pb-6">
                  {/* Ponto na timeline */}
                  <div className={`w-8 h-8 rounded-full border-2 border-white shadow flex items-center justify-center shrink-0 z-10 mt-1 ${STATUS_DOT[s.status]}`}>
                    <span className="text-white text-xs font-bold">{idx + 1}</span>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_COLOR[s.tipo]}`}>
                        {TIPO_LABELS[s.tipo]}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[s.status]}`}>
                        {STATUS_LABELS[s.status]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                      <span>Criado em {new Date(s.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
                        {isOverdue && '⚠ '}Prazo: {limite.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </span>
                    </div>

                    {s.observacoes && (
                      <div className="mt-2 px-2 py-1.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <span className="font-semibold">Obs: </span>{s.observacoes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
