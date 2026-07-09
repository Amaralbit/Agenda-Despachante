-- Store who requested the PA2 process assembly.
ALTER TABLE "processos_montagem" ADD COLUMN "solicitante_pa2" TEXT NOT NULL DEFAULT '';
