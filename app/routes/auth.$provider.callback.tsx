import { LoaderFunctionArgs } from "@remix-run/node";
import { FacebookProfile, SocialsProvider } from "remix-auth-socials";

import { verifySocialLogin } from "~/models/user.server";
import { authenticator, createUserSession } from "~/session.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (typeof params.provider !== "string") {
    throw new Error("Expected 'provider' to be a string");
  }
  const profile = (await authenticator.authenticate(params.provider, request, {
    failureRedirect: "/login",
  })) as FacebookProfile;
  const user = await verifySocialLogin(SocialsProvider.FACEBOOK, profile.id);
  if (!user) {
    throw Error("User not found, despite being authenticated?");
  }
  return createUserSession({
    redirectTo: "/",
    remember: true,
    request,
    userId: user.id,
  });
};
