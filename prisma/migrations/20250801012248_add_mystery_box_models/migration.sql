-- CreateTable
CREATE TABLE "MysteryBox" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MysteryBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MysteryBoxItem" (
    "id" SERIAL NOT NULL,
    "mysteryBoxId" INTEGER NOT NULL,
    "word" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "imageUrl" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MysteryBoxItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBoxItem_mysteryBoxId_word_key" ON "MysteryBoxItem"("mysteryBoxId", "word");

-- AddForeignKey
ALTER TABLE "MysteryBoxItem" ADD CONSTRAINT "MysteryBoxItem_mysteryBoxId_fkey" FOREIGN KEY ("mysteryBoxId") REFERENCES "MysteryBox"("id") ON DELETE CASCADE ON UPDATE CASCADE;
