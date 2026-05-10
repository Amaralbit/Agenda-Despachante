export type TipoServico =
  | 'INCLUSAO_VEICULO_NOVO'
  | 'TRANSFERENCIA'
  | 'INTENCAO_DE_VENDA'
  | 'OUTROS';

export type StatusServico = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  cpfCnpj: string;
  createdAt: string;
  updatedAt: string;
}

export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  renavam: string;
  clienteId: string;
  cliente?: Cliente;
  createdAt: string;
  updatedAt: string;
}

export interface Servico {
  id: string;
  tipo: TipoServico;
  status: StatusServico;
  dataLimite: string;
  observacoes?: string | null;
  clienteId: string;
  cliente: Cliente;
  veiculoId: string;
  veiculo: Veiculo;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicoForm {
  tipo: TipoServico;
  dataLimite: string;
  observacoes?: string;
  clienteId: string;
  veiculoId: string;
}

export const TIPO_LABELS: Record<TipoServico, string> = {
  INCLUSAO_VEICULO_NOVO: 'Inclusão Veículo Novo',
  TRANSFERENCIA: 'Transferência',
  INTENCAO_DE_VENDA: 'Intenção de Venda',
  OUTROS: 'Outros',
};

export const STATUS_LABELS: Record<StatusServico, string> = {
  PENDENTE: 'Para Fazer',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO: 'Concluído',
};
