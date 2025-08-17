/*
  Warnings:

  - You are about to drop the column `key` on the `ApiKeys` table. All the data in the column will be lost.
  - Added the required column `encrypted` to the `ApiKeys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iv` to the `ApiKeys` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."ApiKeys_userId_key_key";

-- AlterTable
ALTER TABLE "public"."ApiKeys" DROP COLUMN "key",
ADD COLUMN     "encrypted" TEXT NOT NULL,
ADD COLUMN     "iv" TEXT NOT NULL;
