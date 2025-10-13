/*
  Warnings:

  - Added the required column `created_by` to the `cliente` table without a default value. This is not possible if the table is not empty.

*/

-- First, add the column as nullable
ALTER TABLE "public"."cliente" ADD COLUMN "created_by" INTEGER;

-- Get or create a default user and update existing records
DO $$
DECLARE
    default_user_id INTEGER;
BEGIN
    -- Get the first user or create a default one if none exists
    SELECT usuario_id INTO default_user_id 
    FROM "public"."usuariointerno" 
    LIMIT 1;
    
    -- If no user exists, create a default admin user
    IF default_user_id IS NULL THEN
        INSERT INTO "public"."usuariointerno" (nombre, apellido, email, rol, "contraseña", created_at, updated_at)
        VALUES ('Admin', 'Sistema', 'admin@doctrack.com', 'preparador', '$2b$12$LQv3c1yqBFVFaxkDoFWjAOaaEXy3F3CZm9EJBhEdkmGtYj3oZzGqC', NOW(), NOW())
        RETURNING usuario_id INTO default_user_id;
    END IF;
    
    -- Update all existing cliente records to have the default user
    UPDATE "public"."cliente" 
    SET "created_by" = default_user_id 
    WHERE "created_by" IS NULL;
END $$;

-- Now make the column NOT NULL
ALTER TABLE "public"."cliente" ALTER COLUMN "created_by" SET NOT NULL;

-- CreateIndex
CREATE INDEX "idx_cliente_created_by" ON "public"."cliente"("created_by");

-- AddForeignKey
ALTER TABLE "public"."cliente" ADD CONSTRAINT "cliente_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."usuariointerno"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
