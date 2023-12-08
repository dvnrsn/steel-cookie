// Use this to create a new user and login with that user
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts username@example.com
// and it will log out the cookie value you can use to interact with the server
// as that new user.

import { installGlobals, redirect } from "@remix-run/node";
import { parse } from "cookie";

import { createUser } from "~/models/user.server";
import { authenticator, sessionStorage } from "~/session.server";

installGlobals();

async function createAndLogin(email: string) {
  if (!email) {
    throw new Error("email required for login");
  }
  if (!email.endsWith("@example.com")) {
    throw new Error("All test emails must end in @example.com");
  }

  const user = await createUser(email, "myreallystrongpassword");

  const request = new Request("test://test");

  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", "myreallystrongpassword");

  await authenticator.authenticate("email-pass", new Request("test://test"), {
    failureRedirect: "/join",
    context: { formData },
  });

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  session.set(authenticator.sessionKey, user);
  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(session),
  });
  const response = redirect("/", { headers });

  const cookieValue = response.headers.get("Set-Cookie");
  if (!cookieValue) {
    throw new Error("Cookie missing from createUserSession response");
  }
  const parsedCookie = parse(cookieValue);
  // we log it like this so our cypress command can parse it out and set it as
  // the cookie value.
  console.log(
    `
<cookie>
  ${parsedCookie.__session}
</cookie>
  `.trim(),
  );
}

createAndLogin(process.argv[2]);
