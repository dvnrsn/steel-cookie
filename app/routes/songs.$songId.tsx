import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useActionData,
  useLoaderData,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import { useEffect, useMemo } from "react";
import { BsArrowLeft, BsPencil, BsYoutube } from "react-icons/bs/index.js";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import invariant from "tiny-invariant";

import {
  getSong,
  logSongView,
  markSongPlaybackEvent,
} from "~/models/song.server";
import { authenticator } from "~/session.server";
import { useOptionalUser } from "~/utils";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.songId, "songId not found");
  const user = await authenticator.isAuthenticated(request);
  const id = parseInt(params.songId);
  const song = await getSong({ id, userId: user?.id });
  if (!song) {
    throw new Response("Not Found", { status: 404 });
  }

  await logSongView({
    songId: song.id,
    ip: getClientIPAddress(request) || "",
    userId: user?.id,
  });

  return json({ song });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request);
  invariant(params.songId, "songId not found");
  const id = parseInt(params.songId);
  const res = await markSongPlaybackEvent({ songId: id, userId: user?.id });

  return json({
    status: "ok",
    ...("alreadyMarked" in res ? { alreadyMarked: res.alreadyMarked } : {}),
  });
};

export default function SongDetailsPage() {
  const { song } = useLoaderData<typeof loader>();
  const user = useOptionalUser();
  const navigate = useNavigate();
  const result = useActionData<typeof action>();

  useEffect(() => {
    if (result?.alreadyMarked) {
      alert("Already got it, thanks!");
    } else if (result?.status === "ok") {
      alert("Song marked as played");
    } else if (result) {
      alert("Error marking song as played");
    }
  }, [result]);

  const wasJustCreated = useMemo(() => {
    // usememo so it doesn't run on every render
    const creation = new Date(song?.createdAt || "");
    const twentySecondsAgo = new Date(Date.now() - 20 * 1000);
    return creation > twentySecondsAgo;
  }, [song?.createdAt]);

  return (
    <div className="w-full flex justify-center md:mt-6">
      <div className="relative w-full md:w-[550px] flex-col justify-center">
        <div className="flex justify-between">
          <button
            className="block p-2 md:absolute md:-translate-x-14 dark:hover:bg-slate-700 hover:bg-slate-200 rounded-lg"
            aria-label="Songs"
            onClick={() => (wasJustCreated ? navigate("/songs") : navigate(-1))}
          >
            <BsArrowLeft size={24} />
            <span className="sr-only">Back to Songs</span>
          </button>
          {user?.isAdmin ? (
            <Link
              to="edit"
              className="block right-0 p-2 md:absolute md:translate-x-14 dark:hover:bg-slate-700 hover:bg-slate-200 rounded-lg"
              aria-label="Edit"
            >
              <BsPencil size={24} />
              <span className="sr-only">Edit</span>
            </Link>
          ) : null}
        </div>
        <h3 className="text-2xl font-bold">{song.title}</h3>
        <div>
          <p>{song.artist}</p>
          {song.songLink ? (
            <a
              href={song.songLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center h-16 my-4 bg-slate-100  dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <span className="text-xl">🎧&nbsp;</span>
              Song
            </a>
          ) : null}
          {song.spotifyLink ? (
            <a
              href={song.spotifyLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Listen on Spotify
            </a>
          ) : null}

          {song.danceInstructionsLink ? (
            <a
              href={song.danceInstructionsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center my-4 h-16 bg-slate-100  dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <BsYoutube size={24} className="text-red-500" />
              &nbsp; Tutorial
            </a>
          ) : null}
          {song.stepSheetLink ? (
            <a
              href={song.stepSheetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center my-4 h-16 bg-slate-100  dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <img
                src="/images/copper-knob-star.png"
                alt="copper knob star"
                className="h-6 w-6"
              ></img>
              &nbsp; Step Sheet
            </a>
          ) : null}

          {user?.isAdmin ? (
            <Form method="post">
              <button className="flex justify-center items-center my-4 h-16 bg-slate-100  dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 w-full">
                <span className="text-xl">🔊&nbsp;</span>
                &nbsp; Mark Event
              </button>
            </Form>
          ) : null}

          <p>Choreographer: {song.danceChoreographer}</p>

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

              {song?.updatedBy && song?.updatedAt ? (
                <p>
                  Updated By:{" "}
                  {song.updatedBy?.firstName || song.updatedBy?.email}
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
      </div>
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
