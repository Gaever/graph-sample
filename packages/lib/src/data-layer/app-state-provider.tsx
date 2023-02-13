import { initialFilterState } from "../components/filter";
import { initialGridState } from "../components/grid-settings";
import { initialLegendState } from "../components/legend-settings";
import { initialWorldMapState } from "../components/world-map-settings";
import { initialConfirmDialogState } from "../containers/confirm-dialog";
import { initCy } from "./cy-functions/cy-init";
import { useDispatchCyAction } from "./cy-functions/use-dispatch-cy-action";
import { graphReducer, guiReducer } from "./reducers";
import { AppStateCtx, GraphReducer, GuiReducer } from "../types";
import noop from "lodash/noop";
import React, { useEffect, useReducer, useRef } from "react";

const initialStoreState: AppStateCtx = {
  cy: null,
  cyContainerRef: null,
  dispatchCyAction: noop,

  graphState: {
    graphId: undefined,

    attributesMap: new Map(),
    metaAttributesMap: new Map(),

    edgeAttributesMap: new Map(),
    nodeSystemIds: new Set(),
    edgeSystemIds: new Set(),

    edgeTypesMap: new Map(),
    nodeTypesMap: new Map(),

    selectedNodes: new Map(),
    selectedEdges: new Map(),
    selectedNodeGroups: new Map(),
    selectedEdgeGroups: new Map(),

    selectedDrawing: null,

    hiddenEdgeGroups: new Map(),
    hiddenEdges: new Map(),
    hiddenNodeGroups: new Map(),
    hiddenNodes: new Map(),

    grouppableSelectedNodes: new Set(),

    defaultStylesheet: [],
    stylesheetMap: new Map(),

    graphMeta: {},
    icons: {},

    metaFields: [],
  },
  dispatchGraphAction: noop,

  guiState: {
    isDataExplorerOpen: false,
    isProgressBarEnabled: false,
    isGraphUnsaved: false,
    isTrackGraphUnsaved: false,
    isFilterOpen: false,
    isClusterOpen: false,
    isTimelineOpen: false,
    filters: initialFilterState,
    maxZindex: 10000,
    minZindex: 5000,
    grid: initialGridState,
    zoom: 1,
    isMergeMode: false,
    confirmDialogState: initialConfirmDialogState,
    legendSettings: initialLegendState,
    worldMap: initialWorldMapState,
    nodeConditionStyles: new Map(),
    edgeConditionStyles: new Map(),
    isIgnoreDashboardFilters: false,
    isDashboard: false,
    sidebarTabIndex: 0,
  },
  dispatchGuiAction: noop,
};

export const appStateCtx = React.createContext<AppStateCtx>(initialStoreState);

export function AppStateProvider(props: { children: React.ReactNode }) {
  const [graphState, dispatchGraphAction] = useReducer<GraphReducer>(graphReducer, initialStoreState.graphState);
  const [guiState, dispatchGuiAction] = useReducer<GuiReducer>(guiReducer, initialStoreState.guiState);

  const cyRef = useRef<AppStateCtx["cy"]>(null);
  const cy = cyRef.current;
  const cyContainerRef: AppStateCtx["cyContainerRef"] = useRef(null);

  const dispatchCyAction = useDispatchCyAction({ cy, graphState, guiState, dispatchGraphAction, dispatchGuiAction });

  useEffect(() => {
    dispatchCyAction({ type: "REFRESH_STYLESHEET", payload: graphState.stylesheetMap });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphState.defaultStylesheet, graphState.stylesheetMap]);

  useEffect(() => {
    if (cyContainerRef.current && !cyRef.current) {
      cyRef.current = initCy({ dispatchGraphAction, dispatchGuiAction, cyContainer: cyContainerRef.current, guiState });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cyContainerRef.current, cyRef.current]);

  return (
    <appStateCtx.Provider
      value={{
        cy,
        cyContainerRef,
        dispatchCyAction,

        graphState,
        dispatchGraphAction,

        guiState,
        dispatchGuiAction,
      }}
    >
      {props.children}
    </appStateCtx.Provider>
  );
}
