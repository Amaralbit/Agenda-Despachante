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
  clienteId: string;
  veiculoId: string;
}

export interface UpdateServicoBody {
  tipo?: TipoServico;
  status?: StatusServico;
  dataLimite?: string;
  observacoes?: string | null;
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
