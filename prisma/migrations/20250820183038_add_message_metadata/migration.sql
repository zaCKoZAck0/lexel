-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';
