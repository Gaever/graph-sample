import { fontFamilies, removeFontAwesome } from "../theme";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";

export interface SelectFontFamilyProps {
  value: string;
  onChange: (fontFamily: string) => void;
}

export function SelectFontFamily({ value, onChange }: SelectFontFamilyProps) {
  return (
    <FormControl fullWidth>
      <InputLabel id="font-family-select-label" sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>
        Шрифт
      </InputLabel>
      <Select
        labelId="font-family-select-label"
        id="font-famkily-select"
        value={value || fontFamilies[0]}
        label="Шрифт"
        onChange={(event: SelectChangeEvent) => {
          onChange(event.target.value || "");
        }}
        size="small"
      >
        {fontFamilies.map((value) => (
          <MenuItem key={value} value={value}>
            <Typography sx={{ fontFamily: value }}>{removeFontAwesome(value)}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
