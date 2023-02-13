export default function useElementsLength(props: {
  selectedNodes?: cytoscape.NodeSingular[];
  selectedEdges?: cytoscape.EdgeSingular[];
  selectedNodeGroups?: cytoscape.NodeSingular[];
  selectedEdgeGroups?: cytoscape.EdgeSingular[];

  hiddenNodes?: cytoscape.NodeSingular[];
  hiddenEdges?: cytoscape.EdgeSingular[];
  hiddenNodeGroups?: cytoscape.NodeSingular[];
  hiddenEdgeGroups?: cytoscape.EdgeSingular[];

  selectedDrawing?: cytoscape.NodeSingular | undefined | null;
}) {
  const selectedNodesLength = props?.selectedNodes?.length || 0;
  const selectedEdgesLength = props?.selectedEdges?.length || 0;
  const selectedNodeGroupsLength = props?.selectedNodeGroups?.length || 0;
  const selectedEdgeGroupsLength = props?.selectedEdgeGroups?.length || 0;

  const hiddenNodesLength = props?.hiddenNodes?.length || 0;
  const hiddenEdgesLength = props?.hiddenEdges?.length || 0;
  const hiddenNodeGroupsLength = props?.hiddenNodeGroups?.length || 0;
  const hiddenEdgeGroupsLength = props?.hiddenEdgeGroups?.length || 0;

  const isNodesSelected = selectedNodesLength > 0;
  const isEdgesSelected = selectedEdgesLength > 0;
  const isNodeGroupsSelected = selectedNodeGroupsLength > 0;
  const isEdgeGroupsSelected = selectedEdgeGroupsLength > 0;

  const isNodesHidden = hiddenNodesLength > 0;
  const isEdgesHidden = hiddenEdgesLength > 0;
  const isNodeGroupsHidden = hiddenNodeGroupsLength > 0;
  const isEdgeGroupsHidden = hiddenEdgeGroupsLength > 0;

  const isNothingSelected = !isNodesSelected && !isEdgesSelected && !isNodeGroupsSelected && !isEdgeGroupsSelected && !props.selectedDrawing;
  const isNothingHidden = !isNodesHidden && !isEdgesHidden && !isNodeGroupsHidden && !isEdgeGroupsHidden;

  const isSomethingSelected = !isNothingSelected;
  const isSomethingHidden = !isNothingHidden;

  return {
    selectedNodesLength,
    selectedEdgesLength,
    selectedNodeGroupsLength,
    selectedEdgeGroupsLength,

    isNodesSelected,
    isEdgesSelected,
    isNodeGroupsSelected,
    isEdgeGroupsSelected,

    hiddenNodesLength,
    hiddenEdgesLength,
    hiddenNodeGroupsLength,
    hiddenEdgeGroupsLength,

    isNodesHidden,
    isEdgesHidden,
    isNodeGroupsHidden,
    isEdgeGroupsHidden,

    isNothingSelected,
    isNothingHidden,

    isSomethingSelected,
    isSomethingHidden,

    isDrawingSelected: !!props.selectedDrawing,
  };
}
