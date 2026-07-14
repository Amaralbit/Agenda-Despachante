CREATE TABLE "lembretes" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data_lembrete" DATE,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "usuario_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lembretes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lembretes_usuario_id_idx" ON "lembretes"("usuario_id");

ALTER TABLE "lembretes"
ADD CONSTRAINT "lembretes_usuario_id_fkey"
FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
