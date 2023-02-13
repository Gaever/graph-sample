import NodeGroupsList, { EditNodeGroupCallbacksProps, NodeGroupsListCallbacksProps } from "./node-groups-list";
import { AttributeListProps } from "./attribute-list";
import ElementsCollapsiblePaper from "./elements-collapsible-paper";
import { SelectedElementsListProps } from "./selected-elements-list";
import { EditNodeCallbacksProps, NodeListItemCallbacksProps } from "./node-list";

export interface NodeGroupsCollapsibleProps extends Pick<SelectedElementsListProps, "stylesheetMap" | "icons" | "selectedNodeGroups" | "onHideElements"> {
  groupsLength: number;
  isEdgesSelected: boolean;
  isNodesSelected: boolean;
  isEdgeGroupsSelected: boolean;
  CollapsibleListProps?: AttributeListProps;
  maxItemsBeforeCollapse: number;
  NodeListItemCallbacks: NodeListItemCallbacksProps;
  NodeGroupsListCallbacks: NodeGroupsListCallbacksProps;
  EditNodeGroupCallbacks: EditNodeGroupCallbacksProps;
  EditNodeCallbacks: EditNodeCallbacksProps;
}

export default function NodeGroupsCollapsible(props: NodeGroupsCollapsibleProps) {
  return (
    <ElementsCollapsiblePaper
      label={props.groupsLength === 1 ? "Группа" : "Группы"}
      showExpander={props.isEdgesSelected || props.isNodesSelected || props.groupsLength > props.maxItemsBeforeCollapse}
      isOpen={
        (props.groupsLength === 1 && !props.isNodesSelected && !props.isEdgesSelected && !props.isEdgeGroupsSelected) ||
        (!props.isNodesSelected && props.groupsLength <= props.maxItemsBeforeCollapse)
      }
      lengthLabel={props.groupsLength > 1 ? props.groupsLength : undefined}
      CollapseProps={{
        ElementActionsProps: {
          onHideClick: () => {
            props.onHideElements("node-groups");
          },
          onHideClickTooltipTitle: "Скрыть выбранные группы узлов (все смежные связи также будут скрыты)",
        },
      }}
    >
      {props.selectedNodeGroups.map((group) => (
        <NodeGroupsList
          key={group.data("id")}
          element={group}
          isOpen={props.groupsLength === 1}
          stylesheetMap={props.stylesheetMap}
          icons={props.icons}
          NodeListItemCallbacks={props.NodeListItemCallbacks}
          NodeGroupsListCallbacks={props.NodeGroupsListCallbacks}
          EditNodeGroupCallbacks={props.EditNodeGroupCallbacks}
          EditNodeCallbacks={props.EditNodeCallbacks}
        />
      ))}
    </ElementsCollapsiblePaper>
  );
}
