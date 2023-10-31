import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { authenticator, logout } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  logout(request);
  // TODO
  // authenticator.logout(request, { redirectTo: "/" });
};

export const loader = async () => redirect("/");
