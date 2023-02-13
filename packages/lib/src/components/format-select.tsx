import { dateFormatVariantToTitle, numberFormatVariantToTitle } from "../utils";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";

export interface FormatSelectProps {
  onOpen: () => void;
  onClose: () => void;
  onChange: (formatVariant: number) => void;
  formatVariant?: number;
  str: string;
}

export default function FormatSelect(props: FormatSelectProps) {
  return (
    <Box sx={{ minWidth: 120, mb: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="format-select-label">Формат</InputLabel>
        <Select
          labelId="format-select-label"
          value={props.formatVariant?.toString?.() || "0"}
          label="Формат"
          onChange={(event: SelectChangeEvent) => {
            props.onChange(+event.target.value);
          }}
          size="small"
          onOpen={props.onOpen}
          onClose={props.onClose}
        >
          <MenuItem value={"0"}>{`${props.str} (по умолчанию)`}</MenuItem>

          <ListSubheader>Число</ListSubheader>

          {Object.keys(numberFormatVariantToTitle).map((variant) => (
            <MenuItem key={`edit-list-item-format-${variant}`} value={variant.toString()}>
              {numberFormatVariantToTitle[+variant]}
            </MenuItem>
          ))}

          <ListSubheader>Дата</ListSubheader>

          {Object.keys(dateFormatVariantToTitle).map((variant) => (
            <MenuItem key={`edit-list-item-format-${variant}`} value={variant.toString()}>
              {dateFormatVariantToTitle[+variant]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
