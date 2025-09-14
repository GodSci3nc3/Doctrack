/*
  Warnings:

  - You are about to drop the column `google_access_token` on the `usuariointerno` table. All the data in the column will be lost.
  - You are about to drop the column `google_refresh_token` on the `usuariointerno` table. All the data in the column will be lost.
  - You are about to drop the column `google_token_expiry` on the `usuariointerno` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."usuariointerno" DROP COLUMN "google_access_token",
DROP COLUMN "google_refresh_token",
DROP COLUMN "google_token_expiry";
