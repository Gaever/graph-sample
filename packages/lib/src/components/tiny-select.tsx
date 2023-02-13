import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectProps } from "@mui/material/Select";

export interface TinySelectProps extends SelectProps {}

export function TinySelect(props: TinySelectProps) {
  return (
    <FormControl fullWidth>
      <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-13px", fontSize: "10px" }, "&.MuiInputLabel-shrink": { fontSize: "0.8rem", left: "-5px" } }}>
        {props.label}
      </InputLabel>
      <Select
        sx={{
          fontSize: "10px",
          "& svg": { fontSize: "1rem", right: "1px" },
          "& .MuiSelect-select.MuiSelect-outlined.MuiOutlinedInput-input.MuiInputBase-input.MuiInputBase-inputSizeSmall": { p: "2px", pl: "7px", pr: "12px" },
          "& .MuiListItemText-root p": { display: "none" },
          "& .MuiListItemText-root": { padding: 0, margin: 0 },
          "& .MuiListItemText-root span": { fontSize: "10px" },
        }}
        label={props.label}
        fullWidth
        size="small"
        value={props.value}
        onChange={props.onChange}
      >
        {props.children}
      </Select>
    </FormControl>
  );
}
