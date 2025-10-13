/*
  Warnings:

  - You are about to drop the column `google_id` on the `usuariointerno` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `usuariointerno` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."usuariointerno" DROP COLUMN "google_id",
DROP COLUMN "profile_picture";
