/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `choices` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `choices` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `questions` table. All the data in the column will be lost.
  - Added the required column `question_id` to the `choices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "choices" DROP CONSTRAINT "choices_questionId_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_categoryId_fkey";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "choices" DROP COLUMN "isCorrect",
DROP COLUMN "questionId",
ADD COLUMN     "is_correct" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "question_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "categoryId",
ADD COLUMN     "category_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "choices" ADD CONSTRAINT "choices_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
