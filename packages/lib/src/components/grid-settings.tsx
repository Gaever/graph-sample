import { GridSettingsState } from "../types";
import { validateNum } from "../utils";
import { TextField } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import { alpha, styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const BlueSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked, & .MuiSwitch-switchBase": {
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track, & .MuiSwitch-switchBase + .MuiSwitch-track": {
    backgroundColor: theme.palette.primary.light,
  },
  "& .MuiSwitch-switchBase.Mui-disable": {
    color: theme.palette.info.main,
  },
  "& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track": {
    backgroundColor: theme.palette.info.light,
  },
}));

export const initialGridState = {
  show: false,
  size: 50,
  snap: false,
  panGrid: true,
  snapToGridCenter: false,
};

export interface GridSettingsProps {
  gridSettingsState: GridSettingsState;
  onChange: (state: GridSettingsState) => void;
}

function GridSettings(props: GridSettingsProps) {
  const [size, setSize] = useState<number | undefined>(props.gridSettingsState.size);
  const debouncedOnSizeChange = useDebouncedCallback((v: number) => {
    props.onChange({
      ...props.gridSettingsState,
      size: v,
    });
  }, 500);
  const [isShow] = useState(props.gridSettingsState.show);
  const [isPanGrid] = useState(props.gridSettingsState.panGrid);
  const [isSnap] = useState(props.gridSettingsState.snap);
  const [isSnapToGridCenter] = useState(props.gridSettingsState.snapToGridCenter);

  return (
    <Grid container>
      <Grid item xs={12}>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={isShow}
                size="small"
                onChange={() => {
                  props.onChange({
                    ...props.gridSettingsState,
                    show: !props.gridSettingsState.show,
                  });
                }}
              />
            }
            componentsProps={{
              typography: {
                variant: "body2",
              },
            }}
            label="Показать сетку"
          />
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={isPanGrid}
                size="small"
                onChange={() => {
                  props.onChange({
                    ...props.gridSettingsState,
                    panGrid: !props.gridSettingsState.panGrid,
                  });
                }}
              />
            }
            componentsProps={{
              typography: {
                variant: "body2",
              },
            }}
            label="Перемещать сетку"
          />
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={isSnap}
                size="small"
                onChange={() => {
                  props.onChange({
                    ...props.gridSettingsState,
                    snap: !props.gridSettingsState.snap,
                  });
                }}
              />
            }
            componentsProps={{
              typography: {
                variant: "body2",
              },
            }}
            label="Привязка к сетке"
          />
          <FormControlLabel
            control={
              <BlueSwitch
                disabled={!props.gridSettingsState.snap}
                defaultChecked={isSnapToGridCenter}
                size="small"
                onChange={() => {
                  props.onChange({
                    ...props.gridSettingsState,
                    snapToGridCenter: !props.gridSettingsState.snapToGridCenter,
                  });
                }}
              />
            }
            label={
              <Typography variant="body2">
                <Typography component="span" variant="body2" color={props.gridSettingsState.snapToGridCenter ? "grey.500" : undefined}>
                  на пересечении
                </Typography>
                <Typography component="span" variant="body2" color="grey.500">
                  {" "}
                  |{" "}
                </Typography>
                <Typography component="span" variant="body2" color={!props.gridSettingsState.snapToGridCenter ? "grey.500" : undefined}>
                  по центру клетки
                </Typography>
              </Typography>
            }
          />

          <TextField
            sx={{ mt: 2 }}
            size="small"
            variant="outlined"
            placeholder="Размер"
            label="Размер"
            value={size?.toString?.() || ""}
            onBlur={() => {
              if (!size && size !== 0) {
                setSize(props.gridSettingsState.size);
              }
            }}
            onChange={(event) => {
              const v = +event.target.value;

              if (!validateNum(event.target.value)) return;

              if (event.target.value === "") {
                setSize(undefined);
              } else {
                setSize(v);
              }

              if (event.target.value !== "") {
                debouncedOnSizeChange(v);
              }
            }}
          />
        </FormGroup>
      </Grid>
    </Grid>
  );
}

export default GridSettings;
