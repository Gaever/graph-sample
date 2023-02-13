import ColorPicker from "./color-picker";
import { DisplayedLabel } from "./displayed-label";
import EdgeTypeSelect from "./edge-type-select";
import { FontSizeSelect } from "./font-size-select";
import { FontStylePicker } from "./font-style-picker";
import { LabelTemplateTextField } from "./label-template-text-field";
import PickGroupAggregations from "./pick-group-aggregations";
import { SelectFontFamily } from "./select-font-family";
import { TextOutlineSizeSelect } from "./text-outline-size-select";
import { pickEdgeLabel } from "../data-layer/format-response";
import { fontFamilies } from "../theme";
import { EdgeAggregations, OnChangeEdgePayload } from "../types";
import { edgeAggregationsToGroupAggregations } from "../utils";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { Divider, FormGroup, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import ClickAwayListener, { ClickAwayListenerProps } from "@mui/material/ClickAwayListener";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper, { PaperProps } from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import EdgeLabelOffsetTextField from "./edge-label-offset-text-field";
import ArrowTypeSelect from "./arrow-type-select";
import LineStyleSelect from "./line-style-select";

export interface EditEdgeProps {
  edge?: cytoscape.EdgeSingular;
  onChange?: (args: OnChangeEdgePayload) => void;
  onStateChange?: (editEdgeState: EditEdgeState) => void;
  onClose?: () => void;
  style?: cytoscape.StylesheetStyle["style"];
  className?: string;
  displayedOptions?: (
    | "header"
    | "label-template-edit"
    | "label-template-display"
    | "aggregations"
    | "font-family-select"
    | "font-size-select"
    | "label-outline"
    | "font-style-picker"
    | "curve-style"
    | "line-style"
    | "label-offset"
    | "line-size-and-color"
    | "flags"
    | "submit"
  )[];
  ClickAwayListenerProps?: Partial<ClickAwayListenerProps>;
  PaperProps?: PaperProps;
}

interface EditEdgeState {
  fontFormats?: string[];
  labelTemplate: string;

  fontFamily?: string;
  fontSize?: string;
  textColor?: string;
  lineColor?: string;
  textOutlineColor?: string;
  textOutlineWidth?: string;
  width?: string | number;
  curveStyle?: string;
  lineStyle?: string;
  labelOffset?: number;

  sourceArrowShape?: string;
  sourceArrowFillColor?: string;

  targetArrowShape?: string;
  targetArrowFillColor?: string;

  edgeAggregations?: EdgeAggregations;

  isApplyStyleToAllEdges: boolean;
  isApplyLabelToAllEdges: boolean;
}

export function editEdgeStateToNewStyle(state: EditEdgeState, oldStyle: cytoscape.Css.Edge): cytoscape.Css.Edge {
  // @ts-ignore
  const newStyle: cytoscape.Css.Edge = {
    ...oldStyle,
    ...(state.fontFamily !== undefined ? { "font-family": state.fontFamily } : null),
    ...(state.fontSize !== undefined ? { "font-size": state.fontSize } : null),
    ...(state?.fontFormats?.includes?.("italic") ? { "font-style": "italic" } : { "font-style": null }),
    ...(state?.fontFormats?.includes?.("bold") ? { "font-weight": "bold" } : { "font-weight": null }),
    ...(state.textColor !== undefined ? { color: state.textColor } : null),
    ...(state.lineColor !== undefined ? { "line-color": state.lineColor } : null),
    ...(state.textOutlineColor !== undefined ? { "text-outline-color": state.textOutlineColor } : null),
    ...(state.textOutlineWidth !== undefined ? { "text-outline-width": state.textOutlineWidth } : null),
    ...(state.width !== undefined ? { width: state.width } : null),
    ...(state.curveStyle !== undefined ? { "curve-style": state.curveStyle } : null),
    ...(state.lineStyle !== undefined ? { "line-style": state.lineStyle } : null),
    ...(state.labelOffset !== undefined && state.labelOffset >= 0 ? { "source-text-offset": state.labelOffset } : { "source-text-offset": null }),
    ...(state.labelOffset !== undefined && state.labelOffset < 0 ? { "target-text-offset": Math.abs(state.labelOffset) } : { "target-text-offset": null }),
    ...(state.sourceArrowShape !== undefined ? { "source-arrow-shape": state.sourceArrowShape } : null),
    ...(state.sourceArrowFillColor !== undefined ? { "source-arrow-color": state.sourceArrowFillColor } : null),
    ...(state.targetArrowShape !== undefined ? { "target-arrow-shape": state.targetArrowShape } : null),
    ...(state.targetArrowFillColor !== undefined ? { "target-arrow-color": state.targetArrowFillColor } : null),
  };

  return newStyle;
}

export function edgeToStyle(edge: EditEdgeProps["edge"], compoledStyle: EditEdgeProps["style"]) {
  return editEdgeStateToNewStyle(edgeToEditEdgeState(edge, compoledStyle), compoledStyle as cytoscape.Css.Edge);
}

export function edgeToEditEdgeState(edge: EditEdgeProps["edge"], style: EditEdgeProps["style"]) {
  const edgePayload = edge?.data?.("payload") || {};
  const oldStyle = (style as cytoscape.Css.Edge) || {};

  const state: EditEdgeState = {
    fontFormats: [(oldStyle["font-weight"] === "bold" && "bold") || "", (oldStyle["font-style"] === "italic" && "italic") || ""].filter(Boolean),

    // @ts-ignore
    labelTemplate: edgePayload.label_template || edgePayload.label || "",

    fontFamily: (fontFamilies.find((value) => value === oldStyle?.["font-family"]) as string) || "",
    fontSize: oldStyle["font-size"] !== undefined ? `${parseInt(oldStyle["font-size"]?.toString?.() || "12")}px` : undefined,
    textColor: oldStyle["color"] as string,
    lineColor: oldStyle["line-color"] as string,
    textOutlineColor: oldStyle["text-outline-color"] as string,
    textOutlineWidth: oldStyle["text-outline-width"] as string,
    width: oldStyle["width"] as string,
    curveStyle: oldStyle["curve-style"] as string,
    lineStyle: oldStyle["line-style"] as string,
    labelOffset: oldStyle["source-text-offset"] as number,

    sourceArrowShape: oldStyle["source-arrow-shape"] as string,
    sourceArrowFillColor: oldStyle["source-arrow-color"] as string,
    targetArrowShape: oldStyle["target-arrow-shape"] as string,
    targetArrowFillColor: oldStyle["target-arrow-color"] as string,

    edgeAggregations: edge?.data?.("payload")?.aggregations,

    isApplyStyleToAllEdges: false,
    isApplyLabelToAllEdges: false,
  };

  return state;
}

/**
 * @see src/data-layer/cy-functions/cy-actions/change-edge-action.ts
 */
export function EditEdge(props: EditEdgeProps) {
  const sourceNodeAttributes = props.edge?.source?.().data?.("payload")?.data;
  const targetNodeAttributes = props.edge?.target?.().data?.("payload")?.data;

  const sourceGroupAggregations = props.edge?.source?.().data?.("payload")?.aggregations;
  const targetGroupAggregations = props.edge?.target?.().data?.("payload")?.aggregations;

  const edgePayload = props.edge?.data?.("payload") || {};
  const theme = useTheme();

  const oldStyle = (props.style as cytoscape.Css.Edge) || {};

  const [state, setState] = useState<EditEdgeState>(edgeToEditEdgeState(props.edge, props.style));

  const [displayedLabel] = useDebounce(
    pickEdgeLabel(
      edgePayload?.label,
      state.labelTemplate,
      edgePayload?.data,
      sourceNodeAttributes,
      targetNodeAttributes,
      edgeAggregationsToGroupAggregations(state.edgeAggregations, sourceGroupAggregations, targetGroupAggregations),
      ""
    ),
    500
  );

  const newStyle = editEdgeStateToNewStyle(state, oldStyle);

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
              <Typography>Изменить связь</Typography>
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
                label="Подпись"
              />
            </Grid>
          ) : null}

          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "aggregations") ? (
            <Grid item xs={12}>
              <PickGroupAggregations
                edgeAggregations={state.edgeAggregations}
                sourceGroupAggregations={sourceGroupAggregations}
                targetGroupAggregations={targetGroupAggregations}
                onChange={(value) => {
                  setState((prev) => ({ ...prev, edgeAggregations: value }));
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
          <Grid item xs={12} sx={{ display: "flex", alignItems: "center", flexDirection: "row", flexWrap: "wrap" }}>
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
            {!props.displayedOptions || props.displayedOptions?.some((item) => item === "label-outline") ? (
              <Box sx={{ minWidth: 75, mr: 1 }}>
                <TextOutlineSizeSelect
                  initialValue={parseInt(state.textOutlineWidth || "3")}
                  onChange={(value) => {
                    setState((prev) => ({ ...prev, textOutlineWidth: value.toString() }));
                  }}
                />
              </Box>
            ) : null}
            {!props.displayedOptions || props.displayedOptions?.some((item) => item === "font-style-picker") ? (
              <FontStylePicker
                defaultTextBackgroundColor="#ffffff"
                fontFormats={state.fontFormats || []}
                textBackgroundColor={state.textOutlineColor}
                color={state.textColor}
                onFontFormatsChange={(newFontFormats) => {
                  setState((prev) => ({ ...prev, fontFormats: newFontFormats }));
                }}
                onChangeTextBgColor={(color) => {
                  setState((prev) => ({ ...prev, textOutlineColor: color }));
                }}
                onChangeTextColor={(color) => {
                  setState((prev) => ({ ...prev, textColor: color }));
                }}
                textBackgrountColorTooltipTitle="Цвет конура подписи"
              />
            ) : null}
          </Grid>

          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "line-size-and-color") ? (
            <Grid item xs={12}>
              {/* Изменение толщины линии */}
              <Typography variant="body2">Толщина линии</Typography>
              <Box sx={{ display: "flex", justifyContent: "cetner", alignItems: "center", flexDirection: "row" }}>
                <Box sx={{ pl: 1, pr: 2, flex: 1, justifyContent: "cetner", alignItems: "center", display: "flex" }}>
                  <Slider
                    valueLabelDisplay="auto"
                    step={1}
                    min={1}
                    max={20}
                    value={parseInt(String(state.width || "1"))}
                    onChange={(_, value) => {
                      setState((prev) => ({ ...prev, width: value as number }));
                    }}
                  />
                </Box>
                <ColorPicker
                  variant="outline"
                  size="small"
                  color={state.lineColor || theme.palette.grey[300]}
                  onChangeComplete={(color) => {
                    setState((prev) => ({ ...prev, lineColor: color.hex }));
                  }}
                  tooltipTitle="Цвет линии"
                />
              </Box>
            </Grid>
          ) : null}

          {/* Вид линии */}
          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "curve-style") ? (
            <Grid item xs={4}>
              <EdgeTypeSelect
                initialValue={state.curveStyle || "bezier"}
                onChange={(value) => {
                  setState((prev) => ({ ...prev, curveStyle: value }));
                }}
              />
            </Grid>
          ) : null}

          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "line-style") ? (
            <Grid item xs={4}>
              <LineStyleSelect
                initialValue={state.lineStyle || "solid"}
                onChange={(value) => {
                  setState((prev) => ({ ...prev, lineStyle: value }));
                }}
              />
            </Grid>
          ) : null}

          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "label-offset") ? (
            <Grid item xs={4}>
              <EdgeLabelOffsetTextField
                value={state.labelOffset}
                onChange={(value) => {
                  setState((prev) => ({ ...prev, labelOffset: value }));
                }}
              />
            </Grid>
          ) : null}

          <Grid item xs={2}>
            <ColorPicker
              variant="outline"
              size="small"
              color={state.sourceArrowFillColor || theme.palette.grey[300]}
              onChangeComplete={(color) => {
                setState((prev) => ({ ...prev, sourceArrowFillColor: color.hex }));
              }}
              tooltipTitle="Цвет линии"
            />
          </Grid>

          {/* Стрелки */}
          <Grid item xs={4}>
            <ArrowTypeSelect
              initialValue={state.sourceArrowShape || ""}
              label="←"
              onChange={(shape) => {
                setState((prev) => ({ ...prev, sourceArrowShape: shape }));
              }}
            />
          </Grid>

          <Grid item xs={4}>
            <ArrowTypeSelect
              initialValue={state.targetArrowShape || ""}
              label="→"
              onChange={(shape) => {
                setState((prev) => ({ ...prev, targetArrowShape: shape }));
              }}
            />
          </Grid>

          <Grid item xs={2} sx={{ justifyContent: "flex-end", display: "flex" }}>
            <ColorPicker
              variant="outline"
              size="small"
              color={state.targetArrowFillColor || theme.palette.grey[300]}
              onChangeComplete={(color) => {
                setState((prev) => ({ ...prev, targetArrowFillColor: color.hex }));
              }}
              tooltipTitle="Цвет линии"
            />
          </Grid>

          {/* Флаги пакетной обработки */}
          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "flags") ? (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, pb: 1 }}>
                <Typography variant="body2">Применить для всех связей:</Typography>
                <Divider sx={{ mt: 1, mb: 0.5 }} />
                <FormGroup>
                  <Grid container>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={state.isApplyStyleToAllEdges}
                            size="small"
                            onChange={() => {
                              setState((prev) => ({ ...prev, isApplyStyleToAllEdges: !prev.isApplyStyleToAllEdges }));
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

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={state.isApplyLabelToAllEdges}
                            size="small"
                            onChange={() => {
                              setState((prev) => ({ ...prev, isApplyLabelToAllEdges: !prev.isApplyLabelToAllEdges }));
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
                      edgeAggregations: state.edgeAggregations,
                      isApplyStyleToAllEdges: state.isApplyStyleToAllEdges,
                      isApplyLabelToAllEdges: state.isApplyLabelToAllEdges,
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
