/*
  Warnings:

  - You are about to drop the `image` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `image` DROP FOREIGN KEY `Image_product_id_fkey`;

-- AlterTable
ALTER TABLE `content` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- DropTable
DROP TABLE `image`;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asset_id` VARCHAR(191) NOT NULL,
    `public_id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `secure_url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `product_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContentImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asset_id` VARCHAR(191) NOT NULL,
    `public_id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `secure_url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `content_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContentImage` ADD CONSTRAINT `ContentImage_content_id_fkey` FOREIGN KEY (`content_id`) REFERENCES `Content`(`content_id`) ON DELETE CASCADE ON UPDATE CASCADE;
