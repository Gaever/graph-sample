import { fontSizes } from "../theme";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useState } from "react";

export interface FontSizeSelectProps {
  initialValue: number;
  onChange: (value: number) => void;
}

export function FontSizeSelect(props: FontSizeSelectProps) {
  const [value, setValue] = useState<number>(props.initialValue);

  return (
    <FormControl fullWidth>
      <InputLabel>Размер</InputLabel>
      <Select
        variant="outlined"
        label="Размер"
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
        {fontSizes.map((fontSize) => (
          <MenuItem value={fontSize} key={`font-size-${fontSize}`}>
            {fontSize}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
