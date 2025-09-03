-- CreateTable
CREATE TABLE `Competitor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `SportId` INTEGER NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `logo` VARCHAR(128) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `deletedAt` DATETIME(0) NULL,

    UNIQUE INDEX `Competitor_SportId_name_uindex`(`SportId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditPurchase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `UserId` INTEGER NOT NULL,
    `oldSystemUserId` VARCHAR(64) NULL,
    `PackageId` INTEGER NOT NULL,
    `callbackKey` VARCHAR(256) NOT NULL,
    `priceInCents` INTEGER NULL,
    `credits` INTEGER NOT NULL,
    `ExternalPaymentProcessor` VARCHAR(64) NULL,
    `ExternalChargeId` VARCHAR(64) NULL,
    `startedAt` DATETIME(0) NOT NULL,
    `appliedAt` DATETIME(0) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MailQueue` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `mailStatus` INTEGER NOT NULL,
    `from` VARCHAR(255) NOT NULL,
    `to` VARCHAR(255) NOT NULL,
    `cc` VARCHAR(255) NULL,
    `bcc` VARCHAR(255) NULL,
    `subject` VARCHAR(255) NOT NULL,
    `template` MEDIUMTEXT NOT NULL,
    `templateVars` MEDIUMTEXT NOT NULL,
    `attachmentPath` VARCHAR(255) NULL,
    `attachmentFilename` VARCHAR(255) NULL,
    `attachmentMediaType` VARCHAR(255) NULL,
    `errorMessage` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NULL,
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Package` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(32) NOT NULL,
    `description` VARCHAR(512) NOT NULL,
    `credits` INTEGER NOT NULL,
    `priceInCents` INTEGER NOT NULL,
    `ExternalPlanId` VARCHAR(32) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pick` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `SportId` INTEGER NOT NULL,
    `AwayCompetitorId` INTEGER NOT NULL,
    `HomeCompetitorId` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `title` VARCHAR(128) NOT NULL,
    `slug` VARCHAR(128) NULL,
    `matchTime` DATETIME(0) NOT NULL,
    `analysis` VARCHAR(4096) NOT NULL,
    `summary` VARCHAR(256) NOT NULL,
    `isFeatured` TINYINT NOT NULL DEFAULT 0,
    `cntUnlocked` INTEGER NOT NULL DEFAULT 0,
    `ExternalDataObj` VARCHAR(4096) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PickNews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `PickId` INTEGER NOT NULL,
    `news` VARCHAR(4096) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shortTitle` VARCHAR(6) NOT NULL,
    `title` VARCHAR(32) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `deletedAt` DATETIME(0) NULL,

    UNIQUE INDEX `Sport_shortTitle_uindex`(`shortTitle`),
    UNIQUE INDEX `Sport_title_uindex`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UnlockedPick` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `UserId` INTEGER NOT NULL,
    `oldSystemUserId` VARCHAR(64) NULL,
    `PickId` INTEGER NOT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(128) NOT NULL,
    `name` VARCHAR(128) NULL,
    `credits` INTEGER NOT NULL DEFAULT 0,
    `cognitoUserId` VARCHAR(64) NULL,
    `oldSystemUserId` VARCHAR(64) NULL,
    `roles` VARCHAR(64) NULL,
    `myReferralCode` VARCHAR(16) NULL,
    `otherReferralCode` VARCHAR(16) NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `deletedAt` DATETIME(0) NULL,
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `users_email_uindex`(`email`),
    UNIQUE INDEX `User_cognitoUserId_uindex`(`cognitoUserId`),
    UNIQUE INDEX `User_oldSystemUserId_uindex`(`oldSystemUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRole` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(16) NOT NULL,

    UNIQUE INDEX `UserRole_role_uindex`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `old_db_picks` (
    `AwayTeamId` INTEGER NULL,
    `HomeTeamId` INTEGER NULL,
    `SportId` INTEGER NULL,
    `Slug` VARCHAR(128) NULL,
    `PickResultText` VARCHAR(16) NULL,
    `PickResult` INTEGER NULL DEFAULT 0
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

