import AddNodeAttribute from "./add-node-attribute";
import AttributeList, { AttributeListProps } from "./attribute-list";
import { EditNode, EditNodeProps } from "./edit-node";
import ElementsCollapsiblePaper from "./elements-collapsible-paper";
import { SelectedElementsListProps } from "./selected-elements-list";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
// import Popover from "@mui/material/Popover";
import { Popover } from "./popover";
import { useEffect, useRef, useState } from "react";
import noop from "lodash/noop";
import { HiddenElementsListProps } from "./hidden-elements-list";
import { getCompiledStyles, isIconClassName } from "../utils";

export interface EditNodeCallbacksProps extends Pick<EditNodeProps, "onAddIcon" | "onUpdateIcon"> {}

export interface NodeListItemCallbacksProps
  extends Partial<
      Pick<
        SelectedElementsListProps,
        | "onDeleteNodeAttribute"
        | "onChangeNodeAttribute"
        | "onDeleteNode"
        | "onChangeNode"
        | "onExcludeNodesFromGroup"
        | "onAddNodeAttribute"
        | "onHideElement"
        | "onRequestNodeConnectionsCountClick"
      >
    >,
    Partial<Pick<HiddenElementsListProps, "onShowElement">> {}

export interface NodesCollapsibleProps extends Pick<SelectedElementsListProps, "selectedNodes" | "grouppableSelectedNodes" | "stylesheetMap" | "icons" | "onHideElements"> {
  nodesLength: number;
  isNodeGroupsSelected: boolean;
  isEdgeGroupsSelected: boolean;
  isEdgesSelected: boolean;
  maxItemsBeforeCollapse: number;
  NodeListItemCallbacks?: NodeListItemCallbacksProps;
  EditNodeCallbacks?: EditNodeCallbacksProps;
  AttributeListProps?: (node: cytoscape.NodeSingular) => AttributeListProps;
}

export interface NodeListItemProps extends Partial<Pick<NodesCollapsibleProps, "nodesLength" | "stylesheetMap" | "icons">> {
  node: cytoscape.NodeSingular;
  EditNodeCallbacks?: EditNodeCallbacksProps;
  NodeListItemCallbacks?: NodeListItemCallbacksProps;
  AttributeListProps?: (node: cytoscape.NodeSingular) => AttributeListProps;
}

export const NodeFolderIcon = () => <FolderOpenIcon sx={{ color: "grey.400", mr: 1, position: "relative", top: -2 }} />;

