CREATE TABLE "marcas_emplacamento" (
  "id" TEXT NOT NULL,
  "conta_id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "nome_normalizado" TEXT NOT NULL,
  "ativa" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "marcas_emplacamento_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "marcas_emplacamento_conta_id_nome_normalizado_key"
  ON "marcas_emplacamento"("conta_id", "nome_normalizado");
CREATE INDEX "marcas_emplacamento_conta_id_idx"
  ON "marcas_emplacamento"("conta_id");

ALTER TABLE "marcas_emplacamento"
  ADD CONSTRAINT "marcas_emplacamento_conta_id_fkey"
  FOREIGN KEY ("conta_id") REFERENCES "contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "marcas_emplacamento" (
  "id", "conta_id", "nome", "nome_normalizado", "ativa", "created_at", "updated_at"
)
SELECT
  'legacy-peugeot-' || em."conta_id",
  em."conta_id",
  'Peugeot',
  'PEUGEOT',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "emplacamentos_mobile" em
WHERE em."peugeot_passeio" > 0
   OR em."peugeot_utilitario" > 0
   OR EXISTS (
     SELECT 1
     FROM "emplacamentos_mobile_veiculos" veiculo
     WHERE veiculo."emplacamento_mobile_id" = em."id"
       AND veiculo."marca" = 'PEUGEOT'
   )
GROUP BY em."conta_id"
ON CONFLICT ("conta_id", "nome_normalizado") DO NOTHING;

INSERT INTO "marcas_emplacamento" (
  "id", "conta_id", "nome", "nome_normalizado", "ativa", "created_at", "updated_at"
)
SELECT
  'legacy-citroen-' || em."conta_id",
  em."conta_id",
  'Citroën',
  'CITROEN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "emplacamentos_mobile" em
WHERE em."citroen_passeio" > 0
   OR em."citroen_utilitario" > 0
   OR EXISTS (
     SELECT 1
     FROM "emplacamentos_mobile_veiculos" veiculo
     WHERE veiculo."emplacamento_mobile_id" = em."id"
       AND veiculo."marca" = 'CITROEN'
   )
GROUP BY em."conta_id"
ON CONFLICT ("conta_id", "nome_normalizado") DO NOTHING;

ALTER TABLE "emplacamentos_mobile_veiculos" ADD COLUMN "marca_id" TEXT;

UPDATE "emplacamentos_mobile_veiculos" veiculo
SET "marca_id" = marca."id"
FROM "emplacamentos_mobile" emplacamento
JOIN "marcas_emplacamento" marca
  ON marca."conta_id" = emplacamento."conta_id"
WHERE veiculo."emplacamento_mobile_id" = emplacamento."id"
  AND marca."nome_normalizado" = veiculo."marca"::text;

CREATE FUNCTION "preencher_marca_id_emplacamento"()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."marca_id" IS NULL AND NEW."marca" IS NOT NULL THEN
    SELECT marca."id"
    INTO NEW."marca_id"
    FROM "emplacamentos_mobile" emplacamento
    JOIN "marcas_emplacamento" marca
      ON marca."conta_id" = emplacamento."conta_id"
    WHERE emplacamento."id" = NEW."emplacamento_mobile_id"
      AND marca."nome_normalizado" = NEW."marca"::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_preencher_marca_id_emplacamento"
  BEFORE INSERT OR UPDATE ON "emplacamentos_mobile_veiculos"
  FOR EACH ROW EXECUTE FUNCTION "preencher_marca_id_emplacamento"();

ALTER TABLE "emplacamentos_mobile_veiculos" ALTER COLUMN "marca" DROP NOT NULL;
ALTER TABLE "emplacamentos_mobile_veiculos" ALTER COLUMN "marca_id" SET NOT NULL;
CREATE INDEX "emplacamentos_mobile_veiculos_marca_id_idx"
  ON "emplacamentos_mobile_veiculos"("marca_id");

ALTER TABLE "emplacamentos_mobile_veiculos"
  ADD CONSTRAINT "emplacamentos_mobile_veiculos_marca_id_fkey"
  FOREIGN KEY ("marca_id") REFERENCES "marcas_emplacamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- A coluna antiga "marca" e seu enum permanecem temporariamente para que a
-- versao anterior da API continue compativel durante a troca do deployment.
