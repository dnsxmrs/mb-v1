/*
  Warnings:

  - A unique constraint covering the columns `[codeId,storyId,fullName,section]` on the table `StudentStoryView` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StudentStoryView_codeId_storyId_fullName_section_key" ON "StudentStoryView"("codeId", "storyId", "fullName", "section");
