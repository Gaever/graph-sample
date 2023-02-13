import { validateNum } from "../utils";
import TextField from "@mui/material/TextField";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { IconButton, Tooltip } from "@mui/material";

export interface EdgeLabelOffsetTextFieldProps {
  value?: number;
  onChange: (value: number) => void;
}

export default function EdgeLabelOffsetTextField(props: EdgeLabelOffsetTextFieldProps) {
  return (
    <TextField
      fullWidth
      type="number"
      size="small"
      label="Смещение"
      placeholder="Смещение"
      value={props.value || 0}
      onChange={(event) => {
        if (!validateNum(event.target.value, true)) return;

        props.onChange(+event.target.value);
      }}
      InputProps={{
        endAdornment: (
          <Tooltip title="Больше нуля - фиксированные отступ от начала линии. Меньше нуля - фиксированный отступ с конца линии">
            <InfoOutlinedIcon fontSize="small" sx={{ color: "grey.500", ml: 1 }} />
          </Tooltip>
        ),
      }}
      inputProps={{
        step: 50,
      }}
    />
  );
}
