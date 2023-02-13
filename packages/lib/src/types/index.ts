import {
  Connection,
  ConnectionGroup,
  Field,
  Graph,
  Group,
  MetaField,
  Node,
  NodeTypeList,
  NodeTypesAndConnections,
  SearchAllPossibleParams,
  SearchInfoCreate,
  SearchLookAlike,
} from "../http/api";
import cytoscape from "cytoscape";
import React from "react";

export interface ElementRect {
  width: number;
  height: number;
}

export type Payload = {
  key: string;
  label?: string;
  value?: string;
};

export interface JsonExport {
  elements: {
    nodes: CyNode[];
    edges: CyEdge[];
  };
}

export interface CyNode extends cytoscape.ElementDefinition {
  data: cytoscape.ElementDefinition["data"] & {
    label?: string;
    className?: string;
    subIcons?: string;
    payload?: Node;
  };
}

export interface CyGroup extends cytoscape.ElementDefinition {
  data: cytoscape.ElementDefinition["data"] & {
    label?: string;
    className?: string;
    payload?: Group;
  };
}

export interface CyEdge extends cytoscape.ElementDefinition {
  data: cytoscape.ElementDefinition["data"] & {
    label?: string;
    className?: string;
    payload?: Connection;
  };
}

export interface Drawing extends cytoscape.ElementDefinition {}

export type StringType = "string" | "date" | "number";
export type AlignKind = "hl" | "hr" | "hc" | "vb" | "vc" | "vt" | "dh" | "dv";
export type MergeKind = "full-merge" | "left-merge" | "right-merge";
export type CollapseEdgesKind = "collapse-all" | "collapse-by-system-id";

export type GraphMeta = Record<string, string | number | undefined>;

export type StoreGraph = (graph: Graph, stylesheetMap: StylesheetMap, nodeTypesAndConnections: NodeTypesAndConnections) => Set<string>;
export type StylesheetMap = Map<string, cytoscape.StylesheetStyle>;
export type GetSnapshot = () => Promise<{ fileName: string; json: string; checkSumm: string; graph: Graph }>;

export type attributeFilterCondition =
  | "str-eq"
  | "str-include"
  | "str-not-include"
  | "str-fuzzy"
  | "str-start"
  | "str-end"
  | "null"
  | "not-null"
  | "num-gt"
  | "num-lt"
  | "num-gte"
  | "num-lte"
  | "num-eq"
  | "num-neq"
  | "date-range";

export type dashboardFilterCondition = "=" | "%LIKE%" | "NOT LIKE" | "LIKE%" | "%LIKE" | "EMPTY" | "NOT EMPTY" | "NULL" | "NOT NULL" | ">" | "<" | ">=" | "<=" | "!=";

export interface dashboardMetaField {
  id: string | number;
  name: string;
}

export type dashboardFilter = {
  crud_field_name: string | undefined;
  condition_enum: dashboardFilterCondition;
  condition_value: string | undefined;
  meta_field: dashboardMetaField | undefined;
  meta_field_id: string | number | undefined;
};

type filter = {
  filterKey?: string;
  value?: string;
};

export interface mappedFilterData {
  iconsSet: Set<string>;
  systemIdsSet: Set<string>;
  attributeFilters: attributeFilter[];
  metaAttributeFilters: attributeFilter[];
}

export type attributeFilter = filter & {
  condition?: attributeFilterCondition;
  fuzzyValue?: string;
  dateRange?: { from?: Date; to?: Date };
};

export type metaGroupFilter = {
  filterKey?: string;
  condition?: "eq" | "ne" | "lt" | "gt" | "lte" | "gte" | "like";
  value?: string;
};

export type systemIdFilter = string;
export type iconFilter = string;

export type filters = {
  icons: iconFilter[];
  attributes: attributeFilter[];
  metaAttributes: attributeFilter[];
  systemIds: systemIdFilter[];
  isHideFiltered?: boolean;
};

export interface Action<T, P = undefined, A = any> {
  type: T;
  payload: P;
  callback?: (args?: A) => void;
}

export type StylesheetDefaults = { defaultStylesheet: cytoscape.StylesheetStyle[]; selectedOverrides: cytoscape.StylesheetStyle[] };

// Изменение внешнего вида и группировок элементов

