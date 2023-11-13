import * as Ariakit from "@ariakit/react";
import { Form, Link } from "@remix-run/react";
import { AiOutlineMenu } from "react-icons/ai";

import { useOptionalUser } from "~/utils";

export default function LoginMenu() {
  const user = useOptionalUser();

  return user ? (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton className="items-center justify-center w-11 ml-auto md:h-[revert] md:w-[revert] flex">
        <span className="md:hidden">
          <AiOutlineMenu size={24} />
        </span>
        <span className="hidden md:flex items-center">
          {user.firstName || user.email}
          <Ariakit.MenuButtonArrow />
        </span>
      </Ariakit.MenuButton>
      <Ariakit.Menu
        gutter={8}
        className="bg-white dark:bg-slate-800 z-10 relative p-2 rounded-lg border-slate-100 border shadow-md"
      >
        <Ariakit.Heading className="p-2 text-gray-400 dark:text-gray-500 md:hidden">
          {user.firstName || user.email}
        </Ariakit.Heading>
        <Ariakit.MenuItem onClick={() => alert("Edit")} className="menu-item">
          User Settings
        </Ariakit.MenuItem>
        <Ariakit.MenuItem
          render={
            <Form action="/logout" method="post" className="rounded">
              <button
                type="submit"
                className="w-full h-full menu-item text-left"
              >
                Logout
              </button>
            </Form>
          }
        ></Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  ) : (
    <Link className="h-full flex items-center md:ml-auto" to="/login">
      Login
    </Link>
  );
}
