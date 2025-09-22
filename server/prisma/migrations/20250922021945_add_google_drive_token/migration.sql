-- CreateTable
CREATE TABLE "public"."google_drive_token" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "access_token" VARCHAR(2048),
    "refresh_token" VARCHAR(2048),
    "scope" VARCHAR(1024),
    "token_type" VARCHAR(50),
    "expiry_date" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_drive_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_drive_token_email_key" ON "public"."google_drive_token"("email");
