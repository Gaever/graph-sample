import { formatNode, nodeTypesAndConnectionsToMaps } from "../../format-response";
import { CyCallbackAction, CyNode, ElementFormatterAggregation, filters, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import { applyFilterConditions, exclude, mapFilterData, show } from "./apply-filters-action";

export function addNodeAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "ADD_NODE") return;

  let node: cytoscape.NodeSingular | undefined = undefined;

  const { connectionTypesMap, nodeTypesMap } = nodeTypesAndConnectionsToMaps(action.payload.nodeTypesAndConnections, props.graphState.nodeTypesMap, props.graphState.edgeTypesMap);

  cy.batch(() => {
    const bb = cy.elements().boundingBox({});

    const aggr: ElementFormatterAggregation = {
      stylesheetMap: new Map(props.graphState.stylesheetMap),
      attributesMap: new Map(props.graphState.attributesMap),
      edgeAttributesMap: new Map(props.graphState.edgeAttributesMap),
      metaAttributesMap: new Map(props.graphState.metaAttributesMap),
      nodeSystemIds: new Set(props.graphState.nodeSystemIds),
      edgeSystemIds: new Set(props.graphState.edgeSystemIds),
      edgeConditionStyles: new Map(props.guiState.edgeConditionStyles),
      nodeConditionStyles: new Map(props.guiState.nodeConditionStyles),
      maxZindex: props.guiState.maxZindex,
      minZindex: props.guiState.minZindex,
      connectionTypesMap,
      nodeTypesMap,
    };

    const pos = {
      x: bb.x2 + 100,
      y: bb.y1 + 75,
    };

    const newNode: CyNode = formatNode({ ...action.payload.node, position: pos }, new Map(), aggr, true);

    props.dispatchGraphAction({ type: "SET_ATTRIBUTES_MAP", payload: aggr.attributesMap });
    props.dispatchGraphAction({ type: "SET_NODE_SYSTEM_IDS", payload: aggr.nodeSystemIds });

    node = cy.add(newNode);

    const shallShow = applyFilters(node, props.guiState.filters);

    if (shallShow) {
      const padding = Math.min(Math.min(cy.width(), cy.height()) / 3, 300);
      cy.fit(node, padding);
    } else {
      const hiddenNodes = new Map(props.graphState.hiddenNodes);
      hiddenNodes.set(node.id(), node);
      props.dispatchGraphAction({ type: "SET_HIDDEN_ELEMENTS", payload: { hiddenNodes } });
    }
  });

  action?.callback?.(node);
}

function applyFilters(node: cytoscape.NodeSingular, filters: filters) {
  const filterData = mapFilterData(filters);
  const shallShow = applyFilterConditions(filterData, node.data());

  if (shallShow) {
    show(node);
  } else {
    exclude(node, !!filters.isHideFiltered);
  }

  return shallShow;
}
