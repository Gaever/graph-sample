import { sha256 } from "js-sha256";
import _kebabCase from "lodash/kebabCase";
import _omit from "lodash/omit";
import { useContext } from "react";
import { initialFilterState } from "../components/filter";
import { initialGridState } from "../components/grid-settings";
import { initialLegendState } from "../components/legend-settings";
import { initialWorldMapState } from "../components/world-map-settings";
import { useConfirmDialog } from "../containers/confirm-dialog";
import { Connection, Graph, Node, NodeTypesAndConnections } from "../http/api";
import { useDefaultCyStylesheet } from "../theme";
import { ElementFormatterAggregation, GetSnapshot, GraphElements, JsonExport, StoreGraph, StylesheetMap } from "../types";
import { readFileToString } from "../utils";
import { appStateCtx } from "./app-state-provider";
import { appStateToGraph } from "./app-state-to-json";
import { fitPadding } from "./cy-functions/cy-actions/helpers";
import { registerPositionListener } from "./cy-functions/cy-init";
import {
  addIconsToStylesheet,
  addIconToStylesheet,
  fixSvgWithoutWidthHeight,
  formatEdge,
  formatGroupNode,
  formatNode,
  getIconClassName,
  mergeSystemTypes,
  nodeTypesAndConnectionsToMaps,
} from "./format-response";
import { useErrorHandler } from "./use-error-handler";

export const bigElementsThreshold = 500;

