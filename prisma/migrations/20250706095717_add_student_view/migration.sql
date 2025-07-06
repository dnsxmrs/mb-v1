-- CreateTable
CREATE TABLE "StudentStoryView" (
    "id" SERIAL NOT NULL,
    "codeId" INTEGER NOT NULL,
    "storyId" INTEGER NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "section" VARCHAR(100) NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentStoryView_pkey" PRIMARY KEY ("id")
);
