import { CSS_AGGREGATIONS, CSS_AGGREGATIONS_HIDDEN, CSS_CONNECTIONS_COUNT, CSS_CONNECTIONS_COUNT_HIDDEN, CSS_FILTERED_HIDDEN, CSS_HIDDEN } from "../../cy-constants";
import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function showElement(element: cytoscape.SingularElementArgument) {
  element.removeClass(CSS_HIDDEN);

  if (element.hasClass(CSS_AGGREGATIONS_HIDDEN)) {
    element.removeClass(CSS_AGGREGATIONS_HIDDEN);
    element.addClass(CSS_AGGREGATIONS);
  }

  if (element.hasClass(CSS_CONNECTIONS_COUNT_HIDDEN)) {
    element.removeClass(CSS_CONNECTIONS_COUNT_HIDDEN);
    element.addClass(CSS_CONNECTIONS_COUNT);
  }

  if (element.hasClass(CSS_FILTERED_HIDDEN)) {
    element.removeClass(CSS_FILTERED_HIDDEN);
  }
}

export function showHiddenElementsAction(_cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "SHOW_HIDDEN_ELEMENTS") return;

  if (action.payload === "nodes") {
    Array.from(props.graphState.hiddenNodes.values()).forEach(showElement);
  }
  if (action.payload === "edges") {
    Array.from(props.graphState.hiddenEdges.values()).forEach(showElement);
  }
  if (action.payload === "node-groups") {
    Array.from(props.graphState.hiddenNodeGroups.values()).forEach(showElement);
  }
  if (action.payload === "edge-groups") {
    Array.from(props.graphState.hiddenEdgeGroups.values()).forEach(showElement);
  }
}
