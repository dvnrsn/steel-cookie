import * as Ariakit from "@ariakit/react";
import { Form, Link, Outlet } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export default function SongsPage() {
  const user = useOptionalUser();

  return (
    <div className="page-container">
      <div className="w-full flex">
        {user ? (
          <Ariakit.MenuProvider>
            <Ariakit.MenuButton className="flex items-center ml-auto h-10 md:h-[revert]">
              {user.firstName || user.email}
              <Ariakit.MenuButtonArrow />
            </Ariakit.MenuButton>
            <Ariakit.Menu
              gutter={8}
              className="bg-white z-10 relative p-2 rounded-lg border-slate-100 border shadow-md"
            >
              <Ariakit.MenuItem
                onClick={() => alert("Edit")}
                className="menu-item"
              >
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
          <Link className="ml-auto" to="/login">
            Login
          </Link>
        )}
      </div>

      <Outlet />
    </div>
  );
}
