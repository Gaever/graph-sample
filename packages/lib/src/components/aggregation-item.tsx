import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { IconButton, Paper, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import _pick from "lodash/pick";
import { Aggregation, AggregationFunc } from "../types";
import { numberFormatVariantToTitle } from "../utils";
import { TinySelect } from "./tiny-select";

export interface AggregationItemProps {
  fields: Map<string, string>;
  functions: AggregationFunc[];
  field?: string;
  func?: string;
  result?: number;
  isVisible?: boolean;
  disableToggleVisibility?: boolean;
  formatVariant?: number;
  formattedValue?: string;
  onChange: (args: Aggregation) => void;
  onDelete: () => void;
}

export function AggregationItem(props: AggregationItemProps) {
  const changebleProps = _pick(props, ["field", "func", "isVisible", "formatVariant"]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <TinySelect
            label="поле"
            value={props.field || ""}
            onChange={(event) => {
              const value = event.target.value as string;
              props.onChange({
                ...changebleProps,
                fieldLabel: props.fields.get(value),
                field: value,
              });
            }}
          >
            {Array.from(props.fields).map((field) => (
              <MenuItem value={field[0] || ""} key={field[0]}>
                <ListItemText primary={field[1]} secondary={field[0]} />
              </MenuItem>
            ))}
          </TinySelect>

          <TinySelect
            label="функция"
            value={props.func || ""}
            onChange={(event) => {
              const value = event.target.value as string;

              props.onChange({
                ...changebleProps,
                func: value,
              });
            }}
          >
            {(props.functions || []).map((func) => (
              <MenuItem value={func.key} key={func.title}>
                {func.title}
              </MenuItem>
            ))}
          </TinySelect>

          <TinySelect
            label="формат"
            value={props.formatVariant?.toString?.() || "0"}
            onChange={(event) => {
              const value = event.target.value as string;

              props.onChange({
                ...changebleProps,
                formatVariant: +value,
              });
            }}
          >
            <MenuItem value={"0"}>(по умолчанию)</MenuItem>
            {Object.keys(numberFormatVariantToTitle).map((variant) => (
              <MenuItem value={variant.toString()} key={`aggr-item-format-variant-${variant}`}>
                {numberFormatVariantToTitle[+variant]}
              </MenuItem>
            ))}
          </TinySelect>
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 1, pt: 0.5, pb: 0.5, mt: 0.5, mb: 1 }}>
          <Stack justifyContent="space-between" direction="row">
            <Box sx={{ width: "100%" }}>
              <Typography>{props.formattedValue || props.result || 0}</Typography>
            </Box>
            {props.disableToggleVisibility ? null : (
              <Box sx={{ mr: 1 }}>
                <Tooltip title={props.isVisible ? "Скрыть отображение с графа" : "Отобразить на графе"}>
                  <Checkbox
                    sx={{ p: 0 }}
                    disableRipple
                    disableFocusRipple
                    icon={<VisibilityOutlinedIcon />}
                    checkedIcon={<VisibilityOffOutlinedIcon />}
                    checked={!!props.isVisible}
                    size="small"
                    onChange={() => {
                      props.onChange({
                        ...changebleProps,
                        isVisible: !props.isVisible,
                      });
                    }}
                  />
                </Tooltip>
              </Box>
            )}
            <Tooltip title="">
              <IconButton sx={{ p: 0 }} size="small" onClick={props.onDelete} disableRipple disableFocusRipple>
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
