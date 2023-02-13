import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function deleteNodeGroupAndChildrenAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "DELETE_NODE_GROUP_AND_CHILDREN") return;
  // Расформировать группу и удалить дочерние узлы
  cy.batch(() => {
    const group = cy.$id(action.payload.groupId);
    const col = cy.collection();
    col.merge(group);
    col.merge(group.children());
    col.unselect().remove();
  });
}
