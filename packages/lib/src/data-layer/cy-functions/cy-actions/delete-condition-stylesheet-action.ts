import { CyCallbackAction, StylesheetDefaults, UseDispatchCyActionProps } from "../../../types";
import { removeLeadingDot } from "../../../utils";
import cytoscape from "cytoscape";
import { refreshStylesheet } from "./helpers";

export function deleteConditionStylesheetAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps, stylesheetDefaults: StylesheetDefaults) {
  if (action.type !== "DELETE_CONDITION_STYLE") return;

  const expandCollapse = cy.expandCollapse("get");
  const selector = action.payload.item.selector;
  const className = removeLeadingDot(selector);
  const stylesheetMap = new Map(props.graphState.stylesheetMap);

  cy.batch(() => {
    const collapsedNodes = expandCollapse.expandableNodes();
    expandCollapse.expandAll();
    cy.$(selector).removeClass(className);
    expandCollapse.collapse(collapsedNodes);
  });

  stylesheetMap.delete(selector);

  if (action.payload.kind === "node") {
    const nodeConditionStyles = new Map(props.guiState.nodeConditionStyles);
    nodeConditionStyles.delete(selector);

    props.dispatchGuiAction({ type: "SET_NODE_CONDITION_STYLES", payload: nodeConditionStyles });
  }

  if (action.payload.kind === "edge") {
    const edgeConditionStyles = new Map(props.guiState.edgeConditionStyles);
    edgeConditionStyles.delete(selector);

    props.dispatchGuiAction({ type: "SET_EDGE_CONDITION_STYLES", payload: edgeConditionStyles });
  }
  props.dispatchGraphAction({ type: "SET_STYLESHEET_MAP", payload: stylesheetMap });

  requestAnimationFrame(() => {
    refreshStylesheet(props, stylesheetDefaults, stylesheetMap);
  });
}
