import { prisma } from "~/db.server";

export function getSongListItems({ search }: { search: string }) {
  const where = search ? { name: { contains: search } } : {};
  return prisma.song.findMany({
    select: {
      id: true,
      name: true,
      tutorialLink: true,
      songLink: true,
      spotifyLink: true,
      stepSheetLink: true,
    },
    where,
    orderBy: { updatedAt: "desc" },
  });
}