export function useGraphData() {
  const { dispatchGraphAction, dispatchGuiAction, dispatchCyAction, cy, graphState, guiState } = useContext(appStateCtx);
  const { errorHandler } = useErrorHandler();
  const { createDialog } = useConfirmDialog();
  const stylesheetDefaults = useDefaultCyStylesheet();

  function confirmLoadLargeGraph(onConfirmCb: () => void, onCancelCb?: () => void, elementsCount?: string) {
    createDialog({
      message: `Вы собираетесь открыть граф, содержащий большое количество элементов${elementsCount ? ` (${elementsCount})` : ""}. Возможна низкая производительность. Продолжить?`,
      onCancelCb,
      onConfirmCb,
    });
  }

  const storeGraph: StoreGraph = (graph, stylesheetMap, nodeTypesAndConnections) => {
    if (!cy) return new Set();
    const nodes: GraphElements["nodes"] = new Map();
    const groups: GraphElements["groups"] = new Map();
    const edges: GraphElements["edges"] = new Map();
    const drawings: GraphElements["drawings"] = new Map();

    let mergedTypes = nodeTypesAndConnections;

    if (graph.node_types_and_connections) {
      mergedTypes = mergeSystemTypes(graph.node_types_and_connections || { connections: [], node_types: [] }, nodeTypesAndConnections);
    }

    const { connectionTypesMap, nodeTypesMap } = nodeTypesAndConnectionsToMaps(mergedTypes, graphState.nodeTypesMap, graphState.edgeTypesMap);

    const aggr: ElementFormatterAggregation = {
      stylesheetMap: new Map(stylesheetMap),
      attributesMap: new Map(),
      metaAttributesMap: new Map(),
      edgeAttributesMap: new Map(),
      nodeSystemIds: new Set(),
      edgeSystemIds: new Set(),
      nodeConditionStyles: new Map(),
      edgeConditionStyles: new Map(),
      maxZindex: 10000,
      minZindex: 5000,
      classesToRequest: new Set(),
      connectionTypesMap,
      nodeTypesMap,
    };

    const prevIsGraphUnsaved = guiState.isGraphUnsaved;
    let shouldSetIsGraphUnsaved = false;
    const shouldSetNewFilters = !guiState.isDashboard || (guiState.isDashboard && guiState.isIgnoreDashboardFilters);

    const onUnpositionedNodesWerePositionedCb = () => {
      shouldSetIsGraphUnsaved = true;
    };

    dispatchGuiAction({ type: "SET_TRACK_UNSAVED_CHANGES", payload: false });

    cy.off("position");

    try {
      addIconsToStylesheet(graph.icons, aggr.stylesheetMap);
    } catch (error) {
      errorHandler(error);
    }

    if (graph.styles) {
      (graph.styles || []).forEach((stylesheet) => {
        aggr.stylesheetMap.set(stylesheet.selector, stylesheet);
      });
    }

    if (graph.node_condition_styles) {
      graph.node_condition_styles.forEach((item) => {
        if (!item?.selector) return;
        aggr.nodeConditionStyles.set(item.selector, item);
      });
    }

    if (graph.connection_condition_styles) {
      graph.connection_condition_styles.forEach((item) => {
        if (!item?.selector) return;
        aggr.edgeConditionStyles.set(item.selector, item);
      });
    }

    graph.nodes?.forEach?.((node) => {
      try {
        formatNode(node, nodes, aggr);
      } catch (error) {
        errorHandler(error);
      }
    });

    graph.groups?.forEach?.((group) => {
      try {
        formatGroupNode(group, groups, aggr);
      } catch (error) {
        errorHandler(error);
      }
    });

    graph.connections?.forEach?.((connection) => {
      try {
        formatEdge(connection, edges, aggr);
      } catch (error) {
        errorHandler(error);
      }
    });

    if (graph.drawings) {
      (graph.drawings || []).forEach((drawing) => {
        if (!drawing?.data?.id) return;
        drawings.set(drawing.data.id, drawing);
      });
    }

    dispatchGraphAction({ type: "SET_STYLESHEET_MAP", payload: aggr.stylesheetMap });

    dispatchGraphAction({
      type: "SET_GRAPH_META",
      payload: _omit(graph, [
        "nodes",
        "icons",
        "connections",
        "connection_groups",
        "groups",
        "filters",
        "grid_settings",
        "world_map_settings",
        "legend_settings",
        "drawings",
        "node_condition_styles",
        "connection_condition_styles",
        "styles",
        "node_types_and_connections",
        "meta_fields",
      ]),
    });

    dispatchGraphAction({ type: "SET_META_FIELDS", payload: graph.meta_fields || [] });

    dispatchGraphAction({ type: "SET_ICONS", payload: { ...graphState.icons, ...graph.icons } });
    dispatchGraphAction({ type: "SET_META_ATTRIBUTES_MAP", payload: aggr.metaAttributesMap });
    dispatchGraphAction({ type: "SET_ATTRIBUTES_MAP", payload: aggr.attributesMap });
    dispatchGraphAction({ type: "SET_EDGE_ATTRIBUTES_MAP", payload: aggr.edgeAttributesMap });
    dispatchGraphAction({ type: "SET_NODE_SYSTEM_IDS", payload: aggr.nodeSystemIds });
    dispatchGraphAction({ type: "SET_EDGE_SYSTEM_IDS", payload: aggr.edgeSystemIds });
    dispatchGraphAction({ type: "SET_NODE_TYPES_MAP", payload: aggr.nodeTypesMap });
    dispatchGraphAction({ type: "SET_EDGE_TYPES_MAP", payload: aggr.connectionTypesMap });

    dispatchGraphAction({ type: "RESET_SELECTED_ELEMENTS" });
    dispatchGraphAction({ type: "RESET_HIDDEN_ELEMENTS" });

    dispatchGuiAction({ type: "SET_LEGEND_STATE", payload: graph.legend_settings || initialLegendState });
    dispatchGuiAction({ type: "SET_GRID_SETTINGS", payload: graph.grid_settings || initialGridState });
    dispatchGuiAction({ type: "SET_WORLD_MAP_STATE", payload: graph.world_map_settings || initialWorldMapState });
    dispatchGuiAction({ type: "SET_MAX_Z_INDEX", payload: aggr.maxZindex });
    dispatchGuiAction({ type: "SET_MIN_Z_INDEX", payload: aggr.minZindex });
    dispatchGuiAction({ type: "SET_NODE_CONDITION_STYLES", payload: aggr.nodeConditionStyles });
    dispatchGuiAction({ type: "SET_EDGE_CONDITION_STYLES", payload: aggr.edgeConditionStyles });

    dispatchCyAction({
      type: "SET_ELEMENTS",
      payload: { nodes, groups, edges, drawings, edgeGroups: graph.connection_groups || null },
      callback: onUnpositionedNodesWerePositionedCb,
    });

    let filters = guiState.filters;
    if (graph.filters) {
      filters = graph.filters;
      if (Array.isArray(filters)) {
        filters = initialFilterState;
      }

      if (!filters.attributes) filters.attributes = [{}];
      if (!filters.icons) filters.icons = [];
      if (!filters.systemIds) filters.systemIds = [];

      if (shouldSetNewFilters) {
        dispatchGuiAction({ type: "SET_FILTERS", payload: filters });
      }
    }

    requestAnimationFrame(() => {
      dispatchCyAction({ type: "APPLY_FILTERS", payload: shouldSetNewFilters ? filters : guiState.filters });
      dispatchGuiAction({ type: "SET_TRACK_UNSAVED_CHANGES", payload: true });
      dispatchGuiAction({ type: "SET_IS_GRAPH_UNSAVED", payload: shouldSetIsGraphUnsaved ? true : prevIsGraphUnsaved });
      registerPositionListener(cy, dispatchGuiAction);
    });

    return aggr.classesToRequest!;
  };

  const doMergeGraph: (newNodes: Node[], newConnections: Connection[]) => Set<string> = (newNodes, newConnections) => {
    if (!cy) return new Set();

    const nodes: GraphElements["nodes"] = new Map();
    const edges: GraphElements["edges"] = new Map();

    const unpositionedNodesCollection = cy.collection();

    const aggr: ElementFormatterAggregation = {
      stylesheetMap: graphState.stylesheetMap,
      attributesMap: graphState.attributesMap,
      metaAttributesMap: graphState.metaAttributesMap,
      edgeAttributesMap: graphState.edgeAttributesMap,
      nodeSystemIds: graphState.nodeSystemIds,
      edgeSystemIds: graphState.edgeSystemIds,
      nodeConditionStyles: guiState.nodeConditionStyles,
      edgeConditionStyles: guiState.edgeConditionStyles,
      maxZindex: guiState.maxZindex,
      minZindex: guiState.minZindex,
      classesToRequest: new Set(),
      connectionTypesMap: new Map(),
      nodeTypesMap: new Map(),
    };

    cy.batch(() => {
      newNodes?.forEach?.((node) => {
        if (!node.guid) return;
        const elementExistsOnGraph = cy.$id(node.guid).length > 0;
        if (elementExistsOnGraph) return;

        try {
          const cyNode = formatNode(node, nodes, aggr, true);
          cy.add(cyNode);
          unpositionedNodesCollection.merge(cy.$id(cyNode.data.id!));
        } catch (error) {
          errorHandler(error);
        }
      });

      newConnections?.forEach?.((connection) => {
        if (!connection.guid) return;
        const elementExistsOnGraph = cy.$id(connection.guid).length > 0;
        if (elementExistsOnGraph) return;

        try {
          const cyEdge = formatEdge(connection, edges, aggr, true);
          cy.add(cyEdge);
        } catch (error) {
          errorHandler(error);
        }
      });

      const bb = cy.elements().boundingBox({});

      unpositionedNodesCollection
        .layout({
          name: "grid",
          animate: true,
          fit: true,
          padding: fitPadding,
          transform: (_, position) => {
            return {
              x: bb.x2 + position.x,
              y: bb.y1 + position.y,
            };
          },
        })
        .run();
      unpositionedNodesCollection.forEach((item) => {
        item.data("positionX", item.position().y);
        item.data("positionY", item.position().x);
      });
    });

    dispatchGraphAction({ type: "SET_STYLESHEET_MAP", payload: aggr.stylesheetMap });
    dispatchGraphAction({ type: "SET_ATTRIBUTES_MAP", payload: aggr.attributesMap });
    dispatchGraphAction({ type: "SET_EDGE_ATTRIBUTES_MAP", payload: aggr.edgeAttributesMap });
    dispatchGraphAction({ type: "SET_NODE_SYSTEM_IDS", payload: aggr.nodeSystemIds });
    dispatchGraphAction({ type: "SET_EDGE_SYSTEM_IDS", payload: aggr.edgeSystemIds });
    dispatchGuiAction({ type: "SET_LEGEND_STATE", payload: initialLegendState });

    dispatchCyAction({ type: "APPLY_FILTERS", payload: guiState.filters });

    requestAnimationFrame(() => {
      dispatchCyAction({ type: "REFRESH_STYLESHEET", payload: aggr.stylesheetMap });
    });

    return aggr.classesToRequest!;
  };

  const mergeGraph: (newNodes: Node[], newConnections: Connection[]) => Promise<Set<string> | null> = async (newNodes, newConnections) => {
    const elementsLength = (newNodes?.length || 0) + (newConnections?.length || 0);
    return new Promise((resolve) => {
      if (elementsLength >= bigElementsThreshold) {
        confirmLoadLargeGraph(
          () => {
            const classesToRequest = doMergeGraph(newNodes, newConnections);
            resolve(classesToRequest);
          },
          () => {
            resolve(null);
          }
        );
      } else {
        const classesToRequest = doMergeGraph(newNodes, newConnections);
        resolve(classesToRequest);
      }
    });
  };

  const storeGraphDataWithConfirmation: (graph: Graph, stylesheetMap: StylesheetMap, nodeTypesAndConnections: NodeTypesAndConnections) => Promise<Set<string> | null> = async (
    graph,
    stylesheetMap,
    nodeTypesAndConnections
  ) => {
    return new Promise((resolve) => {
      const elementsLength = (graph?.nodes?.length || 0) + (graph?.connections?.length || 0) + (graph.groups?.length || 0);
      if (elementsLength >= bigElementsThreshold) {
        confirmLoadLargeGraph(
          () => {
            const classesToRequest = storeGraph(graph, stylesheetMap, nodeTypesAndConnections);

            resolve(classesToRequest);
          },
          () => {
            resolve(null);
          }
        );
      } else {
        const classesToRequest = storeGraph(graph, stylesheetMap, nodeTypesAndConnections);
        resolve(classesToRequest);
      }
    });
  };

  const readFromFile: (file: File) => Promise<Set<string> | null> = async (file) => {
    const graph = JSON.parse(await readFileToString(file)) as Graph;
    const elementsLength = (graph?.nodes?.length || 0) + (graph?.connections?.length || 0) + (graph.groups?.length || 0);

    return new Promise((resolve) => {
      if (elementsLength >= bigElementsThreshold) {
        confirmLoadLargeGraph(
          () => {
            const classesToRequest = storeGraph(graph, graphState.stylesheetMap, { node_types: [], connections: [] });
            resolve(classesToRequest);

            requestAnimationFrame(() => {
              dispatchGuiAction({ type: "SET_IS_GRAPH_UNSAVED", payload: true });
            });
          },
          () => {
            resolve(null);
          }
        );
      } else {
        const classesToRequest = storeGraph(graph, graphState.stylesheetMap, { node_types: [], connections: [] });
        resolve(classesToRequest);

        requestAnimationFrame(() => {
          dispatchGuiAction({ type: "SET_IS_GRAPH_UNSAVED", payload: true });
        });
      }
    });
  };

  const storeNewIcons = (newIcons: { id?: string; label?: string; image?: string }[], stylesheetMap: StylesheetMap) => {
    const storedIcons = graphState.icons || {};

    (newIcons || []).forEach((icon) => {
      if (!icon.id || !icon.image) return;
      const iconImage = fixSvgWithoutWidthHeight(icon.image);
      let className = getIconClassName(icon.id);
      const checksumm = sha256(iconImage);
      let newIconKey = icon.id;

      if (storedIcons[icon.id] && storedIcons[icon.id].sha256 === checksumm) return;
      if (storedIcons[icon.id] && storedIcons[icon.id].sha256 !== checksumm) {
        newIconKey = checksumm.substring(0, 7);
        className = `${className}-${newIconKey}`;
      }

      storedIcons[newIconKey] = {
        src: iconImage,
        label: icon.label,
        sha256: checksumm,
      };
      addIconToStylesheet(iconImage || "", className, stylesheetMap);
    });

    dispatchGraphAction({ type: "SET_ICONS", payload: storedIcons });
  };

  /**
   * Читает из cytoscape инстанса данные узлов и связей,
   * обогащает каждый узел таблицей стилей и создает объект Graph для сохранения в БД.
   */
  const createSnapshot: GetSnapshot = async () => {
    return new Promise((resolve, reject) => {
      if (!cy) return;
      try {
        cy.batch(() => {
          // Чтобы прочитать данные из свернутых групп их сначала нужно развернуть,
          // иначе скрытые узлы не будут видны в переборе.
          // После чтения элементов они сворачиваются обратно.
          // Такая операция приводит к срабатыванию события 'position' (узел переместили).
          // Событие слушает механизм отображения того что локальные данные графа изменены
          // и требуют сохранения в БД.
          // При разворачивании групп принудительно поднимется флаг "данные не сохранены".
          // Чтобы это избежать, отписываемся от события position и заново подписываемся
          // на него в конце функции.
          cy.off("position");

          try {
            const collapsedNodes = cy!.$("[?collapsedChildren]");
            cy!.expandCollapse("get").expand(collapsedNodes);
            const snapshot = cy!.json() as JsonExport;
            cy!.expandCollapse("get").collapse(collapsedNodes);
            const nodes = snapshot.elements.nodes;
            const edges = snapshot.elements.edges;
            const graph = appStateToGraph({
              nodes,
              edges,
              icons: graphState.icons,
              graphMeta: graphState.graphMeta || {},
              stylesheetMap: graphState.stylesheetMap,
              collapsedNodes,
              filters: guiState.filters,
              gridState: guiState.grid,
              legendState: guiState.legendSettings,
              worldMapState: guiState.worldMap,
              edgeConditionStylesheets: guiState.edgeConditionStyles,
              nodeConditionStylesheets: guiState.nodeConditionStyles,
              stylesheetDefaults,
              edgeTypesMap: graphState.edgeTypesMap,
              nodeTypesMap: graphState.nodeTypesMap,
              metaFields: graphState.metaFields,
            });

            const json = JSON.stringify(graph);
            const checkSumm = sha256(json).slice(-7);
            const fileName = `${graphState.graphMeta?.id || "0"}-${_kebabCase(`${graphState.graphMeta?.label}` || "graph")}-${checkSumm}.json`;

            resolve({
              checkSumm,
              fileName,
              json,
              graph,
            });
          } catch (error) {
            errorHandler(error);
          }
        });
      } catch (error) {
        reject(error);
      } finally {
        registerPositionListener(cy, dispatchGuiAction);
      }
    });
  };

  return { storeGraphData: storeGraph, storeGraphDataWithConfirmation, readFromFile, createSnapshot, mergeGraph, storeNewIcons };
}
