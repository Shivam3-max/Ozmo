-- AlterTable
ALTER TABLE `Clinic` MODIFY `address` TEXT NULL;

-- AlterTable
ALTER TABLE `Lead` ADD COLUMN `duplicateOfLeadId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `LeadActivity` MODIFY `note` TEXT NULL;

-- AlterTable
ALTER TABLE `ContactMessage` MODIFY `message` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `HealthProfile` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `Program` MODIFY `description` TEXT NULL,
    MODIFY `followUps` TEXT NULL;

-- AlterTable
ALTER TABLE `DietPlan` MODIFY `title` VARCHAR(255) NOT NULL,
    MODIFY `conditionsNote` TEXT NULL;

-- AlterTable
ALTER TABLE `PlanSlot` MODIFY `optionNote` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `PlanItem` MODIFY `text` TEXT NOT NULL,
    MODIFY `quantity` VARCHAR(255) NULL,
    MODIFY `prepNote` TEXT NULL;

-- AlterTable
ALTER TABLE `PlanTemplate` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `Appointment` MODIFY `reason` TEXT NULL,
    MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `ConsultationNote` MODIFY `subjective` TEXT NULL,
    MODIFY `observations` TEXT NULL,
    MODIFY `planOfAction` TEXT NULL;

-- AlterTable
ALTER TABLE `Measurement` MODIFY `note` TEXT NULL;

-- AlterTable
ALTER TABLE `FoodLog` MODIFY `customText` TEXT NULL;

-- AlterTable
ALTER TABLE `ProgressReport` MODIFY `observations` TEXT NULL,
    MODIFY `nextMonthFocus` TEXT NULL;

-- AlterTable
ALTER TABLE `Message` MODIFY `body` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Document` MODIFY `fileUrl` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `DataRequest` MODIFY `resolution` TEXT NULL;

-- CreateTable
CREATE TABLE `AuthThrottle` (
    `key` VARCHAR(191) NOT NULL,
    `failures` INTEGER NOT NULL DEFAULT 0,
    `lockedUntil` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Lead_clinicId_phone_idx` ON `Lead`(`clinicId`, `phone`);



-- Release booking slots held by appointments that are no longer scheduled, so
-- cancelled and no-show times can be booked again.
UPDATE `Appointment` SET `slotKey` = NULL WHERE `status` <> 'SCHEDULED';
