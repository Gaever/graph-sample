import { CSS_COMPOUND_HIDE_ICON, CSS_DEFAULT_GROUP_ICON } from "../../cy-constants";
import { setUnsaved } from "./helpers";
import { createCompoundNodeId } from "../../format-response";
import { AppStateCtx, CyCallbackAction, CyGroup, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import _set from "lodash/set";

export function createNodeGroupAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "CREATE_NODE_GROUP") return;
  // Сформировать группу из выбранных узлов.
  // Узлы, которые уже состоят в другой группе, а также узлы других групп, игнорируются.

  if (props.graphState.grouppableSelectedNodes.size < 2) return;

  const newGroupId = createCompoundNodeId();
  const groupsCount = cy.$("[id *= 'group']").length;
  const groupName = `Группа ${groupsCount + 1}`;
  const compoundNode: CyGroup = {
    data: {
      id: newGroupId,
      label: groupName,
      payload: {
        label: groupName,
      },
      collapsed: false,
    },
    classes: `${CSS_DEFAULT_GROUP_ICON} ${CSS_COMPOUND_HIDE_ICON}`,
  };
  const selectedNodes: AppStateCtx["graphState"]["selectedNodes"] = new Map(props.graphState.selectedNodes);

  cy.batch(() => {
    const createdCompoundNode = cy.add(compoundNode);

    selectedNodes.forEach((item) => {
      const nodeData = item.data();
      if (!nodeData.parent && !nodeData?.collapsedChildren) {
        const el = cy.$id(nodeData.id || "");
        const newData = el.data();
        _set(newData, "payload.group.id", newGroupId);

        el.data(newData).move({ parent: newGroupId }).unselect();

        selectedNodes.set(nodeData.id || "", el);
      }
    });

    createdCompoundNode.select();
  });

  props.dispatchGraphAction({
    type: "SET_SELECTED_ELEMENTS",
    payload: {
      selectedNodes,
    },
  });
  setUnsaved(props);
}
