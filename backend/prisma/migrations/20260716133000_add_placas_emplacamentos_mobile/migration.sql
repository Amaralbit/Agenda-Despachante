CREATE TYPE "MarcaEmplacamentoMobile" AS ENUM ('PEUGEOT', 'CITROEN');
CREATE TYPE "CategoriaEmplacamentoMobile" AS ENUM ('PASSEIO', 'UTILITARIO');

CREATE TABLE "emplacamentos_mobile_veiculos" (
  "id" TEXT NOT NULL,
  "emplacamento_mobile_id" TEXT NOT NULL,
  "placa" TEXT NOT NULL,
  "marca" "MarcaEmplacamentoMobile" NOT NULL,
  "categoria" "CategoriaEmplacamentoMobile" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "emplacamentos_mobile_veiculos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "emplacamentos_mobile_veiculos_emplacamento_mobile_id_placa_key" ON "emplacamentos_mobile_veiculos"("emplacamento_mobile_id", "placa");
CREATE INDEX "emplacamentos_mobile_veiculos_emplacamento_mobile_id_idx" ON "emplacamentos_mobile_veiculos"("emplacamento_mobile_id");

ALTER TABLE "emplacamentos_mobile_veiculos"
  ADD CONSTRAINT "emplacamentos_mobile_veiculos_emplacamento_mobile_id_fkey"
  FOREIGN KEY ("emplacamento_mobile_id") REFERENCES "emplacamentos_mobile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