// Узлы
export type OnChangeNodePayload = {
  labelTemplate?: string;
  style?: cytoscape.Css.Node;
  iconKey?: string;
  subIcons?: string[];
  isFlash?: boolean;
  isApplyStyleToAllNodesWithSameSystemId?: boolean;
  isApplyLabelToAllNodesWithSameSystemId?: boolean;
  isApplyIconToAllNodesWithSameSystemId?: boolean;
  isApplySubIconsToAllNodesWithSameSystemId?: boolean;
};
export type OnChangeNode = (args: { nodeGuid: string; data: OnChangeNodePayload }) => void;
export type OnChangeNodeGroupPayload = {
  label?: string;
  style?: cytoscape.Css.Node;
  iconKey?: string;
  subIcons?: string[];
  isApplyStyleToAllGroups?: boolean;
  isApplyIconToAllGroups?: boolean;
};
export type OnChangeNodeGroup = (args: { groupId: string; data: OnChangeNodeGroupPayload }) => void;
export type OnGroupNodes = () => void;
export type OnExcludeNodesFromGroup = (args: { groupId: string; nodesData?: CyNode["data"][] }) => void;
export type OnDeleteNodeGroupAndChildren = (args: { groupId: string }) => void;
export type OnDeleteNode = (args: { elementGuid: string }) => void;

// Атрибуты узлов
export type OnAddNodeAttributePayload = Field & {
  formatVariant?: number;
  isAddToAllNodesWithSameSystemId: boolean;
};
export type OnAddNodeAttribute = (args: { elementGuid: string; data: OnAddNodeAttributePayload }) => void;
export type OnChangeAttributePayload = Field & {
  formatVariant?: number;
  saveInDb?: boolean;
  isApplyLabelToAllNodesWithSameSystemId?: boolean;
  isApplyFormatVariantToAllNodesWithSameSystemId?: boolean;
  isApplyStyleToAllGroups?: boolean;
};
export type OnChangeNodeAttribute = (args: { elementGuid: string; systemId: string; itemId: string; attributeIndex: number; data: OnChangeAttributePayload }) => void;
export type OnDeleteNodeAttribute = (args: { elementGuid: string; attributeIndex: number }) => void;

// Связи
export type OnChangeEdgePayload = {
  labelTemplate?: string;
  style?: cytoscape.Css.Edge;
  edgeAggregations?: EdgeAggregations;
  isApplyStyleToAllEdges?: boolean;
  isApplyLabelToAllEdges?: boolean;
};
export type OnChangeEdge = (args: { edgeGuid: string; data: OnChangeEdgePayload }) => void;
export type OnChangeEdgeGroupPayload = {
  label?: string;
  style?: cytoscape.Css.Edge;
  edgeAggregations?: EdgeAggregations;
  isApplyStyleToAllGroups?: boolean;
  isApplyLabelToAllGroups?: boolean;
};
export type OnChangeEdgeGroup = (args: { groupId: string; data: OnChangeEdgeGroupPayload }) => void;
export type OnExcludeEdgesFromGroup = (args: { groupId?: string; edgesData?: CyEdge["data"][] }) => void;
export type OnDeleteEdgeGroupAndChildren = (args: { groupId: string }) => void;
export type OnDeleteEdge = (args: { elementGuid: string }) => void;

// Атрибуты связей
export type OnAddEdgeAttributePayload = Field & {
  formatVariant?: number;
  isAddToAllEdges: boolean;
};
export type OnAddEdgeAttribute = (args: { elementGuid: string; data: OnAddEdgeAttributePayload }) => void;
export type OnChangeEdgeAttribute = (args: { elementGuid: string; attributeIndex: number; data: OnChangeAttributePayload }) => void;
export type OnDeleteEdgeAttribute = (args: { elementGuid: string; attributeIndex: number }) => void;

export type OnSearchCreateRequest = (args: SearchInfoCreate & SearchAllPossibleParams) => void;
export type OnSearchMetagroupCreateRequest = (args: SearchInfoCreate & SearchAllPossibleParams) => void;

export type OnAddNodeClick = (args: NodeTypeList) => void;
export type OnConfirmAddNode = (nodeTemplate: NodeTemplate) => void;

