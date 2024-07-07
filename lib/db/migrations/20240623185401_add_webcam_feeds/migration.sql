/*
  Warnings:

  - A unique constraint covering the columns `[user_id,provider]` on the table `identities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "webcam_feeds" (
    "webcam_id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "hls_url" TEXT NOT NULL,

    CONSTRAINT "webcam_feeds_pkey" PRIMARY KEY ("webcam_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webcam_feeds_identifier_key" ON "webcam_feeds"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "identities_user_id_provider_key" ON "identities"("user_id", "provider");
