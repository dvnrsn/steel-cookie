import { ActionFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { deleteSong } from "~/models/song.server";

export const action = async ({ params }: ActionFunctionArgs) => {
  invariant(params.songId, "songId not found");
  await deleteSong({ id: parseInt(params.songId) });
  return redirect("/songs");
};
