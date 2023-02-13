import Paper from "@mui/material/Paper";
import Collapse, { CollapseProps } from "./collapse";

export interface ElementsCollapsiblePaperProps {
  showExpander: boolean;
  label: string;
  children: React.ReactNode;
  isOpen: boolean;
  CollapseProps?: CollapseProps;
  lengthLabel?: number;
}

export default function ElementsCollapsiblePaper(props: ElementsCollapsiblePaperProps) {
  return (
    <Paper sx={{ m: 2 }} elevation={12}>
      <Collapse
        label={`${props.label}${props.lengthLabel ? ` (${props.lengthLabel})` : ""}`}
        showExpander={props.showExpander}
        rootBoxProps={{ sx: { mb: 2 } }}
        isOpen={props.isOpen}
        ListItemTextProps={{ primaryTypographyProps: { variant: "body1" } }}
        ListItemButtonProps={{ sx: { p: 1.5, pb: 1 } }}
        {...props.CollapseProps}
      >
        {props.children}
      </Collapse>
    </Paper>
  );
}
