import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";

import { getSongListItems } from "~/models/song.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";

  const songListItems = await getSongListItems({ search });
  return json({ songListItems });
};

export default function NotesPage() {
  const data = useLoaderData<typeof loader>();
  const [search, setSearch] = useState("");
  const submit = useSubmit();

  return (
    <>
      <div className="flex">
        <Form
          onChange={(event) => {
            submit(event.currentTarget);
          }}
        >
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            type="search"
            className="p-2"
            placeholder="Search"
            name="search"
          />
        </Form>
        <Link to="new" className="block p-2">
          + New Song
        </Link>
      </div>
      <table className="w-full text-left">
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
          {data.songListItems.map((song) => (
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
