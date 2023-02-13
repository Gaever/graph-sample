import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useState } from "react";

export interface LineStyleSelectProps {
  initialValue: string;
  onChange: (value: string) => void;
}

export default function LineStyleSelect(props: LineStyleSelectProps) {
  const [value, setValue] = useState<string>(props.initialValue);

  return (
    <FormControl fullWidth>
      <InputLabel>Стиль</InputLabel>
      <Select
        variant="outlined"
        label="Стиль"
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
        {["solid", "dotted", "dashed", "double"].map((edgeType) => (
          <MenuItem value={edgeType} key={`edge-type-${edgeType}`}>
            {edgeType}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
