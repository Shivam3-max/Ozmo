-- CreateTable
CREATE TABLE `Clinic` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `legalName` VARCHAR(191) NULL,
    `gstin` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Kolkata',
    `settings` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `clinicId` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'DIETITIAN', 'ASSISTANT', 'FRONT_DESK', 'CLIENT') NOT NULL DEFAULT 'CLIENT',
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sessionVersion` INTEGER NOT NULL DEFAULT 0,
    `lastLoginAt` DATETIME(3) NULL,
    `inviteToken` VARCHAR(191) NULL,
    `inviteExpiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    UNIQUE INDEX `User_inviteToken_key`(`inviteToken`),
    INDEX `User_clinicId_role_idx`(`clinicId`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead` (
    `id` VARCHAR(191) NOT NULL,
    `clinicId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `source` ENUM('ASSESSMENT', 'CONTACT_FORM', 'BOOKING', 'INSTAGRAM', 'GOOGLE_ADS', 'WHATSAPP', 'REFERRAL', 'WALK_IN', 'PHONE', 'OTHER') NOT NULL DEFAULT 'ASSESSMENT',
    `stage` ENUM('NEW', 'CONTACTED', 'CONSULTATION_BOOKED', 'CONSULTED', 'CONVERTED', 'LOST') NOT NULL DEFAULT 'NEW',
    `score` INTEGER NOT NULL DEFAULT 0,
    `goal` VARCHAR(191) NULL,
    `conditions` JSON NULL,
    `readiness` INTEGER NOT NULL DEFAULT 0,
    `requiresMedicalCaution` BOOLEAN NOT NULL DEFAULT false,
    `lostReason` VARCHAR(191) NULL,
    `assignedToId` VARCHAR(191) NULL,
    `nextActionAt` DATETIME(3) NULL,
    `convertedClientId` VARCHAR(191) NULL,
    `consentService` BOOLEAN NOT NULL DEFAULT true,
    `consentMarketing` BOOLEAN NOT NULL DEFAULT false,
    `consentAt` DATETIME(3) NULL,
    `policyVersion` VARCHAR(191) NOT NULL DEFAULT '2026-08-28',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Lead_clinicId_stage_idx`(`clinicId`, `stage`),
    INDEX `Lead_clinicId_createdAt_idx`(`clinicId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeadActivity` (
    `id` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `staffId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LeadActivity_leadId_createdAt_idx`(`leadId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assessment` (
    `id` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NULL,
    `clientId` VARCHAR(191) NULL,
    `token` VARCHAR(191) NOT NULL,
    `responses` JSON NOT NULL,
    `schemaVersion` INTEGER NOT NULL DEFAULT 1,
    `age` INTEGER NULL,
    `gender` VARCHAR(191) NULL,
    `heightCm` DOUBLE NULL,
    `weightKg` DOUBLE NULL,
    `bmi` DOUBLE NULL,
    `goal` VARCHAR(191) NULL,
    `activityLevel` VARCHAR(191) NULL,
    `conditions` JSON NULL,
    `foodPreference` VARCHAR(191) NULL,
    `readiness` INTEGER NOT NULL DEFAULT 0,
    `snapshotCards` JSON NULL,
    `snapshotFocus` JSON NULL,
    `recommendedProgram` VARCHAR(191) NULL,
    `requiresMedicalCaution` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Assessment_leadId_key`(`leadId`),
    UNIQUE INDEX `Assessment_clientId_key`(`clientId`),
    UNIQUE INDEX `Assessment_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` VARCHAR(191) NOT NULL,
    `clinicId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `topic` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `handledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactMessage_clinicId_createdAt_idx`(`clinicId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` VARCHAR(191) NOT NULL,
    `clinicId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `clientCode` VARCHAR(191) NOT NULL,
    `dob` DATETIME(3) NULL,
    `gender` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `occupation` VARCHAR(191) NULL,
    `emergencyContact` VARCHAR(191) NULL,
    `heightCm` DOUBLE NULL,
    `startWeightKg` DOUBLE NULL,
    `targetWeightKg` DOUBLE NULL,
    `targetDate` DATETIME(3) NULL,
    `foodPreference` VARCHAR(191) NULL,
    `allergies` JSON NULL,
    `dislikes` JSON NULL,
    `cooksAtHome` VARCHAR(191) NULL,
    `eatsOutFrequency` VARCHAR(191) NULL,
    `mealTimes` JSON NULL,
    `primaryDietitianId` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'AT_RISK', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Client_userId_key`(`userId`),
    UNIQUE INDEX `Client_clientCode_key`(`clientCode`),
    INDEX `Client_clinicId_status_idx`(`clinicId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HealthProfile` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `conditions` JSON NULL,
    `medications` JSON NULL,
    `supplements` JSON NULL,
    `familyHistory` JSON NULL,
    `symptoms` JSON NULL,
    `intake` JSON NULL,
    `notes` VARCHAR(191) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HealthProfile_clientId_version_idx`(`clientId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Program` (
    `id` VARCHAR(191) NOT NULL,
    `clinicId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `durations` JSON NULL,
    `pricing` JSON NULL,
    `inclusions` JSON NULL,
    `followUps` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Program_clinicId_slug_key`(`clinicId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enrollment` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `programId` VARCHAR(191) NOT NULL,
    `durationMonths` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `pricePaid` DECIMAL(65, 30) NULL,
    `followUpsIncluded` INTEGER NOT NULL DEFAULT 0,
    `followUpsUsed` INTEGER NOT NULL DEFAULT 0,
    `reportsIncluded` INTEGER NOT NULL DEFAULT 0,
    `reportsDelivered` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Enrollment_clientId_status_idx`(`clientId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DietPlan` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `enrollmentId` VARCHAR(191) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('DRAFT', 'ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `title` VARCHAR(191) NOT NULL,
    `dayMode` ENUM('SINGLE', 'WEEK', 'SEQUENCE') NOT NULL DEFAULT 'SINGLE',
    `dayCount` INTEGER NOT NULL DEFAULT 1,
    `startDate` DATETIME(3) NULL,
    `dietPreference` VARCHAR(191) NULL,
    `conditionsNote` VARCHAR(191) NULL,
    `showTargets` BOOLEAN NOT NULL DEFAULT false,
    `targetCalories` INTEGER NULL,
    `targetProtein` INTEGER NULL,
    `targetCarbs` INTEGER NULL,
    `targetFat` INTEGER NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `publishedAt` DATETIME(3) NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DietPlan_clientId_status_idx`(`clientId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanDay` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `index` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PlanDay_planId_index_key`(`planId`, `index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanSlot` (
    `id` VARCHAR(191) NOT NULL,
    `planDayId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `timeHint` VARCHAR(191) NULL,
    `condition` VARCHAR(191) NULL,
    `optionNote` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `PlanSlot_planDayId_order_idx`(`planDayId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanItem` (
    `id` VARCHAR(191) NOT NULL,
    `planSlotId` VARCHAR(191) NOT NULL,
    `type` ENUM('FOOD', 'SUPPLEMENT', 'EXERCISE', 'BREATHWORK', 'LIFESTYLE', 'HYDRATION', 'PREP', 'NOTE') NOT NULL DEFAULT 'FOOD',
    `text` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NULL,
    `prepNote` VARCHAR(191) NULL,
    `optionGroup` INTEGER NULL,
    `foodId` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `PlanItem_planSlotId_order_idx`(`planSlotId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanSection` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `kind` ENUM('GUIDELINES', 'NOTES') NOT NULL,
    `title` VARCHAR(191) NULL,
    `items` JSON NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `PlanSection_planId_order_idx`(`planId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `clinicId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `dietPreference` VARCHAR(191) NULL,
    `conditions` JSON NULL,
    `structure` JSON NULL,
    `timesUsed` INTEGER NOT NULL DEFAULT 0,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PlanTemplate_clinicId_idx`(`clinicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Food` (
    `id` VARCHAR(191) NOT NULL,
    `clinicId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `alternateNames` JSON NULL,
    `category` VARCHAR(191) NOT NULL,
    `servingUnit` VARCHAR(191) NOT NULL DEFAULT 'katori',
    `servingGrams` DOUBLE NOT NULL DEFAULT 100,
    `calories` DOUBLE NOT NULL DEFAULT 0,
    `protein` DOUBLE NOT NULL DEFAULT 0,
    `carbs` DOUBLE NOT NULL DEFAULT 0,
    `fat` DOUBLE NOT NULL DEFAULT 0,
    `fibre` DOUBLE NOT NULL DEFAULT 0,
    `glycemicTag` VARCHAR(191) NULL,
    `conditionTags` JSON NULL,
    `isVeg` BOOLEAN NOT NULL DEFAULT true,
    `isVegan` BOOLEAN NOT NULL DEFAULT false,
    `isJain` BOOLEAN NOT NULL DEFAULT false,
    `allergens` JSON NULL,
    `defaultType` ENUM('FOOD', 'SUPPLEMENT', 'EXERCISE', 'BREATHWORK', 'LIFESTYLE', 'HYDRATION', 'PREP', 'NOTE') NOT NULL DEFAULT 'FOOD',
    `isPrep` BOOLEAN NOT NULL DEFAULT false,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Food_category_idx`(`category`),
    INDEX `Food_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `leadId` VARCHAR(191) NULL,
    `dietitianId` VARCHAR(191) NULL,
    `type` ENUM('INITIAL', 'FOLLOW_UP') NOT NULL DEFAULT 'INITIAL',
    `mode` ENUM('IN_CLINIC', 'VIDEO') NOT NULL DEFAULT 'IN_CLINIC',
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    `scheduledAt` DATETIME(3) NOT NULL,
    `durationMin` INTEGER NOT NULL DEFAULT 60,
    `meetingUrl` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `slotKey` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Appointment_slotKey_key`(`slotKey`),
    INDEX `Appointment_scheduledAt_idx`(`scheduledAt`),
    INDEX `Appointment_status_scheduledAt_idx`(`status`, `scheduledAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConsultationNote` (
    `id` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NOT NULL,
    `subjective` VARCHAR(191) NULL,
    `observations` VARCHAR(191) NULL,
    `planOfAction` VARCHAR(191) NULL,
    `nextReviewAt` DATETIME(3) NULL,
    `sharedWithClient` BOOLEAN NOT NULL DEFAULT false,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ConsultationNote_appointmentId_key`(`appointmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Measurement` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `weightKg` DOUBLE NULL,
    `waistCm` DOUBLE NULL,
    `hipCm` DOUBLE NULL,
    `chestCm` DOUBLE NULL,
    `armCm` DOUBLE NULL,
    `bodyFatPct` DOUBLE NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Measurement_clientId_date_idx`(`clientId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FoodLog` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `slotLabel` VARCHAR(191) NOT NULL,
    `source` ENUM('FROM_PLAN', 'SWAPPED', 'OFF_PLAN') NOT NULL DEFAULT 'FROM_PLAN',
    `customText` VARCHAR(191) NULL,
    `quantity` DOUBLE NULL,
    `unit` VARCHAR(191) NULL,
    `loggedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FoodLog_clientId_date_slotLabel_key`(`clientId`, `date`, `slotLabel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WaterLog` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `glasses` INTEGER NOT NULL DEFAULT 0,
    `targetGlasses` INTEGER NOT NULL DEFAULT 8,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WaterLog_clientId_date_key`(`clientId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Badge` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `badgeType` VARCHAR(191) NOT NULL,
    `earnedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Badge_clientId_badgeType_key`(`clientId`, `badgeType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgressReport` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `data` JSON NULL,
    `observations` VARCHAR(191) NULL,
    `nextMonthFocus` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'APPROVED', 'SENT') NOT NULL DEFAULT 'DRAFT',
    `approvedById` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProgressReport_clientId_periodEnd_idx`(`clientId`, `periodEnd`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MessageThread` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `lastMessageAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `staffUnread` INTEGER NOT NULL DEFAULT 0,
    `clientUnread` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `MessageThread_clientId_key`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `threadId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Message_threadId_createdAt_idx`(`threadId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `type` ENUM('DIET_PLAN', 'PROGRESS_REPORT', 'CONSULT_NOTE', 'LAB_REPORT', 'INVOICE', 'OTHER') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Document_clientId_type_idx`(`clientId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DataRequest` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `type` ENUM('DELETE', 'CORRECT') NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'COMPLETED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolvedAt` DATETIME(3) NULL,
    `resolution` VARCHAR(191) NULL,

    INDEX `DataRequest_status_requestedAt_idx`(`status`, `requestedAt`),
    INDEX `DataRequest_clientId_requestedAt_idx`(`clientId`, `requestedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `clinicId` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `changes` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `AuditLog_clinicId_createdAt_idx`(`clinicId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `Clinic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `Clinic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeadActivity` ADD CONSTRAINT `LeadActivity_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeadActivity` ADD CONSTRAINT `LeadActivity_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactMessage` ADD CONSTRAINT `ContactMessage_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `Clinic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `Clinic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_primaryDietitianId_fkey` FOREIGN KEY (`primaryDietitianId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HealthProfile` ADD CONSTRAINT `HealthProfile_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Program` ADD CONSTRAINT `Program_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `Clinic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `Program`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DietPlan` ADD CONSTRAINT `DietPlan_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DietPlan` ADD CONSTRAINT `DietPlan_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `Enrollment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DietPlan` ADD CONSTRAINT `DietPlan_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanDay` ADD CONSTRAINT `PlanDay_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `DietPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanSlot` ADD CONSTRAINT `PlanSlot_planDayId_fkey` FOREIGN KEY (`planDayId`) REFERENCES `PlanDay`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanItem` ADD CONSTRAINT `PlanItem_planSlotId_fkey` FOREIGN KEY (`planSlotId`) REFERENCES `PlanSlot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanItem` ADD CONSTRAINT `PlanItem_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanSection` ADD CONSTRAINT `PlanSection_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `DietPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanTemplate` ADD CONSTRAINT `PlanTemplate_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `Clinic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanTemplate` ADD CONSTRAINT `PlanTemplate_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Food` ADD CONSTRAINT `Food_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `Clinic`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_dietitianId_fkey` FOREIGN KEY (`dietitianId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConsultationNote` ADD CONSTRAINT `ConsultationNote_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConsultationNote` ADD CONSTRAINT `ConsultationNote_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Measurement` ADD CONSTRAINT `Measurement_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FoodLog` ADD CONSTRAINT `FoodLog_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WaterLog` ADD CONSTRAINT `WaterLog_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgressReport` ADD CONSTRAINT `ProgressReport_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageThread` ADD CONSTRAINT `MessageThread_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_threadId_fkey` FOREIGN KEY (`threadId`) REFERENCES `MessageThread`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DataRequest` ADD CONSTRAINT `DataRequest_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `Clinic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