export type elementsKind = "nodes" | "edges" | "edge-groups" | "node-groups";
export type OnHideElement = (element: cytoscape.SingularElementArgument) => void;
export type OnHideElements = (elementsKind: elementsKind) => void;

export type OnShowElement = (element: cytoscape.SingularElementArgument) => void;
export type OnShowElements = (elementsKind: elementsKind) => void;

export type OnRequestNodeConnectionsCountClick = (args: { itemId: string; systemId: string; guid: string }) => void;

export type OnDrawingChange = (node: cytoscape.NodeSingular, style: cytoscape.Css.Node, label: string | undefined) => void;
export type OnDrawingDelete = (node: cytoscape.NodeSingular) => void;

type guid = string;

export interface GraphState {
  graphId: string | undefined;

  // Ноды, которые пользователь выбрал мышкой
  selectedNodes: Map<guid, cytoscape.NodeSingular>;
  // Связи, которые пользователь выбрал мышкой
  selectedEdges: Map<guid, cytoscape.EdgeSingular>;
  // Группы нод, которые пользователь выбрал мышкой
  selectedNodeGroups: Map<string, cytoscape.NodeSingular>;
  // Свернутые связи, которые пользователь выбрал мышкой
  selectedEdgeGroups: Map<string, cytoscape.EdgeSingular>;

  // Графические примитивы, которые пользователь выбрал мышкой
  selectedDrawing: cytoscape.NodeSingular | null;

  // Ноды, которые скрыл пользователь или фильтр
  hiddenNodes: Map<guid, cytoscape.NodeSingular>;
  // Связи, которые скрыл пользователь или фильтр
  hiddenEdges: Map<guid, cytoscape.EdgeSingular>;
  // Группы узлов, которые скрыл пользователь или фильтр
  hiddenNodeGroups: Map<guid, cytoscape.NodeSingular>;
  // Группы связей, которые скрыл пользователь или фильтр
  hiddenEdgeGroups: Map<guid, cytoscape.EdgeSingular>;

  // Узлы, которые пользователь выбрал и из которые можно создать группу
  grouppableSelectedNodes: Set<guid>;
  // Иконки, которые используются на графе
  icons: Graph["icons"];
  // Прочая информация о графе (например дата создания)
  graphMeta: GraphMeta;
  // Стили графа по умолчанию
  defaultStylesheet: cytoscape.StylesheetStyle[];
  // Реальные стили на графе
  stylesheetMap: StylesheetMap;
  // Все возможные уникальные атрибуты узлов на графе
  attributesMap: Map<string, string>;
  // Все возможные уникальные мета-атрибуты узлов на графе
  metaAttributesMap: Map<string, MetaField>;
  // Все возможные уникальные атрибуты связей на графе
  edgeAttributesMap: Map<string, string>;
  // Все возможные уникальные типы узлов на графе
  nodeSystemIds: Set<string>;
  // Все возможные уникальные типы связей на графе
  edgeSystemIds: Set<string>;
  // Все возможные уникальные типы узлов, которые вообще могут быть (определенные бэкендом)
  nodeTypesMap: NodeTypesMap;
  // Все возможные уникальные типы связей, которые вообще могут быть (определенные бэкендом)
  edgeTypesMap: ConnectionTypesMap;

  metaFields: MetaField[];
}

export type NodeTypesMap = Map<string, NonNullable<NodeTypesAndConnections["node_types"]>[number]>;
export type ConnectionTypesMap = Map<string, NonNullable<NodeTypesAndConnections["connections"]>[number]>;

export interface ElementFormatterAggregation
  extends Pick<GraphState, "stylesheetMap" | "attributesMap" | "metaAttributesMap" | "edgeAttributesMap" | "nodeSystemIds" | "edgeSystemIds">,
    Pick<GuiState, "maxZindex" | "minZindex" | "nodeConditionStyles" | "edgeConditionStyles"> {
  classesToRequest?: Set<string>;
  nodeTypesMap: NodeTypesMap;
  connectionTypesMap: ConnectionTypesMap;
}

export type GraphElements = {
  nodes: Map<guid, CyNode>;
  edges: Map<guid, CyEdge>;
  groups: Map<string, CyGroup>;
  edgeGroups: ConnectionGroup[] | null;
  drawings: Map<string, Drawing>;
};
export type SelectedElements = Pick<GraphState, "selectedNodes" | "selectedEdges" | "selectedNodeGroups" | "selectedEdgeGroups" | "grouppableSelectedNodes">;
export type HiddenElements = Pick<GraphState, "hiddenNodes" | "hiddenEdges" | "hiddenNodeGroups" | "hiddenEdgeGroups">;

