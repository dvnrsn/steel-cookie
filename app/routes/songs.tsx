import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet } from "@remix-run/react";

import { getSongListItems } from "~/models/song.server";
import { useOptionalUser } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";

  const noteListItems = await getSongListItems({ search });
  return json({ noteListItems });
};

export default function NotesPage() {
  const user = useOptionalUser();

  return user ? (
    <div className="page-container">
      <div className="fixed right-[12px] top-[12px]">
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
        <Link to="new" className="block p-4 text-xl text-blue-500">
          + New Song
        </Link>
      </div>
      <Outlet />
    </div>
  ) : (
    <Link to="/login">Login</Link>
  );
}
