-- CreateTable
CREATE TABLE "WordSearch" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WordSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordSearchItem" (
    "id" SERIAL NOT NULL,
    "wordSearchId" INTEGER NOT NULL,
    "word" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WordSearchItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordSearchItem_wordSearchId_word_key" ON "WordSearchItem"("wordSearchId", "word");

-- AddForeignKey
ALTER TABLE "WordSearchItem" ADD CONSTRAINT "WordSearchItem_wordSearchId_fkey" FOREIGN KEY ("wordSearchId") REFERENCES "WordSearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
