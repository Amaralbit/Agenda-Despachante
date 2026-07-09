import { TipoServico, StatusServico } from '@prisma/client';

export { TipoServico, StatusServico };

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
}

export interface UpdateServicoStatusBody {
  status: StatusServico;
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
}

export interface CreateProcessoAnexoBody {
  nome: string;
  mimeType: string;
  tamanho: number;
  conteudoBase64: string;
}
