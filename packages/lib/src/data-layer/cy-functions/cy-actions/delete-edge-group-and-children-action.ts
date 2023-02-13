import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function deleteEdgeGroupAndChildrenAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "DELETE_EDGE_GROUP_AND_CHILDREN") return;
  // Расформировать группу и удалить дочерние связи
  const group = cy.$id(action.payload.groupId);
  group.unselect().remove();
}
