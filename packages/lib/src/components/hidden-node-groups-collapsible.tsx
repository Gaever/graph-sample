import ElementsCollapsiblePaper from "./elements-collapsible-paper";
import { HiddenElementsListProps } from "./hidden-elements-list";
import NodeGroupsList, { NodeGroupsListCallbacksProps } from "./node-groups-list";
import { NodeListItemCallbacksProps } from "./node-list";

export interface HiddenNodeGroupsCollapsibleProps extends Pick<HiddenElementsListProps, "hiddenNodeGroups" | "onShowElements"> {
  groupsLength: number;
  NodeListItemCallbacks?: NodeListItemCallbacksProps;
  NodeGroupsListCallbacks?: NodeGroupsListCallbacksProps;
}

export default function HiddenNodeGroupsCollapsible(props: HiddenNodeGroupsCollapsibleProps) {
  return (
    <ElementsCollapsiblePaper
      label={"Скрытые группы"}
      showExpander={true}
      isOpen={false}
      lengthLabel={props.groupsLength > 1 ? props.groupsLength : undefined}
      CollapseProps={{
        ElementActionsProps: {
          onShowClick: () => {
            props.onShowElements("node-groups");
          },
          onShowClickTooltipTitle: "Показать все скрытые группы узлов",
        },
      }}
    >
      {props.hiddenNodeGroups.map((group) => (
        <NodeGroupsList
          key={group.data("id")}
          element={group}
          isOpen={props.groupsLength === 1}
          NodeListItemCallbacks={props.NodeListItemCallbacks}
          NodeGroupsListCallbacks={props.NodeGroupsListCallbacks}
        />
      ))}
    </ElementsCollapsiblePaper>
  );
}
