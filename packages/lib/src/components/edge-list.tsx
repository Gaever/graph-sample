import AddEdgeAttribute from "./add-edge-attribute";
import AttributeList from "./attribute-list";
import { EditEdge } from "./edit-edge";
import ElementsCollapsible from "./elements-collapsible-paper";
import { SelectedElementsListProps } from "./selected-elements-list";
import { edgeToGroupAggregations, getCompiledStyles } from "../utils";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
// import Popover from "@mui/material/Popover";
import { Popover } from "./popover";
import { useRef, useState } from "react";
import { HiddenElementsListProps } from "./hidden-elements-list";

export interface EdgeListItemCallbacksProps
  extends Partial<
      Pick<
        SelectedElementsListProps,
        "onDeleteEdgeAttribute" | "onChangeEdgeAttribute" | "onExcludeEdgesFromGroup" | "onAddEdgeAttribute" | "onDeleteEdge" | "onChangeEdge" | "onHideElement"
      >
    >,
    Partial<Pick<HiddenElementsListProps, "onShowElement">> {}

export interface EdgeListProps extends Pick<SelectedElementsListProps, "selectedEdges" | "stylesheetMap" | "onHideElements"> {
  edgesLength: number;
  isNodeGroupsSelected: boolean;
  isNodesSelected: boolean;
  isEdgeGroupsSelected: boolean;
  maxItemsBeforeCollapse: number;
  groupId?: string;
  EdgeListItemCallbacks?: EdgeListItemCallbacksProps;
}

export interface EdgeListItemProps extends Partial<Pick<EdgeListProps, "edgesLength" | "stylesheetMap" | "groupId">> {
  edge: cytoscape.EdgeSingular;
  EdgeListItemCallbacks?: EdgeListItemCallbacksProps;
}

export function EdgeListItem(props: EdgeListItemProps) {
  const popoverAnchorElRef = useRef<HTMLButtonElement | null>(null);

  const [isEditAttributeOpen, setIsEditAttributeOpen] = useState(false);
  const [isAddAttributeOpen, setIsAddAttributeOpen] = useState(false);

  const edgeGuid = props.edge.id();
  const attributes = props.edge.data("payload")?.data || [];
  const isOrphan = !props.groupId;
  const sourceNodeAttributes = props.edge.source().data("payload")?.data;
  const targetNodeAttributes = props.edge.target().data("payload")?.data;
  const edgeAggregations = edgeToGroupAggregations(props.edge);
  const compiledStyle = getCompiledStyles(props.edge, props.stylesheetMap);

  return (
    <>
      <Box ref={popoverAnchorElRef}>
        <AttributeList
          edgeData={props.edge.data()}
          isOpen={props.edgesLength === 1}
          onDeleteNodeAttribute={props.EdgeListItemCallbacks?.onDeleteEdgeAttribute}
          onChangeNodeAttribute={props.EdgeListItemCallbacks?.onChangeEdgeAttribute}
          sourceNodeAttributes={sourceNodeAttributes}
          targetNodeAttributes={targetNodeAttributes}
          edgeAggregations={edgeAggregations}
          CollapseProps={{
            ElementActionsProps: {
              onDeleteClick: props.EdgeListItemCallbacks?.onDeleteEdge
                ? () => {
                    props.EdgeListItemCallbacks?.onDeleteEdge?.({ elementGuid: props.edge.id() });
                  }
                : undefined,
              onChangeClick: props.EdgeListItemCallbacks?.onChangeEdge
                ? () => {
                    setIsEditAttributeOpen(true);
                  }
                : undefined,
              onSplitClick:
                isOrphan || !props?.EdgeListItemCallbacks?.onExcludeEdgesFromGroup
                  ? undefined
                  : () => {
                      props?.EdgeListItemCallbacks?.onExcludeEdgesFromGroup?.({ groupId: props.groupId || "", edgesData: [props.edge.data()] });
                    },
              onHideClick: props?.EdgeListItemCallbacks?.onHideElement
                ? () => {
                    props?.EdgeListItemCallbacks?.onHideElement?.(props.edge);
                  }
                : undefined,
              onShowClick: props?.EdgeListItemCallbacks?.onShowElement
                ? () => {
                    props?.EdgeListItemCallbacks?.onShowElement?.(props.edge);
                  }
                : undefined,

              onSplitClickTooltipTitle: "Исключить из группы",
            },
          }}
          AddAttributeComponent={
            props?.EdgeListItemCallbacks?.onAddEdgeAttribute ? (
              <Box sx={{ p: 3, pt: 0 }}>
                <AddEdgeAttribute
                  isOpen={isAddAttributeOpen}
                  onAddClick={() => {
                    setIsAddAttributeOpen(true);
                  }}
                  onClose={() => {
                    setIsAddAttributeOpen(false);
                  }}
                  onChange={(data) => {
                    if (edgeGuid) {
                      props?.EdgeListItemCallbacks?.onAddEdgeAttribute?.({ elementGuid: edgeGuid, data });
                    }
                    setIsAddAttributeOpen(false);
                  }}
                  existAttributes={attributes}
                />
              </Box>
            ) : null
          }
        />
      </Box>
      {props.EdgeListItemCallbacks?.onChangeEdge ? (
        <Popover
          anchorEl={popoverAnchorElRef.current}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: -36,
            horizontal: "right",
          }}
          open={isEditAttributeOpen}
          onClose={() => {
            setIsEditAttributeOpen(false);
          }}
        >
          <EditEdge
            edge={props.edge}
            onChange={(data) => {
              props.EdgeListItemCallbacks?.onChangeEdge?.({ edgeGuid, data });
            }}
            onClose={() => {
              setIsEditAttributeOpen(false);
            }}
            style={compiledStyle}
            className={props.edge.data("className")}
          />
        </Popover>
      ) : null}
    </>
  );
}

export default function EdgeList(props: EdgeListProps) {
  return (
    <ElementsCollapsible
      label={props.edgesLength === 1 ? "Связь" : "Связи"}
      showExpander={props.isNodeGroupsSelected || props.isNodesSelected || props.edgesLength > props.maxItemsBeforeCollapse}
      isOpen={!props.isNodesSelected && props.edgesLength <= props.maxItemsBeforeCollapse}
      lengthLabel={props.edgesLength > 1 ? props.edgesLength : undefined}
      CollapseProps={{
        ElementActionsProps: {
          onHideClick: () => {
            props.onHideElements("edges");
          },
          onHideClickTooltipTitle: "Скрыть выбранные связи",
        },
      }}
    >
      {props.selectedEdges.map((edge, index) => (
        <Box key={edge.id()}>
          <EdgeListItem {...props} edge={edge} />
          {index < props.edgesLength - 1 ? <Divider /> : null}
        </Box>
      ))}
    </ElementsCollapsible>
  );
}
