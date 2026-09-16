-- CreateTable
CREATE TABLE `RateLimitBucket` (
    `key` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL,
    `resetAt` DATETIME(3) NOT NULL,

    INDEX `RateLimitBucket_resetAt_idx`(`resetAt`),
    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RevokedSession` (
    `sid` VARCHAR(64) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RevokedSession_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`sid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

