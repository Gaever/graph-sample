import NodeIcon from "./node-icon";
import { GraphState, LegendSettingsState } from "../types";
import { Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "./collapse";

export interface LegendSettingProps {
  legendState: LegendSettingsState;
  onChange: (legendState: LegendSettingsState) => void;
  usedNodeIcons: LegendSettingsState["usedNodeIcons"];
  nodeSystemIdsOnGraph: GraphState["nodeSystemIds"];
  edgeSystemIdsOnGraph: GraphState["edgeSystemIds"];
  nodeTypesMap: GraphState["nodeTypesMap"];
  edgeTypesMap: GraphState["edgeTypesMap"];
  icons: GraphState["icons"];
}

export const initialLegendState: LegendSettingsState = {
  show: false,
  displayedIcons: undefined,
  displayedNodeTypes: undefined,
  displayedEdgeTypes: undefined,
  showIconless: true,
  showConnectionsCount: true,
  showHiddenNodesCount: true,
  showHiddenEdgesCount: true,
  showNodesCount: true,
  showIcons: true,
  showNodeTypes: true,
  usedNodeIcons: new Set(),
  showEdgeTypes: true,
};

export default function LegendSetting(props: LegendSettingProps) {
  const usedNodeIcons = Array.from(props.usedNodeIcons.values());
  const nodeSystemIdsOnGraph = Array.from(props.nodeSystemIdsOnGraph.values());
  const edgeSystemIdsOnGraph = Array.from(props.edgeSystemIdsOnGraph.values());

  return (
    <Grid container sx={{ pb: 1 }}>
      <Grid item xs={12}>
        <FormGroup sx={{ pl: 2, pr: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={props.legendState.show}
                size="small"
                onChange={() => {
                  props.onChange({
                    ...props.legendState,
                    show: !props.legendState.show,
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

          <FormControlLabel
            control={
              <Checkbox
                checked={props.legendState.showConnectionsCount}
                size="small"
                onChange={() => {
                  props.onChange({
                    ...props.legendState,
                    showConnectionsCount: !props.legendState.showConnectionsCount,
                  });
                }}
              />
            }
            componentsProps={{
              typography: {
                variant: "body2",
              },
            }}
            label="Количество связей"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={props.legendState.showNodesCount}
                size="small"
                onChange={() => {
                  props.onChange({
                    ...props.legendState,
                    showNodesCount: !props.legendState.showNodesCount,
                  });
                }}
              />
            }
            componentsProps={{
              typography: {
                variant: "body2",
              },
            }}
            label="Количество узлов"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={props.legendState.showHiddenNodesCount}
                size="small"
                onChange={() => {
                  props.onChange({
                    ...props.legendState,
                    showHiddenNodesCount: !props.legendState.showHiddenNodesCount,
                  });
                }}
              />
            }
            componentsProps={{
              typography: {
                variant: "body2",
              },
            }}
            label="Количество скрытых узлов"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={props.legendState.showHiddenEdgesCount}
                size="small"
                onChange={() => {
                  props.onChange({
                    ...props.legendState,
                    showHiddenEdgesCount: !props.legendState.showHiddenEdgesCount,
                  });
                }}
              />
            }
            componentsProps={{
              typography: {
                variant: "body2",
              },
            }}
            label="Количество скрытых связей"
          />
        </FormGroup>

        <Divider />

        {/* функционал сейчас не нужен, выключаем */}
        {false && (
          <>
            <Collapse
              label="Использованные иконки"
              // isOpen
              ListItemButtonProps={{
                sx: { p: 2, pt: 1, pb: 1, pl: 0.5 },
                disableRipple: true,
              }}
              startAdornment={
                <Checkbox
                  checked={props.legendState.showIcons}
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onChange({
                      ...props.legendState,
                      showIcons: !props.legendState.showIcons,
                    });
                  }}
                />
              }
            >
              {usedNodeIcons.map((iconKey) => {
                const icon = props.icons![iconKey];
                if (!icon.label && !icon.src) return null;
                return (
                  <ListItem disablePadding key={iconKey}>
                    <ListItemButton
                      sx={{ m: 0, pt: 0, pb: 0 }}
                      onClick={() => {
                        if (!props.legendState.displayedIcons) {
                          // По умолчанию displayedIcons = undefined,
                          // значит нужно отметить все пункты из списка выбранными.
                          // Клик по выбранному пункту снимает пункт и создает множество displayedIcons
                          const displayedIcons = new Set<string>();

                          Object.keys(props.icons || {}).forEach((item) => {
                            if (iconKey !== item) displayedIcons.add(item);
                          });

                          props.onChange({
                            ...props.legendState,
                            displayedIcons: displayedIcons,
                          });
                        } else {
                          const displayedIcons = new Set(props.legendState.displayedIcons);
                          if (props.legendState?.displayedIcons?.has?.(iconKey)) {
                            displayedIcons.delete(iconKey);
                          } else {
                            displayedIcons.add(iconKey);
                          }

                          props.onChange({
                            ...props.legendState,
                            displayedIcons,
                          });
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          size="small"
                          edge="start"
                          checked={props.legendState.displayedIcons === undefined ? true : props.legendState.displayedIcons.has(iconKey)}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText primary={icon.label || iconKey} primaryTypographyProps={{ variant: "body2" }} />
                      <Box sx={{ width: 30, height: 30 }}>
                        <NodeIcon width="30px" height="30px" base64src={icon.src || ""} />
                      </Box>
                    </ListItemButton>
                  </ListItem>
                );
              })}
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ m: 0, pt: 0, pb: 0 }}
                  onClick={() => {
                    props.onChange({
                      ...props.legendState,
                      showIconless: !props.legendState.showIconless,
                    });
                  }}
                >
                  <ListItemIcon>
                    <Checkbox size="small" edge="start" checked={props.legendState.showIconless} disableRipple />
                  </ListItemIcon>
                  <ListItemText primary="Без иконки" primaryTypographyProps={{ variant: "body2" }} />
                </ListItemButton>
              </ListItem>
            </Collapse>

            <Divider />
          </>
        )}

        <Collapse
          label="Использованные типы узлов"
          // isOpen
          ListItemButtonProps={{
            sx: { p: 2, pt: 1, pb: 1, pl: 0.5 },
          }}
          startAdornment={
            <Checkbox
              size="small"
              checked={props.legendState.showNodeTypes}
              onClick={(event) => {
                event.stopPropagation();

                props.onChange({
                  ...props.legendState,
                  showNodeTypes: !props.legendState.showNodeTypes,
                });
              }}
            />
          }
        >
          {nodeSystemIdsOnGraph.map((systemId) => {
            return (
              <ListItem disablePadding key={systemId}>
                <ListItemButton
                  sx={{ m: 0, pt: 0, pb: 0 }}
                  onClick={() => {
                    if (!props.legendState.displayedNodeTypes) {
                      const displayedNodeTypes = new Set<string>();

                      nodeSystemIdsOnGraph.forEach((item) => {
                        if (systemId !== item) displayedNodeTypes.add(item);
                      });

                      props.onChange({
                        ...props.legendState,
                        displayedNodeTypes,
                      });
                    } else {
                      const displayedNodeTypes = new Set(props.legendState.displayedNodeTypes);
                      if (props.legendState?.displayedNodeTypes?.has?.(systemId)) {
                        displayedNodeTypes.delete(systemId);
                      } else {
                        displayedNodeTypes.add(systemId);
                      }

                      props.onChange({
                        ...props.legendState,
                        displayedNodeTypes,
                      });
                    }
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      size="small"
                      edge="start"
                      checked={props.legendState.displayedNodeTypes === undefined ? true : props.legendState.displayedNodeTypes.has(systemId)}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={props.nodeTypesMap.get(systemId)?.label || systemId} primaryTypographyProps={{ variant: "body2" }} />
                  <Box sx={{ width: 30, height: 30 }}>
                    <NodeIcon width="30px" height="30px" base64src={props.icons?.[props.nodeTypesMap.get(systemId)?.icon || ""]?.src || ""} />
                  </Box>
                </ListItemButton>
              </ListItem>
            );
          })}
        </Collapse>
        <Collapse
          label="Использованные типы связей"
          // isOpen
          ListItemButtonProps={{
            sx: { p: 2, pt: 1, pb: 1, pl: 0.5 },
          }}
          startAdornment={
            <Checkbox
              size="small"
              checked={props.legendState.showEdgeTypes}
              onClick={(event) => {
                event.stopPropagation();

                props.onChange({
                  ...props.legendState,
                  showEdgeTypes: !props.legendState.showEdgeTypes,
                });
              }}
            />
          }
        >
          {edgeSystemIdsOnGraph.map((systemId) => {
            return (
              <ListItem disablePadding key={systemId}>
                <ListItemButton
                  sx={{ m: 0, pt: 0, pb: 0 }}
                  onClick={() => {
                    if (!props.legendState.displayedEdgeTypes) {
                      const displayedEdgeTypes = new Set<string>();

                      edgeSystemIdsOnGraph.forEach((item) => {
                        if (systemId !== item) displayedEdgeTypes.add(item);
                      });

                      props.onChange({
                        ...props.legendState,
                        displayedEdgeTypes,
                      });
                    } else {
                      const displayedEdgeTypes = new Set(props.legendState.displayedEdgeTypes);
                      if (props.legendState?.displayedEdgeTypes?.has?.(systemId)) {
                        displayedEdgeTypes.delete(systemId);
                      } else {
                        displayedEdgeTypes.add(systemId);
                      }

                      props.onChange({
                        ...props.legendState,
                        displayedEdgeTypes,
                      });
                    }
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      size="small"
                      edge="start"
                      checked={props.legendState.displayedEdgeTypes === undefined ? true : props.legendState.displayedEdgeTypes.has(systemId)}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={props.edgeTypesMap.get(systemId)?.label || systemId} primaryTypographyProps={{ variant: "body2" }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </Collapse>
      </Grid>
    </Grid>
  );
}
