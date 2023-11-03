import {
  ActionFunctionArgs,
  json,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form } from "@remix-run/react";

import { uploadCSV } from "~/models/song.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const uploadHandler = unstable_composeUploadHandlers(
    async (file) => await uploadCSV(file, userId),
    unstable_createMemoryUploadHandler(),
  );
  await unstable_parseMultipartFormData(request, uploadHandler);
  return json({ msg: "success" });
};

export default function Upload() {
  return (
    <Form
      method="post"
      className="h-full w-full grid justify-center content-center"
      encType="multipart/form-data"
    >
      <input type="file" name="songs" />
      <button>Upload</button>
    </Form>
  );
}
