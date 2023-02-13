import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function aSearchAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "A_SEARCH") return;

  const selectedNodes = cy.$("node:selected[id !*= 'drawing']");

  if (selectedNodes.length !== 2) return;
  const root = selectedNodes[0];
  const goal = selectedNodes[1];

  if (root.children().length > 0 || goal.children().length > 0) return;

  const aStar = cy.elements().aStar({ root: selectedNodes[0], goal: selectedNodes[1] });
  aStar.path.select();
}
