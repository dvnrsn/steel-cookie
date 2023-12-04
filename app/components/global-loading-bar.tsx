import { useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";

export function GlobalLoadingBar() {
  const navigation = useNavigation();

  const loadingBarRef = useRef<LoadingBarRef>(null);
  const loaderStarted = useRef(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (navigation.state !== "idle") {
      timeout = setTimeout(() => {
        if (!loadingBarRef.current) return;
        loaderStarted.current = true;
        loadingBarRef.current.continuousStart();
      }, 400);
    } else if (loaderStarted.current == true) {
      loaderStarted.current = false;
      loadingBarRef.current?.complete();
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [navigation.state]);
  return <LoadingBar ref={loadingBarRef} />;
}
