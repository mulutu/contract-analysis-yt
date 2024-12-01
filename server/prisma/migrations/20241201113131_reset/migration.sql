/*
  Warnings:

  - You are about to alter the column `terminationConditions` on the `contractanalysis` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `contractanalysis` MODIFY `terminationConditions` JSON NULL;
