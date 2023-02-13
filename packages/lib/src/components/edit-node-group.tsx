import ColorPicker from "./color-picker";
import { FontSizeSelect } from "./font-size-select";
import { FontStylePicker } from "./font-style-picker";
import IconPicker, { IconPickerProps } from "./icon-picker";
import { SelectFontFamily } from "./select-font-family";
import { ToggleTransparentCheckbox } from "./toggle-transparent-checkbox";
import { Graph } from "../http/api";
import { fontFamilies } from "../theme";
import { OnChangeAttributePayload, OnChangeNodeGroupPayload } from "../types";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import { TextField, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import FolderIcon from "./folder-icon";

export type OnChange = (args: { data: OnChangeAttributePayload; saveInDb: boolean }) => void;

export interface EditNodeGroupProps {
  groupElement: cytoscape.NodeSingular;
  onChange: (args: OnChangeNodeGroupPayload) => void;
  onClose: () => void;
  style?: cytoscape.StylesheetStyle["style"];
  icons?: Graph["icons"];
  className?: string;
  icon?: string;
  onAddIcon: IconPickerProps["onAddIcon"];
  onUpdateIcon: IconPickerProps["onUpdateIcon"];
}

interface EditNodeGroupState {
  isTransparent: boolean;

  isSizeProportional: boolean;
  fontFormats?: string[];

  label: string;
  icon?: string;

  fontFamily?: string;
  fontSize?: string;
  color?: string;
  textBackgroundColor?: string;
  borderWidth?: number | string;
  borderColor?: string;
  backgroundColor?: string;
  width?: string | number;
  height?: string | number;

  isApplyStyleToAllGroups: boolean;
  isApplyIconToAllGroups: boolean;
}

/**
 * @see src/data-layer/cy-functions/cy-actions/change-node-group-action.ts
 */
export function EditNodeGroup(props: EditNodeGroupProps) {
  const theme = useTheme();

  const oldStyle = (props.style as cytoscape.Css.Node) || {};

  const groupData = props.groupElement.data();

  const [state, setState] = useState<EditNodeGroupState>({
    isTransparent: (oldStyle["opacity"] || 1) < 1,

    isSizeProportional: oldStyle["width"] === oldStyle["height"],
    fontFormats: [(oldStyle["font-weight"] === "bold" && "bold") || "", (oldStyle["font-style"] === "italic" && "italic") || ""].filter(Boolean),

    label: groupData.label || "",
    icon: props.icon,

    fontFamily: (fontFamilies.find((value) => value === oldStyle?.["font-family"]) as string) || "",
    fontSize: oldStyle["font-size"] !== undefined ? `${parseInt(oldStyle["font-size"]?.toString?.() || "12")}px` : undefined,
    color: oldStyle["color"] as string,
    textBackgroundColor: oldStyle["text-background-color"] as string,
    borderWidth: oldStyle["border-width"] as string,
    borderColor: oldStyle["border-color"] as string,
    backgroundColor: oldStyle["background-color"] as string,
    width: oldStyle["width"] as string,
    height: oldStyle["height"] as string,

    isApplyStyleToAllGroups: false,
    isApplyIconToAllGroups: false,
  });

  // @ts-ignore
  const newStyle: cytoscape.Css.Node = {
    ...oldStyle,
    ...(state.fontFamily !== undefined ? { "font-family": state.fontFamily } : null),
    ...(state.fontSize !== undefined ? { "font-size": state.fontSize } : null),
    ...(state?.fontFormats?.includes?.("italic") ? { "font-style": "italic" } : { "font-style": null }),
    ...(state?.fontFormats?.includes?.("bold") ? { "font-weight": "bold" } : { "font-weight": null }),
    ...(state.color !== undefined ? { color: state.color } : null),
    ...(state.textBackgroundColor !== undefined ? { "text-background-color": state.textBackgroundColor } : null),
    ...(state.borderWidth !== undefined ? { "border-width": state.borderWidth } : null),
    ...(state.borderColor !== undefined ? { "border-color": state.borderColor } : null),
    ...(state.width !== undefined ? { width: state.width } : null),
    ...(state.height !== undefined ? { height: state.height } : null),
    ...(state.backgroundColor !== undefined ? { "background-color": state.backgroundColor } : null),
    ...(state.isTransparent ? { opacity: 0.25 } : { opacity: undefined }),
  };

  return (
    <ClickAwayListener
      onClickAway={(event) => {
        // @ts-ignore
        if (event.target.nodeName === "BODY") {
          // Предотвращает закрытие popover-а если внутри popover-а открыть select
          return;
        }
        props.onClose();
      }}
    >
      <Paper sx={{ p: 2, width: "380px" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} justifyContent="space-between" alignItems="center" display="flex">
            <Typography>Изменить группу</Typography>
            <IconButton size="small" onClick={props.onClose}>
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Подпись"
              value={state.label}
              onChange={(event) => {
                setState((prev) => ({ ...prev, label: event.target.value || "" }));
              }}
            />
          </Grid>

          {/* Выбор шрифта подписи */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <SelectFontFamily
                value={state.fontFamily || ""}
                onChange={(value) => {
                  setState((prev) => ({ ...prev, fontFamily: value }));
                }}
              />
            </Box>
          </Grid>

          {/* Выбор стиля и цвета текста */}
          <Grid item xs={12} sx={{ display: "flex", alignItems: "center", flexDirection: "row" }}>
            <Box sx={{ minWidth: 80, mr: 1 }}>
              <FontSizeSelect
                initialValue={parseInt(state.fontSize || "12")}
                onChange={(value) => {
                  setState((prev) => ({ ...prev, fontSize: `${value}px` }));
                }}
              />
            </Box>
            <FontStylePicker
              fontFormats={state.fontFormats || []}
              textBackgroundColor={state.textBackgroundColor}
              color={state.color}
              onFontFormatsChange={(newFontFormats) => {
                setState((prev) => ({ ...prev, fontFormats: newFontFormats }));
              }}
              onChangeTextBgColor={(color) => {
                setState((prev) => ({ ...prev, textBackgroundColor: color }));
              }}
              onChangeTextColor={(color) => {
                setState((prev) => ({ ...prev, color }));
              }}
              defaultTextBackgroundColor="#673ab7"
            />
            {/* Затемнить */}
            <ToggleTransparentCheckbox
              checked={state.isTransparent}
              onChange={() => {
                setState((prev) => ({ ...prev, isTransparent: !prev.isTransparent }));
              }}
            />
          </Grid>

          <Grid item xs={12}>
            {/* Изменение размеров узла */}
            <Grid container spacing={0}>
              <Grid item xs={6} sx={{ pr: 2 }}>
                <Stack direction="row">
                  <Typography variant="body2">Высота</Typography>
                  <Tooltip placement="top" title={state.isSizeProportional ? "Включить раздельный размер" : "Включить пропорциональный размер"}>
                    <Checkbox
                      value={state.isSizeProportional}
                      sx={{ p: 0, ml: 0.5 }}
                      onChange={() => {
                        setState((prev) => ({
                          ...prev,
                          isSizeProportional: !prev.isSizeProportional,
                          width: state.height,
                        }));
                      }}
                      checkedIcon={<LinkIcon fontSize="small" />}
                      icon={<LinkOffIcon fontSize="small" />}
                    />
                  </Tooltip>
                </Stack>
                <Box sx={{ pl: 1 }}>
                  <Slider
                    valueLabelDisplay="auto"
                    step={1}
                    min={20}
                    max={300}
                    value={parseInt(String(state.height || "50"))}
                    onChange={(_, value) => {
                      if (state.isSizeProportional) {
                        setState((prev) => ({ ...prev, height: value as number, width: value as number }));
                      } else {
                        setState((prev) => ({ ...prev, height: value as number }));
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} sx={{ pl: 2 }}>
                <Typography variant="body2">Толщина обводки</Typography>
                <Box sx={{ pr: 1 }}>
                  <Slider
                    valueLabelDisplay="auto"
                    step={1}
                    min={0}
                    max={10}
                    value={parseInt(String(state.borderWidth === undefined ? "2" : state.borderWidth))}
                    onChange={(_, value) => {
                      setState((prev) => ({ ...prev, borderWidth: value as number }));
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} sx={{ pr: 2 }}>
                <Typography variant="body2">Ширина</Typography>
                <Box sx={{ pl: 1 }}>
                  <Slider
                    disabled={state.isSizeProportional}
                    valueLabelDisplay="auto"
                    step={1}
                    min={20}
                    max={300}
                    value={parseInt(String(state.width || "50"))}
                    onChange={(_, value) => {
                      if (!state.isSizeProportional) {
                        setState((prev) => ({ ...prev, width: value as number }));
                      }
                    }}
                  />
                </Box>
              </Grid>

              {/* Цвет заливкии обводки */}
              <Grid item xs={6} sx={{ pl: 0.5 }}>
                <Grid container>
                  <Grid item xs={6} sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Box sx={{ mr: 1 }}>
                      <ColorPicker
                        variant="outline"
                        size="small"
                        color={state.borderColor || theme.palette.primary.light}
                        onChangeComplete={(color) => {
                          setState((prev) => ({ ...prev, borderColor: color.hex }));
                        }}
                        tooltipTitle="Цвет обводки (только для свернутой группы)"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6} sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Box sx={{ ml: 1 }}>
                      <ColorPicker
                        size="small"
                        color={state.backgroundColor || "white"}
                        onChangeComplete={(color) => {
                          setState((prev) => ({ ...prev, backgroundColor: color.hex }));
                        }}
                        tooltipTitle="Цвет заливки"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={3}>
            {/* Иконка */}
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Иконка
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
              <IconPicker
                iconKey={state?.icon}
                icons={props.icons}
                onChange={(iconKey) => {
                  setState((prev) => ({ ...prev, icon: iconKey }));
                }}
                onAddIcon={props.onAddIcon}
                onUpdateIcon={props.onUpdateIcon}
                emptyIconFallback={<FolderIcon />}
              />
            </Box>
          </Grid>

          {/* Флаги пакетной обработки */}

          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, pb: 1 }}>
              <Typography variant="body2">Применить для всех групп:</Typography>
              <Divider sx={{ mt: 1, mb: 0.5 }} />
              <FormGroup>
                <Grid container>
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={state.isApplyStyleToAllGroups}
                          size="small"
                          onChange={() => {
                            setState((prev) => ({ ...prev, isApplyStyleToAllGroups: !prev.isApplyStyleToAllGroups }));
                          }}
                        />
                      }
                      componentsProps={{
                        typography: {
                          variant: "body2",
                        },
                      }}
                      label="Стиль"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={state.isApplyIconToAllGroups}
                          size="small"
                          onChange={() => {
                            setState((prev) => ({ ...prev, isApplyIconToAllGroups: !prev.isApplyIconToAllGroups }));
                          }}
                        />
                      }
                      componentsProps={{
                        typography: {
                          variant: "body2",
                        },
                      }}
                      label="Иконка"
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={() => {
                  props.onChange({
                    label: state.label,
                    style: newStyle,
                    iconKey: state.icon,
                    isApplyStyleToAllGroups: state.isApplyStyleToAllGroups,
                    isApplyIconToAllGroups: state.isApplyIconToAllGroups,
                  });
                }}
              >
                Применить
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </ClickAwayListener>
  );
}
