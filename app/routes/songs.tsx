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
            <Ariakit.MenuButton className="flex items-center ml-auto">
              {user.firstName || user.email}
              <Ariakit.MenuButtonArrow />
            </Ariakit.MenuButton>
            <Ariakit.Menu gutter={8}>
              <Ariakit.MenuItem onClick={() => alert("Edit")}>
                User Settings
              </Ariakit.MenuItem>
              <Ariakit.MenuItem
                render={
                  <Form action="/logout" method="post">
                    <button type="submit">Logout</button>
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
