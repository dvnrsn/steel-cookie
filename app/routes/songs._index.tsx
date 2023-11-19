import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import { MdOutlineClear } from "react-icons/md/index.js";

import { Loader } from "~/components/loader";
import LoginMenu from "~/components/login-menu";
import MobileSongList from "~/components/mobile-song-list";
import { getSongListItems } from "~/models/song.server";
import { useOptionalUser } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";

  const songListItems = await getSongListItems({ q });
  return json({ songListItems, q });
};

export default function SongsPage() {
  const { q, songListItems } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const user = useOptionalUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const navigation = useNavigation();

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

  const handleSubmit = () => {
    const formData = new FormData();
    const searchValue = inputRef.current?.value ?? "";
    if (searchValue) {
      formData.append("q", searchValue);
    }
    submit(formData);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      handleSubmit();
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    const searchField = document.querySelector("input[name=q]");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <>
      <div className="flex items-center">
        <Form
          ref={formRef}
          onChange={handleSubmit}
          className="search-form flex relative border border-gray-600 rounded-md dark:bg-slate-700"
        >
          <input
            ref={inputRef}
            aria-label="Search songs"
            defaultValue={q || ""}
            type="search"
            placeholder="Search"
            className="border-none outline-none p-2"
            name="q"
          />
          <button
            type="button"
            aria-label="clear"
            className={`p-2 md:p-1 md:m-1 ${q ? "" : "invisible"}`}
            onClick={handleClear}
          >
            <MdOutlineClear
              size={24}
              className="text-gray-500 dark:text-gray-300"
            />
            <span className="sr-only">Clear</span>
          </button>
        </Form>
        <Loader visible={navigation.state === "loading"} />
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
      </div>
      {songListItems.length === 0 ? (
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
          <MobileSongList songListItems={songListItems} q={q} />
          <table className="w-full text-left hidden md:table table-fixed mt-4">
            <thead
              className="sticky top-[-1px] bg-white dark:bg-gray-900 border-gray-500 border-solid border-b-2"
              ref={theadRef}
            >
              <tr>
                <th className="py-3 px-2  w-1/4">Title</th>
                <th className="py-3 px-2 w-1/4">Artist</th>
                <th className="py-3 px-2 w-1/4">Dance Name</th>
                <th className="py-3 px-2 w-1/4">Choreographer</th>
              </tr>
            </thead>
            <tbody>
              {songListItems.map((song) => (
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
