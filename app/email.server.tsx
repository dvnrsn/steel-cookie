import { renderToString } from "react-dom/server";
import type { SendEmailFunction } from "remix-auth-email-link";
import { Resend } from "resend";

import type { User } from "~/models/user.server";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail: SendEmailFunction<User> = async (options) => {
  const body = renderToString(
    <p>
      Hi {options.user?.firstName || "there"},<br />
      <br />
      <a href={options.magicLink}>Click here to login on westerner.dance</a>
    </p>,
  );

  await resend.emails.send({
    from: "system@westerner.dance",
    to: options.emailAddress,
    subject: "Westerner Dance Login",
    html: body,
  });
};
