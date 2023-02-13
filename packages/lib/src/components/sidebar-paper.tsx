import { Box, Paper, Typography } from "@mui/material";
import Collapse, { CollapseProps } from "./collapse";

export interface SidebarPaper {
  title?: string;
  children?: React.ReactNode;
  isCollapsible?: boolean;
  CollapseProps?: CollapseProps;
}

export default function SidebarPaper(props: SidebarPaper) {
  return (
    <Paper sx={{ m: 2 }} elevation={12}>
      {props.isCollapsible ? (
        <Collapse
          label={props.title}
          showExpander
          isOpen={false}
          rootBoxProps={{ sx: { mb: 2 } }}
          ListItemTextProps={{ primaryTypographyProps: { variant: "body1" } }}
          ListItemButtonProps={{ sx: { p: 1.5, pb: 1 } }}
          {...props.CollapseProps}
        >
          {props.children}
        </Collapse>
      ) : (
        <>
          {props.title ? (
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="body1">{props.title}</Typography>
            </Box>
          ) : null}
          {props.children}
        </>
      )}
    </Paper>
  );
}
