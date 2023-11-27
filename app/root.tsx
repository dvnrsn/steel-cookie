import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  ShouldRevalidateFunction,
  useLoaderData,
} from "@remix-run/react";
import { HoneypotProvider } from "remix-utils/honeypot/react";

import stylesheet from "~/tailwind.css";

import { honeypot } from "./honeypot.server";
import { authenticator } from "./session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({
    user: await authenticator.isAuthenticated(request),
    honeypotInputProps: honeypot.getInputProps(),
  });
};

export const shouldRevalidate: ShouldRevalidateFunction = ({
  nextUrl,
  defaultShouldRevalidate,
}) => {
  if (nextUrl?.pathname === "/songs") {
    // lot of changing of URL here and we don't need extra requests for the user/honeypot
    return false;
  } else return defaultShouldRevalidate;
};

export default function App() {
  const { honeypotInputProps } = useLoaderData<typeof loader>();
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <HoneypotProvider {...honeypotInputProps}>
          <Outlet />
        </HoneypotProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
