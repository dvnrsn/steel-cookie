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
    <div className="flex flex-col md:hidden mt-4">
      {songListItems.map((song, index) => (
        <Link
          to={`${song.id}`}
          key={song.id}
          className={`flex flex-col border-gray-200 ${
            index !== songListItems.length - 1
              ? "border-b-2 dark:border-gray-600"
              : ""
          }`}
        >
          <div className="flex flex-col h-16 justify-center">
            <div className="text-lg font-bold truncate">{song.title}</div>
            <div className="text-sm">{song.artist}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
