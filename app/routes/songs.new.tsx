import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { BsArrowLeft } from "react-icons/bs/index.js";
import { z } from "zod";

import { createSong } from "~/models/song.server";
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

export const action = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireAdmin(request);
  const formData = await request.formData();

  const payload = Object.fromEntries(formData);
  const result = schema.safeParse(payload);

  if (!result.success) {
    return json({
      payload,
      error: result.error.flatten().fieldErrors,
    });
  }
  const song = await createSong(user.id, {
    ...result.data,
  });
  return redirect("/songs/" + song.id);
};

export default function SongCreatePage() {
  const result = useActionData<typeof action>();
  const [searchParams] = useSearchParams();

  return (
    <Form method="post" className="max-w-[800px] mx-auto">
      <Link
        to={`..${searchParams.get("q") ? `?q=${searchParams.get("q")}` : ""}`}
        className="inline-block md:block p-2 md:absolute md:-translate-x-14 dark:hover:bg-slate-700 hover:bg-slate-200 rounded-lg"
        aria-label="Songs"
      >
        <BsArrowLeft size={24} />
        <span className="sr-only">Songs</span>
      </Link>
      {JSON.stringify(result?.error)}
      <h3 className="text-2xl font-bold">Create Song</h3>

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
            defaultValue="32"
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
            defaultValue="4"
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
            defaultValue={"Left"}
          />
        </div>
      </div>

      <button
        className="w-full block md:w-auto rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 ml-auto mt-4"
        type="submit"
      >
        Create
      </button>
    </Form>
  );
}
