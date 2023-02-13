import RemoveIcon from "@mui/icons-material/Remove";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { metaGroupFilter } from "../types";

export interface MetaGroupSearchFilterProps extends metaGroupFilter {
  metaFields: { id?: string | number; name?: string }[];
  onChange: (args: metaGroupFilter) => void;
  onRemoveClick: () => void;
}

export default function MetaGroupSearchFilter(props: MetaGroupSearchFilterProps) {
  const [state, setState] = useState<metaGroupFilter>({
    filterKey: props.filterKey,
    value: props.value,
    condition: props.condition,
  });

  useEffect(() => {
    props.onChange(state);
  }, [state]);

  return (
    <>
      <FormControl fullWidth>
        <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>мета-поле</InputLabel>
        <Select
          value={state.filterKey || ""}
          label="мета-поле"
          onChange={(event: SelectChangeEvent) => {
            setState((prev) => ({ ...prev, filterKey: event.target.value || "" }));
          }}
          size="small"
        >
          {props.metaFields.map((item) =>
            item.id ? (
              <MenuItem key={item.id} value={item.id}>
                <ListItemText primary={item.name} />
              </MenuItem>
            ) : null
          )}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ ml: 1 }}>
        <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>условие</InputLabel>
        <Select
          value={state.condition || ""}
          label="условие"
          onChange={(event: SelectChangeEvent) => {
            const condition = event.target.value as metaGroupFilter["condition"];
            if (condition) {
              setState((prev) => ({ ...prev, condition, value: undefined }));
            }
          }}
          size="small"
        >
          <MenuItem value="eq">
            <Typography>равно</Typography>
          </MenuItem>
          <MenuItem value="ne">
            <Typography>не равно</Typography>
          </MenuItem>
          <MenuItem value="like">
            <Typography>содержит</Typography>
          </MenuItem>

          <MenuItem value="lt">
            <Typography>{"<"}</Typography>
          </MenuItem>
          <MenuItem value="gt">
            <Typography>{">"}</Typography>
          </MenuItem>

          <MenuItem value="lte">
            <Typography>{"=<"}</Typography>
          </MenuItem>
          <MenuItem value="gte">
            <Typography>{">="}</Typography>
          </MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ ml: 1 }}>
        <TextField
          value={state.value || ""}
          label="значение"
          placeholder="значение"
          onChange={(event) => {
            const value = event.target.value || "";
            setState((prev) => ({ ...prev, value }));
          }}
          size="small"
        />
      </FormControl>

      <Box sx={{ ml: 1 }}>
        <IconButton size="small" onClick={props.onRemoveClick}>
          <RemoveIcon fontSize="small" />
        </IconButton>
      </Box>
    </>
  );
}
