import { prisma } from "~/db.server";

const FilterTagsList = [
  "Wednesday Lessons",
  "Friday Lessons",
  "Early Night",
  "Late Night",
];

export function getTags() {
  return prisma.tag
    .findMany()
    .then((tags) => tags.filter((tag) => FilterTagsList.includes(tag.name)));
}

export async function getSongsByTag() {
  const tagsWithSongs = await prisma.tag.findMany({
    include: {
      songs: {
        select: {
          songId: true,
        },
      },
    },
  });

  const map: Record<string, number[]> = {};
  tagsWithSongs.forEach((tag) => {
    if (FilterTagsList.includes(tag.name))
      map[tag.name] = tag.songs.map((song) => song.songId);
  });
  return map;
}
