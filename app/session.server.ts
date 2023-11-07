import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { FacebookStrategy, SocialsProvider } from "remix-auth-socials";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import {
  createSocialUser,
  findOrCreateUser,
  getUserById,
  verifySocialLogin,
} from "~/models/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getUserId(
  request: Request,
): Promise<User["id"] | undefined> {
  const user = await authenticator.isAuthenticated(request);
  return user?.id;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return user.id;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireAdmin(request: Request) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  if (user?.isAdmin) {
    return user;
  }
  throw await logout(request);
}

export async function logout(request: Request) {
  return authenticator.logout(request, { redirectTo: "/" });
}

export const authenticator = new Authenticator<User>(sessionStorage, {
  sessionKey: "_session",
});

const getCallback = (provider: SocialsProvider) => {
  return `${process.env.FACEBOOK_CALLBACK_URL}/auth/${provider}/callback`;
};

authenticator.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      callbackURL: getCallback(SocialsProvider.FACEBOOK),
    },
    async ({ profile }) => {
      let user = await verifySocialLogin(SocialsProvider.FACEBOOK, profile.id);
      if (!user) {
        user = await createSocialUser({
          socialId: profile._json.id,
          authProvider: SocialsProvider.FACEBOOK,
          email: profile._json.email,
          firstName: profile._json.first_name,
          lastName: profile._json.last_name,
        });
      }
      return user;
    },
  ),
);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string; // validation is handled by the actions
    const password = form.get("password") as string | undefined;

    return findOrCreateUser(email, password);
  }),
  "user-pass",
);
