-- Drop foreign key constraints
ALTER TABLE `opportunity` DROP FOREIGN KEY `Opportunity_contractId_fkey`;
ALTER TABLE `risk` DROP FOREIGN KEY `Risk_contractId_fkey`;

-- Drop unique indexes
DROP INDEX `Opportunity_contractId_key` ON `opportunity`;
DROP INDEX `Risk_contractId_key` ON `risk`;

-- Re-add foreign key constraints without unique indexes
ALTER TABLE `opportunity`
ADD CONSTRAINT `Opportunity_contractId_fkey`
FOREIGN KEY (`contractId`) REFERENCES `ContractAnalysis`(`id`) ON DELETE CASCADE;

ALTER TABLE `risk`
ADD CONSTRAINT `Risk_contractId_fkey`
FOREIGN KEY (`contractId`) REFERENCES `ContractAnalysis`(`id`) ON DELETE CASCADE;
