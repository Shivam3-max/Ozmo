-- AlterTable
ALTER TABLE `ProgressReport` ADD COLUMN `createdById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Document` ADD COLUMN `mimeType` VARCHAR(191) NULL,
    ADD COLUMN `sha256` VARCHAR(64) NULL,
    ADD COLUMN `sizeBytes` INTEGER NULL,
    ADD COLUMN `uploadedById` VARCHAR(191) NULL,
    ADD COLUMN `visibleToClient` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `DocumentFile` (
    `documentId` VARCHAR(191) NOT NULL,
    `keyVersion` INTEGER NOT NULL DEFAULT 1,
    `iv` BINARY(12) NOT NULL,
    `authTag` BINARY(16) NOT NULL,
    `ciphertext` LONGBLOB NOT NULL,

    PRIMARY KEY (`documentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `clinicId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(191) NOT NULL DEFAULT 'EMAIL',
    `recipient` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `status` ENUM('QUEUED', 'SENT', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'QUEUED',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `lastError` TEXT NULL,
    `relatedType` VARCHAR(191) NULL,
    `relatedId` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sentAt` DATETIME(3) NULL,

    INDEX `Notification_clinicId_status_createdAt_idx`(`clinicId`, `status`, `createdAt`),
    INDEX `Notification_relatedType_relatedId_idx`(`relatedType`, `relatedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DocumentFile` ADD CONSTRAINT `DocumentFile_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `Clinic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

