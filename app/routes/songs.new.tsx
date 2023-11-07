import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
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

  return (
    <Form method="post">
      {JSON.stringify(result?.error)}
      <h3 className="text-2xl font-bold">Create Song</h3>

      <label className="block mt-4" htmlFor="title">
        Song Title *
      </label>
      <input
        className="px-2 py-1 w-full md:w-auto"
        type="text"
        id="title"
        name="title"
      />

      <label className="block mt-4" htmlFor="artist">
        Artist *
      </label>
      <input
        className="px-2 py-1 w-full md:w-auto"
        type="text"
        id="artist"
        name="artist"
      />

      <label className="block mt-4" htmlFor="songLink">
        Song Link
      </label>
      <input
        className="px-2 py-1 w-full md:w-auto"
        type="url"
        id="songLink"
        name="songLink"
      />

      <label className="block mt-4" htmlFor="spotifyLink">
        Spotify Link
      </label>
      <input
        className="px-2 py-1 w-full md:w-auto"
        type="url"
        id="spotifyLink"
        name="spotifyLink"
      />

      <label className="block mt-4" htmlFor="danceName">
        Dance Name
      </label>
      <input
        className="px-2 py-1 w-full md:w-auto"
        type="text"
        id="danceName"
        name="danceName"
      />

      <label className="block mt-4" htmlFor="danceInstructionsLink">
        Dance Instructions Link
      </label>
      <input
        className="px-2 py-1 w-full md:w-auto"
        type="url"
        id="danceInstructionsLink"
        name="danceInstructionsLink"
      />

      <label className="block mt-4" htmlFor="danceChoreographer">
        Choreographer
      </label>
      <input
        className="px-2 py-1 w-full md:w-auto"
        type="text"
        id="danceChoreographer"
        name="danceChoreographer"
      />

      <label className="block mt-4" htmlFor="stepSheetLink">
        Step Sheet Link
      </label>
      <input
        className="px-2 py-1 w-full md:w-auto"
        type="url"
        id="stepSheetLink"
        name="stepSheetLink"
      />

      <label className="block mt-4" htmlFor="danceCounts">
        Dance Counts
      </label>
      <input
        className="px-2 py-1 w-full md:w-auto"
        type="text"
        id="danceCounts"
        name="danceCounts"
      />

      <label className="block mt-4" htmlFor="wallCounts">
        Wall Counts
      </label>
      <input
        className="px-2 py-1 w-full md:w-auto"
        type="text"
        id="wallCounts"
        name="wallCounts"
      />

      <label className="block mt-4" htmlFor="startingWeightFoot">
        Starting Weight Foot
      </label>
      <input
        className="px-2 py-1 w-full md:w-auto"
        type="text"
        id="startingWeightFoot"
        name="startingWeightFoot"
      />

      <button
        className="w-full block md:w-auto rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 ml-auto mt-4"
        type="submit"
      >
        Save Changes
      </button>
    </Form>
  );
}