export type GraphReducerAction =
  | Action<"SET_GRAPH_ID", GraphState["graphId"]>
  | Action<"SET_GRAPH_META", GraphState["graphMeta"]>
  | Action<"SET_META_FIELDS", GraphState["metaFields"]>
  | Action<"SET_ICONS", GraphState["icons"]>
  | Action<"SET_SELECTED_ELEMENTS", Partial<SelectedElements>>
  | Action<"SET_HIDDEN_ELEMENTS", Partial<HiddenElements>>
  | Partial<Action<"RESET_SELECTED_ELEMENTS">>
  | Partial<Action<"RESET_HIDDEN_ELEMENTS">>
  | Action<"SET_DEFAULT_STYLESHEET", GraphState["defaultStylesheet"]>
  | Action<"SET_ATTRIBUTES_MAP", GraphState["attributesMap"]>
  | Action<"SET_META_ATTRIBUTES_MAP", GraphState["metaAttributesMap"]>
  | Action<"SET_NODE_TYPES_MAP", GraphState["nodeTypesMap"]>
  | Action<"SET_EDGE_TYPES_MAP", GraphState["edgeTypesMap"]>
  | Action<"SET_EDGE_ATTRIBUTES_MAP", GraphState["edgeAttributesMap"]>
  | Action<"SET_NODE_SYSTEM_IDS", GraphState["nodeSystemIds"]>
  | Action<"SET_EDGE_SYSTEM_IDS", GraphState["edgeSystemIds"]>
  | Action<"SET_STYLESHEET_MAP", GraphState["stylesheetMap"]>
  | Action<"SET_SELECTED_DRAWING", GraphState["selectedDrawing"]>;

export type GraphReducer = React.Reducer<GraphState, GraphReducerAction>;

export interface GridSettingsState {
  show: boolean;
  size: number;
  snap: boolean;
  panGrid: boolean;
  snapToGridCenter: boolean;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmButtonMessage?: string;
  cancelButtonMessage?: string;
  onConfirmCb?: () => void;
  onCancelCb?: () => void;
}

export interface LegendSettingsState {
  show: boolean;
  showConnectionsCount: boolean;
  showNodesCount: boolean;
  showHiddenNodesCount: boolean;
  showHiddenEdgesCount: boolean;
  showIcons: boolean;
  showIconless: boolean;
  showNodeTypes: boolean;
  showEdgeTypes: boolean;
  displayedIcons: Set<string> | undefined;
  usedNodeIcons: Set<string>;
  displayedNodeTypes: Set<string> | undefined;
  displayedEdgeTypes: Set<string> | undefined;
}

export interface WorldMapState {
  show: boolean;
  scale: number;
}

export type ConditionStyle = {
  title: string;
  filter: filters;
  selector: string;
};

export interface GuiState {
  isDataExplorerOpen: boolean;
  isDashboard: boolean;
  isFilterOpen: boolean;
  isClusterOpen: boolean;
  isTimelineOpen: boolean;
  isIgnoreDashboardFilters: boolean;
  isProgressBarEnabled: boolean;
  isGraphUnsaved: boolean;
  isTrackGraphUnsaved: boolean;
  filters: filters;
  maxZindex: number;
  minZindex: number;
  grid: GridSettingsState;
  zoom: number;
  isMergeMode: boolean;
  confirmDialogState: ConfirmDialogState;
  legendSettings: LegendSettingsState;
  worldMap: WorldMapState;
  nodeConditionStyles: Map<string, ConditionStyle>;
  edgeConditionStyles: Map<string, ConditionStyle>;
  sidebarTabIndex: number;
}

