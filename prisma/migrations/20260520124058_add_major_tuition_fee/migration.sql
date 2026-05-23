/*
  Warnings:

  - Added the required column `tuitionFee` to the `Major` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: add with a default of 0 first, then make it NOT NULL
ALTER TABLE "Major" ADD COLUMN "tuitionFee" INTEGER NOT NULL DEFAULT 0;
