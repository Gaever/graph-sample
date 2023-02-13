import { getHiddenNode } from "./helpers";
import { Field } from "../../../http/api";
import { CyCallbackAction, OnAddNodeAttributePayload, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import _set from "lodash/set";
import _snakeCase from "lodash/snakeCase";
import { setNewAttributeFormatVariant } from "./change-node-attribute-action";

export function addNodeAttributeAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "ADD_NODE_ATTRIBUTE") return;
  const expandCollapse = cy.expandCollapse("get");

  const elementGuid = action.payload.elementGuid;
  const originElementId = elementGuid;

  const element = getHiddenNode(props, elementGuid) || cy.$id(elementGuid);
  let elements: cytoscape.CollectionReturnValue = element;

  const isBatch = action.payload.data.isAddToAllNodesWithSameSystemId;

  const selectedNodes = new Map(props.graphState.selectedNodes);
  const selectedNodeGroups = new Map(props.graphState.selectedNodeGroups);

  let isSelectedNodesDataDirty = false;
  let isSelectedGroupsDirty = false;

  function addElement(args: { doSkipOriginElement: boolean; element: cytoscape.SingularElementReturnValue; data: OnAddNodeAttributePayload }) {
    const currentElement = args.element;

    if (args.doSkipOriginElement && currentElement.id() === originElementId) return;

    const group = expandCollapse.getParent(currentElement.id());
    const isExpandable = expandCollapse.isExpandable(group);

    if (isExpandable) expandCollapse.expand(group);

    const elementAttributes = (currentElement.data()?.payload?.data || []) as Field[];

    const newElementData = currentElement.data();
    const newAttributeKey = `key_${_snakeCase(args.data.label)}`;

    if (elementAttributes.some((item) => item.key === newAttributeKey)) return;

    elementAttributes.push({
      key: newAttributeKey,
      label: args.data.label,
      value: args.data.value,
    });

    _set(newElementData, "payload.data", elementAttributes);

    setNewAttributeFormatVariant(newElementData, elementAttributes.length - 1, args.data.value, args.data.formatVariant);

    currentElement.data(newElementData);

    if (props.graphState.selectedNodes.has(currentElement.id())) {
      isSelectedNodesDataDirty = true;
      selectedNodes.set(currentElement.id(), currentElement);
    }

    if (props.graphState.selectedNodeGroups.has(currentElement.data().parent)) {
      isSelectedGroupsDirty = true;
      selectedNodeGroups.set(group.id(), group);
    }

    if (isExpandable) expandCollapse.collapse(group);
  }

  cy.batch(() => {
    if (isBatch) {
      // Применяем изменения ко всем элементам с таким же system_id
      const selector = `[system_id = '${element.data("system_id")}']`;
      elements = cy.$(selector);

      const collapsedGroups = expandCollapse.expandableNodes();
      (Array.from(collapsedGroups) as cytoscape.SingularElementReturnValue[]).forEach((item) => {
        // Выбираем элементы из свернутых групп
        const collapsedChildren = item.data().collapsedChildren as cytoscape.NodeCollection;
        const collapsedChildrenWithSameSystemId = collapsedChildren.nodes(selector);
        elements.merge(collapsedChildrenWithSameSystemId);
      });
    }

    addElement({
      element,
      data: action.payload.data,
      doSkipOriginElement: false,
    });

    elements.forEach((element) => {
      addElement({
        element,
        data: action.payload.data,
        doSkipOriginElement: true,
      });
    });
  });

  if (isSelectedNodesDataDirty || isSelectedGroupsDirty) {
    props.dispatchGraphAction({
      type: "SET_SELECTED_ELEMENTS",
      payload: {
        ...(isSelectedNodesDataDirty ? { selectedNodes } : null),
        ...(isSelectedGroupsDirty ? { selectedNodeGroups } : null),
      },
    });
  }
}
