-- Store process assembly work and attached PDFs for physical printing later.
CREATE TABLE "processos_montagem" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "numero_atendimento" TEXT NOT NULL,
    "status" "StatusServico" NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processos_montagem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "processos_anexos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "conteudo" BYTEA NOT NULL,
    "processo_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processos_anexos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "processos_montagem_status_idx" ON "processos_montagem"("status");
CREATE INDEX "processos_montagem_placa_idx" ON "processos_montagem"("placa");
CREATE INDEX "processos_anexos_processo_id_idx" ON "processos_anexos"("processo_id");

ALTER TABLE "processos_anexos" ADD CONSTRAINT "processos_anexos_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos_montagem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
