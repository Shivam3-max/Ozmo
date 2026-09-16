-- AlterTable
ALTER TABLE `ContactMessage` ADD COLUMN `handledById` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Lead_clinicId_score_createdAt_idx` ON `Lead`(`clinicId`, `score`, `createdAt`);

-- CreateIndex
CREATE INDEX `ContactMessage_clinicId_handledAt_createdAt_idx` ON `ContactMessage`(`clinicId`, `handledAt`, `createdAt`);

-- CreateIndex
CREATE INDEX `Client_clinicId_joinedAt_idx` ON `Client`(`clinicId`, `joinedAt`);

-- CreateIndex
CREATE INDEX `Food_clinicId_category_name_idx` ON `Food`(`clinicId`, `category`, `name`);

-- CreateIndex
CREATE INDEX `AuditLog_clinicId_action_createdAt_idx` ON `AuditLog`(`clinicId`, `action`, `createdAt`);


-- Appointments booked while someone was still a lead stayed attached only to the
-- lead, so they never appeared in the client's file or portal after conversion.
UPDATE `Appointment` a
JOIN `Lead` l ON l.`id` = a.`leadId`
SET a.`clientId` = l.`convertedClientId`
WHERE a.`clientId` IS NULL AND l.`convertedClientId` IS NOT NULL;
