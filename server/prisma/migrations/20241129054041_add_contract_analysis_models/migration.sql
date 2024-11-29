-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `google_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `profile_picture` VARCHAR(191) NULL,
    `is_premium` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `users_google_id_key`(`google_id`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContractAnalysis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `contractText` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(191) NOT NULL,
    `recommendations` JSON NOT NULL,
    `keyClauses` JSON NOT NULL,
    `legalCompliance` VARCHAR(191) NULL,
    `negotiationPoints` JSON NOT NULL,
    `contractDuration` VARCHAR(191) NULL,
    `terminationConditions` VARCHAR(191) NULL,
    `overallScore` DOUBLE NULL DEFAULT 0,
    `performanceMetrics` JSON NOT NULL,
    `intellectualPropertyClauses` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `version` INTEGER NOT NULL DEFAULT 1,
    `customFields` JSON NOT NULL,
    `expirationDate` DATETIME(3) NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'en',
    `aiModel` VARCHAR(191) NOT NULL DEFAULT 'gemini-pro',
    `contractType` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Risk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `risk` VARCHAR(191) NOT NULL,
    `explanation` VARCHAR(191) NOT NULL,
    `severity` ENUM('low', 'medium', 'high') NOT NULL,
    `contractId` INTEGER NOT NULL,

    UNIQUE INDEX `Risk_contractId_key`(`contractId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Opportunity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opportunity` VARCHAR(191) NOT NULL,
    `explanation` VARCHAR(191) NOT NULL,
    `impact` ENUM('low', 'medium', 'high') NOT NULL,
    `contractId` INTEGER NOT NULL,

    UNIQUE INDEX `Opportunity_contractId_key`(`contractId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompensationStructure` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `baseSalary` VARCHAR(191) NOT NULL,
    `bonuses` VARCHAR(191) NOT NULL,
    `equity` VARCHAR(191) NOT NULL,
    `otherBenefits` VARCHAR(191) NOT NULL,
    `contractId` INTEGER NOT NULL,

    UNIQUE INDEX `CompensationStructure_contractId_key`(`contractId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserFeedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rating` INTEGER NOT NULL,
    `comments` VARCHAR(191) NOT NULL,
    `contractId` INTEGER NOT NULL,

    UNIQUE INDEX `UserFeedback_contractId_key`(`contractId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinancialTerms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `details` JSON NOT NULL,
    `contractId` INTEGER NOT NULL,

    UNIQUE INDEX `FinancialTerms_contractId_key`(`contractId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ContractAnalysis` ADD CONSTRAINT `ContractAnalysis_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Risk` ADD CONSTRAINT `Risk_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `ContractAnalysis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opportunity` ADD CONSTRAINT `Opportunity_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `ContractAnalysis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompensationStructure` ADD CONSTRAINT `CompensationStructure_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `ContractAnalysis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserFeedback` ADD CONSTRAINT `UserFeedback_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `ContractAnalysis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialTerms` ADD CONSTRAINT `FinancialTerms_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `ContractAnalysis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
