-- ============================================================
-- Sistema de Gestão de Serviços Veiculares — Schema PostgreSQL
-- ============================================================

CREATE DATABASE agenda_despachante;
\c agenda_despachante;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE tipo_servico AS ENUM (
  'INCLUSAO_VEICULO_NOVO',
  'TRANSFERENCIA',
  'INTENCAO_DE_VENDA',
  'OUTROS'
);

CREATE TYPE status_servico AS ENUM (
  'PENDENTE',
  'EM_ANDAMENTO',
  'CONCLUIDO'
);

-- ============================================================
-- Tabela: clientes
-- ============================================================
CREATE TABLE clientes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       VARCHAR(255) NOT NULL,
  telefone   VARCHAR(20),
  cpf_cnpj   VARCHAR(18) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT clientes_cpf_cnpj_unique UNIQUE (cpf_cnpj)
);

-- ============================================================
-- Tabela: veiculos
-- ============================================================
CREATE TABLE veiculos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa      VARCHAR(10) NOT NULL,
  modelo     VARCHAR(100) NOT NULL,
  renavam    VARCHAR(20) NOT NULL,
  cliente_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT veiculos_placa_unique   UNIQUE (placa),
  CONSTRAINT veiculos_renavam_unique UNIQUE (renavam),
  CONSTRAINT veiculos_cliente_fk     FOREIGN KEY (cliente_id)
    REFERENCES clientes (id) ON DELETE CASCADE
);

-- ============================================================
-- Tabela: servicos
-- ============================================================
CREATE TABLE servicos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        tipo_servico   NOT NULL,
  status      status_servico NOT NULL DEFAULT 'PENDENTE',
  data_limite DATE NOT NULL,
  observacoes TEXT,
  cliente_id  UUID NOT NULL,
  veiculo_id  UUID NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT servicos_cliente_fk FOREIGN KEY (cliente_id)
    REFERENCES clientes (id),
  CONSTRAINT servicos_veiculo_fk FOREIGN KEY (veiculo_id)
    REFERENCES veiculos (id)
);

-- ============================================================
-- Índices de performance
-- ============================================================
CREATE INDEX idx_servicos_status     ON servicos (status);
CREATE INDEX idx_servicos_tipo       ON servicos (tipo);
CREATE INDEX idx_servicos_data_limite ON servicos (data_limite);
CREATE INDEX idx_veiculos_placa      ON veiculos (placa);
CREATE INDEX idx_clientes_nome       ON clientes USING gin (to_tsvector('portuguese', nome));
CREATE INDEX idx_clientes_cpf_cnpj   ON clientes (cpf_cnpj);

-- ============================================================
-- Trigger: atualiza updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_veiculos_updated_at
  BEFORE UPDATE ON veiculos
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_servicos_updated_at
  BEFORE UPDATE ON servicos
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- Tabela: usuarios
-- ============================================================
CREATE TABLE usuarios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  senha_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT usuarios_email_unique UNIQUE (email)
);

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- Dados de exemplo
-- ============================================================
INSERT INTO clientes (id, nome, telefone, cpf_cnpj) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'João Silva',    '(11) 99999-1111', '123.456.789-00'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Maria Souza',   '(11) 98888-2222', '987.654.321-00'),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'Carlos Mendes', '(11) 97777-3333', '12.345.678/0001-99');

INSERT INTO veiculos (id, placa, modelo, renavam, cliente_id) VALUES
  ('b1b2c3d4-0000-0000-0000-000000000001', 'ABC-1234', 'Honda Civic 2022',   '12345678901', 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('b1b2c3d4-0000-0000-0000-000000000002', 'XYZ-5678', 'Toyota Corolla 2023','98765432109', 'a1b2c3d4-0000-0000-0000-000000000002'),
  ('b1b2c3d4-0000-0000-0000-000000000003', 'DEF-9012', 'VW Gol 2021',        '11223344556', 'a1b2c3d4-0000-0000-0000-000000000003');

INSERT INTO servicos (tipo, status, data_limite, observacoes, cliente_id, veiculo_id) VALUES
  ('TRANSFERENCIA',         'PENDENTE',     '2026-05-15', 'Aguardando CRV do vendedor',   'a1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000001'),
  ('INCLUSAO_VEICULO_NOVO', 'EM_ANDAMENTO', '2026-05-20', NULL,                           'a1b2c3d4-0000-0000-0000-000000000002', 'b1b2c3d4-0000-0000-0000-000000000002'),
  ('INTENCAO_DE_VENDA',     'PENDENTE',     '2026-05-12', 'Falta documento do comprador', 'a1b2c3d4-0000-0000-0000-000000000003', 'b1b2c3d4-0000-0000-0000-000000000003'),
  ('OUTROS',                'CONCLUIDO',    '2026-05-01', NULL,                           'a1b2c3d4-0000-0000-0000-000000000001', 'b1b2c3d4-0000-0000-0000-000000000001');
