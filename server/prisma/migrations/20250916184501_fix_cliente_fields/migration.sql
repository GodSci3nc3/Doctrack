/*
  Warnings:

  - You are about to drop the column `ciudad` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `direccion_actual` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `encargado` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `estado_civil` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_nacimiento` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `forma_contacto` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `migratorio_dependientes` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `migratorio_estatus_actual` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `migratorio_fecha_entrada_eeuu` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `migratorio_fecha_vencimiento_estadia` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `migratorio_numero_caso` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `migratorio_tipo_proceso` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `migratorio_ubicacion_actual` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `migratorio_via_entrada_eeuu` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `nivel_estudios` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `notas_cliente` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `numero_documento` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `ocupacion_actual` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `pais_nacimiento` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `pais_origen` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_documento` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_proceso` on the `pago` table. All the data in the column will be lost.
  - You are about to drop the column `zipcode` on the `pago` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."cliente" ADD COLUMN     "ciudad" VARCHAR(100),
ADD COLUMN     "direccion_actual" VARCHAR(255),
ADD COLUMN     "encargado" VARCHAR(100),
ADD COLUMN     "estado" VARCHAR(50),
ADD COLUMN     "estado_civil" VARCHAR(50),
ADD COLUMN     "fecha_nacimiento" TIMESTAMP(3),
ADD COLUMN     "forma_contacto" VARCHAR(50),
ADD COLUMN     "migratorio_dependientes" VARCHAR(255),
ADD COLUMN     "migratorio_estatus_actual" VARCHAR(50),
ADD COLUMN     "migratorio_fecha_entrada_eeuu" TIMESTAMP(3),
ADD COLUMN     "migratorio_fecha_vencimiento_estadia" TIMESTAMP(3),
ADD COLUMN     "migratorio_numero_caso" VARCHAR(50),
ADD COLUMN     "migratorio_tipo_proceso" VARCHAR(100),
ADD COLUMN     "migratorio_ubicacion_actual" VARCHAR(100),
ADD COLUMN     "migratorio_via_entrada_eeuu" VARCHAR(50),
ADD COLUMN     "nivel_estudios" VARCHAR(100),
ADD COLUMN     "notas_cliente" VARCHAR(1000),
ADD COLUMN     "numero_documento" VARCHAR(50),
ADD COLUMN     "ocupacion_actual" VARCHAR(100),
ADD COLUMN     "pais_nacimiento" VARCHAR(100),
ADD COLUMN     "pais_origen" VARCHAR(100),
ADD COLUMN     "tipo_documento" VARCHAR(50),
ADD COLUMN     "tipo_proceso" VARCHAR(100),
ADD COLUMN     "zipcode" VARCHAR(20);

-- AlterTable
ALTER TABLE "public"."pago" DROP COLUMN "ciudad",
DROP COLUMN "direccion_actual",
DROP COLUMN "encargado",
DROP COLUMN "estado",
DROP COLUMN "estado_civil",
DROP COLUMN "fecha_nacimiento",
DROP COLUMN "forma_contacto",
DROP COLUMN "migratorio_dependientes",
DROP COLUMN "migratorio_estatus_actual",
DROP COLUMN "migratorio_fecha_entrada_eeuu",
DROP COLUMN "migratorio_fecha_vencimiento_estadia",
DROP COLUMN "migratorio_numero_caso",
DROP COLUMN "migratorio_tipo_proceso",
DROP COLUMN "migratorio_ubicacion_actual",
DROP COLUMN "migratorio_via_entrada_eeuu",
DROP COLUMN "nivel_estudios",
DROP COLUMN "notas_cliente",
DROP COLUMN "numero_documento",
DROP COLUMN "ocupacion_actual",
DROP COLUMN "pais_nacimiento",
DROP COLUMN "pais_origen",
DROP COLUMN "tipo_documento",
DROP COLUMN "tipo_proceso",
DROP COLUMN "zipcode";
