import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import { isCollapsedGroup } from "../../../utils";
import cytoscape from "cytoscape";
import _set from "lodash/set";

export function removeNodeGroupAction(cy: cytoscape.Core, action: CyCallbackAction, _props: UseDispatchCyActionProps) {
  if (action.type !== "REMOVE_NODE_GROUP") return;
  const expandCollapse = cy.expandCollapse("get");

  // Расформировать группу, не удаляя дочерние узлы
  cy.batch(() => {
    const group = cy.$id(action.payload.groupId);
    if (isCollapsedGroup(group)) {
      expandCollapse.expand(group);
    }
    group.unselect();
    const children = group.children();
    children.move({ parent: null });
    children.forEach((item) => {
      const newData = item.data();
      _set(newData, "payload.parent.id", undefined);
      item.data(newData);
    });
    children.select();
    group.remove();
  });
}
