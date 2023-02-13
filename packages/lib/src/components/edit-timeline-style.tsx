import ColorPicker from "./color-picker";
import { FontSizeSelect } from "./font-size-select";
import { FontStylePicker } from "./font-style-picker";
import { SelectFontFamily } from "./select-font-family";
import { CSS_PREFIX_TIMELINE } from "../data-layer/cy-constants";
import { timeliteStyles } from "../theme";
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import _findLast from "lodash/findLast";
import _uniq from "lodash/uniq";
import { useEffect, useState } from "react";

export interface EditTimelineStyleProps {
  oldClassname: string | undefined;
  onChange: (classname: string) => void;
}

interface EditTimelineStyleState {
  fontFormats?: string[];
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
}

function stateToCn(state: EditTimelineStyleState): string {
  return [
    state.fontFamily ? `${CSS_PREFIX_TIMELINE}font-family--${state.fontFamily.replaceAll(" ", "_").replaceAll('"', "").replaceAll(",", "_")}` : null,
    state.fontSize ? `${CSS_PREFIX_TIMELINE}font-size--${state.fontSize}` : null,
    state?.fontFormats?.includes?.("italic") ? `${CSS_PREFIX_TIMELINE}font-format--italic` : null,
    state?.fontFormats?.includes?.("bold") ? `${CSS_PREFIX_TIMELINE}font-format--bold` : null,
    state?.color ? `${CSS_PREFIX_TIMELINE}text-color--${state.color.replace("#", "")}` : null,
    state.backgroundColor ? `${CSS_PREFIX_TIMELINE}dot-bg-color--${state.backgroundColor.replace("#", "")}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function cnToState(classname: string): EditTimelineStyleState {
  const styles = classname.split(" ");

  const fontFamily = _findLast(
    styles.map((item) => timeliteStyles.fontFamiliesCn[item]),
    Boolean
  );
  const fontSize = _findLast(
    styles.map((item) => timeliteStyles.fontSizesCn[item]),
    Boolean
  );
  const fontFormats = _uniq(styles.map((item) => timeliteStyles.fontFormatCn[item]).filter(Boolean));
  const color = _findLast(
    styles.map((item) => timeliteStyles.textColorStyleCn[item]),
    Boolean
  );
  const backgroundColor = _findLast(
    styles.map((item) => timeliteStyles.dotBgStyleCn[item]),
    Boolean
  );

  const state: EditTimelineStyleState = {
    fontFamily,
    fontSize,
    fontFormats,
    color,
    backgroundColor,
  };

  return state;
}

export function EditTimelineStyle(props: EditTimelineStyleProps) {
  const [state, setState] = useState<EditTimelineStyleState>(cnToState(props.oldClassname || ""));
  const theme = useTheme();

  useEffect(() => {
    props.onChange(stateToCn(state));
  }, [state]);

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <SelectFontFamily
          value={state.fontFamily || ""}
          onChange={(value) => {
            setState((prev) => ({ ...prev, fontFamily: value }));
          }}
        />
      </Box>
      <Grid item xs={12} sx={{ display: "flex", alignItems: "center", flexDirection: "row", mt: 2 }}>
        <Box sx={{ minWidth: 80, mr: 1 }}>
          <FontSizeSelect
            initialValue={parseInt(state.fontSize || "16")}
            onChange={(value) => {
              setState((prev) => ({ ...prev, fontSize: `${value}px` }));
            }}
          />
        </Box>

        <FontStylePicker
          fontFormats={state.fontFormats || []}
          color={state.color}
          onFontFormatsChange={(newFontFormats) => {
            setState((prev) => ({ ...prev, fontFormats: newFontFormats }));
          }}
          onChangeTextColor={(color) => {
            setState((prev) => ({ ...prev, color }));
          }}
        />
        <Box sx={{ mr: 1 }}>
          <ColorPicker
            size="small"
            color={state.backgroundColor || theme.palette.primary.light}
            onChangeComplete={(color) => {
              setState((prev) => ({ ...prev, backgroundColor: color.hex }));
            }}
            tooltipTitle="Цвет узла"
          />
        </Box>
      </Grid>
    </Box>
  );
}
