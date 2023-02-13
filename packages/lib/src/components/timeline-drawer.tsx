import AttributeList from "./attribute-list";
import { EditTimelineStyle } from "./edit-timeline-style";
import { pickNodeLabel } from "../data-layer/format-response";
import { Field, Node } from "../http/api";
import { OnTimelineItemChange } from "../types";
import { isNodeGroup } from "../utils";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { IconButton, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import noop from "lodash/noop";
import ListItemText from "@mui/material/ListItemText";
import { useEffect, useRef, useState } from "react";
import { Timeline } from "vis-timeline/esnext";

export interface TimelineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onChange: OnTimelineItemChange;
  nodes: cytoscape.CollectionReturnValue | null;
}
const inf = new Date(new Date().getTime() * 1.5);

const CONTAINER_HEIGHT = "400px";

function dateFieldCond(item: any) {
  return isNaN(Number(item || 0)) && !isNaN(Date.parse(item));
}

function pickDate(node: Node, dataField?: string) {
  if (dataField) {
    const v = node?.data?.find((item) => item.key === dataField)?.value;
    if (v === "Infinity") return inf;
    return v ? new Date(v) : undefined;
  }

  const createdAtValue = node?.data?.find((item) => item.key === "created_at")?.value || undefined;
  const fallbackValue = !createdAtValue ? node?.data?.find((item) => dateFieldCond(item.value))?.value || undefined : undefined;

  const v = createdAtValue || fallbackValue;

  if (v === "Infinity") return inf;

  return v ? new Date(v) : undefined;
}

export interface TimelineDrawerContentProps extends TimelineDrawerProps {
  items: any[];
  onItemSelect: (guid: string) => void;
  onUnselect: () => void;
}

function TimelineDrawerContent(props: TimelineDrawerContentProps) {
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<Timeline | null>(null);

  const selectHandler = (event: any) => {
    const ev = timelineRef.current?.getEventProperties?.(event);
    // @ts-ignore
    const guid = ev?.event?.items?.[0];

    if (guid) {
      props.onItemSelect(guid);
    } else {
      props.onUnselect();
    }
  };

  useEffect(() => {
    if (timelineContainerRef.current) {
      if (timelineRef.current) {
        timelineRef.current.off("select", selectHandler);
        timelineRef.current.destroy();
        timelineRef.current = null;
      }

      timelineRef.current = new Timeline(timelineContainerRef.current, props.items, {
        height: "100%",
        max: inf,
        autoResize: false,
      });

      timelineRef.current?.on?.("select", selectHandler);
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.off("select", selectHandler);
      }
    };
  }, [props.items]);

  return <Box ref={timelineContainerRef} sx={{ width: "100%", height: CONTAINER_HEIGHT }} />;
}

export interface SelectedItemProps extends TimelineDrawerProps {
  node: cytoscape.SingularElementReturnValue;
  onHide: (id: string) => void;
}

function pickDataField(node: Node, dataField?: string) {
  if (dataField) return dataField;

  const createdAtKey = node?.data?.find((item) => item.key === "created_at")?.key || undefined;
  const fallbackValue = !createdAtKey ? node?.data?.find((item) => dateFieldCond(item.value))?.key || undefined : undefined;

  return createdAtKey || fallbackValue;
}

function attributesToAttributesMap(attributes: Field[]) {
  const map = new Map<string, string>();
  attributes.forEach((item) => {
    if (item.key) {
      map.set(item.key, item.formattedValue || item.label || item.key);
    }
  });
  return map;
}

