/*
  Warnings:

  - You are about to drop the column `choices` on the `QuizItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuizItem" DROP COLUMN "choices";

-- CreateTable
CREATE TABLE "Choice" (
    "id" SERIAL NOT NULL,
    "text" VARCHAR(255) NOT NULL,
    "quizItemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Choice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" SERIAL NOT NULL,
    "defaultChoicesCount" INTEGER NOT NULL DEFAULT 2,
    "maxChoicesCount" INTEGER NOT NULL DEFAULT 10,
    "minChoicesCount" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_quizItemId_fkey" FOREIGN KEY ("quizItemId") REFERENCES "QuizItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
