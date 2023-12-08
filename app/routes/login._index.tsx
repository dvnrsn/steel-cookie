import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, useSearchParams } from "@remix-run/react";
import { FaFacebook, FaMagic } from "react-icons/fa/index.js";
import { MdEmail } from "react-icons/md/index.js";
import { SocialsProvider } from "remix-auth-socials";
import { HoneypotInputs } from "remix-utils/honeypot/react";

import { authenticator } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
};

export const meta: MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/songs";

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Link
          to="magic"
          className="w-full flex items-center justify-center rounded bg-blue-500 px-4 py-3 text-white hover:bg-blue-600 focus:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:bg-blue-800"
        >
          <FaMagic className="mr-2" size={24} />
          Login with Magic Link
        </Link>
        <HoneypotInputs />
        <Form
          action={`/auth/${SocialsProvider.FACEBOOK}`}
          method="post"
          className="mt-8"
        >
          <button className="flex items-center justify-center w-full rounded bg-blue-500 px-4 py-3 text-white hover:bg-blue-600 focus:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:bg-blue-800">
            <FaFacebook className="mr-2" size={24} />
            Login with Facebook
          </button>
          <HoneypotInputs />
        </Form>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Link
          to="email-pass"
          className="flex items-center justify-center mt-8 w-full rounded bg-blue-500 px-4 py-3 text-white hover:bg-blue-600 focus:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:bg-blue-800"
        >
          <MdEmail className="mr-2" size={24} />
          Login with Email/Pass
        </Link>
      </div>
    </div>
  );
}
