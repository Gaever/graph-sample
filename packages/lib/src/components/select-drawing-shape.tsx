import { fontFamilies, removeFontAwesome } from "../theme";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import noop from "lodash/noop";

export interface SelectDrawingShapProps {
  value: string | undefined;
  onChange: (shape: string) => void;
}

export const shapes = [
  "rectangle",
  "roundrectangle",
  "ellipse",
  "triangle",
  "pentagon",
  "hexagon",
  "heptagon",
  "octagon",
  "star",
  "barrel",
  "diamond",
  "vee",
  "rhomboid",
  "polygon",
  "tag",
  "round-rectangle",
  "round-triangle",
  "round-diamond",
  "round-pentagon",
  "round-hexagon",
  "round-heptagon",
  "round-octagon",
  "round-tag",
  "cut-rectangle",
  "bottom-round-rectangle",
  "concave-hexagon",
];

export function SelectDrawingShape({ value, onChange }: SelectDrawingShapProps) {
  return (
    <FormControl fullWidth>
      <InputLabel id="font-family-select-label" sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>
        Форма
      </InputLabel>
      <Select
        labelId="font-family-select-label"
        id="font-famkily-select"
        value={value || shapes[0]}
        label="Шрифт"
        onChange={(event: SelectChangeEvent) => {
          onChange(event.target.value || "");
        }}
        size="small"
      >
        {shapes.map((value) => (
          <MenuItem key={value} value={value}>
            <Typography>{value}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
