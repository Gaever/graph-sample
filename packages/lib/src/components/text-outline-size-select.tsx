import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useState } from "react";

export interface TextOutlineSelectProps {
  initialValue: number;
  onChange: (value: number) => void;
}

export function TextOutlineSizeSelect(props: TextOutlineSelectProps) {
  const [value, setValue] = useState<number>(props.initialValue);

  return (
    <FormControl fullWidth>
      <InputLabel>Контур</InputLabel>
      <Select
        variant="outlined"
        label="Контур"
        size="small"
        value={value}
        onChange={(event) => {
          props.onChange(+event.target.value);
          setValue(+event.target.value);
        }}
        MenuProps={{
          sx: {
            maxHeight: 300,
          },
        }}
      >
        {[...Array(20).keys()].map((fontSize) => (
          <MenuItem value={fontSize} key={`font-size-${fontSize}`}>
            {fontSize}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
