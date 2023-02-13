import DateRangePicker from "./date-range-picker";
import { attributeFilter, attributeFilterCondition, GraphState } from "../types";
import { validateNum } from "../utils";
import RemoveIcon from "@mui/icons-material/Remove";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { FilterProps } from "./filter";

export interface AttributeFilterProps extends attributeFilter, Pick<FilterProps, "onSelectOpen" | "onSelectClose"> {
  onChange: (args: attributeFilter) => void;
  onRemoveClick: () => void;
  attributesMap: GraphState["attributesMap"];
  attributeSelectPlaceholder?: string;
}

export default function AttributeFilter(props: AttributeFilterProps) {
  const [state, setState] = useState<attributeFilter>({
    filterKey: props.filterKey,
    value: props.value,
    fuzzyValue: props.fuzzyValue,
    dateRange: props.dateRange,
    condition: props.condition,
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    props.onChange(state);
  }, [state]);

  return (
    <>
      <FormControl fullWidth>
        <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>{props.attributeSelectPlaceholder || "по атрибутам"}</InputLabel>
        <Select
          value={state.filterKey || ""}
          label={props.attributeSelectPlaceholder || "по атрибутам"}
          onChange={(event: SelectChangeEvent) => {
            setState((prev) => ({ ...prev, filterKey: event.target.value || "" }));
          }}
          size="small"
          onOpen={props.onSelectOpen}
          onClose={props.onSelectClose}
        >
          {Array.from(props.attributesMap.keys()).map((attributeKey) => (
            <MenuItem key={attributeKey} value={attributeKey}>
              <ListItemText primary={props.attributesMap.get(attributeKey)} secondary={attributeKey} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ ml: 1 }}>
        <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>условие</InputLabel>
        <Select
          value={state.condition || ""}
          label="условие"
          onChange={(event: SelectChangeEvent) => {
            const condition = event.target.value as attributeFilterCondition;
            if (condition) {
              setState((prev) => ({ ...prev, condition, value: undefined, dateRange: undefined, fuzzyValue: undefined }));
            }
          }}
          size="small"
          onOpen={props.onSelectOpen}
          onClose={props.onSelectClose}
        >
          <ListSubheader>По тексту</ListSubheader>

          <MenuItem value="str-include">
            <Typography>содержит</Typography>
          </MenuItem>
          <MenuItem value="str-not-include">
            <Typography>не содержит</Typography>
          </MenuItem>
          <MenuItem value="str-eq">
            <Typography>равно</Typography>
          </MenuItem>
          <MenuItem value="str-start">
            <Typography>начинается с</Typography>
          </MenuItem>
          <MenuItem value="str-end">
            <Typography>заканчивается на</Typography>
          </MenuItem>
          <MenuItem value="null">
            <Typography>пусто</Typography>
          </MenuItem>
          <MenuItem value="not-null">
            <Typography>не пусто</Typography>
          </MenuItem>
          <MenuItem value="str-fuzzy">
            <Typography>нечеткий поиск</Typography>
          </MenuItem>

          <ListSubheader>По числу</ListSubheader>

          <MenuItem value="num-gt">
            <Typography>{">"}</Typography>
          </MenuItem>
          <MenuItem value="num-lt">
            <Typography>{"<"}</Typography>
          </MenuItem>

          <MenuItem value="num-gte">
            <Typography>{">="}</Typography>
          </MenuItem>
          <MenuItem value="num-lte">
            <Typography>{"=<"}</Typography>
          </MenuItem>
          <MenuItem value="num-eq">
            <Typography>=</Typography>
          </MenuItem>
          <MenuItem value="num-neq">
            <Typography>!=</Typography>
          </MenuItem>

          <ListSubheader>По дате</ListSubheader>

          <MenuItem value="date-range">
            <Typography>диапазон дат</Typography>
          </MenuItem>
        </Select>
      </FormControl>

      {state.filterKey && state.condition && !["date-range", "null", "not-null"].includes(state.condition) ? (
        <FormControl fullWidth sx={{ ml: 1 }}>
          <TextField
            value={state.value || ""}
            label="значение"
            placeholder="значение"
            onChange={(event) => {
              const value = event.target.value || "";
              if (state.condition?.indexOf("num") === 0 && !validateNum(value)) {
                return;
              }
              setState((prev) => ({ ...prev, value }));
            }}
            size="small"
          />
        </FormControl>
      ) : null}

      {state.filterKey && state.condition === "str-fuzzy" ? (
        <FormControl fullWidth sx={{ ml: 1 }}>
          <TextField
            value={state?.fuzzyValue || ""}
            label="расстояние"
            placeholder="расстояние"
            onChange={(event) => {
              const value = event.target.value;
              if (!validateNum(value)) return;
              setState((prev) => ({ ...prev, fuzzyValue: value }));
            }}
            size="small"
          />
        </FormControl>
      ) : null}

      {state.filterKey && state.condition === "date-range" ? (
        <FormControl fullWidth sx={{ ml: 1 }}>
          <DateRangePicker
            isOpen={isDatePickerOpen}
            onClose={() => {
              props?.onSelectClose?.();
              setIsDatePickerOpen(false);
            }}
            onOpen={() => {
              props?.onSelectOpen?.();
              setIsDatePickerOpen(true);
            }}
            startDate={state.dateRange?.from}
            endDate={state.dateRange?.to}
            onChange={(selection) => {
              setState((prev) => ({
                ...prev,
                dateRange: {
                  from: selection?.selection?.startDate as Date,
                  to: selection?.selection?.endDate as Date,
                },
              }));
            }}
          />
        </FormControl>
      ) : null}

      <Box sx={{ ml: 1 }}>
        <IconButton size="small" onClick={props.onRemoveClick}>
          <RemoveIcon fontSize="small" />
        </IconButton>
      </Box>
    </>
  );
}
