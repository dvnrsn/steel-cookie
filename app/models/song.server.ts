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

    tags: {
      select: {
        tag: true,
      },
    },

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

type NullableSongFields = {
  [K in keyof Omit<
    Song,
    | "createdById"
    | "createdAt"
    | "updatedById"
    | "title"
    | "artist"
    | "id"
    | "updatedAt"
  >]?: Song[K] | null;
};
type RequiredSongField = Pick<Song, "title" | "artist">;

export function editSong(
  songId: Song["id"],
  userId: User["id"],
  songData: NullableSongFields & RequiredSongField & { tags?: string[] },
) {
  let tags = {};
  if (songData.tags) {
    // avoid deleting and reinserting tags all the time, only if they changed.
    // also the nested ternary freaks out prisma TS for some reason
    tags = {
      deleteMany: {},
      create: songData.tags?.map((tag) => ({
        tag: { connect: { id: parseInt(tag) } },
      })),
    };
  }
  return prisma.song.update({
    where: { id: songId },
    data: {
      ...songData,
      updatedById: userId,
      tags,
    },
  });
}

export function createSong(
  userId: User["id"],
  songData: NullableSongFields & RequiredSongField,
) {
  return prisma.song.create({
    data: {
      ...songData,
      createdById: userId,
      createdAt: new Date(),
    },
  });
}

export function deleteSong({ id }: Pick<Song, "id">) {
  return prisma.song.deleteMany({
    where: { id },
  });
}
export async function markSongPlaybackEvent({
  songId,
  userId,
}: {
  songId: Song["id"];
  userId?: User["id"];
}) {
  const tenMinutesAgo = new Date();
  tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

  const songPlayedInLastTenMinutes = await prisma.playbackEvent.findFirst({
    where: {
      songId,
      createdAt: {
        gte: tenMinutesAgo,
        lte: new Date(),
      },
    },
  });

  if (songPlayedInLastTenMinutes) {
    return { alreadyMarked: true };
  }

  return prisma.playbackEvent.create({
    data: {
      songId,
      userId,
    },
  });
}

export function getSongListItems() {
  return prisma.song.findMany({
    select: {
      id: true,
      title: true,
      danceChoreographer: true,
      danceName: true,
      danceInstructionsLink: true,
      artist: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function logSongView({
  songId,
  userId,
  ip,
}: {
  songId: Song["id"];
  userId?: User["id"];
  ip: string;
}) {
  return prisma.analyticsSongView.create({
    data: {
      songId,
      userId,
      ip,
    },
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
