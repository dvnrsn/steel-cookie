import type { Song } from "@prisma/client";
import { Link } from "@remix-run/react";

export default function MobileSongList({
  songListItems,
}: {
  songListItems: Pick<
    Song,
    "id" | "title" | "artist" | "danceChoreographer" | "danceName"
  >[];
}) {
  return (
    <div className="flex flex-col md:hidden">
      {songListItems.map((song) => (
        <Link
          to={`${song.id}`}
          key={song.id}
          className="flex flex-col border-b-2 border-gray-200"
        >
          <div className="flex flex-col">
            <div className="text-lg font-bold">{song.title}</div>
            <div className="text-sm">{song.artist}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
