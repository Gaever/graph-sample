import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function selectAllAction(cy: cytoscape.Core, action: CyCallbackAction, _props: UseDispatchCyActionProps) {
  if (action.type !== "SELECT_ALL") return;

  cy.elements().select();
}
