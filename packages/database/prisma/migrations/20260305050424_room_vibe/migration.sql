-- CreateEnum
CREATE TYPE "RoomVibe" AS ENUM ('MUSIC', 'ART', 'FOOD', 'SPORTS', 'TECH', 'GAMING', 'BOOKS', 'FILM', 'NATURE', 'OTHER');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "roomVibe" "RoomVibe";
