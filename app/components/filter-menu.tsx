import * as Ariakit from "@ariakit/react";
import { useSearchParams } from "@remix-run/react";
import { useRef, useState } from "react";
import { FiFilter } from "react-icons/fi/index.js";

export default function FilterMenu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterRef = useRef<HTMLInputElement>(null);
  const [incomplete, setIncomplete] = useState(
    searchParams.get("filter") === "incomplete",
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (!incomplete) {
        prev.set("filter", "incomplete");
      } else {
        prev.delete("filter");
      }
      return prev;
    });
    setIncomplete((prev) => !prev);
  };

  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton className="items-center justify-center w-11 ml-auto md:h-[revert] md:w-[revert] flex dark:hover:bg-slate-700 hover:bg-slate-200 rounded-lg p-2 relative">
        <FiFilter size={24} />
        {incomplete ? (
          <div className="absolute top-0 rounded-lg right-0 bg-red-700 h-4 w-4 translate-x-2 -translate-y-2 text-xs">
            1
          </div>
        ) : null}
      </Ariakit.MenuButton>
      <Ariakit.Menu
        gutter={8}
        className="bg-white dark:bg-slate-800 z-10 relative p-2 rounded-lg border-slate-100 border shadow-md"
      >
        <Ariakit.MenuItem onClick={handleClick}>
          <label className="w-full h-full menu-item text-left rounded flex items-center">
            <input
              ref={filterRef}
              type="checkbox"
              name="filter"
              checked={incomplete}
              onChange={() => undefined}
              className="mr-2 cursor-pointer"
            />
            Incomplete
          </label>
        </Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}