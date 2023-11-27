import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { MdOutlineClear } from "react-icons/md/index.js";

import FilterMenu from "~/components/filter-menu";
import LoginMenu from "~/components/login-menu";
import MobileSongList from "~/components/mobile-song-list";
import { getSongListItems } from "~/models/song.server";
import { useOptionalUser } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";

  const songListItems = await getSongListItems();
  return json({ songListItems, q });
};

export default function SongsPage() {
  const { q, songListItems } = useLoaderData<typeof loader>();
  const user = useOptionalUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const [search, setSearch] = useState(q);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const thead = theadRef.current as HTMLTableSectionElement;
    const observer = new IntersectionObserver(
      ([e]) =>
        e.target.classList.toggle(
          "song-thead-box-shadow",
          e.intersectionRatio < 1,
        ),
      { threshold: [1] },
    );
    if (thead) observer.observe(thead);
    return () => {
      observer.disconnect();
    };
  }, [theadRef]);

  const handleClear = () => {
    setSearch("");
    inputRef.current?.focus();
  };

  const incompleteFilter = searchParams.get("filter");

  const filteredSongItems = useMemo(() => {
    let list = songListItems;
    if (incompleteFilter) {
      list = songListItems.filter((song) => !song.danceInstructionsLink);
    }
    if (!search) return list;
    const fuseOptions = {
      threshold: 0.35,
      keys: ["title", "artist", "danceName", "danceChoreographer"],
    };
    const fuse = new Fuse(list, fuseOptions);
    return fuse.search(search).map((result) => result.item);
  }, [songListItems, search, incompleteFilter]);

  return (
    <>
      <div className="flex items-center">
        <Form className="search-form flex relative border border-gray-600 rounded-md dark:bg-slate-700">
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search songs"
            type="search"
            placeholder="Search"
            className="border-none outline-none p-2"
          />
          <button
            type="button"
            aria-label="clear"
            className={`p-2 md:p-1 md:m-1 ${search ? "" : "invisible"}`}
            onClick={handleClear}
          >
            <MdOutlineClear
              size={24}
              className="text-gray-500 dark:text-gray-300"
            />
            <span className="sr-only">Clear</span>
          </button>
        </Form>
        {user?.isAdmin ? (
          <Link
            to="new"
            className="p-2 hidden md:block dark:hover:bg-slate-700 hover:bg-slate-200 rounded-lg ml-2"
          >
            + New Song
          </Link>
        ) : null}
        <div className="md:hidden flex ml-auto">
          <LoginMenu />
        </div>
        <div className="flex ml-2">
          <FilterMenu />
        </div>
      </div>
      {filteredSongItems.length === 0 ? (
        <div className="max-w-lg md:absolute mt-4 md:m-auto inset-0 flex flex-col items-center max-h-[500px]">
          Hmm, no songs found. Maybe try a different search?
          <img
            src="https://images.fineartamerica.com/images/artworkimages/mediumlarge/2/cowboy-standing-in-desert-with-empty-matthias-clamer.jpg"
            alt="cowoy standing in desert with empty matthias clamer"
            className="rounded-md mt-4 object-none object-[1%_33%] md:object-contain"
          />
        </div>
      ) : (
        <>
          <MobileSongList songListItems={filteredSongItems} q={q} />
          <table className="w-full text-left hidden md:table table-fixed mt-4">
            <thead
              className="sticky top-[-1px] bg-white dark:bg-gray-900 border-gray-500 border-solid border-b-2"
              ref={theadRef}
            >
              <tr>
                <th className="py-3 px-2 w-1/4">Title</th>
                <th className="py-3 px-2 w-1/4">Artist</th>
                <th className="py-3 px-2 w-1/4">Dance Name</th>
                <th className="py-3 px-2 w-1/4">Choreographer</th>
              </tr>
            </thead>
            <tbody>
              {filteredSongItems.map((song) => (
                <tr
                  key={song.id}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <td
                    className="px-2 py-3 border-gray-100 dark:border-gray-600 border-solid border-b-2 truncate"
                    title={`${
                      (song.title?.length || 0) > 30 ? song.title : ""
                    }`}
                  >
                    <Link to={`${song.id}${q ? `?q=${q}` : ""}`}>
                      {song.title}
                    </Link>
                  </td>
                  <td
                    className="py-3 px-2 border-gray-100 dark:border-gray-600 border-solid border-b-2 truncate"
                    title={`${
                      (song.artist?.length || 0) > 30 ? song.artist : ""
                    }`}
                  >
                    {song.artist}
                  </td>
                  <td
                    className="py-3 px-2 border-gray-100 dark:border-gray-600 border-solid border-b-2 truncate"
                    title={`${
                      (song.danceName?.length || 0) > 30 ? song.danceName : ""
                    }`}
                  >
                    {song.danceName}
                  </td>
                  <td
                    className="py-3 px-2 border-gray-100 dark:border-gray-600 border-solid border-b-2 truncate"
                    title={`${
                      (song.danceChoreographer?.length || 0) > 30
                        ? song.danceChoreographer
                        : ""
                    }`}
                  >
                    {song.danceChoreographer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
