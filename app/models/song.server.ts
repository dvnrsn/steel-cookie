import { Song, User } from "@prisma/client";
import { UploadHandlerPart } from "@remix-run/node";
import Papa from "papaparse";

import { prisma } from "~/db.server";

export function getSong({
  id,
  userId,
}: Pick<Song, "id"> & { userId?: User["id"] }) {
  const select = {
    id: true,
    title: true,
    artist: true,
    songLink: true,
    spotifyLink: true,

    danceName: true,
    danceChoreographer: true,
    danceInstructionsLink: true,
    stepSheetLink: true,
    danceCounts: true,
    wallCounts: true,
    startingWeightFoot: true,

    ...(userId
      ? {
          createdAt: true,
          updatedAt: true,

          createdBy: true,
          createdById: true,

          updatedBy: true,
          updatedById: true,
        }
      : {}),
  };
  return prisma.song.findFirst({
    select,
    where: { id },
  });
}

export function deleteSong({ id }: Pick<Song, "id">) {
  return prisma.note.deleteMany({
    where: { id },
  });
}

export function getSongListItems({ search }: { search: string }) {
  const where = search ? { title: { contains: search } } : {};
  return prisma.song.findMany({
    select: {
      id: true,
      title: true,
      danceInstructionsLink: true,
      danceChoreographer: true,
      danceName: true,
      songLink: true,
      artist: true,
      spotifyLink: true,
      stepSheetLink: true,
    },
    where,
    orderBy: { updatedAt: "desc" },
  });
}

export async function uploadCSV(file: UploadHandlerPart, userId: string) {
  const chunks = [];
  for await (const chunk of file.data) {
    chunks.push(chunk); // Assuming these are Buffers or Uint8Arrays
  }
  const combinedChunks = Buffer.concat(chunks);
  const csvString = combinedChunks.toString("utf8");
  interface Parsed {
    data: string[][];
  }
  const res = Papa.parse(csvString) as unknown as Parsed;

  async function createSongsFromCSV(csvData: string[][]) {
    // Loop over the CSV data and create song entries
    for (const row of csvData) {
      const [
        ,
        // first element is ID of ironcookie song
        title,
        artist,
        songLink,
        danceName,
        danceCounts,
        wallCounts,
        startingWeightFoot,
        danceInstructionsLink,
        stepSheetLink,
        danceChoreographer,
      ] = row;

      // Convert danceCounts and wallCounts to numbers, or use null if they're not provided
      const danceCountsNumber = danceCounts ? parseInt(danceCounts, 10) : null;
      let wallCountsNumber = wallCounts ? parseInt(wallCounts, 10) : null;
      if (wallCounts == "Circle") {
        wallCountsNumber = 0;
      }

      // Create the song record
      await prisma.song.create({
        data: {
          title: title,
          artist: artist,
          songLink: songLink || null,
          danceName: danceName || null,
          danceChoreographer: danceChoreographer || null,
          danceInstructionsLink: danceInstructionsLink || null,
          stepSheetLink: stepSheetLink || null,
          danceCounts: danceCountsNumber,
          wallCounts: wallCountsNumber,
          startingWeightFoot: startingWeightFoot || null,
          createdById: userId,
          updatedById: userId,
        },
      });
    }
  }

  createSongsFromCSV(res.data.slice(1, -1));
  return undefined;
}
