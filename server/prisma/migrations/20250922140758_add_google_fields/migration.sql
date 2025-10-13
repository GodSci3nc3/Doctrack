/*
  Warnings:

  - You are about to drop the `google_drive_token` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."usuariointerno" ADD COLUMN     "google_id" VARCHAR(50),
ADD COLUMN     "profile_picture" VARCHAR(255);

-- DropTable
DROP TABLE "public"."google_drive_token";
