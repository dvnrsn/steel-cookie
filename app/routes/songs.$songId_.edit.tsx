import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { BsArrowLeft } from "react-icons/bs/index.js";
import invariant from "tiny-invariant";
import { z } from "zod";

import { deleteSong, editSong, getSong } from "~/models/song.server";
import { requireAdmin } from "~/session.server";

const schema = z.object({
  title: z.string().min(1),
  artist: z.string().min(1),
  songLink: z.string().nullable().optional(),
  spotifyLink: z.string().optional(),
  danceName: z.string().optional(),
  danceInstructionsLink: z.string().optional(),
  danceChoreographer: z.string().optional(),
  stepSheetLink: z.string().optional(),
  danceCounts: z.coerce.number().optional(),
  wallCounts: z.coerce.number().optional(),
  startingWeightFoot: z.string().optional(),
});

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.songId, "songId not found");
  const user = await requireAdmin(request);
  const formData = await request.formData();

  const { _action, ...payload } = Object.fromEntries(formData);

  if (_action === "delete") {
    await deleteSong({ id: parseInt(params.songId) });
    return redirect("/songs");
  }

  const result = schema.safeParse(payload);

  if (!result.success) {
    return json({
      payload,
      error: result.error.flatten().fieldErrors,
    });
  }
  const song = await editSong(parseInt(params.songId), user.id, result.data);
  return redirect("/songs/" + song.id);
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.songId, "songId not found");
  const user = await requireAdmin(request);

  const id = parseInt(params.songId);

  const song = await getSong({ id, userId: user.id });
  if (!song) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ song });
};

export default function SongEditPage() {
  const data = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const [searchParams] = useSearchParams();

  const { song } = data;
  return (
    <div className="max-w-[800px] mx-auto">
      <Form method="post">
        <Link
          to={`..${searchParams.get("q") ? `?q=${searchParams.get("q")}` : ""}`}
          className="inline-block md:block p-2 md:absolute md:-translate-x-14 dark:hover:bg-slate-700 hover:bg-slate-200 rounded-lg"
          aria-label="Songs"
        >
          <BsArrowLeft size={24} />
          <span className="sr-only">Songs</span>
        </Link>
        {JSON.stringify(result?.error)}
        <h3 className="text-2xl font-bold">Edit Song Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 mt-4">
          <div className="w-full">
            <label className="block" htmlFor="title">
              Song Title *
            </label>
            <input
              className="px-2 py-1 w-full"
              type="text"
              id="title"
              name="title"
              defaultValue={song.title}
            />
          </div>
          <div className="w-full">
            <label className="block" htmlFor="artist">
              Artist *
            </label>
            <input
              className="px-2 py-1 w-full"
              type="text"
              id="artist"
              name="artist"
              defaultValue={song.artist}
            />
          </div>
          <div className="w-full">
            <label className="block" htmlFor="songLink">
              Song Link
            </label>
            <input
              className="px-2 py-1 w-full"
              type="url"
              id="songLink"
              name="songLink"
              defaultValue={song.songLink || ""}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 mt-8">
          <div>
            <label className="block" htmlFor="danceName">
              Dance Name
            </label>
            <input
              className="px-2 py-1 w-full"
              type="text"
              id="danceName"
              name="danceName"
              defaultValue={song.danceName || ""}
            />
          </div>
          <div>
            <label className="block" htmlFor="danceChoreographer">
              Choreographer
            </label>
            <input
              className="px-2 py-1 w-full"
              type="text"
              id="danceChoreographer"
              name="danceChoreographer"
              defaultValue={song.danceChoreographer || ""}
            />
          </div>
          <div>
            <label className="block" htmlFor="danceInstructionsLink">
              Dance Instructions Link
            </label>
            <input
              className="px-2 py-1 w-full"
              type="url"
              id="danceInstructionsLink"
              name="danceInstructionsLink"
              defaultValue={song.danceInstructionsLink || ""}
            />
          </div>

          <div>
            <label className="block" htmlFor="stepSheetLink">
              Step Sheet Link
            </label>
            <input
              className="px-2 py-1 w-full"
              type="url"
              id="stepSheetLink"
              name="stepSheetLink"
              defaultValue={song.stepSheetLink || ""}
            />
          </div>
          <div>
            <label className="block" htmlFor="danceCounts">
              Dance Counts
            </label>
            <input
              className="px-2 py-1 w-full"
              type="text"
              id="danceCounts"
              name="danceCounts"
              defaultValue={song.danceCounts || ""}
            />
          </div>
          <div>
            <label className="block" htmlFor="wallCounts">
              Wall Counts
            </label>
            <input
              className="px-2 py-1 w-full"
              type="text"
              id="wallCounts"
              name="wallCounts"
              defaultValue={song.wallCounts || ""}
            />
          </div>
          <div>
            <label className="block" htmlFor="startingWeightFoot">
              Starting Weight Foot
            </label>
            <input
              className="px-2 py-1 w-full"
              type="text"
              id="startingWeightFoot"
              name="startingWeightFoot"
              defaultValue={song.startingWeightFoot || ""}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-8 justify-end">
          <button
            type="submit"
            className="block rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400  mr-auto"
            onClick={(event) => {
              const response = confirm(
                "Are you sure you want to delete this song?",
              );
              if (!response) {
                event.preventDefault();
              }
            }}
            name="_action"
            value="delete"
          >
            Delete
          </button>
          <Link
            className="w-auto rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 focus:bg-gray-400"
            to={`..${
              searchParams.get("q") ? `?q=${searchParams.get("q")}` : ""
            }`}
          >
            Cancel
          </Link>
          <button
            className="block w-auto rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
            type="submit"
            name="_action"
            value="save"
          >
            Save Changes
          </button>
        </div>
      </Form>
    </div>
  );
}
