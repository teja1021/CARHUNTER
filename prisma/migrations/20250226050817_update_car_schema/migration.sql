/*
  Warnings:

  - You are about to drop the `CarImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CarImage" DROP CONSTRAINT "CarImage_carId_fkey";

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "images" TEXT[];

-- DropTable
DROP TABLE "CarImage";
