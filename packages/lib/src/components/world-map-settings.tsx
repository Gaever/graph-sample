import { WorldMapState } from "../types";
import { validateNum } from "../utils";
import { TextField } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export interface WorldMapSettingProps {
  worldMapState: WorldMapState;
  onChange: (worldMapState: WorldMapState) => void;
}

export const initialWorldMapState: WorldMapState = {
  show: false,
  scale: 2.5,
};

export default function WorldMapSetting(props: WorldMapSettingProps) {
  const [scale, setScale] = useState<string | undefined>(props.worldMapState.scale?.toString?.());
  const debouncedOnScaleChange = useDebouncedCallback((v: number) => {
    props.onChange({
      ...props.worldMapState,
      scale: v,
    });
  }, 500);

  return (
    <Grid container sx={{ pb: 1 }}>
      <Grid item xs={12}>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={props.worldMapState.show}
                size="small"
                onChange={() => {
                  props.onChange({
                    ...props.worldMapState,
                    show: !props.worldMapState.show,
                  });
                }}
              />
            }
            componentsProps={{
              typography: {
                variant: "body2",
              },
            }}
            label="Показать"
          />

          <TextField
            sx={{ mt: 2 }}
            size="small"
            variant="outlined"
            placeholder="Масштаб"
            label="Масштаб"
            value={scale?.toString?.() || ""}
            onBlur={() => {
              if (!scale && scale !== "0") {
                setScale(props.worldMapState.scale?.toString?.());
              }
            }}
            onChange={(event) => {
              const v = event.target.value;

              if (!validateNum(v)) return;

              if (v === "") {
                setScale(undefined);
              } else {
                setScale(v);
              }

              if (v !== "") {
                debouncedOnScaleChange(parseFloat(v));
              }
            }}
          />
        </FormGroup>
      </Grid>
    </Grid>
  );
}
