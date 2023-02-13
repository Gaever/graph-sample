import EdgeGroupsList, { EdgeGroupsListCallbacksProps } from "./edge-groups-list";
import ElementsCollapsiblePaper from "./elements-collapsible-paper";
import { HiddenElementsListProps } from "./hidden-elements-list";
import { EdgeListItemCallbacksProps } from "./edge-list";

export interface HiddenEdgeGroupsCollapsibleProps extends Pick<HiddenElementsListProps, "hiddenEdgeGroups" | "onShowElements"> {
  groupsLength: number;
  EdgeListItemCallbacks?: EdgeListItemCallbacksProps;
  EdgeGroupsListCallbacks?: EdgeGroupsListCallbacksProps;
}

export default function HiddenEdgeGroupsCollapsible(props: HiddenEdgeGroupsCollapsibleProps) {
  return (
    <ElementsCollapsiblePaper
      label={"Скрытые группы связей"}
      showExpander={true}
      isOpen={false}
      lengthLabel={props.groupsLength > 1 ? props.groupsLength : undefined}
      CollapseProps={{
        ElementActionsProps: {
          onShowClick: () => {
            props.onShowElements("edge-groups");
          },
          onShowClickTooltipTitle: "Показать все скрытые группы связей",
        },
      }}
    >
      {props.hiddenEdgeGroups.map((group) => (
        <EdgeGroupsList
          key={group.data("id")}
          element={group}
          isOpen={props.groupsLength === 1}
          EdgeListItemCallbacks={props.EdgeListItemCallbacks}
          EdgeGroupsListCallbacks={props.EdgeGroupsListCallbacks}
        />
      ))}
    </ElementsCollapsiblePaper>
  );
}