function SelectedItem(props: SelectedItemProps) {
  const data = props.node?.data?.("payload");
  // const [startDateField, setStartDateField] = useState(pickDataField(data, data?.timeline_field) || "");
  // const [endDateField, setEndDateField] = useState(pickDataField(data, data?.timeline_end_field) || "");

  const [startDateField, setStartDateField] = useState(pickDataField(data, data?.timeline_field) || "");
  const [endDateField, setEndDateField] = useState(data?.timeline_end_field || "");

  const [applyToAllNodesWithSameSystemId, setApplyToAllNodesWithSameSystemId] = useState(false);
  const [nodeTimlineClassname, setNodeTimlineClassname] = useState(props.node?.data("payload")?.timeline_class);

  const label = pickNodeLabel(props.node?.data?.("label"), data?.label_template, data?.data || [], props.node?.id());
  const attributesMap = attributesToAttributesMap((props.node?.data("payload")?.data || []) as Field[]);
  const systemId = data?.system_id;

  return (
    <Box sx={{ width: "360px", overflow: "scroll" }}>
      <Box
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          display: "flex",
          mb: 2,
        }}
      >
        <Typography>{label}</Typography>
        <IconButton size="small" onClick={props.onClose}>
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>Поле даты начала</InputLabel>
          <Select
            value={startDateField || ""}
            label="Поле даты начала"
            onChange={(event) => {
              setStartDateField(event.target.value);
            }}
            size="small"
            onOpen={noop}
            onClose={noop}
          >
            <MenuItem value="">
              <Typography>
                {"<"}Без даты{">"}
              </Typography>
            </MenuItem>

            {Array.from(attributesMap.keys()).map((attributeKey) => (
              <MenuItem key={attributeKey} value={attributeKey}>
                <ListItemText primary={attributesMap.get(attributeKey)} secondary={attributeKey} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>Поле даты конца</InputLabel>
          <Select
            value={endDateField || ""}
            label="Поле даты конца"
            onChange={(event) => {
              setEndDateField(event.target.value);
            }}
            size="small"
            onOpen={noop}
            onClose={noop}
          >
            <MenuItem value="">
              <Typography>
                {"<"}Без даты{">"}
              </Typography>
            </MenuItem>

            {Array.from(attributesMap.keys()).map((attributeKey) => (
              <MenuItem key={attributeKey} value={attributeKey}>
                <ListItemText primary={attributesMap.get(attributeKey)} secondary={attributeKey} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <EditTimelineStyle
          oldClassname={nodeTimlineClassname}
          onChange={(newClassname) => {
            setNodeTimlineClassname(newClassname);
          }}
        />

        <Box sx={{ mb: 2 }}>
          {systemId ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={applyToAllNodesWithSameSystemId}
                  size="small"
                  onChange={() => {
                    setApplyToAllNodesWithSameSystemId((prev) => !prev);
                  }}
                />
              }
              componentsProps={{
                typography: {
                  variant: "body2",
                },
              }}
              label={`Применить для всех узлов с system id ${systemId}`}
            />
          ) : null}
        </Box>

        <Button
          variant="contained"
          size="small"
          onClick={() => {
            props.onChange({
              node: props.node,
              applyToAllNodesWithSameSystemId,
              startDateField,
              endDateField,
              nodeTimlineClassname,
            });
          }}
        >
          Применить
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            props.onHide(props.node.id());
          }}
        >
          Скрыть
        </Button>
      </Stack>

      <AttributeList nodeData={props.node.data()} isOpen CollapseProps={{ label: "Атрибуты" }} />
    </Box>
  );
}

export default function TimelineDrawer(props: TimelineDrawerProps) {
  const [selectedGuid, setSelectedGuid] = useState<string | null>(null);
  const [hiddenFromTimeline, setHiddenFromTimeline] = useState<Set<string>>(new Set());

  const mapItems = (nodes: cytoscape.CollectionReturnValue | null) => {
    const data: any[] = [];
    const guidToNodesIndex: Record<string, number> = {};

    (nodes || []).forEach((cyItem, index) => {
      if (isNodeGroup(cyItem)) return;
      if (hiddenFromTimeline.has(cyItem.id())) return;

      const node = cyItem.data("payload") as Node;

      const start = pickDate(node, node?.timeline_field);

      if (!start) return;

      const end = node?.timeline_end_field ? pickDate(node, node?.timeline_end_field) : undefined;
      const guid = node.guid || "";

      data.push({
        id: guid,
        // className: ["timeline-item", node?.timeline_class].join(" "),
        className: node?.timeline_class,
        start,
        end,
        content: pickNodeLabel(node?.label, node?.label_template, node?.data || [], node?.guid),
        ...(!end ? { type: "point" } : null),
      });
      guidToNodesIndex[guid] = index;
    });

    return { data, guidToNodesIndex };
  };

  const [timelineItems, setTimelineItems] = useState<any[]>([]);
  const [guidToNodesIndex, setGuidToNodesIndex] = useState<Record<string, number>>({});

  const updateItems = () => {
    const result = mapItems(props.nodes);

    setTimelineItems(result.data);
    setGuidToNodesIndex(result.guidToNodesIndex);
  };

  useEffect(() => {
    updateItems();
  }, [props.nodes]);

  const selectedNode = selectedGuid !== null ? props.nodes?.[guidToNodesIndex[selectedGuid]] : null;

  return (
    <Drawer
      anchor="bottom"
      open={props.isOpen}
      onClose={() => {
        setSelectedGuid(null);
        props.onClose();
        setHiddenFromTimeline(new Set());
      }}
      ModalProps={{ BackdropProps: { sx: { backgroundColor: "rgba(0, 0, 0, 0.2)" } } }}
    >
      <Stack direction="row" sx={{ position: "relative" }}>
        <TimelineDrawerContent
          items={timelineItems}
          {...props}
          onItemSelect={(guid) => {
            setSelectedGuid(guid);
          }}
          onUnselect={() => {
            setSelectedGuid(null);
          }}
        />
        {selectedNode ? (
          <Box
            sx={{
              p: 2,
              position: "absolute",
              right: 0,
              top: 0,
              backgroundColor: "#f5f5f5",
              height: CONTAINER_HEIGHT,
              borderLeftColor: "grey.300",
              borderLeftStyle: "solid",
              borderLeftWidth: 1,
              overflow: "scroll",
            }}
          >
            <SelectedItem
              node={selectedNode}
              {...props}
              onChange={(data) => {
                props.onChange(data);
                requestAnimationFrame(() => {
                  updateItems();
                  setSelectedGuid(null);
                });
              }}
              onClose={() => {
                setSelectedGuid(null);
              }}
              onHide={(id) => {
                const newHiddenFromTimeline = hiddenFromTimeline.add(id);
                setHiddenFromTimeline(newHiddenFromTimeline);
                setSelectedGuid(null);
                updateItems();
              }}
            />
          </Box>
        ) : null}
      </Stack>
    </Drawer>
  );
}
