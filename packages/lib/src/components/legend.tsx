import NodeIcon from "./node-icon";
import { Graph } from "../http/api";
import { GraphState, LegendSettingsState } from "../types";
import { Box, Divider, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Paper from "@mui/material/Paper";

export interface LegendProps {
  legendSettings: LegendSettingsState;
  nodesCount: number;
  edgesCount: number;
  hiddenNodesCount: number;
  hiddenEdgesCount: number;
  nodesWoIcons: number;
  nodesByIcons: Map<string, number>;
  nodesByNodeTypes: Map<string, number>;
  edgesByEdgeTypes: Map<string, number>;
  nodeTypesMap: GraphState["nodeTypesMap"];
  edgeTypesMap: GraphState["edgeTypesMap"];
  icons: Graph["icons"];
  parentHeight: number;
}

export default function Legend(props: LegendProps) {
  const renderItem = (label: string, value: string | number) => {
    return (
      <>
        <Grid xs={9} item>
          <Typography>{label}</Typography>
        </Grid>
        <Grid xs={3} item>
          <Typography sx={{ textAlign: "right" }}>{value}</Typography>
        </Grid>
      </>
    );
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        userSelect: "none",
        backgroundColor: "rgba(255,255,255,0.7)",
        p: 2,
        pt: 1,
        pb: 0,
        maxWidth: 280,
        overflowY: "scroll",
        maxHeight: `calc(${props.parentHeight}px - 87px)`,
      }}
    >
      <Grid container sx={{ mb: 1 }}>
        {props.legendSettings.showNodesCount ? renderItem("Отображено узлов: ", props.nodesCount) : null}
        {props.legendSettings.showConnectionsCount ? renderItem("Отображено связей: ", props.edgesCount) : null}
        {props.legendSettings.showHiddenNodesCount ? renderItem("Скрыто узлов: ", props.hiddenNodesCount) : null}
        {props.legendSettings.showHiddenEdgesCount ? renderItem("Скрыто связей: ", props.hiddenEdgesCount) : null}
      </Grid>

      {/* функционал сейчас не нужен, выключаем */}
      {props.legendSettings.showIcons && false ? (
        <>
          <Typography sx={{ fontWeight: "bold" }}>Вершины по иконкам</Typography>
          <Divider sx={{ mt: 1 }} />

          <List sx={{ mb: 1 }}>
            {Array.from(props.nodesByIcons.keys())
              .sort((a, b) => (props?.nodesByIcons?.get?.(b) || 0) - (props?.nodesByIcons?.get?.(a) || 0))
              .map((iconKey) => {
                if (props.legendSettings.displayedIcons && !props.legendSettings.displayedIcons.has(iconKey)) {
                  return null;
                }
                return (
                  <ListItem disablePadding key={iconKey}>
                    <ListItemIcon>
                      <Box sx={{ width: 30, height: 30 }}>
                        <NodeIcon width="30px" height="30px" base64src={props.icons?.[iconKey || ""]?.src || ""} />
                      </Box>
                    </ListItemIcon>
                    <Stack justifyContent="space-between" direction="row" sx={{ width: "100%" }}>
                      <Box>
                        <Typography>{props.icons?.[iconKey || ""]?.label || iconKey}</Typography>
                      </Box>
                      <Box sx={{ ml: 1 }}>
                        <Typography>{props.nodesByIcons.get(iconKey)}</Typography>
                      </Box>
                    </Stack>
                  </ListItem>
                );
              })}
          </List>
        </>
      ) : null}

      {props.legendSettings.showNodeTypes ? (
        <>
          <Typography sx={{ fontWeight: "bold" }}>Типы вершин</Typography>
          <Divider sx={{ mt: 1 }} />

          <List sx={{ mb: 1 }}>
            {Array.from(props.nodesByNodeTypes.keys())
              .sort((a, b) => (props?.nodesByNodeTypes?.get?.(b) || 0) - (props?.nodesByNodeTypes?.get?.(a) || 0))
              .map((systemId) => {
                if (props.legendSettings.displayedNodeTypes && !props.legendSettings.displayedNodeTypes.has(systemId)) {
                  return null;
                }

                return (
                  <ListItem disablePadding key={systemId}>
                    <ListItemIcon>
                      <Box sx={{ width: 30, height: 30 }}>
                        <NodeIcon width="30px" height="30px" base64src={props.icons?.[props?.nodeTypesMap?.get?.(systemId)?.icon || ""]?.src || ""} />
                      </Box>
                    </ListItemIcon>

                    <Stack justifyContent="space-between" direction="row" sx={{ width: "100%" }}>
                      <Box>
                        <Typography>{props?.nodeTypesMap?.get?.(systemId)?.label || systemId}</Typography>
                      </Box>
                      <Box>
                        <Typography>{props.nodesByNodeTypes.get(systemId)}</Typography>
                      </Box>
                    </Stack>
                  </ListItem>
                );
              })}
          </List>
        </>
      ) : null}

      {props.legendSettings.showEdgeTypes ? (
        <>
          <Typography sx={{ fontWeight: "bold" }}>Типы связей</Typography>
          <Divider sx={{ mt: 1 }} />

          <List sx={{ mb: 1 }}>
            {Array.from(props.edgesByEdgeTypes.keys())
              .sort((a, b) => (props?.edgesByEdgeTypes?.get?.(b) || 0) - (props?.edgesByEdgeTypes?.get?.(a) || 0))
              .map((systemId) => {
                if (props.legendSettings.displayedEdgeTypes && !props.legendSettings.displayedEdgeTypes.has(systemId)) {
                  return null;
                }

                return (
                  <ListItem disablePadding key={systemId}>
                    <Stack justifyContent="space-between" direction="row" sx={{ width: "100%" }}>
                      <Box>
                        <Typography>{props.edgeTypesMap.get(systemId!)?.label || systemId}</Typography>
                      </Box>
                      <Box>
                        <Typography>{props.edgesByEdgeTypes.get(systemId)}</Typography>
                      </Box>
                    </Stack>
                  </ListItem>
                );
              })}
          </List>
        </>
      ) : null}
    </Paper>
  );
}
