import { CSS_PREFIX_USER_STYLE } from "../../cy-constants";
import { pickNodeLabel } from "../../format-response";
import { CyNode, StylesheetDefaults, StylesheetMap, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import _set from "lodash/set";
export const fitPadding = 80;

export function setUnsaved(props: UseDispatchCyActionProps) {
  props.dispatchGuiAction({ type: "SET_IS_GRAPH_UNSAVED", payload: true });
}

export function getHiddenNode(args: UseDispatchCyActionProps, elementGuid: string) {
  if (!args.cy) return;

  const expandCollapse = args.cy.expandCollapse("get");
  const parentNode = expandCollapse.getParent(elementGuid);
  const hiddenElement = (Array.from(expandCollapse.getCollapsedChildren(parentNode) || []) as cytoscape.CollectionReturnValue[]).find((element) => element.id() === elementGuid);

  return hiddenElement;
}

// export function getHiddenEdge(args: UseDispatchCyActionProps, edgeGuid: string) {
//   if (!args.cy) return;

//   const expandCollapse = args.cy.expandCollapse("get");
//   const parentNode = expandCollapse.getParent(edgeGuid);
//   const hiddenElement = (Array.from(expandCollapse.getCollapsedChildren(parentNode) || []) as cytoscape.CollectionReturnValue[]).find((element) => element.id() === elementGuid);

//   return hiddenElement;
// }

export function updateGroupByElementId(args: UseDispatchCyActionProps, elementId: string) {
  if (!args.cy) return;

  const element = args.cy.$id(elementId);
  const expandCollapse = args.cy.expandCollapse("get");
  const selectedGroups = new Map(args.graphState.selectedNodeGroups);
  const parentNode = expandCollapse.getParent(element.id());
  const group = parentNode || element.parent()[0];
  selectedGroups.set(group.id(), group);

  args.dispatchGraphAction({
    type: "SET_SELECTED_ELEMENTS",
    payload: {
      selectedNodeGroups: selectedGroups,
    },
  });
}

export function updateElementItemDataInGraphState(args: UseDispatchCyActionProps, element: cytoscape.CollectionReturnValue, data: any) {
  if (args.graphState.selectedNodes.has(element.id())) {
    // Обновляем данные в сайдбаре для выбранного узла

    // Выбран и узел и группа, внутри которого находится измененный узел
    // ИЛИ только узел
    // ИЛИ много узлов, среди которых измененный

    const selectedNodes = new Map(args.graphState.selectedNodes);
    selectedNodes.set(element.id(), element);
    args.dispatchGraphAction({
      type: "SET_SELECTED_ELEMENTS",
      payload: {
        selectedNodes,
      },
    });
  }

  if (args.graphState.selectedEdges.has(element.id())) {
    // Обновляем данные в сайдбаре для выбранной связи
    const selectedEdges = new Map(args.graphState.selectedEdges);
    selectedEdges.set(element.id(), element);

    args.dispatchGraphAction({
      type: "SET_SELECTED_ELEMENTS",
      payload: {
        selectedEdges,
      },
    });
  }

  if (args.graphState.selectedNodeGroups.has(element.data().parent)) {
    // Выбрана группа, внутри которого находится измененный элемент.
    // Обновляем данные этой группы
    updateGroupByElementId(args, element.id());
  }
}

export function refreshStylesheet(args: UseDispatchCyActionProps, stylesheetDefaults: StylesheetDefaults, stylesheetMap?: StylesheetMap) {
  if (!args.cy) return;
  args.cy.style([
    ...stylesheetDefaults.defaultStylesheet,
    ...Array.from(stylesheetMap?.values?.() || args.graphState.stylesheetMap.values()),
    ...stylesheetDefaults.selectedOverrides,
  ]);
}

export function updateElementDisplayedLabel(newData: CyNode["data"]) {
  const defaultLabel = newData.payload?.label;
  const labelTemplate = newData.payload?.label_template || "";
  const attributes = newData.payload?.data || [];

  _set(newData, "label", pickNodeLabel(defaultLabel, labelTemplate, attributes, newData.id));
}

export function noUserClasses(element: cytoscape.SingularElementReturnValue | cytoscape.SingularElementArgument) {
  return (element.classes() as unknown as string[]).filter((className) => className.indexOf(CSS_PREFIX_USER_STYLE) === -1);
}

export function getUserClass(element: cytoscape.SingularElementReturnValue | cytoscape.SingularElementArgument) {
  return (element.classes() as unknown as string[]).find((className) => className.indexOf(CSS_PREFIX_USER_STYLE) !== -1);
}
