/*
  Warnings:

  - You are about to drop the column `createdAt` on the `StudentSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `StudentSubmission` table. All the data in the column will be lost.
  - You are about to alter the column `score` on the `StudentSubmission` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "StudentSubmission" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "score" SET DATA TYPE INTEGER;
