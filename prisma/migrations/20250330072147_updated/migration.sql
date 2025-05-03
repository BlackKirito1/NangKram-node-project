/*
  Warnings:

  - You are about to drop the column `content_id` on the `image` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `image` DROP FOREIGN KEY `Image_content_id_fkey`;

-- DropIndex
DROP INDEX `Image_content_id_fkey` ON `image`;

-- AlterTable
ALTER TABLE `image` DROP COLUMN `content_id`;
