CREATE TYPE "TipoVeiculoMontagem" AS ENUM ('NOVO', 'USADO');

ALTER TABLE "processos_montagem"
  ADD COLUMN "tipo_veiculo" "TipoVeiculoMontagem" NOT NULL DEFAULT 'USADO';
