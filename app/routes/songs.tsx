import * as Ariakit from "@ariakit/react";
import { Link, Outlet } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export default function SongsPage() {
  const user = useOptionalUser();

  return (
    <div className="page-container">
      {user ? (
        <div className="w-full">
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
                  <Link className="w-full block" to="/logo">
                    Logout
                  </Link>
                }
              ></Ariakit.MenuItem>
            </Ariakit.Menu>
          </Ariakit.MenuProvider>
        </div>
      ) : (
        <Link to="/login">Login</Link>
      )}

      <Outlet />
    </div>
  );
}
