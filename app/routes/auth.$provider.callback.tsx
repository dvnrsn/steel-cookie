import { LoaderFunctionArgs } from "@remix-run/node";

import { authenticator } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (typeof params.provider !== "string") {
    throw new Error("Expected 'provider' to be a string");
  }
  return await authenticator.authenticate(params.provider, request, {
    failureRedirect: "/login",
    successRedirect: "/",
  });
};
