import ElementsCollapsiblePaper from "./elements-collapsible-paper";
import { HiddenElementsListProps } from "./hidden-elements-list";
import { NodeListItem, NodeListItemCallbacksProps } from "./node-list";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

export interface HiddenNodeListProps extends Pick<HiddenElementsListProps, "hiddenNodes" | "onShowElements"> {
  nodesLength: number;
  isNodeGroupsHidden: boolean;
  isEdgeGroupsHidden: boolean;
  isEdgesHidden: boolean;
  maxItemsBeforeCollapse: number;
  NodeListItemCallbacks?: NodeListItemCallbacksProps;
}

export default function HiddenNodeList(props: HiddenNodeListProps) {
  return (
    <ElementsCollapsiblePaper
      label="Скрытые узлы"
      showExpander={props.isNodeGroupsHidden || props.isEdgesHidden || props.nodesLength > props.maxItemsBeforeCollapse}
      isOpen={false}
      lengthLabel={props.nodesLength > 1 ? props.nodesLength : undefined}
      CollapseProps={{
        ElementActionsProps: {
          onShowClick: () => {
            props.onShowElements("nodes");
          },
          onShowClickTooltipTitle: "Показать скрытые узлы (кроме узлов, содержащихся в скрытых группах)",
        },
      }}
    >
      {props.hiddenNodes.map((node, index) => (
        <Box key={node.id()}>
          <NodeListItem node={node} nodesLength={props.nodesLength} NodeListItemCallbacks={props.NodeListItemCallbacks} />
          {index < props.nodesLength - 1 ? <Divider /> : null}
        </Box>
      ))}
    </ElementsCollapsiblePaper>
  );
}
