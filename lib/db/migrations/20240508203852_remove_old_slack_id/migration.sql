/*
  Warnings:

  - You are about to drop the column `slack_user_id` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "slack_user_id";
