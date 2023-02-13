import { GraphReducer, GuiReducer } from "../types";

export const graphReducer: GraphReducer = (state, action) => {
  switch (action.type) {
    case "SET_GRAPH_ID":
      return {
        ...state,
        graphId: action.payload,
      };
    case "SET_GRAPH_META":
      return {
        ...state,
        graphMeta: action.payload,
      };
    case "SET_META_FIELDS":
      return {
        ...state,
        metaFields: action.payload,
      };
    case "SET_ICONS":
      return {
        ...state,
        icons: action.payload,
      };
    case "SET_SELECTED_ELEMENTS":
      return {
        ...state,
        ...(action.payload.selectedNodes ? { selectedNodes: action.payload.selectedNodes } : null),
        ...(action.payload.selectedEdges ? { selectedEdges: action.payload.selectedEdges } : null),
        ...(action.payload.selectedNodeGroups ? { selectedNodeGroups: action.payload.selectedNodeGroups } : null),
        ...(action.payload.selectedEdgeGroups ? { selectedEdgeGroups: action.payload.selectedEdgeGroups } : null),

        ...(action.payload.grouppableSelectedNodes ? { grouppableSelectedNodes: action.payload.grouppableSelectedNodes } : null),
      };
    case "SET_HIDDEN_ELEMENTS": {
      return {
        ...state,

        ...(action.payload.hiddenEdges ? { hiddenEdges: action.payload.hiddenEdges } : null),
        ...(action.payload.hiddenNodes ? { hiddenNodes: action.payload.hiddenNodes } : null),
        ...(action.payload.hiddenNodeGroups ? { hiddenNodeGroups: action.payload.hiddenNodeGroups } : null),
        ...(action.payload.hiddenEdgeGroups ? { hiddenEdgeGroups: action.payload.hiddenEdgeGroups } : null),
      };
    }
    case "RESET_SELECTED_ELEMENTS":
      return {
        ...state,
        selectedNodes: new Map(),
        selectedEdges: new Map(),
        selectedNodeGroups: new Map(),
        selectedEdgeGroups: new Map(),
        grouppableSelectedNodes: new Set(),
        selectedDrawing: null,
      };
    case "RESET_HIDDEN_ELEMENTS":
      return {
        ...state,
        hiddenNodes: new Map(),
        hiddenEdges: new Map(),
        hiddenNodeGroups: new Map(),
        hiddenEdgeGroups: new Map(),
      };
    case "SET_DEFAULT_STYLESHEET":
      return {
        ...state,
        defaultStylesheet: action.payload,
      };
    case "SET_STYLESHEET_MAP":
      return {
        ...state,
        stylesheetMap: action.payload,
      };

    case "SET_ATTRIBUTES_MAP":
      return {
        ...state,
        attributesMap: action.payload,
      };
    case "SET_META_ATTRIBUTES_MAP":
      return {
        ...state,
        metaAttributesMap: action.payload,
      };
    case "SET_NODE_TYPES_MAP":
      return {
        ...state,
        nodeTypesMap: action.payload,
      };
    case "SET_EDGE_TYPES_MAP":
      return {
        ...state,
        edgeTypesMap: action.payload,
      };
    case "SET_EDGE_ATTRIBUTES_MAP":
      return {
        ...state,
        edgeAttributesMap: action.payload,
      };
    case "SET_NODE_SYSTEM_IDS":
      return {
        ...state,
        nodeSystemIds: action.payload,
      };
    case "SET_EDGE_SYSTEM_IDS":
      return {
        ...state,
        edgeSystemIds: action.payload,
      };
    case "SET_SELECTED_DRAWING":
      return {
        ...state,
        selectedDrawing: action.payload,
      };
  }
  return state;
};

export const guiReducer: GuiReducer = (state, action) => {
  switch (action.type) {
    case "SET_TRACK_UNSAVED_CHANGES":
      return {
        ...state,
        isTrackGraphUnsaved: action.payload,
      };
    case "TOGGLE_SHOW_DATA_EXPLORER":
      return {
        ...state,
        isDataExplorerOpen: action.payload,
      };
    case "TOGGLE_PROGRESS_BAR":
      return {
        ...state,
        isProgressBarEnabled: action.payload,
      };
    case "SET_IS_GRAPH_UNSAVED":
      return {
        ...state,
        isGraphUnsaved: action.payload,
      };
    case "TOGGLE_SHOW_FILTER":
      return {
        ...state,
        isFilterOpen: action.payload,
      };
    case "TOGGLE_SHOW_TIMELINE":
      return {
        ...state,
        isTimelineOpen: action.payload,
      };
    case "TOGGLE_SHOW_CLUSTER":
      return {
        ...state,
        isClusterOpen: action.payload,
      };

    case "SET_FILTERS":
      return {
        ...state,
        filters: action.payload,
      };
    case "SET_MAX_Z_INDEX":
      return {
        ...state,
        maxZindex: action.payload,
      };
    case "SET_MIN_Z_INDEX":
      return {
        ...state,
        minZindex: action.payload,
      };
    case "SET_GRID_SETTINGS":
      return {
        ...state,
        grid: action.payload,
      };
    case "SET_ZOOM":
      return {
        ...state,
        zoom: action.payload,
      };
    case "SET_CONFIRM_DIALOG_STATE":
      return {
        ...state,
        confirmDialogState: action.payload,
      };
    case "SET_LEGEND_STATE":
      return {
        ...state,
        legendSettings: action.payload,
      };
    case "SET_WORLD_MAP_STATE":
      return {
        ...state,
        worldMap: action.payload,
      };
    case "SET_NODE_CONDITION_STYLES":
      return {
        ...state,
        nodeConditionStyles: action.payload,
      };
    case "SET_EDGE_CONDITION_STYLES":
      return {
        ...state,
        edgeConditionStyles: action.payload,
      };
    case "SET_ACCEPT_DASHBOARD_FILTERS":
      return {
        ...state,
        isIgnoreDashboardFilters: action.payload,
      };
    case "SET_IS_DASHBOARD":
      return {
        ...state,
        isDashboard: action.payload,
      };
    case "SET_SIDEBAR_TAB_INDEX":
      return {
        ...state,
        sidebarTabIndex: action.payload,
      };
  }
};
