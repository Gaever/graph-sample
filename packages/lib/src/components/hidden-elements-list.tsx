import HiddenEdgeList from "./hidden-edge-list";
import HiddenNodeList from "./hidden-node-list";
import useElementsLength from "../data-layer/use-elements-length";
import { elementsKind, OnShowElement, OnShowElements } from "../types";
import { EdgeGroupsListCallbacksProps } from "./edge-groups-list";
import { EdgeListItemCallbacksProps } from "./edge-list";
import HiddenEdgeGroupsCollapsible from "./hidden-edge-groups-collapsible";
import HiddenNodeGroupsCollapsible from "./hidden-node-groups-collapsible";
import { NodeGroupsListCallbacksProps } from "./node-groups-list";
import { NodeListItemCallbacksProps } from "./node-list";

export interface HiddenElementsListProps {
  hiddenNodes: cytoscape.NodeSingular[];
  hiddenNodeGroups: cytoscape.NodeSingular[];
  hiddenEdges: cytoscape.EdgeSingular[];
  hiddenEdgeGroups: cytoscape.EdgeSingular[];

  onShowElement: OnShowElement;
  onShowElements: OnShowElements;
}

export default function HiddenElementsList(props: HiddenElementsListProps) {
  const { isNodesHidden, isEdgesHidden, isNodeGroupsHidden, isEdgeGroupsHidden } = useElementsLength({
    hiddenNodes: props?.hiddenNodes,
    hiddenEdges: props?.hiddenEdges,
    hiddenNodeGroups: props?.hiddenNodeGroups,
    hiddenEdgeGroups: props?.hiddenEdgeGroups,
  });

  const NodeListItemCallbacks: NodeListItemCallbacksProps = {
    onShowElement: props.onShowElement,
  };
  const NodeGroupsListCallbacks: NodeGroupsListCallbacksProps = {
    onShowElement: props.onShowElement,
  };
  const EdgeListItemCallbacks: EdgeListItemCallbacksProps = {
    onShowElement: props.onShowElement,
  };
  const EdgeGroupsListCallbacks: EdgeGroupsListCallbacksProps = {
    onShowElement: props.onShowElement,
  };

  return (
    <>
      {isNodesHidden ? (
        <HiddenNodeList
          nodesLength={props.hiddenNodes.length}
          isNodeGroupsHidden={isNodeGroupsHidden}
          isEdgeGroupsHidden={isEdgeGroupsHidden}
          isEdgesHidden={isEdgesHidden}
          maxItemsBeforeCollapse={0}
          hiddenNodes={props.hiddenNodes}
          NodeListItemCallbacks={NodeListItemCallbacks}
          onShowElements={props.onShowElements}
        />
      ) : null}

      {isNodeGroupsHidden ? (
        <HiddenNodeGroupsCollapsible
          groupsLength={props.hiddenNodeGroups.length}
          hiddenNodeGroups={props.hiddenNodeGroups}
          NodeListItemCallbacks={{}}
          NodeGroupsListCallbacks={NodeGroupsListCallbacks}
          onShowElements={props.onShowElements}
        />
      ) : null}

      {isEdgesHidden ? (
        <HiddenEdgeList
          edgesLength={props.hiddenEdges.length}
          isNodeGroupsHidden={isNodeGroupsHidden}
          isEdgeGroupsHidden={isEdgeGroupsHidden}
          isEdgesHidden={isEdgesHidden}
          maxItemsBeforeCollapse={0}
          hiddenEdges={props.hiddenEdges}
          EdgeListItemCallbacks={EdgeListItemCallbacks}
          onShowElements={props.onShowElements}
        />
      ) : null}

      {isEdgeGroupsHidden ? (
        <HiddenEdgeGroupsCollapsible
          groupsLength={props.hiddenEdgeGroups.length}
          hiddenEdgeGroups={props.hiddenEdgeGroups}
          EdgeListItemCallbacks={{}}
          EdgeGroupsListCallbacks={EdgeGroupsListCallbacks}
          onShowElements={props.onShowElements}
        />
      ) : null}
    </>
  );
}
