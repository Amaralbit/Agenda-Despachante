import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClienteModal } from '../components/ClienteModal/ClienteModal';
import { VeiculoModal } from '../components/VeiculoModal/VeiculoModal';
import { useClientes, useCreateCliente, useUpdateCliente, useDeleteCliente, useCreateVeiculo } from '../hooks/useClientes';
import { Cliente, Veiculo } from '../types';

export const Clientes: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const [clienteModal, setClienteModal] = useState<{ open: boolean; cliente?: Cliente | null }>({ open: false });
  const [veiculoModal, setVeiculoModal] = useState<{ open: boolean; clienteId?: string; clienteNome?: string; veiculo?: Veiculo | null }>({ open: false });

  const { data: clientes = [], isLoading } = useClientes(search || undefined);
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  const deleteCliente = useDeleteCliente();
  const createVeiculo = useCreateVeiculo();

  function handleClienteSubmit(data: { nome: string; telefone?: string; cpfCnpj: string }) {
    if (clienteModal.cliente) {
      updateCliente.mutate(
        { id: clienteModal.cliente.id, data },
        { onSuccess: () => setClienteModal({ open: false }) },
      );
    } else {
      createCliente.mutate(data, { onSuccess: () => setClienteModal({ open: false }) });
    }
  }

  function handleVeiculoSubmit(data: { placa: string; modelo: string; renavam: string }) {
    if (!veiculoModal.clienteId) return;
    createVeiculo.mutate(
      { clienteId: veiculoModal.clienteId, data },
      { onSuccess: () => setVeiculoModal({ open: false }) },
    );
  }

  function handleDeleteCliente(id: string, nome: string) {
    if (!window.confirm(`Excluir cliente "${nome}" e todos os seus veículos e serviços?`)) return;
    deleteCliente.mutate(id);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nome ou CPF/CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <button
          onClick={() => setClienteModal({ open: true })}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <span>+</span> Novo Cliente
        </button>
      </div>

      {/* Contagem */}
      <p className="text-sm text-gray-500">
        {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} encontrado{clientes.length !== 1 ? 's' : ''}
      </p>

      {/* Lista */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Carregando...</div>
      ) : clientes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">👤</p>
          <p>Nenhum cliente cadastrado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {clientes.map((cliente) => {
            const isOpen = expanded === cliente.id;
            return (
              <div key={cliente.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header do cliente */}
                <div className="flex items-center gap-3 px-5 py-4">
                  <button
                    onClick={() => setExpanded(isOpen ? null : cliente.id)}
                    className="flex-1 flex items-start gap-3 text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                      {cliente.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{cliente.nome}</p>
                      <p className="text-xs text-gray-400">{cliente.cpfCnpj}</p>
                      {cliente.telefone && (
                        <p className="text-xs text-gray-400">{cliente.telefone}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {cliente.veiculos.length} veículo{cliente.veiculos.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                      onClick={() => setClienteModal({ open: true, cliente })}
                      className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
                    >
                      Editar
                    </button>
                    <span className="text-gray-200">|</span>
                    <button
                      onClick={() => handleDeleteCliente(cliente.id, cliente.nome)}
                      className="text-xs text-red-400 hover:text-red-600 font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {/* Veículos (expandido) */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-5 pb-4 pt-3 bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Veículos</p>
                      <button
                        onClick={() => setVeiculoModal({ open: true, clienteId: cliente.id, clienteNome: cliente.nome })}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        + Adicionar veículo
                      </button>
                    </div>

                    {cliente.veiculos.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">Nenhum veículo cadastrado.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {cliente.veiculos.map((v) => (
                          <div key={v.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-3 py-2.5">
                            <span className="bg-gray-900 text-white text-xs font-mono font-bold px-2 py-0.5 rounded tracking-widest">
                              {v.placa}
                            </span>
                            <span className="text-sm text-gray-700 flex-1">{v.modelo}</span>
                            <span className="text-xs text-gray-400 font-mono">{v.renavam}</span>
                            <Link
                              to={`/veiculos/${v.id}/historico`}
                              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium ml-2"
                            >
                              Histórico
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modais */}
      {clienteModal.open && (
        <ClienteModal
          cliente={clienteModal.cliente}
          onClose={() => setClienteModal({ open: false })}
          onSubmit={handleClienteSubmit}
          isLoading={createCliente.isPending || updateCliente.isPending}
        />
      )}

      {veiculoModal.open && veiculoModal.clienteId && (
        <VeiculoModal
          clienteNome={veiculoModal.clienteNome ?? ''}
          veiculo={veiculoModal.veiculo}
          onClose={() => setVeiculoModal({ open: false })}
          onSubmit={handleVeiculoSubmit}
          isLoading={createVeiculo.isPending}
        />
      )}
    </div>
  );
};
