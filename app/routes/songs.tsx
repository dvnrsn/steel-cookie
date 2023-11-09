import { Outlet } from "@remix-run/react";

import LoginMenu from "~/components/login-menu";

export default function SongsPage() {
  return (
    <div className="page-container">
      <div className="w-full hidden md:flex">
        <LoginMenu />
      </div>
      <Outlet />
    </div>
  );
}
