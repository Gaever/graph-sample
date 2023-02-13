import { Paper } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { useRef, useState } from "react";
import { pickGroupEdgeLabel } from "../data-layer/format-response";
import { getCompiledStyles, isNodeGroup } from "../utils";
import Collapse, { CollapseProps } from "./collapse";
import { EdgeAggregations } from "./edge-aggregations";
import { EdgeListItem, EdgeListItemCallbacksProps } from "./edge-list";
import { EditEdgeGroup } from "./edit-edge-group";
import { HiddenElementsListProps } from "./hidden-elements-list";
import { Popover } from "./popover";
import { SelectedElementsListProps } from "./selected-elements-list";

export interface EdgeGroupsListCallbacksProps
  extends Partial<Pick<SelectedElementsListProps, "onDeleteEdgeGroupAndChildren" | "onRemoveEdgeGroup" | "onChangeEdgeGroup" | "onHideElement">>,
    Partial<Pick<HiddenElementsListProps, "onShowElement">> {}

export interface EdgeGroupsListProps extends Partial<Pick<SelectedElementsListProps, "stylesheetMap">> {
  element: cytoscape.EdgeSingular;
  isOpen?: boolean;
  CollapseProps?: Partial<CollapseProps>;
  EdgeListItemCallbacks?: EdgeListItemCallbacksProps;
  EdgeGroupsListCallbacks?: EdgeGroupsListCallbacksProps;
}

export default function EdgeGroupsList(props: EdgeGroupsListProps) {
  const popoverAnchorElRef = useRef<HTMLDivElement | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const isPopoverOpen = isEditOpen;
  const children = props.element.data("collapsedEdges") as cytoscape.EdgeCollection;
  const childrenLength = children.length;

  const groupId = props.element.id();
  const compiledStyle = getCompiledStyles(props.element, props.stylesheetMap);

  const label = pickGroupEdgeLabel(props.element);

  const node1 = props.element.source();
  const node2 = props.element.target();

  let collection: cytoscape.CollectionReturnValue;

  // https://jira.alfakom.org/browse/VITYAZ3-1391
  // Сергей Макаров: "Нужно доработать, чтобы агрегацию связей можно было настраивать с группами нод"

  if (isNodeGroup(node1) && node1.data("collapsedChildren")) {
    collection = node1.data("collapsedChildren");
  } else {
    collection = node1.union(node1);
  }

  if (isNodeGroup(node2) && node2.data("collapsedChildren")) {
    collection = collection.union(node2.data("collapsedChildren"));
  } else {
    collection = collection.union(node2);
  }

  return (
    <>
      <Paper sx={{ m: 1 }} variant="outlined">
        <Box ref={popoverAnchorElRef}>
          <Collapse
            isOpen={props.isOpen}
            label={label}
            ListItemTextProps={{ primaryTypographyProps: { variant: "body1" } }}
            ListItemButtonProps={{ sx: { p: 1.5, pb: 1 } }}
            ElementActionsProps={{
              onDeleteClick: props.EdgeGroupsListCallbacks?.onDeleteEdgeGroupAndChildren
                ? () => {
                    props.EdgeGroupsListCallbacks?.onDeleteEdgeGroupAndChildren?.({ groupId });
                  }
                : undefined,
              onDeleteClickTooltipTitle: "Удалить группу и вложенные связи",

              onChangeClick: props.EdgeGroupsListCallbacks?.onChangeEdgeGroup
                ? () => {
                    setIsEditOpen(true);
                  }
                : undefined,
              onChangeClickTooltipTitle: "Изменить группу",

              onSplitClick: props.EdgeGroupsListCallbacks?.onRemoveEdgeGroup
                ? () => {
                    props.EdgeGroupsListCallbacks?.onRemoveEdgeGroup?.({ groupId });
                  }
                : undefined,

              onHideClick: props?.EdgeGroupsListCallbacks?.onHideElement
                ? () => {
                    props?.EdgeGroupsListCallbacks?.onHideElement?.(props.element);
                  }
                : undefined,

              onShowClick: props?.EdgeGroupsListCallbacks?.onShowElement
                ? () => {
                    props?.EdgeGroupsListCallbacks?.onShowElement?.(props.element);
                  }
                : undefined,
            }}
            {...props?.CollapseProps}
          >
            {children.map((element, index) => {
              if (element.group() === "edges") {
                return (
                  <Box key={`${groupId}${element.id()}`}>
                    <EdgeListItem
                      groupId={groupId}
                      edge={element}
                      edgesLength={childrenLength}
                      stylesheetMap={props.stylesheetMap}
                      EdgeListItemCallbacks={props.EdgeListItemCallbacks}
                    />
                    {index < children.length - 1 ? <Divider /> : null}
                  </Box>
                );
              }
              return null;
            })}
            <Box sx={{ mt: 2 }}>
              <Collapse isOpen={false} label="Агрегации" ListItemTextProps={{ primaryTypographyProps: { variant: "subtitle1" } }}>
                <Box sx={{ p: 1, pt: 1 }}>
                  <EdgeAggregations
                    groupId={groupId}
                    compiledStyle={compiledStyle}
                    groupElement={props.element}
                    nodesToAggregate={collection}
                    EdgeGroupsListCallbacks={props.EdgeGroupsListCallbacks}
                  />
                </Box>
              </Collapse>
            </Box>
          </Collapse>
        </Box>
      </Paper>
      {props.EdgeGroupsListCallbacks?.onChangeEdgeGroup ? (
        <Popover
          anchorEl={popoverAnchorElRef.current}
          anchorOrigin={{
            vertical: "top",
            horizontal: -9,
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={isPopoverOpen}
          onClose={() => {
            setIsEditOpen(false);
          }}
        >
          {isEditOpen ? (
            <EditEdgeGroup
              groupElement={props.element}
              onChange={(data) => {
                props.EdgeGroupsListCallbacks?.onChangeEdgeGroup?.({ groupId, data });
              }}
              onClose={() => {
                setIsEditOpen(false);
              }}
              style={compiledStyle}
            />
          ) : null}
        </Popover>
      ) : null}
    </>
  );
}
