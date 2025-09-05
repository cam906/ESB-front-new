-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `UserId` INTEGER NOT NULL,
    `PackageId` INTEGER NOT NULL,
    `paypalOrderId` VARCHAR(64) NOT NULL,
    `amountInCents` INTEGER NOT NULL,
    `currency` VARCHAR(8) NOT NULL,
    `status` VARCHAR(16) NOT NULL,
    `rawResponse` MEDIUMTEXT NULL,
    `createdAt` DATETIME(0) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `deletedAt` DATETIME(0) NULL,

    UNIQUE INDEX `Order_paypalOrderId_uindex`(`paypalOrderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
