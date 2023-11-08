-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Song" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
INSERT INTO "new_Song" ("artist", "createdAt", "createdById", "danceChoreographer", "danceCounts", "danceInstructionsLink", "danceName", "id", "songLink", "spotifyLink", "startingWeightFoot", "stepSheetLink", "title", "updatedAt", "updatedById", "wallCounts") SELECT "artist", "createdAt", "createdById", "danceChoreographer", "danceCounts", "danceInstructionsLink", "danceName", "id", "songLink", "spotifyLink", "startingWeightFoot", "stepSheetLink", "title", "updatedAt", "updatedById", "wallCounts" FROM "Song";
DROP TABLE "Song";
ALTER TABLE "new_Song" RENAME TO "Song";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
