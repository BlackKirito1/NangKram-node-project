/*
  Warnings:

  - You are about to drop the column `body` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `content` DROP COLUMN `body`,
    DROP COLUMN `title`;
