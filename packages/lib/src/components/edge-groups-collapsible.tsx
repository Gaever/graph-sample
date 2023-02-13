import EdgeGroupsList, { EdgeGroupsListCallbacksProps } from "./edge-groups-list";
import { AttributeListProps } from "./attribute-list";
import ElementsCollapsiblePaper from "./elements-collapsible-paper";
import { SelectedElementsListProps } from "./selected-elements-list";
import { EdgeListItemCallbacksProps } from "./edge-list";

export interface NodeGroupsCollapsibleProps extends Pick<SelectedElementsListProps, "selectedEdgeGroups" | "stylesheetMap" | "onHideElements"> {
  groupsLength: number;
  isEdgesSelected: boolean;
  isNodesSelected: boolean;
  isNodeGroupsSelected: boolean;
  CollapsibleListProps?: AttributeListProps;
  maxItemsBeforeCollapse: number;
  EdgeListItemCallbacks: EdgeListItemCallbacksProps;
  EdgeGroupsListCallbacks: EdgeGroupsListCallbacksProps;
}

export default function EdgeGroupsCollapsible(props: NodeGroupsCollapsibleProps) {
  return (
    <ElementsCollapsiblePaper
      label={props.groupsLength === 1 ? "Группа связей" : "Группы связей"}
      showExpander={props.isEdgesSelected || props.isNodesSelected || props.groupsLength > props.maxItemsBeforeCollapse}
      isOpen={props.groupsLength === 1 || (!props.isNodesSelected && props.groupsLength <= props.maxItemsBeforeCollapse)}
      lengthLabel={props.groupsLength > 1 ? props.groupsLength : undefined}
      CollapseProps={{
        ElementActionsProps: {
          onHideClick: () => {
            props.onHideElements("edge-groups");
          },
          onHideClickTooltipTitle: "Скрыть выбранные группы связей",
        },
      }}
    >
      {props.selectedEdgeGroups.map((group) => (
        <EdgeGroupsList
          key={group.id()}
          element={group}
          isOpen={props.groupsLength === 1}
          stylesheetMap={props.stylesheetMap}
          EdgeListItemCallbacks={props.EdgeListItemCallbacks}
          EdgeGroupsListCallbacks={props.EdgeGroupsListCallbacks}
        />
      ))}
    </ElementsCollapsiblePaper>
  );
}
