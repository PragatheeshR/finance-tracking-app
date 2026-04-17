/*
  Warnings:

  - Added the required column `displayName` to the `expense_categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "expense_categories" ADD COLUMN     "displayName" TEXT NOT NULL;
