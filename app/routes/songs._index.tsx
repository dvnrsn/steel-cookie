import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";

import { getSongListItems } from "~/models/song.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";

  const noteListItems = await getSongListItems({ search });
  return json({ noteListItems });
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
      <table className="w-full">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.noteListItems.map((song) => (
            <tr key={song.id}>
              <td className="p-2 border-black-200 border-solid border-b-2">
                {song.title}
              </td>
              <td className="p-2 border-black-200 border-solid border-b-2">
                <Link to={`${song.songLink}`}>song</Link>
              </td>
              <td className="p-2 border-black-200 border-solid border-b-2">
                <Link to={`${song.tutorialLink}`}>tutorial</Link>
              </td>
              <td className="p-2 border-black-200 border-solid border-b-2">
                <Link to={`${song.spotifyLink}`}>
                  <img
                    alt="spotify"
                    src="https://1000logos.net/wp-content/uploads/2017/08/Spotify-Logo.png"
                    className="max-h-6"
                  />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
