import { TipoServico, StatusServico, TipoVeiculoMontagem } from '@prisma/client';

export { TipoServico, StatusServico, TipoVeiculoMontagem };

export interface ListServicosQuery {
  status?: StatusServico;
  tipo?: TipoServico;
  search?: string;
}

export interface CreateServicoBody {
  tipo: TipoServico;
  dataLimite: string;
  observacoes?: string;
  chassi: string;
  clienteId: string;
}

export interface UpdateServicoBody {
  tipo?: TipoServico;
  status?: StatusServico;
  dataLimite?: string;
  observacoes?: string | null;
  chassi?: string;
  senhaConfirmacao?: string;
}

export interface UpdateServicoStatusBody {
  status: StatusServico;
  senhaConfirmacao?: string;
}

export interface CreateClienteBody {
  nome: string;
  telefone?: string;
  cpfCnpj: string;
}

export interface CreateVeiculoBody {
  placa: string;
  modelo: string;
  renavam: string;
  clienteId: string;
}

export interface CreateProcessoMontagemBody {
  placa: string;
  numeroAtendimento: string;
  solicitantePa2: string;
  tipoVeiculo: TipoVeiculoMontagem;
}

export interface CreateProcessoAnexoBody {
  nome: string;
  mimeType: string;
  tamanho: number;
  conteudoBase64: string;
}
