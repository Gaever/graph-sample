import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function breakEdgehandlesAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "BREAK_EDGEHANDLE") return;

  const eh = cy.scratch("_app").edgehandlesInstance;
  eh.stop();
}