export type GuiAction =
  | Action<"TOGGLE_SHOW_DATA_EXPLORER", GuiState["isDataExplorerOpen"]>
  | Action<"TOGGLE_PROGRESS_BAR", boolean>
  | Action<"SET_IS_GRAPH_UNSAVED", boolean>
  | Action<"TOGGLE_SHOW_FILTER", boolean>
  | Action<"TOGGLE_SHOW_CLUSTER", boolean>
  | Action<"TOGGLE_SHOW_TIMELINE", boolean>
  | Action<"SET_FILTERS", filters>
  | Action<"SET_MAX_Z_INDEX", number>
  | Action<"SET_MIN_Z_INDEX", number>
  | Action<"SET_GRID_SETTINGS", GridSettingsState>
  | Action<"SET_ZOOM", number>
  | Action<"SET_CONFIRM_DIALOG_STATE", ConfirmDialogState>
  | Action<"SET_LEGEND_STATE", LegendSettingsState>
  | Action<"SET_WORLD_MAP_STATE", WorldMapState>
  | Action<"SET_TRACK_UNSAVED_CHANGES", boolean>
  | Action<"SET_NODE_CONDITION_STYLES", GuiState["nodeConditionStyles"]>
  | Action<"SET_EDGE_CONDITION_STYLES", GuiState["edgeConditionStyles"]>
  | Action<"SET_ACCEPT_DASHBOARD_FILTERS", GuiState["isIgnoreDashboardFilters"]>
  | Action<"SET_IS_DASHBOARD", GuiState["isDashboard"]>
  | Action<"SET_SIDEBAR_TAB_INDEX", GuiState["sidebarTabIndex"]>;

export type GuiReducer = React.Reducer<GuiState, GuiAction>;

export type CyCallbackAction =
  | Action<"SET_ELEMENTS", GraphElements, () => void>
  | Partial<Action<"SET_UNSAVED">>
  | Partial<Action<"REFRESH_STYLESHEET", StylesheetMap>>
  | Partial<Action<"CENTER">>
  | Action<"LAYOUT", cytoscape.LayoutOptions["name"]>
  | Action<"CHANGE_NODE", Parameters<OnChangeNode>[0]>
  | Action<"DELETE_NODE", Parameters<OnDeleteNode>[0]>
  | Partial<Action<"CREATE_NODE_GROUP">>
  | Action<"CHANGE_NODE_GROUP", Parameters<OnChangeNodeGroup>[0]>
  | Partial<Action<"ADD_NODES_TO_GROUP">>
  | Action<"REMOVE_NODE_GROUP", Parameters<OnExcludeNodesFromGroup>[0]>
  | Action<"REMOVE_CHILD_FROM_NODE_GROUP", Parameters<OnExcludeNodesFromGroup>[0]>
  | Action<"DELETE_NODE_GROUP_AND_CHILDREN", Parameters<OnDeleteNodeGroupAndChildren>[0]>
  | Action<"ADD_NODE_ATTRIBUTE", Parameters<OnAddNodeAttribute>[0]>
  | Action<"CHANGE_NODE_ATTRIBUTE", Parameters<OnChangeNodeAttribute>[0]>
  | Action<"DELETE_NODE_ATTRIBUTE", Parameters<OnDeleteNodeAttribute>[0]>
  | Action<"CREATE_EDGE_GROUP", CollapseEdgesKind>
  | Action<"CHANGE_EDGE", Parameters<OnChangeEdge>[0]>
  | Action<"DELETE_EDGE", Parameters<OnDeleteEdge>[0]>
  | Action<"CHANGE_EDGE_GROUP", Parameters<OnChangeEdgeGroup>[0]>
  | Action<"REMOVE_EDGE_GROUP", Parameters<OnExcludeEdgesFromGroup>[0]>
  | Action<"REMOVE_CHILD_FROM_EDGE_GROUP", Parameters<OnExcludeEdgesFromGroup>[0]>
  | Action<"DELETE_EDGE_GROUP_AND_CHILDREN", Parameters<OnDeleteEdgeGroupAndChildren>[0]>
  | Action<"ADD_EDGE_ATTRIBUTE", Parameters<OnAddEdgeAttribute>[0]>
  | Action<"CHANGE_EDGE_ATTRIBUTE", Parameters<OnChangeEdgeAttribute>[0]>
  | Action<"DELETE_EDGE_ATTRIBUTE", Parameters<OnDeleteEdgeAttribute>[0]>
  | Action<"APPLY_FILTERS", filters>
  | Partial<Action<"BRING_TO_FRONT">>
  | Partial<Action<"BRING_TO_BACK">>
  | Action<"ADD_NODE", { node: Node; nodeTypesAndConnections: NodeTypesAndConnections }, cytoscape.NodeSingular>
  | Partial<Action<"ENABLE_EDGEHANDLE">>
  | Partial<Action<"BREAK_EDGEHANDLE">>
  | Action<"SET_GRID_SETTINGS", GridSettingsState>
  | Action<"ALIGN", AlignKind>
  | Partial<Action<"SELECT_ALL">>
  | Partial<Action<"DELETE_SELECTED_ELEMENTS">>
  | Action<"SHOW_HIDDEN_ELEMENTS", elementsKind>
  | Action<"HIDE_SELECTED_ELEMENTS", elementsKind>
  | Action<"SET_CONNECTIONS_COUNT", { guid: string; count: string }>
  | Action<"SET_ZOOM", number>
  | Partial<Action<"A_SEARCH">>
  | Partial<Action<"MERGE">>
  | Action<"SET_WORLD_MAP_STATE", WorldMapState>
  | Partial<Action<"ADD_DRAWING">>
  | Action<"APPLY_CONDITION_STYLE", { item: ConditionStyle; kind: "node" | "edge"; style: cytoscape.StylesheetStyle["style"] }>
  | Action<"DELETE_CONDITION_STYLE", { item: ConditionStyle; kind: "node" | "edge" }>
  | Action<"CHANGE_CONDITION_STYLE", { item: ConditionStyle; style: cytoscape.StylesheetStyle["style"]; kind: "node" | "edge" }>
  | Action<"CLUSTER", OnClusterSetupChangePayload>
  | Action<"CHAGNE_NODE_TIMELINE_SETTINGS", OnTimelineItemChangePayload>;

