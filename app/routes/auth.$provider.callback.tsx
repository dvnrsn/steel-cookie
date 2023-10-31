import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/session.server";

export let loader = ({ request, params }: LoaderFunctionArgs) => {
  if (typeof params.provider !== "string") {
    throw new Error("Expected 'provider' to be a string");
  }
  return authenticator.authenticate(params.provider, request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
