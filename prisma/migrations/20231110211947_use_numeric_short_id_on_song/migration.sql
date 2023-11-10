/*
  Warnings:

  - The primary key for the `Song` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Song` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Song" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "songLink" TEXT,
    "spotifyLink" TEXT,
    "danceName" TEXT,
    "danceChoreographer" TEXT,
    "danceInstructionsLink" TEXT,
    "stepSheetLink" TEXT,
    "danceCounts" INTEGER,
    "wallCounts" INTEGER,
    "startingWeightFoot" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    CONSTRAINT "Song_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Song_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Song" ("artist", "createdAt", "createdById", "danceChoreographer", "danceCounts", "danceInstructionsLink", "danceName", "songLink", "spotifyLink", "startingWeightFoot", "stepSheetLink", "title", "updatedAt", "updatedById", "wallCounts") 
  SELECT "artist", "createdAt", "createdById", "danceChoreographer", "danceCounts", "danceInstructionsLink", "danceName", "songLink", "spotifyLink", "startingWeightFoot", "stepSheetLink", "title", "updatedAt", "updatedById", "wallCounts" FROM "Song";
DROP TABLE "Song";
ALTER TABLE "new_Song" RENAME TO "Song";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
