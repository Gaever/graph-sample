import { EdgeListItem, EdgeListItemCallbacksProps } from "./edge-list";
import ElementsCollapsiblePaper from "./elements-collapsible-paper";
import { HiddenElementsListProps } from "./hidden-elements-list";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

export interface HiddenEdgeListProps extends Pick<HiddenElementsListProps, "hiddenEdges" | "onShowElements"> {
  edgesLength: number;
  isNodeGroupsHidden: boolean;
  isEdgeGroupsHidden: boolean;
  isEdgesHidden: boolean;
  maxItemsBeforeCollapse: number;
  EdgeListItemCallbacks?: EdgeListItemCallbacksProps;
}

export default function HiddenEdgeList(props: HiddenEdgeListProps) {
  return (
    <ElementsCollapsiblePaper
      label="Скрытые связи"
      showExpander={props.isNodeGroupsHidden || props.isEdgesHidden || props.edgesLength > props.maxItemsBeforeCollapse}
      isOpen={false}
      lengthLabel={props.edgesLength > 1 ? props.edgesLength : undefined}
      CollapseProps={{
        ElementActionsProps: {
          onShowClick: () => {
            props.onShowElements("edges");
          },
          onShowClickTooltipTitle: "Показать все скрытые связи (кроме связей, для которых скрыт смежный узел)",
        },
      }}
    >
      {props.hiddenEdges.map((edge, index) => (
        <Box key={edge.id()}>
          <EdgeListItem edge={edge} edgesLength={props.edgesLength} EdgeListItemCallbacks={props.EdgeListItemCallbacks} />
          {index < props.edgesLength - 1 ? <Divider /> : null}
        </Box>
      ))}
    </ElementsCollapsiblePaper>
  );
}
