/*
  Warnings:

  - You are about to drop the column `user_id` on the `categories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `categories` DROP FOREIGN KEY `Categories_user_id_fkey`;

-- DropIndex
DROP INDEX `Categories_user_id_fkey` ON `categories`;

-- AlterTable
ALTER TABLE `categories` DROP COLUMN `user_id`;
