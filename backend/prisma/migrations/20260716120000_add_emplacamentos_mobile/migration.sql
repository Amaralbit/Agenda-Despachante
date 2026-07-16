CREATE TABLE "emplacamentos_mobile" (
  "id" TEXT NOT NULL,
  "conta_id" TEXT NOT NULL,
  "data" DATE NOT NULL,
  "peugeot_passeio" INTEGER NOT NULL DEFAULT 0,
  "peugeot_utilitario" INTEGER NOT NULL DEFAULT 0,
  "citroen_passeio" INTEGER NOT NULL DEFAULT 0,
  "citroen_utilitario" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "emplacamentos_mobile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "emplacamentos_mobile_conta_id_data_key" ON "emplacamentos_mobile"("conta_id", "data");
CREATE INDEX "emplacamentos_mobile_conta_id_idx" ON "emplacamentos_mobile"("conta_id");

ALTER TABLE "emplacamentos_mobile"
  ADD CONSTRAINT "emplacamentos_mobile_conta_id_fkey"
  FOREIGN KEY ("conta_id") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
