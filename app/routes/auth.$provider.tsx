import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/session.server";

export let loader = () => redirect("/");

export let action = ({ request, params }: ActionFunctionArgs) => {
  console.log("here");
  if (typeof params.provider !== "string") {
    throw new Error("Expected 'provider' to be a string");
  }
  return authenticator.authenticate(params.provider, request);
};
