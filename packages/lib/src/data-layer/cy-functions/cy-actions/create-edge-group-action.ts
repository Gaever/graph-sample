import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import _findLast from "lodash/findLast";
import cytoscape from "cytoscape";
import { isAppClassName, isUserClassName } from "../../../utils";

export function createEdgeGroupAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "CREATE_EDGE_GROUP") return;

  const selectedEdges = cy.$("edge:selected");

  const collapseKind = action.payload;

  if (collapseKind === "collapse-all") {
    doCollapseEdges(cy, selectedEdges);
  } else if (collapseKind === "collapse-by-system-id") {
    const edgesBySystemId: Map<string, cytoscape.EdgeCollection> = new Map();
    const NO_SYSTEM_ID = "__NO_SYSTEM_ID__";
    edgesBySystemId.set(NO_SYSTEM_ID, cy.collection());

    selectedEdges.forEach((edge) => {
      const systemId = edge.data("payload")?.system_id;

      if (!systemId) {
        edgesBySystemId.get(NO_SYSTEM_ID)?.merge?.(edge);
        return;
      }

      if (!edgesBySystemId.get(systemId)) {
        edgesBySystemId.set(systemId, cy.collection());
      }

      edgesBySystemId.get(systemId)?.merge?.(edge);
    });

    (Array.from(edgesBySystemId.values()) as cytoscape.EdgeCollection[]).forEach((edgeCollection) => {
      doCollapseEdges(cy, edgeCollection);
    });
  }
}

function doCollapseEdges(cy: cytoscape.Core, edgesToCollapse: cytoscape.EdgeCollection) {
  const expandCollapse = cy.expandCollapse("get");

  const collapsedEdgeResult = expandCollapse.collapseEdges(edgesToCollapse);
  const collapsedEdge = collapsedEdgeResult.edges?.[0] as cytoscape.EdgeSingular;

  if (!collapsedEdge) {
    // Среди выбранных связей есть связь, относящаяся к третей вершине (должно быть только две)
    return;
  }

  // Назначаем групповой связи стиль первой свернутой связи
  const firstCollapsedEdgeClassName = _findLast(
    collapsedEdgeResult.oldEdges?.[0].classes() as string[],
    (className) => (isUserClassName(className) || !isAppClassName(className)) && className !== "cy-expand-collapse-meta-edge"
  );
  if (firstCollapsedEdgeClassName) {
    collapsedEdge?.addClass?.(firstCollapsedEdgeClassName);
  }

  collapsedEdge.select();
}
