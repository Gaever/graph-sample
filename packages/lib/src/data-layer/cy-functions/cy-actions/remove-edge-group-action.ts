import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function removeEdgeGroupAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "REMOVE_EDGE_GROUP" && action.type !== "REMOVE_CHILD_FROM_EDGE_GROUP") return;

  const expandCollapse = cy.expandCollapse("get");

  const groupId = action.payload.groupId;
  let groupEdge: cytoscape.EdgeCollection;

  cy.batch(() => {
    if (groupId) {
      groupEdge = cy.$id(groupId);
    } else {
      groupEdge = cy.$("edge:selected");
    }

    if (groupEdge.length > 1) return;

    const collapsedEdgeClasses = groupEdge[0].classes();

    const expandResult = expandCollapse.expandEdges(groupEdge);
    let expandedEdgesCollection: cytoscape.EdgeCollection = expandResult.edges;

    if (action.payload.edgesData) {
      // Исключить одну связь из группы
      const edgesToCollapseBack: cytoscape.EdgeCollection = cy.collection();

      (expandResult.edges as cytoscape.EdgeCollection).forEach((edge) => {
        const skipEdge = (action.payload.edgesData || []).some((edgeData) => edgeData.id === edge.id());
        if (skipEdge) return;
        edgesToCollapseBack.merge(edge);
      });
      const collapseResult = expandCollapse.collapseEdges(edgesToCollapseBack);
      collapseResult.edges.select();
      collapseResult.edges?.[0]?.classes?.(collapsedEdgeClasses);
    } else {
      // Расформировать группу целиком

      expandedEdgesCollection.select();
    }
  });
}
