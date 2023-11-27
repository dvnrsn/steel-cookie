import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { MdOutlineClear } from "react-icons/md/index.js";

import FilterMenu from "~/components/filter-menu";
import LoginMenu from "~/components/login-menu";
import MobileSongList from "~/components/mobile-song-list";
import { getSongListItems } from "~/models/song.server";
import { useOptionalUser } from "~/utils";

export const loader = async () => {
  const songListItems = await getSongListItems();
  return json({ songListItems });
};

// don't revalidate because we don't want to refetch the song list
// all filtering/searching/sorting will be client side
export const shouldRevalidate = () => false;

export default function SongsPage() {
  const { songListItems } = useLoaderData<typeof loader>();
  const user = useOptionalUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [incomplete, setIncomplete] = useState(
    searchParams.get("filter") === "incomplete",
  );
  const submit = useSubmit();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [timeoutRef]);

  const q = searchParams.get("q");
  const incompleteFilter = searchParams.get("filter");

  // update the UI to match the URL SearchParams (e.g., seen on back button)
  // this does fire superflously when user types in the search box
  // but it's a necessary tradeoff afaict to keep state in sync with URL
  useEffect(() => {
    setSearch(q || "");
  }, [q]);

  useEffect(() => {
    setIncomplete(incompleteFilter === "incomplete");
  }, [incompleteFilter]);

  const handleSubmit = ({
    incompleteArg,
    searchArg,
    debounce = false,
  }: {
    incompleteArg?: boolean;
    searchArg?: string;
    debounce?: boolean;
  } = {}) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const q = typeof searchArg === "string" ? searchArg : searchParams.get("q");
    const filter =
      typeof incompleteArg === "boolean"
        ? incompleteArg
        : searchParams.get("filter");

    const formData = new FormData();
    if (q) {
      formData.set("q", q);
    }
    if (filter) {
      formData.set("filter", "incomplete");
    }
    if (debounce) {
      timeoutRef.current = setTimeout(() => submit(formData), 300);
    } else {
      submit(formData);
    }
  };

  const handleClear = () => {
    setSearch("");
    inputRef.current?.focus();
    handleSubmit({ searchArg: "" });
  };

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
            onChange={(e) => {
              setSearch(e.target.value);
              handleSubmit({ searchArg: e.target.value, debounce: true });
            }}
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
          <FilterMenu {...{ incomplete, setIncomplete, handleSubmit }} />
          <LoginMenu />
        </div>
        <div className="md:flex ml-2 hidden">
          <FilterMenu {...{ incomplete, setIncomplete, handleSubmit }} />
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
          <MobileSongList songListItems={filteredSongItems} />
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
                    <Link to={`${song.id}`}>{song.title}</Link>
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
