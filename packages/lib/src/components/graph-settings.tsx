import Box from "@mui/material/Box";
import SidebarPaper from "./sidebar-paper";
import GridSettings, { GridSettingsProps } from "./grid-settings";
import LegendSetting, { LegendSettingProps } from "./legend-settings";
import WorldMapSetting, { WorldMapSettingProps } from "./world-map-settings";
import NodeStylesSettings, { NodeStylesSettingsProps } from "./node-styles-settings";
import Button from "@mui/material/Button";
import EdgeStylesSettings, { EdgeStylesSettingsProps } from "./edge-styles-settings";

export interface GraphSettingsProps {
  GridSettingsProps: GridSettingsProps;
  LegendSettingProps: LegendSettingProps;
  WorldMapSettingsProps: WorldMapSettingProps;
  NodeStylesSettingsProps: NodeStylesSettingsProps;
  EdgeStylesSettingsProps: EdgeStylesSettingsProps;
  onRefreshStylesClick: () => void;
}

function GraphSettings(props: GraphSettingsProps) {
  return (
    <>
      <SidebarPaper>
        <Box sx={{ p: 2 }}>
          <Button variant="outlined" fullWidth onClick={props.onRefreshStylesClick} size="small">
            Перезапросить стили
          </Button>
        </Box>
      </SidebarPaper>
      <SidebarPaper title="Стили узлов" isCollapsible>
        <NodeStylesSettings {...props.NodeStylesSettingsProps} />
      </SidebarPaper>
      <SidebarPaper title="Стили связей" isCollapsible>
        <EdgeStylesSettings {...props.EdgeStylesSettingsProps} />
      </SidebarPaper>
      <SidebarPaper title="Сетка" isCollapsible>
        <Box sx={{ p: 2, pt: 0 }}>
          <GridSettings {...props.GridSettingsProps}></GridSettings>
        </Box>
      </SidebarPaper>
      <SidebarPaper title="Легенда" isCollapsible>
        <LegendSetting {...props.LegendSettingProps} />
      </SidebarPaper>
      <SidebarPaper title="Карта мира" isCollapsible>
        <Box sx={{ p: 2, pt: 0 }}>
          <WorldMapSetting {...props.WorldMapSettingsProps}></WorldMapSetting>
        </Box>
      </SidebarPaper>
    </>
  );
}

export default GraphSettings;
