-- Allow services to be created before a vehicle has a plate.
ALTER TABLE "servicos" ADD COLUMN "chassi" TEXT;
ALTER TABLE "servicos" ALTER COLUMN "veiculo_id" DROP NOT NULL;
