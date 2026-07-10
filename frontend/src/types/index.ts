export type TipoServico =
  | 'INCLUSAO_VEICULO_NOVO'
  | 'TRANSFERENCIA'
  | 'PA2'
  | 'INTENCAO_DE_VENDA'
  | 'OUTROS';

export type StatusServico = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export type StatusProcessoMontagem =
  | StatusServico
  | 'AGUARDANDO_IMPRESSAO';

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
  chassi?: string | null;
  clienteId: string;
  cliente: Cliente;
  veiculoId?: string | null;
  veiculo?: Veiculo | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicoForm {
  tipo: TipoServico;
  dataLimite: string;
  observacoes?: string;
  clienteId: string;
  chassi: string;
}

export interface ProcessoAnexo {
  id: string;
  nome: string;
  mimeType: string;
  tamanho: number;
  createdAt: string;
}

export interface ProcessoMontagem {
  id: string;
  placa: string;
  numeroAtendimento: string;
  solicitantePa2: string;
  status: StatusProcessoMontagem;
  anexos: ProcessoAnexo[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProcessoMontagemForm {
  placa: string;
  numeroAtendimento: string;
  solicitantePa2: string;
}

export interface ProcessoAnexoUpload {
  nome: string;
  mimeType: 'application/pdf';
  tamanho: number;
  conteudoBase64: string;
}

export const TIPO_LABELS: Record<TipoServico, string> = {
  INCLUSAO_VEICULO_NOVO: 'Inclusão Veículo Novo',
  TRANSFERENCIA: 'Transferência',
  PA2: 'PA2',
  INTENCAO_DE_VENDA: 'Intenção de Venda',
  OUTROS: 'Outros',
};

export const PROCESSO_STATUS_LABELS: Record<StatusProcessoMontagem, string> = {
  PENDENTE: 'Para Fazer',
  EM_ANDAMENTO: 'Em Andamento',
  AGUARDANDO_IMPRESSAO: 'Aguardando Impressão',
  CONCLUIDO: 'Concluído',
};

export const STATUS_LABELS: Record<StatusServico, string> = {
  PENDENTE: 'Para Fazer',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO: 'Concluído',
};