export function NodeListItem(props: NodeListItemProps) {
  const popoverAnchorElRef = useRef<HTMLButtonElement | null>(null);
  const [isEditAttributeOpen, setIsEditAttributeOpen] = useState(false);
  const [isAddAttributeOpen, setIsAddAttributeOpen] = useState(false);
  const nodeData = props.node.data();

  const isOrphan = !nodeData.parent;
  const nodeGuid = props.node.id();
  const systemId = nodeData?.payload?.system_id || "";
  const itemId = nodeData?.payload?.item_id || "";
  const attributes = nodeData?.payload?.data || [];
  const isFlash = !!props.node.scratch("_app")?.flashHandler;

  const compiledStyle = getCompiledStyles(props.node, props.stylesheetMap);

  useEffect(() => {
    const fullscreenListener = () => {
      setIsEditAttributeOpen(false);
    };
    document.addEventListener("fullscreenchange", fullscreenListener);

    return () => {
      document.removeEventListener("fullscreenchange", fullscreenListener);
    };
  }, [setIsEditAttributeOpen]);

  return (
    <>
      <Box ref={popoverAnchorElRef}>
        <AttributeList
          nodeData={nodeData}
          isOpen={props.nodesLength === 1}
          onDeleteNodeAttribute={props?.NodeListItemCallbacks?.onDeleteNodeAttribute}
          onChangeNodeAttribute={props?.NodeListItemCallbacks?.onChangeNodeAttribute}
          CollapseProps={{
            startAdornment: !isOrphan ? <NodeFolderIcon /> : null,
            ElementActionsProps: {
              onChangeClick: props?.NodeListItemCallbacks?.onChangeNode
                ? () => {
                    setIsEditAttributeOpen(true);
                  }
                : undefined,
              onDeleteClick: props?.NodeListItemCallbacks?.onDeleteNode
                ? () => {
                    props?.NodeListItemCallbacks?.onDeleteNode?.({ elementGuid: nodeGuid });
                  }
                : undefined,
              onUngroupClick:
                isOrphan || !props?.NodeListItemCallbacks?.onExcludeNodesFromGroup
                  ? undefined
                  : () => {
                      props?.NodeListItemCallbacks?.onExcludeNodesFromGroup?.({ groupId: nodeData?.parent, nodesData: [nodeData] });
                    },
              onUngroupClickTooltipTitle: "Исключить элемент из группы",
              onCountLinksClick: props?.NodeListItemCallbacks?.onRequestNodeConnectionsCountClick
                ? () => {
                    props?.NodeListItemCallbacks?.onRequestNodeConnectionsCountClick?.({ itemId, systemId, guid: nodeGuid });
                  }
                : undefined,
              onHideClick: props?.NodeListItemCallbacks?.onHideElement
                ? () => {
                    props?.NodeListItemCallbacks?.onHideElement?.(props.node);
                  }
                : undefined,
              onShowClick: props?.NodeListItemCallbacks?.onShowElement
                ? () => {
                    props?.NodeListItemCallbacks?.onShowElement?.(props.node);
                  }
                : undefined,
            },
          }}
          AddAttributeComponent={
            props?.NodeListItemCallbacks?.onAddNodeAttribute ? (
              <Box sx={{ p: 3, pt: 0 }}>
                <AddNodeAttribute
                  isOpen={isAddAttributeOpen}
                  onAddClick={() => {
                    setIsAddAttributeOpen(true);
                  }}
                  onClose={() => {
                    setIsAddAttributeOpen(false);
                  }}
                  onChange={(data) => {
                    if (nodeGuid) {
                      props.NodeListItemCallbacks?.onAddNodeAttribute?.({ elementGuid: nodeGuid, data });
                    }
                    setIsAddAttributeOpen(false);
                  }}
                  systemId={systemId}
                  existAttributes={attributes}
                />
              </Box>
            ) : undefined
          }
          {...props?.AttributeListProps?.(props.node)}
        />
      </Box>
      {props?.NodeListItemCallbacks?.onChangeNode ? (
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
          <EditNode
            nodeData={nodeData}
            onChange={(data) => {
              props?.NodeListItemCallbacks?.onChangeNode?.({ nodeGuid, data });
            }}
            onClose={() => {
              setIsEditAttributeOpen(false);
            }}
            // style={nodeData.className ? props?.stylesheetMap?.get?.(`.${nodeData.className}`)?.style : undefined}
            style={compiledStyle}
            icons={props.icons}
            icon={nodeData?.payload?.icon}
            subIcons={nodeData?.payload?.subIcons || []}
            onAddIcon={props?.EditNodeCallbacks?.onAddIcon || noop}
            onUpdateIcon={props?.EditNodeCallbacks?.onUpdateIcon || noop}
            isFlash={isFlash}
          />
        </Popover>
      ) : null}
    </>
  );
}

export default function NodeList(props: NodesCollapsibleProps) {
  return (
    <ElementsCollapsiblePaper
      label={props.nodesLength === 1 ? "Узел" : "Узлы"}
      showExpander={props.isNodeGroupsSelected || props.isEdgesSelected || props.nodesLength > props.maxItemsBeforeCollapse}
      isOpen={props.nodesLength <= props.maxItemsBeforeCollapse}
      lengthLabel={props.nodesLength > 1 ? props.nodesLength : undefined}
      CollapseProps={{
        ElementActionsProps: {
          onHideClick: () => {
            props.onHideElements("nodes");
          },
          onHideClickTooltipTitle: "Скрыть выбранные узлы (смежные связи будут также скрыты)",
        },
      }}
    >
      {props.selectedNodes.map((node, index) => (
        <Box key={node.id()}>
          <NodeListItem {...props} node={node} />
          {index < props.nodesLength - 1 ? <Divider /> : null}
        </Box>
      ))}
    </ElementsCollapsiblePaper>
  );
}
