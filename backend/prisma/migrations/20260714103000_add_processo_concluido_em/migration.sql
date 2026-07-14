ALTER TABLE "processos_montagem"
ADD COLUMN "concluido_em" TIMESTAMP(3);

UPDATE "processos_montagem"
SET "concluido_em" = "updated_at"
WHERE "status" = 'CONCLUIDO';
