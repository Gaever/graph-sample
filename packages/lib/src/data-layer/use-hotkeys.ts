import { AppStateCtx, CyCallback } from "../types";
import { useHotkeys as useHotkeysHook } from "react-hotkeys-hook";
import { disableMergeMode } from "./cy-functions/cy-node-merge";

export default function useHotkeys(props: {
  dispatchCyAction: CyCallback;
  dispatchGuiAction: AppStateCtx["dispatchGuiAction"];
  cy: AppStateCtx["cy"];
  guiState: AppStateCtx["guiState"];
  refreshLegend?: () => void;
  enabledKeys?: Record<string, boolean>;
}) {
  useHotkeysHook(
    "backspace,del",
    (event) => {
      if (props?.enabledKeys && !(props?.enabledKeys?.backspace || props?.enabledKeys?.del)) {
        return true;
      }

      props.dispatchCyAction({ type: "DELETE_SELECTED_ELEMENTS" });

      event.preventDefault();
      event.stopPropagation();

      props?.refreshLegend?.();

      return false;
    },
    {},
    [props.dispatchCyAction, props.refreshLegend, props.guiState]
  );

  useHotkeysHook(
    "cmd+a,ctrl+a",
    (event) => {
      if (props?.enabledKeys && !(props?.enabledKeys?.["cmd+a"] || props?.enabledKeys?.["ctrl+a"])) {
        return true;
      }

      props.dispatchCyAction({ type: "SELECT_ALL" });

      event.preventDefault();
      event.stopPropagation();
      return false;
    },
    {},
    [props.dispatchCyAction]
  );

  useHotkeysHook(
    "g",
    (event) => {
      if (props?.enabledKeys && !props?.enabledKeys?.["g"]) {
        return true;
      }

      props.dispatchCyAction({ type: "CREATE_NODE_GROUP" });

      event.preventDefault();
      event.stopPropagation();
      return false;
    },
    {},
    [props.dispatchCyAction]
  );

  useHotkeysHook(
    "c",
    (event) => {
      if (props?.enabledKeys && !props?.enabledKeys?.["c"]) {
        return true;
      }

      props.dispatchCyAction({ type: "ENABLE_EDGEHANDLE" });

      event.preventDefault();
      event.stopPropagation();
      return false;
    },
    {},
    [props.dispatchCyAction]
  );

  useHotkeysHook(
    "x",
    (event) => {
      if (props?.enabledKeys && !props?.enabledKeys?.["x"]) {
        return true;
      }

      props.dispatchCyAction({ type: "CREATE_EDGE_GROUP", payload: "collapse-by-system-id" });

      event.preventDefault();
      event.stopPropagation();
      return false;
    },
    {},
    [props.dispatchCyAction]
  );

  useHotkeysHook(
    "b",
    (event) => {
      if (props?.enabledKeys && !props?.enabledKeys?.["b"]) {
        return true;
      }

      props.dispatchGuiAction({ type: "TOGGLE_SHOW_DATA_EXPLORER", payload: !props.guiState.isDataExplorerOpen });

      event.preventDefault();
      event.stopPropagation();
      return false;
    },
    {},
    [props.dispatchCyAction]
  );

  useHotkeysHook(
    "esc",
    (event) => {
      if (props?.enabledKeys && !props?.enabledKeys?.["esc"]) {
        return true;
      }

      props.dispatchCyAction({ type: "BREAK_EDGEHANDLE" });
      if (props.cy) {
        disableMergeMode(props.cy);
      }

      event.preventDefault();
      event.stopPropagation();
      return false;
    },
    {},
    [props.dispatchCyAction, props.cy]
  );
}
