import ColorPicker from "./color-picker";
import { DisplayedLabel } from "./displayed-label";
import { FontSizeSelect } from "./font-size-select";
import { FontStylePicker } from "./font-style-picker";
import IconPicker, { IconPickerProps } from "./icon-picker";
import { LabelTemplateTextField, LabelTemplateTextFieldProps } from "./label-template-text-field";
import { SelectFontFamily } from "./select-font-family";
import { SubiconPickerPopover } from "./subicon-picker-popover";
import { ToggleTransparentCheckbox } from "./toggle-transparent-checkbox";
import { pickNodeLabel } from "../data-layer/format-response";
import { Graph } from "../http/api";
import { fontFamilies } from "../theme";
import { CyNode, OnChangeNodePayload } from "../types";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import ClickAwayListener, { ClickAwayListenerProps } from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper, { PaperProps } from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { ToggleFlashCheckbox } from "./toggle-flash-checkbox";
import { SelectDrawingShape } from "./select-drawing-shape";

export interface EditNodeProps {
  nodeData?: CyNode["data"];
  onChange?: (args: OnChangeNodePayload) => void;
  onStateChange?: (editNodeState: EditNodeState) => void;
  onClose?: () => void;
  style?: cytoscape.StylesheetStyle["style"];
  icons?: Graph["icons"];
  icon?: string;
  subIcons?: string[];
  onAddIcon?: IconPickerProps["onAddIcon"];
  onUpdateIcon?: IconPickerProps["onUpdateIcon"];
  isFlash?: boolean;
  displayedOptions?: (
    | "header"
    | "label-template-edit"
    | "label-template-display"
    | "font-family-select"
    | "font-size-select"
    | "font-style-picker"
    | "shape"
    | "transparent-checkbox"
    | "flash-checkbox"
    | "node-size-and-color"
    | "icon"
    | "sub-icons"
    | "flags"
    | "submit"
  )[];
  ClickAwayListenerProps?: Partial<ClickAwayListenerProps>;
  PaperProps?: Partial<PaperProps>;
  LabelTemplateTextFieldProps?: Partial<LabelTemplateTextFieldProps>;
}

interface EditNodeState {
  isTransparent: boolean;

  isSizeProportional: boolean;
  fontFormats?: string[];

  labelTemplate: string;
  icon?: string;
  subIcons: string[];

  fontFamily?: string;
  fontSize?: string;
  color?: string;
  textBackgroundColor?: string;
  borderWidth?: number | string;
  borderColor?: string;
  backgroundColor?: string;
  shape?: string;
  width?: string | number;
  height?: string | number;

  isFlash: boolean;

  isApplyStyleToAllNodesWithSameSystemId: boolean;
  isApplyLabelToAllNodesWithSameSystemId: boolean;
  isApplyIconToAllNodesWithSameSystemId: boolean;
  isApplySubIconsToAllNodesWithSameSystemId: boolean;
}

export function editNodeStateToNewStyle(state: EditNodeState, oldStyle: cytoscape.Css.Node): cytoscape.Css.Node {
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
    ...(state.shape !== undefined ? { shape: state.shape } : null),
    ...(state.borderColor !== undefined ? { "border-color": state.borderColor } : null),
    ...(state.width !== undefined ? { width: state.width } : null),
    ...(state.height !== undefined ? { height: state.height } : null),
    ...(state.backgroundColor !== undefined ? { "background-color": state.backgroundColor } : null),
    ...(state.isTransparent ? { opacity: 0.25 } : { opacity: undefined }),
  };

  return newStyle;
}

/**
 * @see src/data-layer/cy-functions/cy-actions/change-node-action.ts
 */
