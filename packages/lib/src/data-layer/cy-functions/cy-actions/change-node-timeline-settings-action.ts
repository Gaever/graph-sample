import { Field } from "../../../http/api";
import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import _set from "lodash/set";

export function changeNodeTimelineSettingsAction(cy: cytoscape.Core, action: CyCallbackAction, _props: UseDispatchCyActionProps) {
  if (action.type !== "CHAGNE_NODE_TIMELINE_SETTINGS") return;

  const node = action.payload.node;
  const startDateField = action.payload.startDateField;
  const endDateField = action.payload.endDateField;
  const expandCollapse = cy.expandCollapse("get");

  cy.batch(() => {
    let collection = cy.collection();
    let elementsToCollapse = expandCollapse.expandableNodes();
    expandCollapse.expandAll();

    if (action.payload.applyToAllNodesWithSameSystemId) {
      const selector = `[system_id = '${node.data("system_id")}']`;
      collection.merge(cy.$(selector));
    } else {
      collection.merge(cy.$id(node.id()));
    }

    collection.forEach((node) => {
      changeNode(node, startDateField, endDateField, action.payload.nodeTimlineClassname);
    });

    if (elementsToCollapse) {
      expandCollapse.collapse(elementsToCollapse);
    }
  });
}

function changeNode(node: cytoscape.NodeSingular, startDateField: string | undefined, endDateField: string | undefined, nodeTimelineClassname: string | undefined) {
  const newData = node.data("payload");
  if (startDateField) {
    const value = ((node.data("payload")?.data || []) as Field[]).find((attr) => attr.key === startDateField)?.value || "";
    if (!isNaN(new Date(value).getTime())) {
      _set(newData, "timeline_field", startDateField);
    }
  } else if (newData?.timeline_field) {
    delete newData.timeline_field;
  }

  if (endDateField && startDateField) {
    const value = ((node.data("payload")?.data || []) as Field[]).find((attr) => attr.key === endDateField)?.value || "";
    if (!isNaN(new Date(value).getTime())) {
      _set(newData, "timeline_end_field", endDateField);
    }
  } else if (newData?.timeline_end_field) {
    delete newData.timeline_end_field;
  }

  if (endDateField && !startDateField) {
    if (newData?.timeline_end_field) delete newData.timeline_end_field;
    if (newData?.timeline_field) delete newData.timeline_field;
  }

  _set(newData, "timeline_class", nodeTimelineClassname);

  node.data("payload", newData);
}
