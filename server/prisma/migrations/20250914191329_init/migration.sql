-- AlterTable
ALTER TABLE "public"."documento" ADD COLUMN     "nombre_archivo_original" VARCHAR(200),
ADD COLUMN     "nombre_personalizado" VARCHAR(200),
ADD COLUMN     "ruta_storage" VARCHAR(500),
ADD COLUMN     "tamaño_bytes" INTEGER,
ADD COLUMN     "tipo_archivo" VARCHAR(50);
