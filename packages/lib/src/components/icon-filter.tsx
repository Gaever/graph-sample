import NodeIcon from "./node-icon";
import { filters, LegendSettingsState } from "../types";
import RemoveIcon from "@mui/icons-material/Remove";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { FilterProps } from "./filter";

export interface IconFilterProps extends Pick<FilterProps, "onSelectOpen" | "onSelectClose" | "icons">, Pick<LegendSettingsState, "usedNodeIcons"> {
  selectedIcons: filters["icons"];
  onChange: (selectedIcons: filters["icons"]) => void;
  onClearClick: () => void;
}

export default function IconFilter(props: IconFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FormControl fullWidth>
        <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>по иконке</InputLabel>
        <Select
          value={props.selectedIcons}
          multiple
          input={<OutlinedInput id="select-multiple-chip" label="по иконке" />}
          onChange={(event) => {
            const value = event.target.value;
            props.onChange(typeof value === "string" ? value.split(",") : value);
            setIsOpen(false);
            props?.onSelectClose?.();
          }}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={props.icons?.[value || ""]?.label || value} avatar={<Avatar src={props.icons?.[value || ""]?.src || ""} />} />
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
          {Object.keys(props.icons || {}).map((iconKey) => {
            if (!props.usedNodeIcons.has(iconKey)) {
              return null;
            }
            return (
              <MenuItem key={iconKey} value={iconKey}>
                <Stack direction="row" alignItems="center">
                  <Box sx={{ mr: 1 }}>
                    <NodeIcon width="30px" height="30px" removeShadow base64src={props.icons?.[iconKey || ""]?.src || ""} />
                  </Box>
                  <Typography>{props?.icons?.[iconKey]?.label || iconKey}</Typography>
                </Stack>
              </MenuItem>
            );
          })}
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
