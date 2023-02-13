import { Field } from "../../http/api";
import { AppStateCtx, MergeKind } from "../../types";
import cytoscape from "cytoscape";
import _set from "lodash/set";
import { SCRATCH_MERGE_MODE, SCRATCH_MERGE_NODE_1, SCRATCH_MERGE_NODE_2 } from "../cy-constants";

export function enableMergeMode(cy: cytoscape.Core, mergeKind: MergeKind) {
  cy.scratch(SCRATCH_MERGE_MODE, mergeKind);
}

export function disableMergeMode(cy: cytoscape.Core) {
  cy.removeScratch(SCRATCH_MERGE_MODE);
}

export function mergeNodes(nodeToRemove: cytoscape.NodeSingular, nodeToSave: cytoscape.NodeSingular, mergedAttributes: Field[]) {
  const newData = nodeToSave.data();
  _set(newData, "payload.data", mergedAttributes);
  nodeToSave.data(newData);

  nodeToRemove.connectedEdges().forEach((edge) => {
    // Передаем связи новой ноде
    if (edge.data("to") === nodeToRemove.id()) {
      edge.data("to", nodeToSave.id());
    }
    if (edge.data("from") === nodeToRemove.id()) {
      edge.data("from", nodeToSave.id());
    }
  });

  nodeToRemove.remove();
}

export function mergeAttributes(nodeToRemoveAttributes: Field[], nodeToSaveAttributes: Field[], mergeKind: MergeKind): Field[] {
  let newAttributes: Field[] = [];

  switch (mergeKind) {
    case "full-merge": {
      newAttributes = nodeToSaveAttributes;

      nodeToRemoveAttributes.forEach((nodeToRemoveAttribute) => {
        const sameAttribute = nodeToSaveAttributes.find((nodeToSaveAttribute) => nodeToRemoveAttribute.key === nodeToSaveAttribute.key);

        if (sameAttribute) {
          const key = `_merged_${nodeToRemoveAttribute.key}`;
          const label = sameAttribute.label === nodeToRemoveAttribute.label ? `_merged_${nodeToRemoveAttribute.label}` : nodeToRemoveAttribute.label;

          newAttributes.push({
            key,
            label,
            value: nodeToRemoveAttribute.value,
          });
        } else {
          newAttributes.push(nodeToRemoveAttribute);
        }
      });

      break;
    }

    case "left-merge": {
      newAttributes = nodeToSaveAttributes;

      nodeToRemoveAttributes.forEach((nodeToRemoveAttribute) => {
        const sameAttribute = nodeToSaveAttributes.find((nodeToSaveAttribute) => nodeToRemoveAttribute.key === nodeToSaveAttribute.key);
        if (!sameAttribute) {
          newAttributes.push(nodeToRemoveAttribute);
        }
      });
      break;
    }

    case "right-merge": {
      newAttributes = nodeToRemoveAttributes;

      nodeToSaveAttributes.forEach((nodeToSaveAttribute) => {
        const sameAttribute = nodeToRemoveAttributes.find((nodeToRemoveAttribute) => nodeToRemoveAttribute.key === nodeToSaveAttribute.key);
        if (!sameAttribute) {
          newAttributes.push(nodeToSaveAttribute);
        }
      });

      break;
    }
  }

  return newAttributes;
}

export function handleMerge(cy: cytoscape.Core, nodes: AppStateCtx["graphState"]["selectedNodes"], nodeToMerge: cytoscape.NodeSingular | undefined) {
  if (nodes.size > 1) {
    cy.removeScratch(SCRATCH_MERGE_NODE_1);
    cy.removeScratch(SCRATCH_MERGE_NODE_2);
    return;
  }

  const mergeMode = cy.scratch(SCRATCH_MERGE_MODE) as MergeKind;

  if (nodes.size < 1 && !mergeMode) {
    cy.removeScratch(SCRATCH_MERGE_NODE_1);
    cy.removeScratch(SCRATCH_MERGE_NODE_2);
    return;
  }

  if (nodes.size !== 1) return;

  if (!cy.scratch(SCRATCH_MERGE_NODE_1) && !cy.scratch(SCRATCH_MERGE_NODE_2)) {
    cy.scratch(SCRATCH_MERGE_NODE_1, nodeToMerge);
  } else if (cy.scratch(SCRATCH_MERGE_NODE_1) && !cy.scratch(SCRATCH_MERGE_NODE_2)) {
    cy.scratch(SCRATCH_MERGE_NODE_2, nodeToMerge);
  }

  if (cy.scratch(SCRATCH_MERGE_NODE_1) && cy.scratch(SCRATCH_MERGE_NODE_2) && !mergeMode) {
    cy.removeScratch(SCRATCH_MERGE_NODE_1);
    cy.removeScratch(SCRATCH_MERGE_NODE_2);
    return;
  }

  if (cy.scratch(SCRATCH_MERGE_NODE_1) && cy.scratch(SCRATCH_MERGE_NODE_2) && mergeMode) {
    const nodeToRemove = cy.scratch(SCRATCH_MERGE_NODE_1) as cytoscape.NodeSingular;
    const nodeToSave = cy.scratch(SCRATCH_MERGE_NODE_2) as cytoscape.NodeSingular;

    const nodeToRemoveAttributes: Field[] = nodeToRemove.data("payload")?.data || [];
    const nodeToSaveAttributes: Field[] = nodeToSave.data("payload")?.data || [];

    const mergedAttributes = mergeAttributes(nodeToRemoveAttributes, nodeToSaveAttributes, mergeMode);
    mergeNodes(nodeToRemove, nodeToSave, mergedAttributes);

    disableMergeMode(cy);
  }
}
