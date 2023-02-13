import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function addNodesToGroupAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "ADD_NODES_TO_GROUP") return;

  if (props.graphState.selectedNodeGroups.size > 1) return;

  const expandCollapse = cy.expandCollapse("get");

  const groupId = props.graphState.selectedNodeGroups.keys().next().value;
  const group = props.graphState.selectedNodeGroups.values().next().value;
  const nodesToAdd = Array.from(props.graphState.selectedNodes.values()).filter((item) => item.parent().length < 1);

  if (nodesToAdd.length < 1) return;

  cy.batch(() => {
    const isExpandable = expandCollapse.isExpandable(group);
    if (isExpandable) expandCollapse.expand(group);
    nodesToAdd.forEach((node) => {
      cy.$id(node.id()).move({ parent: groupId });
    });
    if (isExpandable) expandCollapse.collapse(group);
  });

  const selectedGroups = new Map(props.graphState.selectedNodeGroups);
  selectedGroups.set(groupId, cy.$id(groupId));

  props.dispatchGraphAction({ type: "SET_SELECTED_ELEMENTS", payload: { selectedNodeGroups: selectedGroups, grouppableSelectedNodes: new Set() } });
}
