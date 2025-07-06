-- AddForeignKey
ALTER TABLE "StudentStoryView" ADD CONSTRAINT "StudentStoryView_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "Code"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentStoryView" ADD CONSTRAINT "StudentStoryView_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