export function EditNode(props: EditNodeProps) {
  const nodePayload = props.nodeData?.payload || {};

  const theme = useTheme();

  const oldStyle = (props.style as cytoscape.Css.Node) || {};

  const [state, setState] = useState<EditNodeState>({
    isTransparent: (oldStyle["opacity"] || 1) < 1,

    isSizeProportional: oldStyle["width"] === oldStyle["height"],
    fontFormats: [(oldStyle["font-weight"] === "bold" && "bold") || "", (oldStyle["font-style"] === "italic" && "italic") || ""].filter(Boolean),

    labelTemplate: nodePayload.label_template || nodePayload.label || props.nodeData?.label || "",

    fontFamily: (fontFamilies.find((value) => value === oldStyle?.["font-family"]) as string) || "",
    fontSize: oldStyle["font-size"] !== undefined ? `${parseInt(oldStyle["font-size"]?.toString?.() || "12")}px` : undefined,
    color: oldStyle["color"] as string,
    shape: oldStyle["shape"] as string,
    textBackgroundColor: oldStyle["text-background-color"] as string,
    borderWidth: oldStyle["border-width"] as string,
    borderColor: oldStyle["border-color"] as string,
    backgroundColor: oldStyle["background-color"] as string,
    width: oldStyle["width"] as string,
    height: oldStyle["height"] as string,

    icon: props.icon,
    subIcons: props.subIcons || [],

    isFlash: !!props.isFlash,

    isApplyLabelToAllNodesWithSameSystemId: false,
    isApplyStyleToAllNodesWithSameSystemId: false,
    isApplyIconToAllNodesWithSameSystemId: false,
    isApplySubIconsToAllNodesWithSameSystemId: false,
  });

  const [displayedLabel] = useDebounce(pickNodeLabel(nodePayload?.label, state.labelTemplate, nodePayload?.data || [], nodePayload.guid), 500);

  // @ts-ignore
  const newStyle = editNodeStateToNewStyle(state, oldStyle);

  useEffect(() => {
    props?.onStateChange?.(state);
  }, [state]);

  return (
    <ClickAwayListener
      onClickAway={(event) => {
        // @ts-ignore
        if (event.target.nodeName === "BODY") {
          // Предотвращает закрытие popover-а если внутри popover-а открыть select
          return;
        }
        props?.onClose?.();
      }}
      {...props.ClickAwayListenerProps}
    >
      <Paper sx={{ p: 2, width: "380px" }} {...props.PaperProps}>
        <Grid container spacing={2}>
          {/* Шапка */}
          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "header") ? (
            <Grid item xs={12} justifyContent="space-between" alignItems="center" display="flex">
              <Typography>Изменить узел</Typography>
              <IconButton size="small" onClick={props.onClose}>
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Grid>
          ) : null}

          {/* Редактировани подписи */}
          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "label-template-edit") ? (
            <Grid item xs={12}>
              <LabelTemplateTextField
                initialValue={state.labelTemplate}
                onChange={(value) => {
                  setState((prev) => ({ ...prev, labelTemplate: value }));
                }}
                tooltipTitle="Укажите ключ поля в фигурных скобках чтобы отобразить его в подписи. Пример: {{ Госномер }} {{ created_at }}"
                label="Шаблон подписи"
                {...props.LabelTemplateTextFieldProps}
              />
            </Grid>
          ) : null}

          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "shape") ? (
            <Grid item xs={12}>
              <SelectDrawingShape
                value={state.shape || ""}
                onChange={(shape) => {
                  setState((prev) => ({ ...prev, shape }));
                }}
              />
            </Grid>
          ) : null}

          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "label-template-display") ? (
            <Grid item xs={12}>
              <DisplayedLabel displayedLabel={displayedLabel} />
            </Grid>
          ) : null}

          {/* Выбор шрифта подписи */}
          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "font-family-select") ? (
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
          ) : null}

          {/* Выбор стиля и цвета текста */}
          <Grid item xs={12} sx={{ display: "flex", alignItems: "center", flexDirection: "row" }}>
            {!props.displayedOptions || props.displayedOptions?.some((item) => item === "font-size-select") ? (
              <Box sx={{ minWidth: 80, mr: 1 }}>
                <FontSizeSelect
                  initialValue={parseInt(state.fontSize || "12")}
                  onChange={(value) => {
                    setState((prev) => ({ ...prev, fontSize: `${value}px` }));
                  }}
                />
              </Box>
            ) : null}

            {!props.displayedOptions || props.displayedOptions?.some((item) => item === "font-style-picker") ? (
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
              />
            ) : null}

            {/* Затемнить */}
            {!props.displayedOptions || props.displayedOptions?.some((item) => item === "transparent-checkbox") ? (
              <ToggleTransparentCheckbox
                checked={state.isTransparent}
                onChange={() => {
                  setState((prev) => ({ ...prev, isTransparent: !prev.isTransparent }));
                }}
              />
            ) : null}

            {/* Анимировать */}
            {!props.displayedOptions || props.displayedOptions?.some((item) => item === "flash-checkbox") ? (
              <ToggleFlashCheckbox
                checked={!!state.isFlash}
                onChange={() => {
                  setState((prev) => ({ ...prev, isFlash: !prev.isFlash }));
                }}
              />
            ) : null}
          </Grid>

          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "node-size-and-color") ? (
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
                      value={parseInt(String(state.borderWidth || "2"))}
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
                          tooltipTitle="Цвет обводки"
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
          ) : null}

          {/* Иконка */}
          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "icon") ? (
            <Grid item xs={3}>
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
                />
              </Box>
            </Grid>
          ) : null}

          {/* Суб-иконки */}
          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "sub-icons") ? (
            <Grid item xs={9}>
              <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Суб-иконки
                </Typography>
                <Paper variant="outlined" sx={{ flex: 1, p: 0.5 }}>
                  <SubiconPickerPopover
                    subIcons={state.subIcons}
                    onChange={(subIcons) => {
                      setState((prev) => ({ ...prev, subIcons }));
                    }}
                  />
                </Paper>
              </Box>
            </Grid>
          ) : null}

          {/* Флаги пакетной обработки */}
          {(!props.displayedOptions || props.displayedOptions?.some((item) => item === "flags")) && nodePayload.system_id ? (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, pb: 1 }}>
                <Typography variant="body2">Применить для всех узлов этого типа ({nodePayload.system_id}):</Typography>
                <Divider sx={{ mt: 1, mb: 0.5 }} />
                <FormGroup>
                  <Grid container>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={state.isApplyLabelToAllNodesWithSameSystemId}
                            size="small"
                            onChange={() => {
                              setState((prev) => ({ ...prev, isApplyLabelToAllNodesWithSameSystemId: !prev.isApplyLabelToAllNodesWithSameSystemId }));
                            }}
                          />
                        }
                        componentsProps={{
                          typography: {
                            variant: "body2",
                          },
                        }}
                        label="Подпись"
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={state.isApplyStyleToAllNodesWithSameSystemId}
                            size="small"
                            onChange={() => {
                              setState((prev) => ({ ...prev, isApplyStyleToAllNodesWithSameSystemId: !prev.isApplyStyleToAllNodesWithSameSystemId }));
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
                            checked={state.isApplyIconToAllNodesWithSameSystemId}
                            size="small"
                            onChange={() => {
                              setState((prev) => ({ ...prev, isApplyIconToAllNodesWithSameSystemId: !prev.isApplyIconToAllNodesWithSameSystemId }));
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

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={state.isApplySubIconsToAllNodesWithSameSystemId}
                            size="small"
                            onChange={() => {
                              setState((prev) => ({ ...prev, isApplySubIconsToAllNodesWithSameSystemId: !prev.isApplySubIconsToAllNodesWithSameSystemId }));
                            }}
                          />
                        }
                        componentsProps={{
                          typography: {
                            variant: "body2",
                          },
                        }}
                        label="Суб-иконки"
                      />
                    </Grid>
                  </Grid>
                </FormGroup>
              </Paper>
            </Grid>
          ) : null}

          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "submit") ? (
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={() => {
                    props?.onChange?.({
                      labelTemplate: state.labelTemplate,
                      style: newStyle,
                      iconKey: state.icon,
                      subIcons: state.subIcons,
                      isFlash: state.isFlash,
                      isApplyStyleToAllNodesWithSameSystemId: state.isApplyStyleToAllNodesWithSameSystemId,
                      isApplyLabelToAllNodesWithSameSystemId: state.isApplyLabelToAllNodesWithSameSystemId,
                      isApplyIconToAllNodesWithSameSystemId: state.isApplyIconToAllNodesWithSameSystemId,
                      isApplySubIconsToAllNodesWithSameSystemId: state.isApplySubIconsToAllNodesWithSameSystemId,
                    });
                  }}
                >
                  Применить
                </Button>
              </Stack>
            </Grid>
          ) : null}
        </Grid>
      </Paper>
    </ClickAwayListener>
  );
}
