/*
  Warnings:

  - You are about to alter the column `legalCompliance` on the `contractanalysis` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `contractanalysis` MODIFY `legalCompliance` VARCHAR(191) NULL;
