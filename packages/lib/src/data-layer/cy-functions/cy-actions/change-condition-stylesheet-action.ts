import { CyCallbackAction, StylesheetDefaults, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import { refreshStylesheet } from "./helpers";

export function changeConditionStylesheetAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps, stylesheetDefaults: StylesheetDefaults) {
  if (action.type !== "CHANGE_CONDITION_STYLE") return;

  const stylesheetMap = new Map(props.graphState.stylesheetMap);
  const selector = action.payload.item.selector;
  const style = action.payload.style;
  const stylesheet: cytoscape.StylesheetStyle = {
    style,
    selector,
  };
  stylesheetMap.set(selector, stylesheet);

  if (action.payload.kind === "node") {
    const nodeConditionStylesheets = new Map(props.guiState.nodeConditionStyles);
    nodeConditionStylesheets.set(selector, action.payload.item);

    props.dispatchGuiAction({ type: "SET_NODE_CONDITION_STYLES", payload: nodeConditionStylesheets });
  }

  if (action.payload.kind === "edge") {
    const edgeConditionStylesheets = new Map(props.guiState.edgeConditionStyles);
    edgeConditionStylesheets.set(selector, action.payload.item);

    props.dispatchGuiAction({ type: "SET_EDGE_CONDITION_STYLES", payload: edgeConditionStylesheets });
  }
  props.dispatchGraphAction({ type: "SET_STYLESHEET_MAP", payload: stylesheetMap });

  requestAnimationFrame(() => {
    refreshStylesheet(props, stylesheetDefaults, stylesheetMap);
  });
}
