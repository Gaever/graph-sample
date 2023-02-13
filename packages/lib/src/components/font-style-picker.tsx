import ColorPicker from "./color-picker";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import ButtonGroup from "@mui/material/ButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

export interface FontStylePickerProps {
  color: string | undefined;

  textBackgroundColor?: string | undefined;
  fontFormats: string[];

  onFontFormatsChange: (fontFormats: string[]) => void;
  onChangeTextBgColor?: (color: string) => void;
  onChangeTextColor: (color: string) => void;

  defaultTextBackgroundColor?: string;
  defaultTextColor?: string;
  textBackgrountColorTooltipTitle?: string;
}

export function FontStylePicker(props: FontStylePickerProps) {
  return (
    <>
      <ToggleButtonGroup
        size="small"
        value={props.fontFormats}
        onChange={(_, newFontFormats: string[]) => {
          props.onFontFormatsChange(newFontFormats);
        }}
      >
        <ToggleButton value="bold">
          <FormatBoldIcon />
        </ToggleButton>
        <ToggleButton value="italic">
          <FormatItalicIcon />
        </ToggleButton>
      </ToggleButtonGroup>

      <ButtonGroup sx={{ ml: 1 }}>
        {props?.onChangeTextBgColor ? (
          <ColorPicker
            icon={<FormatColorFillIcon sx={{ color: props.textBackgroundColor || props.defaultTextBackgroundColor || "#ffffff" }} />}
            color={props.textBackgroundColor || props.defaultTextBackgroundColor || "#ffffff"}
            onChangeComplete={(color) => {
              props?.onChangeTextBgColor?.(color.hex);
            }}
            tooltipTitle={props.textBackgrountColorTooltipTitle || "Цвет фона подписи"}
          />
        ) : null}
        <ColorPicker
          icon={<FormatColorTextIcon sx={{ color: props.color || props.defaultTextColor || "#000000" }} />}
          color={props.color || props.defaultTextColor || "#000000"}
          onChangeComplete={(color) => {
            props.onChangeTextColor(color.hex);
          }}
          tooltipTitle="Цвет текста подписи"
        />
      </ButtonGroup>
    </>
  );
}
