import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useState } from "react";

export interface ArrowTypeSelectProps {
  initialValue: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function ArrowTypeSelect(props: ArrowTypeSelectProps) {
  const [value, setValue] = useState<string>(props.initialValue);

  return (
    <FormControl fullWidth>
      {props.label ? <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>{props.label}</InputLabel> : null}
      <Select
        variant="outlined"
        label={props.label}
        size="small"
        value={value}
        onChange={(event) => {
          props.onChange(event.target.value);
          setValue(event.target.value);
        }}
        MenuProps={{
          sx: {
            maxHeight: 300,
          },
        }}
      >
        {["tee", "vee", "triangle", "triangle-tee", "circle-triangle", "triangle-cross", "triangle-backcurve", "square", "circle", "diamond", "chevron", "none"].map((edgeType) => (
          <MenuItem value={edgeType} key={`arrow-type-${edgeType}`}>
            {edgeType}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
