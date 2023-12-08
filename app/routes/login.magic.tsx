import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { SpamError } from "remix-utils/honeypot/server";

import { honeypot } from "~/honeypot.server";
import { getUserByEmail } from "~/models/user.server";
import { authenticator, sessionStorage } from "~/session.server";
import { validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  return json({
    magicLinkSent: session.has("auth:magiclink"),
    magicLinkEmail: session.get("auth:email"),
    magicLinkError: session.get("auth:error"),
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const clonedReq = request.clone();
  const formData = await clonedReq.formData();
  if (formData.get("_action") === "retry") {
    return authenticator.logout(request, { redirectTo: "/login/magic" });
  }
  const email = formData.get("email");
  const name = formData.get("name");
  //   const remember = formData.get("remember");

  try {
    honeypot.check(formData);
  } catch (error) {
    if (error instanceof SpamError) {
      return json({ errors: { email: null } }, { status: 400 });
    }
    throw error;
  }

  if (!validateEmail(email)) {
    return json({ errors: { email: "Email is invalid" } }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user && !name) {
    return json({ errors: { email: "No Account" } }, { status: 422 });
  }

  await authenticator.authenticate("email-link", request, {
    successRedirect: "/login/magic",
    failureRedirect: "/login/magic",
  });
};

export default function LoginMagic() {
  const emailRef = useRef<HTMLInputElement>(null);
  const { magicLinkSent, magicLinkEmail } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        {magicLinkSent ? (
          <>
            Successfully sent magic link{" "}
            {magicLinkEmail ? `to ${magicLinkEmail}` : null}
            <Form method="post" className="mt-8">
              <button
                type="submit"
                name="_action"
                value="retry"
                className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:bg-blue-800"
              >
                Try again
              </button>
            </Form>
          </>
        ) : (
          <Form method="post" className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  ref={emailRef}
                  id="email"
                  required
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={true}
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-describedby="email-error"
                  className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                />
              </div>
            </div>
            {actionData?.errors?.email === "No Account" ? (
              <>
                <p>
                  No account found with that email address. Please enter your
                  name to create an account.
                </p>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      aria-describedby="name-error"
                      className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                    />
                  </div>
                </div>
              </>
            ) : null}
            <HoneypotInputs />
            <button
              type="submit"
              className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:bg-blue-800"
            >
              Email a login link
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}
