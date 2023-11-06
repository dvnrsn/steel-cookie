import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { BsArrowLeft, BsPencil } from "react-icons/bs";
import invariant from "tiny-invariant";

import { deleteSong, getSong } from "~/models/song.server";
import { getUserId, requireUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.songId, "songId not found");
  const userId = await getUserId(request);
  const song = await getSong({ id: params.songId, userId });
  if (!song) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ song });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  await requireUserId(request);
  invariant(params.songId, "songId not found");

  await deleteSong({ id: params.songId });

  return redirect("/songs");
};

export default function SongDetailsPage() {
  const { song } = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  return (
    <div className="relative w-max">
      <Link to=".." className="block p-2 md:absolute md:-translate-x-14">
        <BsArrowLeft size={24} />
      </Link>
      {user?.isAdmin ? (
        <Link
          to="edit"
          className="block right-0 p-2 md:absolute md:translate-x-14"
        >
          <BsPencil size={24} />
        </Link>
      ) : null}
      <h3 className="text-2xl font-bold">{song.title}</h3>
      <div>
        <h1>
          {song.title} by {song.artist}
        </h1>
        {song.songLink ? (
          <a
            href={song.songLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            Listen to the Song
          </a>
        ) : null}
        {song.spotifyLink ? (
          <a href={song.spotifyLink} target="_blank" rel="noopener noreferrer">
            Listen on Spotify
          </a>
        ) : null}

        <h2 className="mt-4">Dance name: {song.danceName}</h2>
        {song.danceInstructionsLink ? (
          <a
            href={song.danceInstructionsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            Dance Instructions
          </a>
        ) : null}
        <p>Choreographer: {song.danceChoreographer}</p>

        {song.stepSheetLink ? (
          <a
            href={song.stepSheetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            Step Sheet
          </a>
        ) : null}

        <p>Dance Counts: {song.danceCounts}</p>
        <p>Wall Counts: {song.wallCounts}</p>
        <p>Starting Weight Foot: {song.startingWeightFoot}</p>

        {user ? (
          <>
            {song?.createdAt ? (
              <p className="mt-4">
                Added By: {song.createdBy?.firstName || song.createdBy?.email}
                {" - "}
                {new Date(song.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            ) : null}

            {song?.updatedAt ? (
              <p>
                Updated By: {song.updatedBy?.firstName || song.updatedBy?.email}
                {" - "}
                {new Date(song?.updatedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      {user?.isAdmin ? (
        <Form method="post">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Delete
          </button>
        </Form>
      ) : null}
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Song not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
