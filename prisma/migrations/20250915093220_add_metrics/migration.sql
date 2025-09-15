-- CreateTable
CREATE TABLE `DailyMetric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metric` ENUM('WIN_RATE', 'AVG_ROI', 'WIN_STREAK', 'MEMBERS') NOT NULL,
    `date` DATE NOT NULL,
    `value` DECIMAL(10, 2) NULL,
    `textValue` VARCHAR(64) NULL,
    `meta` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DailyMetric_metric_date_uindex`(`metric`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
