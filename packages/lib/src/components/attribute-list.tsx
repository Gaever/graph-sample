import { AttributeListItem } from "./attribute-list-item";
import Collapse, { CollapseProps } from "./collapse";
import { SelectedElementsListProps } from "./selected-elements-list";
import { pickEdgeLabel, pickNodeLabel } from "../data-layer/format-response";
import { Field } from "../http/api";
import { CyEdge, CyNode, GroupAggregation } from "../types";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";

export interface AttributeListProps {
  nodeData?: CyNode["data"];
  edgeData?: CyEdge["data"];
  sourceNodeAttributes?: Field[];
  targetNodeAttributes?: Field[];
  edgeAggregations?: GroupAggregation[];

  isOpen?: boolean;

  onDeleteNodeAttribute?: SelectedElementsListProps["onDeleteNodeAttribute"];
  onChangeNodeAttribute?: SelectedElementsListProps["onChangeNodeAttribute"];

  onDeleteEdgeAttribute?: SelectedElementsListProps["onDeleteEdgeAttribute"];
  onChangeEdgeAttribute?: SelectedElementsListProps["onChangeEdgeAttribute"];

  CollapseProps?: CollapseProps;
  AddAttributeComponent?: React.ReactNode;
}

export default function AttributeList(props: AttributeListProps) {
  const nodePayload = props.nodeData?.payload;
  const edgePayload = props.edgeData?.payload;

  const label =
    pickNodeLabel(nodePayload?.label, nodePayload?.label_template, nodePayload?.data, nodePayload?.guid) ||
    // @ts-ignore
    pickEdgeLabel(edgePayload?.label, edgePayload?.label_template, edgePayload?.data, props.sourceNodeAttributes, props.targetNodeAttributes, props.edgeAggregations) ||
    props.edgeData?.id;
  const attributes = nodePayload?.data || edgePayload?.data || [];
  const guid = nodePayload?.guid || edgePayload?.guid;
  const edgeId = edgePayload?.id?.toString?.();
  const fromGuid = edgePayload?.fromGuid;
  const toGuid = edgePayload?.toGuid;
  // @ts-ignore
  const systemId = nodePayload?.system_id || edgePayload?.system_id || "";
  // @ts-ignore
  const itemId = nodePayload?.item_id || edgePayload?.item_id || "";
  const systemTypeLabel = nodePayload?.system_id_label || edgePayload?.system_id_label;

  // @ts-ignore
  const connectionsCount = nodePayload?.connections_count?.toString?.() || "";

  return (
    <Collapse label={label} isOpen={props.isOpen} {...props.CollapseProps}>
      <List sx={{ pr: 0, pl: 3 }}>
        <Box sx={{ "& .MuiListItemText-secondary": { fontSize: "0.775rem" } }}>
          {edgeId && <AttributeListItem label="id" value={edgeId} />}
          {guid && <AttributeListItem label="guid" value={guid} />}
          {fromGuid && <AttributeListItem label="from guid" value={fromGuid} />}
          {toGuid && <AttributeListItem label="to guid" value={toGuid} />}
          {systemId && <AttributeListItem label="Тип (system id)" value={systemTypeLabel || systemId} />}
          {itemId && <AttributeListItem label="item id" value={itemId} />}
          {connectionsCount && <AttributeListItem label="Количество связей" value={connectionsCount} />}
        </Box>
        {attributes.length > 0 ? <Divider sx={{ mt: 1, mb: 1 }} /> : null}
        {attributes.map((item, index) =>
          item?.key ? (
            <AttributeListItem
              key={item.key}
              editable
              deletable={Boolean(guid)}
              label={item?.label || item.key}
              value={item?.value || ""}
              systemId={systemId}
              formattedValue={item.formattedValue}
              formatVariant={item.formatVariant}
              onChange={
                props.onChangeNodeAttribute || props.onChangeEdgeAttribute
                  ? (attribute) => {
                      if (props.onChangeNodeAttribute) {
                        props.onChangeNodeAttribute({
                          elementGuid: guid || "",
                          attributeIndex: index,
                          data: { ...attribute, key: item.key },
                          systemId,
                          itemId: nodePayload?.item_id || "",
                        });
                      }
                      if (props.onChangeEdgeAttribute) {
                        props.onChangeEdgeAttribute({ elementGuid: guid || "", attributeIndex: index, data: { ...attribute, key: item.key } });
                      }
                    }
                  : undefined
              }
              onDelete={
                props?.onDeleteNodeAttribute
                  ? () => {
                      props?.onDeleteNodeAttribute?.({ elementGuid: guid || "", attributeIndex: index });
                    }
                  : undefined
              }
            />
          ) : null
        )}
      </List>
      {props.AddAttributeComponent}
    </Collapse>
  );
}
