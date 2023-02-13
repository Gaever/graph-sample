import { getHiddenNode, updateElementDisplayedLabel, updateElementItemDataInGraphState } from "./helpers";
import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function enableEdgehandlesAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "ENABLE_EDGEHANDLE") return;

  if (props.graphState.selectedNodes.size !== 1) return;
  const selectedNode = Array.from(props.graphState.selectedNodes.values())[0];

  const eh = cy.scratch("_app").edgehandlesInstance;
  eh.start(selectedNode);
}
