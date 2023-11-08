import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import { useEffect } from "react";

import MobileSongList from "~/components/mobile-song-list";
import { getSongListItems } from "~/models/song.server";
import { useOptionalUser } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";

  const songListItems = await getSongListItems({ q });
  return json({ songListItems, q });
};

export default function NotesPage() {
  const { q, songListItems } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const user = useOptionalUser();

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
          onChange={(event) => {
            submit(event.currentTarget);
          }}
        >
          <input
            aria-label="Search songs"
            defaultValue={q || ""}
            type="search"
            className="p-2"
            placeholder="Search"
            name="q"
          />
        </Form>
        {user?.isAdmin ? (
          <Link
            to="new"
            className="p-2 hidden md:block dark:hover:bg-slate-600 hover:bg-slate-200 rounded-lg ml-2"
          >
            + New Song
          </Link>
        ) : null}
      </div>
      <MobileSongList songListItems={songListItems} />
      <table className="w-full text-left hidden md:block">
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
              <td className="p-2 border-gray-200 border-solid border-b-2">
                <Link key={song.id} to={`${song.id}`}>
                  {song.title}
                </Link>
              </td>
              <td className="p-2 border-gray-200 border-solid border-b-2">
                {song.artist}
              </td>
              <td className="p-2 border-gray-200 border-solid border-b-2">
                {song.danceName}
              </td>
              <td className="p-2 border-gray-200 border-solid border-b-2">
                {song.danceChoreographer}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
