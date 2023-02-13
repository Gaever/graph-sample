import HiddenElementsList, { HiddenElementsListProps } from "./hidden-elements-list";
import SelectedElementsList, { SelectedElementsListProps } from "./selected-elements-list";
import useElementsLength from "../data-layer/use-elements-length";
import { Divider } from "@mui/material";
import AddDrawing, { AddDrawingProps } from "./add-drawing";
import AddNode, { AddNodeProps } from "./add-node";
import Hints from "./hints";
import SidebarPaper from "./sidebar-paper";

export interface DataExplorerProps {
  AddNodeProps: AddNodeProps;
  HiddenElementsListProps: HiddenElementsListProps;
  SelectedElementsListProps: SelectedElementsListProps;
  AddDrawingProps: AddDrawingProps;
}

export default function DataExplorer(props: DataExplorerProps) {
  const { isNothingSelected, isNothingHidden, isSomethingHidden, isSomethingSelected } = useElementsLength({
    selectedNodes: props.SelectedElementsListProps.selectedNodes,
    selectedEdges: props.SelectedElementsListProps.selectedEdges,
    selectedNodeGroups: props.SelectedElementsListProps.selectedNodeGroups,
    selectedEdgeGroups: props.SelectedElementsListProps.selectedEdgeGroups,

    selectedDrawing: props.SelectedElementsListProps.selectedDrawing,

    hiddenNodes: props.HiddenElementsListProps.hiddenNodes,
    hiddenEdges: props.HiddenElementsListProps.hiddenEdges,
    hiddenNodeGroups: props.HiddenElementsListProps.hiddenNodeGroups,
    hiddenEdgeGroups: props.HiddenElementsListProps.hiddenEdgeGroups,
  });

  return (
    <>
      <HiddenElementsList {...props.HiddenElementsListProps} />
      {isSomethingHidden && isSomethingSelected ? <Divider sx={{ mt: 3, mb: 3 }} /> : null}
      <SelectedElementsList {...props.SelectedElementsListProps} />

      {isNothingSelected && isNothingHidden ? <Hints /> : null}

      {isNothingSelected ? (
        <>
          {isSomethingHidden ? <Divider sx={{ mt: 3, mb: 3 }} /> : null}
          <SidebarPaper title="Добавить узел">
            <AddNode {...props.AddNodeProps} />
          </SidebarPaper>
          <SidebarPaper title="Добавить пиктограмму">
            <AddDrawing {...props.AddDrawingProps} />
          </SidebarPaper>
        </>
      ) : null}
    </>
  );
}
