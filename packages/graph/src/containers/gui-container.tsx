import { initialFilterState } from "@vityaz-graph/lib/src/components/filter";
import Gui from "@/components/gui";
import { appStateCtx } from "@vityaz-graph/lib/src/data-layer/app-state-provider";
import { mapDashboardFiltersToAppFilters } from "@vityaz-graph/lib/src/data-layer/cy-functions/cy-actions/apply-filters-action";
import { hideElement } from "@vityaz-graph/lib/src/data-layer/cy-functions/cy-actions/hide-selected-elements-action";
import { showElement } from "@vityaz-graph/lib/src/data-layer/cy-functions/cy-actions/show-hidden-elements-action";
import { enableMergeMode } from "@vityaz-graph/lib/src/data-layer/cy-functions/cy-node-merge";
import { addIconToStylesheet, getIconClassName } from "@vityaz-graph/lib/src/data-layer/format-response";
import { useGraphData } from "@vityaz-graph/lib/src/data-layer/use-graph-data";
import { useGraphDataRequests } from "@vityaz-graph/lib/src/data-layer/use-graph-requests";
import useHotkeys from "@vityaz-graph/lib/src/data-layer/use-hotkeys";
import useLegend from "@vityaz-graph/lib/src/data-layer/use-legend";
import { Icon } from "@vityaz-graph/lib/src/http/api";
import { dashboardFilter, filters, GraphState } from "@vityaz-graph/lib/src/types";
import { closeFullscreen, downloadDocx, downloadJson, downloadPng, isFullscreen, openFullscreen, readFileToBase64 } from "@vityaz-graph/lib/src/utils";
import createDocx from "@vityaz-graph/lib/src/utils/docx";
import useDeeplink from "@vityaz-graph/lib/src/data-layer/use-deeplink";

import { sha256 } from "js-sha256";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";

export interface GuiContainerProps {
  containerHeight: number;
  containerWidth: number;
  rootElement: HTMLElement;
  dashboardFilters: dashboardFilter[] | undefined;
  deepLink?: string;
}
function getFilename(graphState: GraphState) {
  return `${graphState.graphId ? `${graphState.graphId}-` : ""}${graphState.graphMeta.label}`;
}

