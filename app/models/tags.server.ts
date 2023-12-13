import { prisma } from "~/db.server";

export function getTags() {
  return prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
  });
}
