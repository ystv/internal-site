/*
  Warnings:

  - You are about to drop the column `slack_user_id` on the `users` table. All the data in the column will be lost.

*/

INSERT INTO "identities" ("user_id", "provider", "provider_key")
SELECT "user_id", 'slack', "slack_user_id" FROM "users" WHERE "slack_user_id" IS NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "slack_user_id";