/*
  Warnings:

  - You are about to alter the column `legalCompliance` on the `contractanalysis` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- AlterTable
ALTER TABLE `contractanalysis` MODIFY `legalCompliance` DOUBLE NULL;
