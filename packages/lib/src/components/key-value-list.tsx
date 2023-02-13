import Grid from "@mui/material/Grid";
import Typography, { TypographyProps } from "@mui/material/Typography";

export interface KeyValueListItemProps {
  label?: React.ReactNode;
  value?: React.ReactNode;
  labelTypographyProps?: TypographyProps;
  valueTypographyProps?: TypographyProps;
}

export function KeyValueListItem(props: KeyValueListItemProps) {
  return (
    <>
      <Grid item xs={6}>
        <Typography {...props.labelTypographyProps}>{props.label}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography sx={{ color: (theme) => theme.palette.grey[700] }} {...props.valueTypographyProps}>
          {props.value}
        </Typography>
      </Grid>
    </>
  );
}

export interface KeyValueListProps {
  children: React.ReactNode;
}

export default function KeyValueList(props: KeyValueListProps) {
  return (
    <Grid item xs={12}>
      <Grid container>{props.children}</Grid>
    </Grid>
  );
}
