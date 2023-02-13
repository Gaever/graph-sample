import TextField from "@mui/material/TextField";

export interface DisplayedLabelProps {
  displayedLabel: string;
}

export function DisplayedLabel(props: DisplayedLabelProps) {
  return <TextField multiline fullWidth size="small" label="Отображаемая подпись" value={props.displayedLabel} disabled />;
}
