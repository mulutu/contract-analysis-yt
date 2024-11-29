-- DropForeignKey
ALTER TABLE `opportunity` DROP FOREIGN KEY `Opportunity_contractId_fkey`;

-- DropForeignKey
ALTER TABLE `risk` DROP FOREIGN KEY `Risk_contractId_fkey`;

-- AddForeignKey
ALTER TABLE `Risk` ADD CONSTRAINT `Risk_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `ContractAnalysis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Opportunity` ADD CONSTRAINT `Opportunity_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `ContractAnalysis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
