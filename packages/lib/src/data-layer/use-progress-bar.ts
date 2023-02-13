import { useContext } from "react";
import { appStateCtx } from "./app-state-provider";

export function useProgressBar() {
  const { dispatchGuiAction } = useContext(appStateCtx);

  return {
    start: () => {
      dispatchGuiAction({ type: "TOGGLE_PROGRESS_BAR", payload: true });
    },
    done: () => {
      dispatchGuiAction({ type: "TOGGLE_PROGRESS_BAR", payload: false });
    },
  };
}
