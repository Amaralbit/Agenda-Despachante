-- Cada novo cadastro passa a ter uma conta própria. Para instalações já existentes,
-- todos os usuários e dados atuais permanecem juntos em uma única conta compartilhada.
CREATE TYPE "PapelConta" AS ENUM ('PROPRIETARIO', 'MEMBRO');

CREATE TABLE "contas" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "contas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "membros_conta" (
  "id" TEXT NOT NULL,
  "usuario_id" TEXT NOT NULL,
  "conta_id" TEXT NOT NULL,
  "papel" "PapelConta" NOT NULL DEFAULT 'MEMBRO',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "membros_conta_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "convites_conta" (
  "id" TEXT NOT NULL,
  "conta_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "criado_por" TEXT NOT NULL,
  "expira_em" TIMESTAMP(3) NOT NULL,
  "aceito_em" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "convites_conta_pkey" PRIMARY KEY ("id")
);

-- Mantém os dados existentes juntos. A expressão gera um UUID sem depender de extensão do PostgreSQL.
INSERT INTO "contas" ("id", "nome", "updated_at")
SELECT md5(random()::text || clock_timestamp()::text)::uuid::text, 'Conta compartilhada', CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "usuarios")
   OR EXISTS (SELECT 1 FROM "clientes")
   OR EXISTS (SELECT 1 FROM "veiculos")
   OR EXISTS (SELECT 1 FROM "servicos")
   OR EXISTS (SELECT 1 FROM "processos_montagem");

INSERT INTO "membros_conta" ("id", "usuario_id", "conta_id", "papel")
SELECT md5(random()::text || clock_timestamp()::text || u."id")::uuid::text, u."id", c."id", 'PROPRIETARIO'
FROM "usuarios" u CROSS JOIN "contas" c;

ALTER TABLE "clientes" ADD COLUMN "conta_id" TEXT;
ALTER TABLE "veiculos" ADD COLUMN "conta_id" TEXT;
ALTER TABLE "servicos" ADD COLUMN "conta_id" TEXT;
ALTER TABLE "processos_montagem" ADD COLUMN "conta_id" TEXT;

UPDATE "clientes" SET "conta_id" = (SELECT "id" FROM "contas" LIMIT 1);
UPDATE "veiculos" SET "conta_id" = (SELECT "id" FROM "contas" LIMIT 1);
UPDATE "servicos" SET "conta_id" = (SELECT "id" FROM "contas" LIMIT 1);
UPDATE "processos_montagem" SET "conta_id" = (SELECT "id" FROM "contas" LIMIT 1);

ALTER TABLE "clientes" ALTER COLUMN "conta_id" SET NOT NULL;
ALTER TABLE "veiculos" ALTER COLUMN "conta_id" SET NOT NULL;
ALTER TABLE "servicos" ALTER COLUMN "conta_id" SET NOT NULL;
ALTER TABLE "processos_montagem" ALTER COLUMN "conta_id" SET NOT NULL;

DROP INDEX "clientes_cpf_cnpj_key";
CREATE UNIQUE INDEX "clientes_conta_id_cpf_cnpj_key" ON "clientes"("conta_id", "cpf_cnpj");
DROP INDEX "veiculos_placa_key";
DROP INDEX "veiculos_renavam_key";
CREATE UNIQUE INDEX "veiculos_conta_id_placa_key" ON "veiculos"("conta_id", "placa");
CREATE UNIQUE INDEX "veiculos_conta_id_renavam_key" ON "veiculos"("conta_id", "renavam");

CREATE UNIQUE INDEX "convites_conta_token_key" ON "convites_conta"("token");
CREATE UNIQUE INDEX "membros_conta_usuario_id_conta_id_key" ON "membros_conta"("usuario_id", "conta_id");
CREATE INDEX "membros_conta_conta_id_idx" ON "membros_conta"("conta_id");
CREATE INDEX "convites_conta_conta_id_idx" ON "convites_conta"("conta_id");
CREATE INDEX "clientes_conta_id_idx" ON "clientes"("conta_id");
CREATE INDEX "veiculos_conta_id_idx" ON "veiculos"("conta_id");
CREATE INDEX "servicos_conta_id_idx" ON "servicos"("conta_id");
CREATE INDEX "processos_montagem_conta_id_idx" ON "processos_montagem"("conta_id");

ALTER TABLE "membros_conta" ADD CONSTRAINT "membros_conta_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "membros_conta" ADD CONSTRAINT "membros_conta_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "convites_conta" ADD CONSTRAINT "convites_conta_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "processos_montagem" ADD CONSTRAINT "processos_montagem_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
