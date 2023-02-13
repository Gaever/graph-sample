import { getHiddenNode } from "./helpers";
import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function deleteNodeAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "DELETE_NODE") return;
  const expandCollapse = cy.expandCollapse("get");

  cy.batch(() => {
    const elementGuid = action.payload.elementGuid;

    const visibleElement = cy.$id(elementGuid);
    const hiddenElement = getHiddenNode(props, elementGuid);
    const element = hiddenElement || visibleElement;
    const group = expandCollapse.getParent(elementGuid) || visibleElement.parent()?.[0];

    const isGroupCollapsed = !!hiddenElement;
    const groupNodeId = group.id();

    if (props.graphState.selectedNodes.has(elementGuid)) {
      // Удаляем узел из сайдбара
      const selectedNodesData = new Map(props.graphState.selectedNodes);
      selectedNodesData.delete(elementGuid);
      props.dispatchGraphAction({
        type: "SET_SELECTED_ELEMENTS",
        payload: {
          selectedNodes: selectedNodesData,
        },
      });
    }

    if (props.graphState.selectedEdges.has(elementGuid)) {
      // Удаляем связь из сайдбара
      const selectedEdgesData = new Map(props.graphState.selectedEdges);
      selectedEdgesData.delete(elementGuid);
      props.dispatchGraphAction({
        type: "SET_SELECTED_ELEMENTS",
        payload: {
          selectedEdges: selectedEdgesData,
        },
      });
    }

    if (hiddenElement) {
      // Удаляем элемент, скрытый в группе. Сначала разворачиваем группу, удаляем элемент, сворачиваем обратно
      expandCollapse.expand(group);
      element.remove();
      expandCollapse.collapse(group);
    } else {
      // Удаляем элемент
      element.remove();
      if (!isGroupCollapsed && props.graphState.selectedNodes.size < 1) {
        // При удалении узла в развернутой группе может возникнуть
        // база cytoscape-expand-collapse плагина:
        // иконка "свернуть" не обновит свое положение и "подвиснет" в воздухе.
        // Принудительно обновляем ее, свернув и развернув группу.
        expandCollapse.collapse(group);
        expandCollapse.expand(group);
      }
    }

    const collapsedChildrenLength = hiddenElement ? group.data()?.collapsedChildren?.length || 0 : undefined;
    const nodesInGroup = (collapsedChildrenLength !== undefined && collapsedChildrenLength) || group.children().length;

    if (groupNodeId && nodesInGroup < 1) {
      // Удалили последний узел в группе. Удаляем группу.
      group.remove();
    }

    if (groupNodeId && nodesInGroup < 1 && props.graphState.selectedNodeGroups.has(groupNodeId)) {
      // Удалили группу. Эта группа была отображена в сайдбаре. Удаляем из сайдбара.
      const selectedGroups = new Map(props.graphState.selectedNodeGroups);
      selectedGroups.delete(groupNodeId);

      props.dispatchGraphAction({
        type: "SET_SELECTED_ELEMENTS",
        payload: {
          selectedNodeGroups: selectedGroups,
        },
      });
    }

    if (groupNodeId && nodesInGroup >= 1 && props.graphState.selectedNodeGroups.has(groupNodeId)) {
      // Группа с удаленным элементом была отображена в сайдбаре. Удаляем элемент секции выбранной группы в сайдбаре.
      const selectedGroups = new Map(props.graphState.selectedNodeGroups);
      selectedGroups.set(groupNodeId, cy.$id(groupNodeId));

      props.dispatchGraphAction({
        type: "SET_SELECTED_ELEMENTS",
        payload: {
          selectedNodeGroups: selectedGroups,
        },
      });
    }
  });
}
