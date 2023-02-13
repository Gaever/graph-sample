import RemoveIcon from "@mui/icons-material/Remove";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import { useState } from "react";
import { filters, GraphState } from "../types";
import { FilterProps } from "./filter";

export interface SystemIdFilterProps extends Pick<FilterProps, "onSelectOpen" | "onSelectClose"> {
  selectedSystemIds: filters["systemIds"];
  systemTypes: GraphState["nodeTypesMap"] | GraphState["edgeTypesMap"];
  onChange: (selectedSystemIds: filters["systemIds"]) => void;
  onClearClick: () => void;
  systemIds: string[];
}

export default function SystemIdFilter(props: SystemIdFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="icon-filter-label" sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>
          по типу (system id)
        </InputLabel>
        <Select
          labelId="icon-filter-label"
          value={props.selectedSystemIds}
          multiple
          input={<OutlinedInput id="select-multiple-chip" label="по типу (system id)" />}
          onChange={(event) => {
            const value = event.target.value;
            props.onChange(typeof value === "string" ? value.split(",") : value);
            setIsOpen(false);
            props?.onSelectClose?.();
          }}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={props.systemTypes.get(value)?.label || value} />
              ))}
            </Box>
          )}
          size="small"
          open={isOpen}
          onOpen={() => {
            setIsOpen(true);
            props?.onSelectOpen?.();
          }}
          onClose={() => {
            setIsOpen(false);
            props?.onSelectClose?.();
          }}
        >
          {props.systemIds.map((systemId) => (
            <MenuItem key={systemId} value={systemId}>
              {props.systemTypes.get(systemId)?.label || systemId}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ ml: 1 }}>
        <IconButton size="small" onClick={props.onClearClick}>
          <RemoveIcon fontSize="small" />
        </IconButton>
      </Box>
    </>
  );
}
