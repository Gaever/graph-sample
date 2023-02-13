import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export interface LabelTemplateTextFieldProps {
  initialValue: string;
  onChange: (value: string) => void;
  tooltipTitle?: string;
  label: string;
  TextFieldProps?: Partial<TextFieldProps>;
}

export function LabelTemplateTextField(props: LabelTemplateTextFieldProps) {
  const [value, setValue] = useState(props.initialValue);
  const debouncedOnChange = useDebouncedCallback(props.onChange, 300);

  return (
    <TextField
      multiline
      size="small"
      fullWidth
      InputProps={{
        endAdornment: props.tooltipTitle ? (
          <Tooltip title={props.tooltipTitle || ""}>
            <HelpOutlineIcon sx={{ color: "grey.400" }} />
          </Tooltip>
        ) : null,
      }}
      label={props.label}
      value={value}
      onChange={(event) => {
        const newValue = event.target.value;
        setValue(newValue);
        debouncedOnChange(newValue);
      }}
      {...props.TextFieldProps}
    />
  );
}
