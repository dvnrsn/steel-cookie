import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { MdOutlineClear } from "react-icons/md/index.js";

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
      <div className="flex">
        <Form
          ref={formRef}
          onChange={handleSubmit}
          className="search-form flex relative border border-gray-600 rounded-md"
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
              className="text-gray-500 dark:text-gray-400"
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
      </div>
      <MobileSongList songListItems={songListItems} q={q} />
      <table className="w-full text-left hidden md:table">
        <thead>
          <tr>
            <th className="p-2 border-gray-500 border-solid border-b-2">
              Title
            </th>
            <th className="p-2 border-gray-500 border-solid border-b-2">
              Artist
            </th>
            <th className="p-2 border-gray-500 border-solid border-b-2">
              Dance Name
            </th>
            <th className="p-2 border-gray-500 border-solid border-b-2">
              Choreographer
            </th>
          </tr>
        </thead>
        <tbody>
          {songListItems.map((song) => (
            <tr key={song.id}>
              <td className="p-2 border-gray-200 dark:border-gray-600 border-solid border-b-2">
                <Link to={`${song.id}${q ? `?q=${q}` : ""}`}>{song.title}</Link>
              </td>
              <td className="p-2 border-gray-200 dark:border-gray-600 border-solid border-b-2">
                {song.artist}
              </td>
              <td className="p-2 border-gray-200 dark:border-gray-600 border-solid border-b-2">
                {song.danceName}
              </td>
              <td className="p-2 border-gray-200 dark:border-gray-600 border-solid border-b-2">
                {song.danceChoreographer}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
