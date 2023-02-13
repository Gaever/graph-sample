import { CSS_AGGREGATIONS, CSS_AGGREGATIONS_HIDDEN, CSS_CONNECTIONS_COUNT, CSS_CONNECTIONS_COUNT_HIDDEN, CSS_HIDDEN } from "../../cy-constants";
import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function hideElement(element: cytoscape.SingularElementArgument) {
  element.addClass(CSS_HIDDEN);

  if (element.hasClass(CSS_AGGREGATIONS)) {
    element.removeClass(CSS_AGGREGATIONS);
    element.addClass(CSS_AGGREGATIONS_HIDDEN);
  }

  if (element.hasClass(CSS_CONNECTIONS_COUNT)) {
    element.removeClass(CSS_CONNECTIONS_COUNT);
    element.addClass(CSS_CONNECTIONS_COUNT_HIDDEN);
  }
}

export function hideSelectedElementsAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "HIDE_SELECTED_ELEMENTS") return;

  if (action.payload === "nodes") {
    Array.from(props.graphState.selectedNodes.values()).forEach(hideElement);
  }
  if (action.payload === "edges") {
    Array.from(props.graphState.selectedEdges.values()).forEach(hideElement);
  }
  if (action.payload === "node-groups") {
    Array.from(props.graphState.selectedNodeGroups.values()).forEach(hideElement);
  }
  if (action.payload === "edge-groups") {
    Array.from(props.graphState.selectedEdgeGroups.values()).forEach(hideElement);
  }
  requestAnimationFrame(() => {
    cy.elements().unselect();
  });
}
