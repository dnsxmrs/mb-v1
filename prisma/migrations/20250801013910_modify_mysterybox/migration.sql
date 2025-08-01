/*
  Warnings:

  - You are about to drop the column `mysteryBoxId` on the `MysteryBoxItem` table. All the data in the column will be lost.
  - You are about to drop the `MysteryBox` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[word]` on the table `MysteryBoxItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MysteryBoxItem" DROP CONSTRAINT "MysteryBoxItem_mysteryBoxId_fkey";

-- DropIndex
DROP INDEX "MysteryBoxItem_mysteryBoxId_word_key";

-- AlterTable
ALTER TABLE "MysteryBoxItem" DROP COLUMN "mysteryBoxId";

-- DropTable
DROP TABLE "MysteryBox";

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBoxItem_word_key" ON "MysteryBoxItem"("word");
