ALTER TABLE "processos_montagem"
  ALTER COLUMN "numero_atendimento" DROP NOT NULL,
  ADD COLUMN "numero_protocolo" TEXT NOT NULL DEFAULT '';
