import { useEffect, useContext } from "react";
import { appStateCtx } from "./app-state-provider";

function useDeeplink(deepLink: string | undefined) {
  const { dispatchGuiAction } = useContext(appStateCtx);

  useEffect(() => {
    switch (deepLink) {
      case "search":
        dispatchGuiAction({ type: "SET_SIDEBAR_TAB_INDEX", payload: 1 });
        dispatchGuiAction({ type: "TOGGLE_SHOW_DATA_EXPLORER", payload: true });
        break;
    }
  }, [deepLink]);
}

export default useDeeplink;