export type CyCallback = (action: CyCallbackAction) => void;

export interface AppStateCtx {
  cy: cytoscape.Core | null;
  cyContainerRef: React.Ref<HTMLElement | null>;
  dispatchCyAction: CyCallback;

  graphState: GraphState;
  dispatchGraphAction: React.Dispatch<React.ReducerAction<GraphReducer>>;

  guiState: GuiState;
  dispatchGuiAction: React.Dispatch<React.ReducerAction<GuiReducer>>;
}

export interface ProgressBarCtx {
  enabled: boolean;
  start: () => void;
  done: () => void;
}

export interface UseDispatchCyActionProps extends Pick<AppStateCtx, "cy" | "graphState" | "guiState" | "dispatchGraphAction" | "dispatchGuiAction"> {}

export interface Aggregation {
  fieldLabel?: string;
  field?: string;
  func?: string;
  isVisible?: boolean;
  formatVariant?: number;
}

export type AggregationFuncKind = "sum" | "min" | "max" | "avg";
export type AggregationFunc = { title: string; key: AggregationFuncKind };
export type GroupAggregation = {
  field?: string;
  fieldLabel?: string;
  func?: string;
  result?: number;
  isVisible?: boolean;
  formatVariant?: number;
  formattedValue?: string;
  edgeWidthTreshold?: number;
};
export type EdgeAggregations = {
  sourceGroupAggregationIndecies?: number[];
  targetGroupAggregationIndecies?: number[];
};

export interface KnightEvent extends Event {
  id: string;
}

export interface NodeTemplate {
  attributes: Node["data"];
  requiredKey?: string;
  systemId: string;
  label: string;
  icon: string;
}

export type ClusterFieldVariant = "attribute" | "system_id";
export type ClusterAlgo = "kMeans" | "kMedoids" | "fuzzyCMeans" | "hierarchicalClustering" | "affinityPropagation";
export type ClusterAlgoOptions = { k?: number };

export type OnClusterSetupChangePayload = {
  clusterFieldVariant: ClusterFieldVariant;
  attributeKey?: string;
  algo: ClusterAlgo;
  algoOptions?: ClusterAlgoOptions;
};
export type OnClusterSetupChange = (args: OnClusterSetupChangePayload) => void;

export type OnTimelineItemChangePayload = {
  node: cytoscape.NodeSingular;
  applyToAllNodesWithSameSystemId: boolean;
  startDateField: string | undefined;
  endDateField: string | undefined;
  nodeTimlineClassname: string | undefined;
};
export type OnTimelineItemChange = (args: OnTimelineItemChangePayload) => void;
