/*
  Warnings:

  - A unique constraint covering the columns `[user_id,provider]` on the table `identities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "identities_user_id_provider_key" ON "identities"("user_id", "provider");
