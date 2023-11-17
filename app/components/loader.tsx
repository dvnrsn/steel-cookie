import { useEffect, useState } from "react";
import { GiCowboyBoot } from "react-icons/gi/index.js";
export function Loader({ visible }: { visible?: boolean }) {
  const [isVisible, setIsVisible] = useState<undefined | boolean>();
  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(visible), 300);
    if (!visible) {
      clearTimeout(timeout);
      setIsVisible(false);
    }
    return () => clearTimeout(timeout);
  }, [visible]);
  return (
    <div className={`p-2 ${!isVisible ? "invisible" : ""}`}>
      <GiCowboyBoot className="cowboy-boot opacity-70" size={24} />{" "}
    </div>
  );
}