function GuiContainer(props: GuiContainerProps) {
  const { dispatchGuiAction, dispatchGraphAction, dispatchCyAction, guiState, graphState, cy } = useContext(appStateCtx);
  const { readFromFile, createSnapshot } = useGraphData();

  const {
    saveGraphToDb,
    createSearchRequest,
    getSearchesMutation,
    getSearchMutation,
    updateSearchMutation,
    updateAttributeMutation,
    getNodeTypesMutation,
    createNodeMutation,
    getNodeConnectionsMutation,
    getSnapshotsMutation,
    getNodeTemplateMutation,
    connectionsDetailMutation,
    getNodeConnectionStatisticMutation,
    getMetagroupsMutation,
    loadStylesheets,
    createRemoteSnapshot,
    updateSnapshot,
    loadSnapshot,
    deleteSnapshot,
    progress,
    errorHandler,
  } = useGraphDataRequests({
    createNodeMutationOnSuccess: () => {
      refreshLegend(true);
    },
  });

  const selectedNodes = useMemo(() => Array.from(graphState.selectedNodes.values()), [graphState.selectedNodes]);
  const selectedEdges = useMemo(() => Array.from(graphState.selectedEdges.values()), [graphState.selectedEdges]);
  const selectedNodeGroups = useMemo(() => Array.from(graphState.selectedNodeGroups.values()), [graphState.selectedNodeGroups]);
  const selectedEdgeGroups = useMemo(() => Array.from(graphState.selectedEdgeGroups.values()), [graphState.selectedEdgeGroups]);

  const hiddenNodes = useMemo(() => Array.from(graphState.hiddenNodes.values()), [graphState.hiddenNodes]);
  const hiddenEdges = useMemo(() => Array.from(graphState.hiddenEdges.values()), [graphState.hiddenEdges]);
  const hiddenNodeGroups = useMemo(() => Array.from(graphState.hiddenNodeGroups.values()), [graphState.hiddenNodeGroups]);
  const hiddenEdgeGroups = useMemo(() => Array.from(graphState.hiddenEdgeGroups.values()), [graphState.hiddenEdgeGroups]);

  const { legendProps, refreshLegend } = useLegend();
  useHotkeys({
    cy,
    dispatchCyAction,
    dispatchGuiAction,
    refreshLegend: () => {
      refreshLegend(true);
    },
    guiState,
  });
  const [timelineNodes, setTimelineNodes] = useState<cytoscape.CollectionReturnValue | null>(null);

  useEffect(() => {
    const handler: cytoscape.EventHandler = () => {
      refreshLegend(true);
    };

    if (cy) {
      cy.addListener("set-elements", handler);
    }

    return () => {
      if (cy) {
        cy.removeListener("set-elements", handler);
      }
    };
  }, [cy]);

  useEffect(() => {
    const onBeforeCloseWindowListener = (event: BeforeUnloadEvent) => {
      if (guiState.isGraphUnsaved) {
        // Спрашиваем подтверждение на закрытие страницы при несохраненных в БД локальных данных
        event.preventDefault();
        event.returnValue = "";
        return;
      }

      delete event["returnValue"];
    };
    window.addEventListener("beforeunload", onBeforeCloseWindowListener);
    return () => {
      window.removeEventListener("beforeunload", onBeforeCloseWindowListener);
    };
  }, [guiState.isGraphUnsaved]);

  useEffect(() => {
    if (graphState.graphId) {
      getSearchesMutation.mutate();
      getNodeTypesMutation.mutate();
      getSnapshotsMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphState.graphId]);

  const doSetTimelineNodes = () => {
    if (!cy) return;
    let elements: cytoscape.CollectionReturnValue = cy.collection();

    const selectedElements = cy.$("node:selected[id !*= 'drawing']");

    if (selectedElements.length > 0) {
      elements = selectedElements;
    } else {
      cy.batch(() => {
        const elementsToCollapse = cy?.expandCollapse("get").expandableNodes();
        cy?.expandCollapse("get").expandAll();
        const foundElements = cy.elements("node[id !*= 'drawing']");
        elements.merge(foundElements);
        cy.expandCollapse("get").collapse(elementsToCollapse);
      });
    }

    setTimelineNodes(elements);
  };

  useDeeplink(props.deepLink);

  // Заморожено до лучших времен.
  // https://jira.alfakom.org/browse/VITYAZ3-1234
  // Не получается прокинуть фильтры из графа чтобы привязать их к дашборду.
  // const onApplyDashboardFilters = useCallback((filters: filters) => {
  //   const dashboardLikeFilters = mapFiltersToDashboardLikeFilters(filters);
  //   const isFilterTransformed = JSON.stringify(filters.attributes) !== JSON.stringify(dashboardLikeFilters.attributes);
  //   if (isFilterTransformed) {
  //     alert("Настройки фильтров на графе могут измениться после применения их на дашборде");
  //   }

  //   const dashboardFilters = mapGraphFiltersToDashboardFilters(dashboardLikeFilters);

  //   dispatchGuiAction({ type: "SET_FILTERS", payload: dashboardLikeFilters });
  //   dispatchCyAction({ type: "APPLY_FILTERS", payload: dashboardLikeFilters });

  //   emitLaravelLivewireEvent(changeGraphFiltersEventName, { widgetId: props.dataset.widgetId, filters: dashboardFilters });
  // }, []);

  // useEffect(() => {
  //   livewireOnChangeDashboardFiltersListener = (dashboardFilters: dashboardFilter[]) => {
  //     const f = mapDashboardFiltersToAppFilters(dashboardFilters, guiState.filters);
  //     onChangeFilters(f);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [guiState.filters]);

  // useEffect(() => {
  //   laravelLivewireEventListener(onChangeDashboardFiltersEventName, (filters) => {
  //     livewireOnChangeDashboardFiltersListener?.(filters);
  //   });

  //   return () => {
  //     livewireOnChangeDashboardFiltersListener = undefined;
  //   };
  // }, []);

  useEffect(() => {
    dispatchCyAction({ type: "SET_WORLD_MAP_STATE", payload: guiState.worldMap });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guiState.worldMap]);

  useEffect(() => {
    dispatchCyAction({ type: "SET_GRID_SETTINGS", payload: guiState.grid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guiState.grid]);

  const onChangeFilters = useCallback((filters: filters) => {
    dispatchGuiAction({ type: "SET_FILTERS", payload: filters });
    dispatchCyAction({ type: "APPLY_FILTERS", payload: filters });

    refreshLegend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [prevDashboardFilters, setPrevDashboardFilters] = useState<dashboardFilter[]>([]);

  useEffect(() => {
    if (props.dashboardFilters && JSON.stringify(props.dashboardFilters) !== JSON.stringify(prevDashboardFilters) && !guiState.isIgnoreDashboardFilters) {
      setPrevDashboardFilters(props.dashboardFilters);
      onChangeFilters(mapDashboardFiltersToAppFilters(props.dashboardFilters, guiState.filters));
    }
  }, [props.dashboardFilters, prevDashboardFilters, guiState.filters, guiState.isIgnoreDashboardFilters]);

  return (
    <Gui
      containerHeight={props.containerHeight}
      containerWidth={props.containerWidth}
      state={guiState}
      onToggleDataExplorer={() => {
        dispatchGuiAction({ type: "TOGGLE_SHOW_DATA_EXPLORER", payload: !guiState.isDataExplorerOpen });
      }}
      graphTitle={graphState.graphMeta?.label as string}
      onGraphRename={(title) => {
        dispatchGraphAction({
          type: "SET_GRAPH_META",
          payload: {
            ...graphState.graphMeta,
            label: title,
          },
        });
        dispatchCyAction({ type: "SET_UNSAVED" });
      }}
      onViewportCenterClick={() => {
        dispatchCyAction({ type: "CENTER" });
      }}
      isFullscreen={isFullscreen()}
      onToggleFullscreenClick={() => {
        if (isFullscreen()) {
          closeFullscreen();
        } else {
          openFullscreen(props.rootElement);
        }
      }}
      onUploadJsonClick={(event) => {
        if (guiState.isGraphUnsaved) {
          // Спрашиваем подтверждение на чтение из json файла при несохраненных в БД локальных данных
          const isConfirm = window.confirm("Несохраненные данные пропадут. Продолжить?");
          if (!isConfirm) {
            event.preventDefault();
            return;
          }
        }
      }}
      onUploadJson={async (file) => {
        await readFromFile(file);
      }}
      onDownloadJsonClick={async () => {
        const { fileName, json } = await createSnapshot();
        downloadJson(fileName, json);
      }}
      onDoLayoutClick={(kind) => {
        dispatchCyAction({ type: "LAYOUT", payload: kind });
      }}
      onSaveGraphInDbClick={() => {
        saveGraphToDb();
      }}
      onCreateSnapshotClick={() => {
        createRemoteSnapshot();
      }}
      onFilterClick={() => {
        dispatchGuiAction({ type: "TOGGLE_SHOW_FILTER", payload: !guiState.isFilterOpen });
      }}
      onFilterClose={() => {
        dispatchGuiAction({ type: "TOGGLE_SHOW_FILTER", payload: false });
      }}
      onMergeClick={(mergeKind) => {
        if (cy) {
          enableMergeMode(cy, mergeKind);
        }
      }}
      onBringToFrontClick={() => {
        dispatchCyAction({ type: "BRING_TO_FRONT" });
      }}
      onBringToBackClick={() => {
        dispatchCyAction({ type: "BRING_TO_BACK" });
      }}
      onCreateNodeGroupClick={() => {
        dispatchCyAction({ type: "CREATE_NODE_GROUP" });
      }}
      onDocxExportClick={async () => {
        try {
          progress.start();
          const doc = await createDocx(graphState, graphState.stylesheetMap);
          const filename = `${getFilename(graphState)}-nodes.docx`;
          downloadDocx(filename, doc);
        } catch (err) {
          errorHandler(err);
        } finally {
          progress.done();
        }
      }}
      onCollapseEdgesClick={(kind) => {
        dispatchCyAction({ type: "CREATE_EDGE_GROUP", payload: kind });
      }}
      onExpandEdgesClick={() => {
        dispatchCyAction({ type: "REMOVE_EDGE_GROUP", payload: {} });
      }}
      onCreateEdgeClick={() => {
        dispatchCyAction({ type: "ENABLE_EDGEHANDLE" });
      }}
      onAlignClick={(data) => {
        dispatchCyAction({ type: "ALIGN", payload: data });
      }}
      onChangeZoom={(zoom) => {
        dispatchCyAction({ type: "SET_ZOOM", payload: zoom });
      }}
      onASearchClick={() => {
        dispatchCyAction({ type: "A_SEARCH" });
      }}
      onClusterPickerOpen={() => {
        dispatchGuiAction({ type: "TOGGLE_SHOW_CLUSTER", payload: true });
      }}
      onClusterPickerClose={() => {
        dispatchGuiAction({ type: "TOGGLE_SHOW_CLUSTER", payload: false });
      }}
      onTimelineClick={() => {
        dispatchGuiAction({ type: "TOGGLE_SHOW_TIMELINE", payload: true });
        doSetTimelineNodes();
      }}
      onPngExportClick={({ maxWidth, maxHeight }) => {
        if (!cy) return;
        const png = cy.png({ output: "blob", bg: "#ffffff", maxWidth, maxHeight, full: true });
        downloadPng(getFilename(graphState), png);
      }}
      SidebarProps={{
        tabIndex: guiState.sidebarTabIndex,
        setTabIndex: (tabIndex) => {
          dispatchGuiAction({ type: "SET_SIDEBAR_TAB_INDEX", payload: tabIndex });
        },
        DataExplorerProps: {
          SelectedElementsListProps: {
            selectedNodes,
            selectedEdges,
            selectedNodeGroups,
            selectedEdgeGroups,

            selectedDrawing: graphState.selectedDrawing,

            grouppableSelectedNodes: graphState.grouppableSelectedNodes,

            stylesheetMap: graphState.stylesheetMap,
            icons: graphState.icons,

            onChangeNode: (data) => {
              dispatchCyAction({ type: "CHANGE_NODE", payload: data });
              refreshLegend(true);
            },
            onDeleteNode: (data) => {
              dispatchCyAction({ type: "DELETE_NODE", payload: data });
              refreshLegend(true);
            },
            onGroupNodes: () => {
              dispatchCyAction({ type: "CREATE_NODE_GROUP" });
            },
            onChangeNodeGroup: (data) => {
              dispatchCyAction({ type: "CHANGE_NODE_GROUP", payload: data });
              refreshLegend(true);
            },
            onAddNodesToGroup: () => {
              dispatchCyAction({ type: "ADD_NODES_TO_GROUP" });
            },
            onRemoveNodeGroup: (data) => {
              dispatchCyAction({ type: "REMOVE_NODE_GROUP", payload: data });
            },
            onExcludeNodesFromGroup: (data) => {
              dispatchCyAction({ type: "REMOVE_CHILD_FROM_NODE_GROUP", payload: data });
            },
            onDeleteNodeGroupAndChildren: (data) => {
              dispatchCyAction({ type: "DELETE_NODE_GROUP_AND_CHILDREN", payload: data });
              refreshLegend(true);
            },
            onAddNodeAttribute: (data) => {
              dispatchCyAction({ type: "ADD_NODE_ATTRIBUTE", payload: data });
            },
            onChangeNodeAttribute: (data) => {
              dispatchCyAction({ type: "CHANGE_NODE_ATTRIBUTE", payload: data });
              if (data.data.saveInDb && data.data.key) {
                updateAttributeMutation.mutate({ systemId: data.systemId, itemId: data.itemId, data: { [data.data.key]: data.data.value } });
              }
            },
            onDeleteNodeAttribute: (data) => {
              dispatchCyAction({ type: "DELETE_NODE_ATTRIBUTE", payload: data });
            },
            onChangeEdge: (data) => {
              dispatchCyAction({ type: "CHANGE_EDGE", payload: data });
              refreshLegend();
            },
            onDeleteEdge: (data) => {
              dispatchCyAction({ type: "DELETE_EDGE", payload: data });
              refreshLegend();
            },
            onChangeEdgeGroup: (data) => {
              dispatchCyAction({ type: "CHANGE_EDGE_GROUP", payload: data });
              refreshLegend();
            },
            onRemoveEdgeGroup: (data) => {
              dispatchCyAction({ type: "REMOVE_EDGE_GROUP", payload: data });
            },
            onExcludeEdgesFromGroup: (data) => {
              dispatchCyAction({ type: "REMOVE_CHILD_FROM_EDGE_GROUP", payload: data });
            },
            onDeleteEdgeGroupAndChildren: (data) => {
              dispatchCyAction({ type: "DELETE_EDGE_GROUP_AND_CHILDREN", payload: data });
            },
            onAddEdgeAttribute: (data) => {
              dispatchCyAction({ type: "ADD_EDGE_ATTRIBUTE", payload: data });
            },
            onChangeEdgeAttribute: (data) => {
              dispatchCyAction({ type: "CHANGE_EDGE_ATTRIBUTE", payload: data });
            },
            onDeleteEdgeAttribute: (data) => {
              dispatchCyAction({ type: "DELETE_EDGE_ATTRIBUTE", payload: data });
            },
            onAddIcon: async (file) => {
              const base64 = await readFileToBase64(file);
              const checksumm = sha256(base64);
              const newStylesheet = new Map(graphState.stylesheetMap);

              const icon: Icon = {
                src: base64,
                sha256: checksumm,
                label: file.name,
              };

              const iconKey = checksumm.substring(0, 7);
              const className = getIconClassName(iconKey);

              addIconToStylesheet(base64, className, newStylesheet);
              dispatchGraphAction({
                type: "SET_STYLESHEET_MAP",
                payload: newStylesheet,
              });
              dispatchGraphAction({ type: "SET_ICONS", payload: { ...graphState.icons, [iconKey]: icon } });
              refreshLegend();
            },
            onUpdateIcon: (iconKey, icon) => {
              dispatchGraphAction({ type: "SET_ICONS", payload: { ...graphState.icons, [iconKey]: icon } });
              refreshLegend();
            },
            onRequestNodeConnectionsCountClick: (data) => {
              getNodeConnectionsMutation.mutate(data);
            },
            onHideElement: (element) => {
              hideElement(element);
              refreshLegend();
            },
            onHideElements: (elementsKind) => {
              dispatchCyAction({ type: "HIDE_SELECTED_ELEMENTS", payload: elementsKind });
              refreshLegend();
            },
            onDrawingDelete: (node) => {
              dispatchGraphAction({ type: "SET_SELECTED_DRAWING", payload: null });
              node.remove();
            },
            onDrawingChange: (node, style, label) => {
              node.data("style", style);
              node.data("label", label);

              Object.keys(style).forEach((key) => {
                // @ts-ignore
                const v = style[key];
                if ((v === undefined || v === null || v === "") && node.style(key)) {
                  node.style(key, undefined);
                }
                node.style(key, v);
              });
            },
          },

          AddNodeProps: {
            nodeTypeList: getNodeTypesMutation.data?.data?.data || [],
            icons: graphState.icons,
            onAddNodeClick: async (nodeType) => {
              getNodeTemplateMutation.mutate(nodeType);
            },
            nodeTemplate: getNodeTemplateMutation.data,
            error: getNodeTemplateMutation.error,
            isLoadingSystemId:
              (getNodeTemplateMutation.isLoading ? getNodeTemplateMutation.variables?.system_id : undefined) ||
              (createNodeMutation.isLoading ? createNodeMutation.variables?.systemId : undefined),
            onCancel: () => {
              getNodeTemplateMutation.reset();
            },
            onConfirmAddNode: async (nodeTemplate) => {
              try {
                await createNodeMutation.mutateAsync(nodeTemplate);
                refreshLegend(true);
              } catch {}
              getNodeTemplateMutation.reset();
            },
          },

          AddDrawingProps: {
            onAddClick: () => {
              dispatchCyAction({ type: "ADD_DRAWING" });
            },
          },

          HiddenElementsListProps: {
            hiddenNodeGroups,
            hiddenNodes,
            hiddenEdgeGroups,
            hiddenEdges,
            onShowElement: (element) => {
              showElement(element);
              refreshLegend();
            },
            onShowElements: (elementsKind) => {
              dispatchCyAction({ type: "SHOW_HIDDEN_ELEMENTS", payload: elementsKind });
              refreshLegend();
            },
          },
        },

        QueueListProps: {
          CommonSearchProps: {
            selectedNodes,
            ConnectionStatisticProps: {
              getNodeConnectionStatisticMutation,
            },
            SearchRequestTypePickerProps: {
              connectionsList: connectionsDetailMutation.data?.data?.data || [],
              onSearchTypeChange: (searchType) => {
                if (searchType === "connected" || searchType === "flows") {
                  const nodeSystemIds: string[] = selectedNodes.map((node) => node.data("payload").system_id);
                  if (nodeSystemIds.length === 1) {
                    connectionsDetailMutation.mutate(nodeSystemIds[0]);
                  }
                }
              },
            },
            onSearchCreateRequest: createSearchRequest,
          },
          MetaSearchProps: {
            onMount: () => {
              if (getMetagroupsMutation.isIdle) {
                getMetagroupsMutation.mutate();
              }
            },
            metagroups: getMetagroupsMutation.data?.data?.data || [
              {
                id: 2,
                name: "Карты",
                "node-types": [],
              },
              {
                id: 3,
                name: "МО_Автор",
                "node-types": [],
              },
              {
                id: 4,
                name: "Наименование товара",
                "node-types": [],
              },
              {
                id: 5,
                name: "МО_книга",
                "node-types": [],
              },
              {
                id: 6,
                name: "МО_континент",
                "node-types": [],
              },
              {
                id: 7,
                name: "МО_0",
                "node-types": [],
              },
              {
                id: 9,
                name: "МП-Г  население и континент",
                "node-types": [
                  {
                    id: 78,
                    name: "Вершина_Континент",
                    "meta-fields": [
                      {
                        id: 25,
                        name: "МП_названия_континентов",
                      },
                    ],
                  },
                ],
              },
              {
                id: 8,
                name: "МП-Г Вершины Страна и Континент",
                "node-types": [
                  {
                    id: 78,
                    name: "Вершина_Континент",
                    "meta-fields": [
                      {
                        id: 25,
                        name: "МП_названия_континентов",
                      },
                    ],
                  },
                  {
                    id: 79,
                    name: "Вершина_Страна",
                    "meta-fields": [],
                  },
                ],
              },
              {
                id: 10,
                name: "МГ- Товар и Номер декларации = Таможенный орган",
                "node-types": [
                  {
                    id: 38,
                    name: "Товар",
                    "meta-fields": [
                      {
                        id: 20,
                        name: "Таможенный орган",
                      },
                    ],
                  },
                  {
                    id: 39,
                    name: "Вершина по nd",
                    "meta-fields": [
                      {
                        id: 20,
                        name: "Таможенный орган",
                      },
                    ],
                  },
                ],
              },
              {
                id: 1,
                name: "Пустая мета-группа",
                "node-types": [],
              },
              {
                id: 11,
                name: "ТРАНСПОРТНОЕ СРЕДСТВО",
                "node-types": [
                  {
                    id: 61,
                    name: "СМЭВ: Рег. действия ТС",
                    "meta-fields": [
                      {
                        id: 27,
                        name: "ГРЗ ТС",
                      },
                    ],
                  },
                  {
                    id: 62,
                    name: "СМЭВ: Транспортные средства",
                    "meta-fields": [
                      {
                        id: 27,
                        name: "ГРЗ ТС",
                      },
                      {
                        id: 28,
                        name: "Год выпуска ТС",
                      },
                    ],
                  },
                ],
              },
            ],
            onSearchMetagroupCreateRequest: createSearchRequest,
          },
          onChangeClick: (data) => {
            updateSearchMutation.mutate({ id: data.id || 0, data: { name: data.name, is_favorites: data.is_favorites } });
          },
          createdSearches: getSearchesMutation.data?.data?.data || [],
          onGetClick: (data) => {
            getSearchMutation.mutate(data.id || 0);
          },
          onRefreshClick: () => {
            getSearchesMutation.mutate();
          },
        },

        SnapshotListProps: {
          snapshots: getSnapshotsMutation.data?.data.data || [],
          onAddSnapshotClick: () => {
            createRemoteSnapshot();
          },
          onDeleteClick: (snapshotId) => {
            deleteSnapshot(snapshotId);
          },
          onLoadClick: (snapshotId) => {
            loadSnapshot(snapshotId);
          },
          onUpdateClick: (snapshotId) => {
            updateSnapshot(snapshotId);
          },
        },

        GraphSettingsProps: {
          onRefreshStylesClick: () => {
            loadStylesheets();
          },
          NodeStylesSettingsProps: {
            stylesheetMap: graphState.stylesheetMap,
            onAdd: () => {
              const nodeConditionStylesheets = new Map(guiState.nodeConditionStyles);
              const className = uuid();
              const selector = `.${className}`;
              nodeConditionStylesheets.set(selector, {
                title: `Новый стиль ${guiState.nodeConditionStyles.size + 1}`,
                selector,
                filter: initialFilterState,
              });
              dispatchGuiAction({ type: "SET_NODE_CONDITION_STYLES", payload: nodeConditionStylesheets });
            },
            onDelete: (item) => {
              dispatchCyAction({ type: "DELETE_CONDITION_STYLE", payload: { item, kind: "node" } });
            },
            onApply: (item, style) => {
              dispatchCyAction({ type: "CHANGE_CONDITION_STYLE", payload: { item, kind: "node", style } });
              dispatchCyAction({
                type: "APPLY_CONDITION_STYLE",
                payload: {
                  item: item,
                  kind: "node",
                  style,
                },
              });
            },
            FilterProps: {
              icons: graphState.icons,
              usedNodeIcons: legendProps.usedNodeIcons,
              attributesMap: graphState.attributesMap,
              // @ts-expect-error
              metaAttributesMap: graphState.metaAttributesMap,
              systemIds: graphState.nodeSystemIds,
              systemTypes: graphState.nodeTypesMap,
            },
            nodeConditionStyles: guiState.nodeConditionStyles,
          },
          EdgeStylesSettingsProps: {
            stylesheetMap: graphState.stylesheetMap,
            onAdd: () => {
              const edgeConditionStylesheets = new Map(guiState.edgeConditionStyles);
              const className = uuid();
              const selector = `.${className}`;
              edgeConditionStylesheets.set(selector, {
                title: `Новый стиль ${guiState.edgeConditionStyles.size + 1}`,
                selector,
                filter: initialFilterState,
              });
              dispatchGuiAction({ type: "SET_EDGE_CONDITION_STYLES", payload: edgeConditionStylesheets });
            },
            onDelete: (item) => {
              dispatchCyAction({ type: "DELETE_CONDITION_STYLE", payload: { item, kind: "edge" } });
            },
            onApply: (item, style) => {
              dispatchCyAction({ type: "CHANGE_CONDITION_STYLE", payload: { item, kind: "edge", style } });
              dispatchCyAction({
                type: "APPLY_CONDITION_STYLE",
                payload: {
                  item,
                  kind: "edge",
                  style,
                },
              });
            },
            FilterProps: {
              icons: graphState.icons,
              usedNodeIcons: legendProps.usedNodeIcons,
              attributesMap: graphState.edgeAttributesMap,
              systemIds: graphState.edgeSystemIds,
              systemTypes: graphState.edgeTypesMap,
            },
            edgeConditionStyles: guiState.edgeConditionStyles,
          },
          GridSettingsProps: {
            gridSettingsState: guiState.grid,
            onChange: (data) => {
              dispatchGuiAction({ type: "SET_GRID_SETTINGS", payload: data });
            },
          },
          LegendSettingProps: {
            icons: graphState.icons,
            legendState: guiState.legendSettings,
            usedNodeIcons: legendProps.usedNodeIcons,
            nodeSystemIdsOnGraph: graphState.nodeSystemIds,
            edgeSystemIdsOnGraph: graphState.edgeSystemIds,
            nodeTypesMap: graphState.nodeTypesMap,
            edgeTypesMap: graphState.edgeTypesMap,
            onChange: (legendState) => {
              dispatchGuiAction({ type: "SET_LEGEND_STATE", payload: legendState });
            },
          },
          WorldMapSettingsProps: {
            worldMapState: guiState.worldMap,
            onChange: (worldMapState) => {
              dispatchGuiAction({ type: "SET_WORLD_MAP_STATE", payload: worldMapState });
            },
          },
        },
      }}
      FilterProps={{
        icons: graphState.icons,
        usedNodeIcons: legendProps.usedNodeIcons,
        attributesMap: graphState.attributesMap,
        metaAttributesMap: graphState.metaAttributesMap,
        systemIds: graphState.nodeSystemIds,
        systemTypes: graphState.nodeTypesMap,
        filters: guiState.filters,
        isIgnoreDashboardFilters: guiState.isIgnoreDashboardFilters,
        onToggleisIgnoreDashboardFilters: (value) => {
          dispatchGuiAction({ type: "SET_ACCEPT_DASHBOARD_FILTERS", payload: value });
        },
        onChange: (filters) => {
          onChangeFilters(filters);
        },
      }}
      ClusterPickerProps={{
        attributesMap: graphState.attributesMap,
        nodeSystemIds: graphState.nodeSystemIds,
        onChange: (args) => {
          dispatchCyAction({ type: "CLUSTER", payload: args });
        },
      }}
      LegendProps={{
        icons: graphState.icons,
        legendSettings: guiState.legendSettings,
        parentHeight: props.containerHeight,
        nodeTypesMap: graphState.nodeTypesMap,
        edgeTypesMap: graphState.edgeTypesMap,
        ...legendProps,
      }}
      TimelineDrawerProps={{
        isOpen: guiState.isTimelineOpen,
        nodes: timelineNodes,
        onClose: () => {
          dispatchGuiAction({ type: "TOGGLE_SHOW_TIMELINE", payload: false });
          setTimelineNodes(null);
        },
        // @ts-ignore
        onChange: (data) => {
          dispatchCyAction({ type: "CHAGNE_NODE_TIMELINE_SETTINGS", payload: data });
          doSetTimelineNodes();
        },
      }}
    />
  );
}

export default GuiContainer;
