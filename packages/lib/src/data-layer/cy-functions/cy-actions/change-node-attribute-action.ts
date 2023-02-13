import cytoscape from "cytoscape";
import _set from "lodash/set";
import { Field } from "../../../http/api";
import { CyCallbackAction, CyNode, OnChangeAttributePayload, UseDispatchCyActionProps } from "../../../types";
import { formatString } from "../../../utils";
import { elementsToAttributesMap } from "../../format-response";
import { getHiddenNode, updateElementDisplayedLabel } from "./helpers";

export function changeNodeAttributeAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "CHANGE_NODE_ATTRIBUTE") return;
  const expandCollapse = cy.expandCollapse("get");

  // Изменить поле из данных элемента - узела или связи, НЕ группы.
  // Изменить данные узлов и связей внутри группы - ок.
  const elementGuid = action.payload.elementGuid;
  const originElementId = elementGuid;

  const element = getHiddenNode(props, elementGuid) || cy.$id(elementGuid);
  let elements: cytoscape.CollectionReturnValue = element;

  const changedFieldKey = element.data("payload")?.data?.[action.payload.attributeIndex]?.key;

  const isBatch = action.payload.data.isApplyLabelToAllNodesWithSameSystemId || action.payload.data.isApplyFormatVariantToAllNodesWithSameSystemId;

  const selectedNodes = new Map(props.graphState.selectedNodes);
  const selectedEdges = new Map(props.graphState.selectedEdges);
  const selectedNodeGroups = new Map(props.graphState.selectedNodeGroups);

  let isSelectedNodesDataDirty = false;
  let isSelectedEdgesDataDirty = false;
  let isSelectedGroupsDirty = false;
  let isAttributeMapDirty = false;

  function changeElement(args: {
    doSkipOriginElement: boolean;
    element: cytoscape.SingularElementReturnValue;
    data: OnChangeAttributePayload;
    doChangeLabel?: boolean;
    doChangeFormatVariant?: boolean;
    doChangeValue?: boolean;
  }) {
    const currentElement = args.element;

    if (args.doSkipOriginElement && currentElement.id() === originElementId) return;

    const group = expandCollapse.getParent(currentElement.id());
    const isExpandable = expandCollapse.isExpandable(group);

    if (isExpandable) expandCollapse.expand(group);

    const elementAttributes = (currentElement.data()?.payload?.data || []) as Field[];
    const attributeIndex = elementAttributes?.findIndex?.((item) => item.key === changedFieldKey);
    const attribute = attributeIndex !== undefined ? elementAttributes[attributeIndex] : undefined;
    const oldAttributeLabel = attribute?.label;
    const oldAttributeKey = attribute?.key;
    const oldAttribute = { ...attribute };

    if (!attribute && isExpandable) expandCollapse.collapse(group);
    if (!attribute) return;

    const newData = element.data();

    if (args.doChangeLabel) {
      setNewAttributeLabel(newData, attributeIndex, args.data.label || "");
      setNewElementLabelTemlpate(newData, currentElement.data("payload").label_template, oldAttributeLabel, oldAttributeKey, args.data.label);
    }

    if (args.doChangeValue) {
      setNewAttributeValue(newData, attributeIndex, args.data.value);
    }

    if (args.doChangeFormatVariant) {
      setNewAttributeFormatVariant(newData, attributeIndex, attribute.value, args.data.formatVariant);
    }

    if (args.doChangeLabel || args.doChangeFormatVariant) {
      updateElementDisplayedLabel(newData);
    }

    if (args.doChangeLabel || args.doChangeValue || args.doChangeFormatVariant) {
      isAttributeMapDirty = true;
    }

    currentElement.data(newData);
    currentElement.connectedEdges().forEach((item) => {
      // заставляем обновиться подписи у смежных связей
      item.data(item.data());
    });

    if (props.graphState.selectedNodes.has(currentElement.id())) {
      // Обновляем данные в сайдбаре для выбранного узла

      // Выбран и узел и группа, внутри которого находится измененный узел
      // ИЛИ только узел
      // ИЛИ много узлов, среди которых измененный
      isSelectedNodesDataDirty = true;
      selectedNodes.set(currentElement.id(), currentElement);
    }

    if (props.graphState.selectedEdges.has(currentElement.id())) {
      // Обновляем данные в сайдбаре для выбранной связи
      isSelectedEdgesDataDirty = true;
      selectedEdges.set(currentElement.id(), currentElement);
    }

    if (props.graphState.selectedNodeGroups.has(currentElement.data().parent)) {
      // Выбрана группа, внутри которого находится измененный элемент.
      // Обновляем данные этой группы
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

    changeElement({
      element,
      data: action.payload.data,
      doChangeLabel: true,
      doChangeFormatVariant: true,
      doChangeValue: true,
      doSkipOriginElement: false,
    });

    elements.forEach((element) => {
      changeElement({
        element,
        data: action.payload.data,
        doChangeLabel: action.payload.data.isApplyLabelToAllNodesWithSameSystemId,
        doChangeFormatVariant: action.payload.data.isApplyFormatVariantToAllNodesWithSameSystemId,
        doSkipOriginElement: true,
      });
    });
  });

  if (isSelectedNodesDataDirty || isSelectedEdgesDataDirty || isSelectedGroupsDirty) {
    props.dispatchGraphAction({
      type: "SET_SELECTED_ELEMENTS",
      payload: {
        ...(isSelectedNodesDataDirty ? { selectedNodes } : null),
        ...(isSelectedEdgesDataDirty ? { selectedEdges } : null),
        ...(isSelectedGroupsDirty ? { selectedNodeGroups } : null),
      },
    });
  }

  if (isAttributeMapDirty) {
    const [attributes] = elementsToAttributesMap(cy.nodes());
    props.dispatchGraphAction({ type: "SET_ATTRIBUTES_MAP", payload: attributes });
  }
}

