import { Paper } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Aggregations from "./aggregations";
import { AttributeListProps } from "./attribute-list";
import Collapse, { CollapseProps } from "./collapse";
import { EditNodeGroup, EditNodeGroupProps } from "./edit-node-group";
import { EditNodeCallbacksProps, NodeListItem, NodeListItemCallbacksProps } from "./node-list";
import { SelectedElementsListProps } from "./selected-elements-list";
// import Popover from "@mui/material/Popover";
import noop from "lodash/noop";
import { useRef, useState } from "react";
import { getCompiledStyles } from "../utils";
import { HiddenElementsListProps } from "./hidden-elements-list";
import { Popover } from "./popover";

export interface NodeGroupsListCallbacksProps
  extends Partial<Pick<SelectedElementsListProps, "onDeleteNodeGroupAndChildren" | "onChangeNodeGroup" | "onRemoveNodeGroup" | "onHideElement">>,
    Partial<Pick<HiddenElementsListProps, "onShowElement">> {}

export interface EditNodeGroupCallbacksProps extends Pick<EditNodeGroupProps, "onAddIcon" | "onUpdateIcon"> {}

export interface NodeGroupsListProps extends Partial<Pick<SelectedElementsListProps, "stylesheetMap" | "icons">> {
  element: cytoscape.NodeSingular;
  isOpen?: boolean;
  CollapseProps?: Partial<CollapseProps>;
  CollapsibleListProps?: Partial<AttributeListProps>;
  NodeListItemCallbacks?: NodeListItemCallbacksProps;
  NodeGroupsListCallbacks?: NodeGroupsListCallbacksProps;
  EditNodeGroupCallbacks?: EditNodeGroupCallbacksProps;
  EditNodeCallbacks?: EditNodeCallbacksProps;
}

export default function NodeGroupsList(props: NodeGroupsListProps) {
  const popoverAnchorElRef = useRef<HTMLDivElement | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const isPopoverOpen = isEditOpen;

  const expandedChildren = props?.element?.children?.()?.nodes?.();
  const collapesedChildren = props?.element?.data?.()?.collapsedChildren?.nodes?.() as cytoscape.NodeCollection;
  const children = (((expandedChildren?.length || 0) > 0 && expandedChildren) || ((collapesedChildren?.length || 0) > 0 && collapesedChildren) || []) as cytoscape.NodeCollection;
  const groupId = props.element?.id?.() || "";
  const compiledStyle = getCompiledStyles(props.element, props.stylesheetMap);

  const childrenLength = children.length;

  return (
    <>
      <Paper sx={{ m: 1 }} variant="outlined">
        <Box ref={popoverAnchorElRef}>
          <Collapse
            isOpen={props.isOpen}
            label={`${props.element?.data?.()?.label}${childrenLength > 1 ? ` (${childrenLength})` : ""}`}
            ListItemTextProps={{ primaryTypographyProps: { variant: "body1" } }}
            ListItemButtonProps={{ sx: { p: 1.5, pb: 1 } }}
            ElementActionsProps={{
              onDeleteClick: props.NodeGroupsListCallbacks?.onDeleteNodeGroupAndChildren
                ? () => {
                    props.NodeGroupsListCallbacks?.onDeleteNodeGroupAndChildren?.({ groupId });
                  }
                : undefined,
              onDeleteClickTooltipTitle: "Удалить группу и вложенные узлы",

              onChangeClick: props.NodeGroupsListCallbacks?.onChangeNodeGroup
                ? () => {
                    setIsEditOpen(true);
                  }
                : undefined,
              onChangeClickTooltipTitle: "Изменить группу",

              onUngroupClick: props.NodeGroupsListCallbacks?.onRemoveNodeGroup
                ? () => {
                    props.NodeGroupsListCallbacks?.onRemoveNodeGroup?.({ groupId });
                  }
                : undefined,

              onHideClick: props?.NodeGroupsListCallbacks?.onHideElement
                ? () => {
                    props?.NodeGroupsListCallbacks?.onHideElement?.(props.element);
                  }
                : undefined,

              onShowClick: props?.NodeGroupsListCallbacks?.onShowElement
                ? () => {
                    props?.NodeGroupsListCallbacks?.onShowElement?.(props.element);
                  }
                : undefined,
            }}
            {...props?.CollapseProps}
          >
            {children.map((element, index) => {
              return (
                <Box key={`${groupId}${element.id()}`}>
                  <NodeListItem
                    node={element}
                    nodesLength={childrenLength}
                    stylesheetMap={props.stylesheetMap}
                    icons={props.icons}
                    NodeListItemCallbacks={props.NodeListItemCallbacks}
                    EditNodeCallbacks={props.EditNodeCallbacks}
                  />
                  {index < children.length - 1 ? <Divider /> : null}
                </Box>
              );
            })}
            {props.element.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <Collapse isOpen={false} label="Агрегации" ListItemTextProps={{ primaryTypographyProps: { variant: "subtitle1" } }}>
                  <Box sx={{ p: 1, pt: 1 }}>
                    <Aggregations groupElement={props.element} nodesToAggregate={children} groupElementType="node" />
                  </Box>
                </Collapse>
              </Box>
            ) : null}
          </Collapse>
        </Box>
      </Paper>
      {props.NodeGroupsListCallbacks?.onChangeNodeGroup ? (
        <Popover
          anchorEl={popoverAnchorElRef.current}
          onClose={() => {
            setIsEditOpen(false);
          }}
          anchorOrigin={{
            vertical: "top",
            horizontal: -9,
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={isPopoverOpen}
        >
          {isEditOpen ? (
            <EditNodeGroup
              groupElement={props.element}
              onChange={(data) => {
                props.NodeGroupsListCallbacks?.onChangeNodeGroup?.({ groupId, data });
                // setIsEditOpen(false);
              }}
              onClose={() => {
                setIsEditOpen(false);
              }}
              style={compiledStyle}
              icons={props?.icons}
              icon={props.element.data()?.payload?.icon}
              onAddIcon={props.EditNodeGroupCallbacks?.onAddIcon || noop}
              onUpdateIcon={props.EditNodeGroupCallbacks?.onUpdateIcon || noop}
            />
          ) : null}
        </Popover>
      ) : null}
    </>
  );
}
