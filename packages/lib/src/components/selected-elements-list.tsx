import AddToGroupButton from "./add-to-group-button";
import EdgeGroupsCollapsible from "./edge-groups-collapsible";
import EdgeList from "./edge-list";
import { IconPickerProps } from "./icon-picker";
import NodeGroupsCollapsible from "./node-groups-collapsible";
import NodeList from "./node-list";
import useElementsLength from "../data-layer/use-elements-length";
import { Graph } from "../http/api";
import {
  GraphState,
  OnAddEdgeAttribute,
  OnAddNodeAttribute,
  OnChangeEdge,
  OnChangeEdgeAttribute,
  OnChangeEdgeGroup,
  OnChangeNode,
  OnChangeNodeAttribute,
  OnChangeNodeGroup,
  OnDeleteEdgeAttribute,
  OnDeleteEdgeGroupAndChildren,
  OnDeleteNode,
  OnDeleteNodeAttribute,
  OnDeleteNodeGroupAndChildren,
  OnDrawingChange,
  OnDrawingDelete,
  OnExcludeEdgesFromGroup,
  OnExcludeNodesFromGroup,
  OnGroupNodes,
  OnHideElement,
  OnHideElements,
  OnRequestNodeConnectionsCountClick,
  StylesheetMap,
} from "../types";
import { useMemo } from "react";
import { SelectedDrawing } from "./selected-drawing";

export interface SelectedElementsListProps {
  selectedNodes: cytoscape.NodeSingular[];
  selectedNodeGroups: cytoscape.NodeSingular[];
  selectedEdges: cytoscape.EdgeSingular[];
  selectedEdgeGroups: cytoscape.EdgeSingular[];

  selectedDrawing: cytoscape.NodeSingular | null;

  grouppableSelectedNodes: GraphState["grouppableSelectedNodes"];

  stylesheetMap: StylesheetMap;
  icons: Graph["icons"];

  onChangeNode: OnChangeNode;
  onDeleteNode: OnDeleteNode;
  onGroupNodes: OnGroupNodes;
  onChangeNodeGroup: OnChangeNodeGroup;
  onAddNodesToGroup: OnGroupNodes;
  onRemoveNodeGroup: OnExcludeNodesFromGroup;
  onExcludeNodesFromGroup: OnExcludeNodesFromGroup;
  onDeleteNodeGroupAndChildren: OnDeleteNodeGroupAndChildren;

  onAddNodeAttribute: OnAddNodeAttribute;
  onChangeNodeAttribute: OnChangeNodeAttribute;
  onDeleteNodeAttribute: OnDeleteNodeAttribute;

  onChangeEdge: OnChangeEdge;
  onDeleteEdge: OnDeleteNode;
  onChangeEdgeGroup: OnChangeEdgeGroup;
  onRemoveEdgeGroup: OnExcludeEdgesFromGroup;
  onExcludeEdgesFromGroup: OnExcludeEdgesFromGroup;
  onDeleteEdgeGroupAndChildren: OnDeleteEdgeGroupAndChildren;

  onAddEdgeAttribute: OnAddEdgeAttribute;
  onChangeEdgeAttribute: OnChangeEdgeAttribute;
  onDeleteEdgeAttribute: OnDeleteEdgeAttribute;

  onAddIcon: IconPickerProps["onAddIcon"];
  onUpdateIcon: IconPickerProps["onUpdateIcon"];

  onRequestNodeConnectionsCountClick: OnRequestNodeConnectionsCountClick;

  onHideElement: OnHideElement;
  onHideElements: OnHideElements;

  onDrawingDelete: OnDrawingDelete;
  onDrawingChange: OnDrawingChange;
}

