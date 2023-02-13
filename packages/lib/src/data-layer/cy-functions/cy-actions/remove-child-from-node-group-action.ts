import { getHiddenNode } from "./helpers";
import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import _set from "lodash/set";

export function removeChildFromNodeGroupAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "REMOVE_CHILD_FROM_NODE_GROUP") return;
  const expandCollapse = cy.expandCollapse("get");

  // Исключить элемент из группы, в которой они состоят
  cy.batch(() => {
    const nodeData = action.payload.nodesData?.[0];
    if (!nodeData) return;

    const elementGuid = nodeData.id || "";
    const groupId = action.payload.groupId;
    const hiddenElement = getHiddenNode(props, elementGuid);
    const group = cy.$id(groupId);

    const isGroupCollapsed = !!hiddenElement;

    if (isGroupCollapsed) {
      expandCollapse.expand(group);
    }

    const visibleElement = cy.$id(elementGuid);
    visibleElement.move({ parent: null });
    const newData = visibleElement.data();
    _set(newData, "payload.parent.id", undefined);
    visibleElement.data(newData);

    if (props.graphState.selectedNodeGroups.has(groupId)) {
      const collapsedChildrenLength = group.data()?.collapsedChildren?.length || 0;
      const nodesInGroup = (collapsedChildrenLength !== undefined && collapsedChildrenLength) || group.children().length;

      const selectedGroups = new Map(props.graphState.selectedNodeGroups);

      if (nodesInGroup < 1) {
        group.remove();
        selectedGroups.delete(groupId);
      } else {
        selectedGroups.set(groupId, cy.$id(groupId));
      }

      props.dispatchGraphAction({
        type: "SET_SELECTED_ELEMENTS",
        payload: { selectedNodeGroups: selectedGroups },
      });
    }

    if (isGroupCollapsed && !group.removed()) {
      expandCollapse.collapse(group);
    }

    if (
      group.selected() &&
      !isGroupCollapsed &&
      props.graphState.selectedNodeGroups.size === 1 &&
      props.graphState.selectedEdges.size === 0 &&
      props.graphState.selectedNodes.size === 0
    ) {
      group.unselect().select();
    }
  });
}
