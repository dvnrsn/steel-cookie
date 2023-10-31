import { ActionFunctionArgs, redirect } from "@remix-run/node";

import { authenticator } from "~/session.server";

export const loader = () => redirect("/");

export const action = ({ request, params }: ActionFunctionArgs) => {
  if (typeof params.provider !== "string") {
    throw new Error("Expected 'provider' to be a string");
  }
  return authenticator.authenticate(params.provider, request);
};