export default function SelectedElementsList(props: SelectedElementsListProps) {
  const { selectedNodesLength, selectedEdgesLength, selectedNodeGroupsLength, isEdgesSelected, isNodesSelected, isEdgeGroupsSelected, isNodeGroupsSelected } = useElementsLength({
    selectedNodes: props.selectedNodes,
    selectedEdges: props.selectedEdges,
    selectedNodeGroups: props.selectedNodeGroups,
    selectedEdgeGroups: props.selectedEdgeGroups,
    selectedDrawing: props.selectedDrawing,
  });

  const isAddToNodeGroupDisplayed = useMemo(
    () => isNodesSelected && selectedNodeGroupsLength === 1 && props.selectedNodes.find((node) => node.parent().length < 1),
    [isNodesSelected, selectedNodeGroupsLength, props.selectedNodes]
  );

  const nodeListItemCallbacks = {
    onChangeNode: props.onChangeNode,
    onDeleteNode: props.onDeleteNode,
    onHideElement: props.onHideElement,
    onGroupNodes: props.onGroupNodes,
    onExcludeNodesFromGroup: props.onExcludeNodesFromGroup,
    onAddNodeAttribute: props.onAddNodeAttribute,
    onChangeNodeAttribute: props.onChangeNodeAttribute,
    onDeleteNodeAttribute: props.onDeleteNodeAttribute,
    onRequestNodeConnectionsCountClick: props.onRequestNodeConnectionsCountClick,
  };

  const edgeListItemCallbacks = {
    onDeleteEdgeAttribute: props.onDeleteEdgeAttribute,
    onChangeEdgeAttribute: props.onChangeEdgeAttribute,
    onDeleteEdge: props.onDeleteEdge,
    onChangeEdge: props.onChangeEdge,
    onHideElement: props.onHideElement,
    onExcludeEdgesFromGroup: props.onExcludeEdgesFromGroup,
  };
  const { onDeleteEdge, onChangeEdge, ...groupEdgeListItemCallbacks } = edgeListItemCallbacks;

  return (
    <>
      {props.selectedDrawing ? <SelectedDrawing element={props.selectedDrawing} onDelete={props.onDrawingDelete} onChange={props.onDrawingChange} /> : null}

      {isNodesSelected ? (
        <NodeList
          nodesLength={selectedNodesLength}
          isNodeGroupsSelected={isNodeGroupsSelected}
          isEdgesSelected={isEdgesSelected}
          isEdgeGroupsSelected={isEdgeGroupsSelected}
          maxItemsBeforeCollapse={15}
          selectedNodes={props.selectedNodes}
          grouppableSelectedNodes={props.grouppableSelectedNodes}
          stylesheetMap={props.stylesheetMap}
          icons={props.icons}
          EditNodeCallbacks={{
            onAddIcon: props.onAddIcon,
            onUpdateIcon: props.onUpdateIcon,
          }}
          NodeListItemCallbacks={nodeListItemCallbacks}
          onHideElements={props.onHideElements}
        />
      ) : null}

      {isAddToNodeGroupDisplayed ? <AddToGroupButton onClick={props.onAddNodesToGroup} /> : null}

      {isNodeGroupsSelected ? (
        <NodeGroupsCollapsible
          groupsLength={selectedNodeGroupsLength}
          isNodesSelected={isNodesSelected}
          isEdgesSelected={isEdgesSelected}
          isEdgeGroupsSelected={isEdgeGroupsSelected}
          maxItemsBeforeCollapse={15}
          selectedNodeGroups={props.selectedNodeGroups}
          stylesheetMap={props.stylesheetMap}
          icons={props.icons}
          NodeListItemCallbacks={nodeListItemCallbacks}
          NodeGroupsListCallbacks={{
            onChangeNodeGroup: props.onChangeNodeGroup,
            onDeleteNodeGroupAndChildren: props.onDeleteNodeGroupAndChildren,
            onRemoveNodeGroup: props.onRemoveNodeGroup,
            onHideElement: props.onHideElement,
          }}
          EditNodeGroupCallbacks={{ onAddIcon: props.onAddIcon, onUpdateIcon: props.onUpdateIcon }}
          EditNodeCallbacks={{
            onAddIcon: props.onAddIcon,
            onUpdateIcon: props.onUpdateIcon,
          }}
          onHideElements={props.onHideElements}
        />
      ) : null}

      {isEdgesSelected ? (
        <EdgeList
          edgesLength={selectedEdgesLength}
          isNodesSelected={isNodesSelected}
          isNodeGroupsSelected={isNodeGroupsSelected}
          isEdgeGroupsSelected={isEdgeGroupsSelected}
          maxItemsBeforeCollapse={15}
          selectedEdges={props.selectedEdges}
          stylesheetMap={props.stylesheetMap}
          EdgeListItemCallbacks={edgeListItemCallbacks}
          onHideElements={props.onHideElements}
        />
      ) : null}

      {isEdgeGroupsSelected ? (
        <EdgeGroupsCollapsible
          groupsLength={selectedNodeGroupsLength}
          isNodesSelected={isNodesSelected}
          isNodeGroupsSelected={isNodeGroupsSelected}
          isEdgesSelected={isEdgesSelected}
          maxItemsBeforeCollapse={15}
          selectedEdgeGroups={props.selectedEdgeGroups}
          stylesheetMap={props.stylesheetMap}
          EdgeListItemCallbacks={groupEdgeListItemCallbacks}
          EdgeGroupsListCallbacks={{
            onChangeEdgeGroup: props.onChangeEdgeGroup,
            onDeleteEdgeGroupAndChildren: props.onDeleteEdgeGroupAndChildren,
            onRemoveEdgeGroup: props.onRemoveEdgeGroup,
            onHideElement: props.onHideElement,
          }}
          onHideElements={props.onHideElements}
        />
      ) : null}
    </>
  );
}