function setNewAttributeLabel(newData: CyNode["data"], attributeIndex: number, newAttributeLabel: string) {
  if (newData.payload?.data?.[attributeIndex]) {
    _set(newData, `payload.data.${attributeIndex}.label`, newAttributeLabel);
  }
}

function setNewAttributeValue(newData: CyNode["data"], attributeIndex: number, newValue?: string) {
  if (newData.payload?.data?.[attributeIndex]) {
    _set(newData, `payload.data.${attributeIndex}.value`, newValue);
  }
}

function setNewElementLabelTemlpate(newData: CyNode["data"], oldLabelTemlate?: string, oldAttributeLabel?: string, oldAttributeKey?: string, newAttributeLabel?: string) {
  const newLabelTemplate = oldLabelTemlate?.replaceAll?.(new RegExp(`{{\\s?(${oldAttributeLabel}|${oldAttributeKey})\\s?}}`, "g"), `{{ ${newAttributeLabel} }}`);
  _set(newData, "payload.label_template", newLabelTemplate);
}

export function setNewAttributeFormatVariant(newData: CyNode["data"], attributeIndex: number, attributeValue?: string, newFormatVariant?: number) {
  const attribute = newData.payload?.data?.[attributeIndex];
  if (!attribute) return;

  const formatVariant = newFormatVariant || 0;
  const formattedAttributeValue = formatString(attributeValue || "", formatVariant);
  const shallFormat = formattedAttributeValue !== undefined && formattedAttributeValue !== "" && formattedAttributeValue !== attributeValue;

  if (formatVariant === 0 && attribute.formatVariant !== undefined) delete attribute.formatVariant;
  if (formatVariant === 0 && attribute.formattedValue !== undefined) delete attribute.formattedValue;
  if (formatVariant === 0 || !shallFormat) return;

  _set(newData, `payload.data.${attributeIndex}.formattedValue`, formattedAttributeValue);
  _set(newData, `payload.data.${attributeIndex}.formatVariant`, formatVariant);
}
