import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useState } from "react";

export interface EdgeTypeSelectProps {
  initialValue: string;
  onChange: (value: string) => void;
}

export default function EdgeTypeSelect(props: EdgeTypeSelectProps) {
  const [value, setValue] = useState<string>(props.initialValue);

  return (
    <FormControl fullWidth>
      <InputLabel>Вид линии</InputLabel>
      <Select
        variant="outlined"
        label="Вид линии"
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
        {["bezier", "haystack", "segments", "straight", "taxi", "unbundled-bezier"].map((edgeType) => (
          <MenuItem value={edgeType} key={`edge-type-${edgeType}`}>
            {edgeType}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
