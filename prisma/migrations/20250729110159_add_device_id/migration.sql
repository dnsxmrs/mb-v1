/*
  Warnings:

  - A unique constraint covering the columns `[codeId,storyId,fullName,section,deviceId]` on the table `StudentStoryView` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "StudentStoryView_codeId_storyId_fullName_section_key";

-- AlterTable
ALTER TABLE "StudentStoryView" ADD COLUMN     "deviceId" VARCHAR(255) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "StudentSubmission" ADD COLUMN     "deviceId" VARCHAR(255) NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "StudentStoryView_codeId_storyId_fullName_section_deviceId_key" ON "StudentStoryView"("codeId", "storyId", "fullName", "section", "deviceId");
