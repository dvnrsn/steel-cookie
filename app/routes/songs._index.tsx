import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getSongListItems } from "~/models/song.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";

  const noteListItems = await getSongListItems({ search });
  return json({ noteListItems });
};

export default function NotesPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Song Link</th>
          <th>Tutorial Link</th>
          <th>Spotify Link</th>
        </tr>
      </thead>
      <tbody>
        {data.noteListItems.map((song) => (
          <tr key={song.id}>
            <td className="p-2 border-indigo-200 border-solid border-b-2">
              {song.name}
            </td>
            <td className="p-2 border-indigo-200 border-solid border-b-2">
              {song.songLink}
            </td>
            <td className="p-2 border-indigo-200 border-solid border-b-2">
              {song.tutorialLink}
            </td>
            <td className="p-2 border-indigo-200 border-solid border-b-2">
              {song.spotifyLink}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
