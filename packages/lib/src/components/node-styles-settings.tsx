import Collapse from "./collapse";
import { EditNode, editNodeStateToNewStyle } from "./edit-node";
import Filter, { FilterProps } from "./filter";
import { ConditionStyle, filters, GraphState, GuiState } from "../types";
import { Button, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import _omitBy from "lodash/omitBy";
import { useState } from "react";

export interface NodeStylesSettingsProps extends Pick<GuiState, "nodeConditionStyles">, Pick<GraphState, "stylesheetMap"> {
  onApply: (item: ConditionStyle, style: cytoscape.Css.Node) => void;
  onAdd: () => void;
  onDelete: (item: ConditionStyle) => void;
  FilterProps: Pick<FilterProps, "icons" | "attributesMap" | "systemIds" | "systemTypes" | "usedNodeIcons">;
}

export interface NodeStyleSettingsItemProps extends Omit<NodeStylesSettingsProps, "nodeConditionStyles" | "onAdd" | "onRefresh"> {
  conditionStylesheet: ConditionStyle;
}

export function NodeStyleSettingsItem(props: NodeStyleSettingsItemProps) {
  const stylesheet = props.stylesheetMap.get(props.conditionStylesheet.selector);
  const [filterState, setFilterState] = useState<filters>(props.conditionStylesheet.filter);
  const [styleState, setStyleState] = useState<cytoscape.Css.Node>((stylesheet?.style || {}) as cytoscape.Css.Node);
  const [title, setTitle] = useState(props.conditionStylesheet.title);

  return (
    <Box>
      <Box sx={{ m: 2, mb: 1 }}>
        <TextField
          value={title}
          size="small"
          fullWidth
          label="Название"
          placeholder="Название"
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />
      </Box>
      <Collapse label="Фильтр" isOpen={true}>
        <Box sx={{ mt: 1 }}>
          <Filter
            hideHeader
            filters={filterState}
            onStateChange={(filter) => {
              if (filter) {
                setFilterState(filter);
              }
            }}
            PaperProps={{ sx: { p: 2, boxShadow: "none", pt: 0 } }}
            SubmitComponent={() => <></>}
            displayedOptions={["icon", "system-id", "attributes"]}
            {...props.FilterProps}
          />
        </Box>
      </Collapse>
      <Collapse label="Стиль" isOpen={true}>
        <Box sx={{ mt: 1 }}>
          <EditNode
            style={stylesheet?.style || {}}
            displayedOptions={["font-family-select", "font-size-select", "font-style-picker", "node-size-and-color"]}
            ClickAwayListenerProps={{
              onClickAway: () => {},
            }}
            PaperProps={{ sx: { p: 2, boxShadow: "none" } }}
            onStateChange={(editNodeState) => {
              const newStyle = editNodeStateToNewStyle(editNodeState, (stylesheet?.style || {}) as cytoscape.Css.Node);
              const sanitizedStyle = _omitBy(newStyle, (item) => item === undefined || item === null || item === "");

              setStyleState(sanitizedStyle);
            }}
          />
        </Box>
      </Collapse>
      <Box m={1.5}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={() => {
              props.onApply(
                {
                  ...props.conditionStylesheet,
                  title,
                  filter: filterState,
                },
                styleState
              );
            }}
          >
            Применить
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            fullWidth
            onClick={() => {
              props.onDelete(props.conditionStylesheet);
            }}
          >
            Удалить
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default function NodeStylesSettings(props: NodeStylesSettingsProps) {
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ mb: 2 }}>
        {Array.from(props.nodeConditionStyles.values()).map((item) => (
          <Collapse key={item.selector} label={item.title} isOpen={false} ListItemTextProps={{ primaryTypographyProps: { variant: "body1" } }}>
            <NodeStyleSettingsItem {...props} conditionStylesheet={item} />
          </Collapse>
        ))}
      </Box>
      <Box sx={{ m: 1.5, mt: 0 }}>
        <Button variant="contained" size="small" fullWidth onClick={props.onAdd}>
          Добавить
        </Button>
      </Box>
    </Box>
  );
}
