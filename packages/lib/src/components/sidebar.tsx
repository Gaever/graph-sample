import DataExplorer, { DataExplorerProps } from "./data-explorer";
import GraphSettings, { GraphSettingsProps } from "./graph-settings";
import QueueList, { QueueListProps } from "./queue-list";
import SnapshotList, { SnapshotListProps } from "./snapshot-list";
import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useState } from "react";

export interface SidebarProps {
  DataExplorerProps: DataExplorerProps;
  QueueListProps: QueueListProps;
  GraphSettingsProps: GraphSettingsProps;
  SnapshotListProps: SnapshotListProps;
  tabIndex: number;
  setTabIndex: (index: number) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <Box hidden={value !== index} sx={{ overflow: "scroll", height: "100%" }}>
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </Box>
  );
}

export const dataExplorerWidth = 360;

export default function Sidebar(props: SidebarProps) {
  const tabIndex = props.tabIndex;

  const handleChange = (_event: React.SyntheticEvent, newTabIndex: number) => {
    props.setTabIndex(newTabIndex);
  };

  return (
    <Box sx={{ height: "100%", width: dataExplorerWidth, display: "flex", flexDirection: "column", backgroundColor: "background.paper" }}>
      <Box sx={{ borderBottom: 2, borderColor: "divider", m: 1 }}>
        <Tabs value={tabIndex} onChange={handleChange} variant="fullWidth" scrollButtons="auto">
          <Tab label="Данные" />
          <Tab label="Поиск" />
          <Tab label="Снимки" />
          <Tab sx={{ minWidth: "70px" }} icon={<SettingsIcon />} />
        </Tabs>
      </Box>
      <TabPanel value={tabIndex} index={0}>
        <DataExplorer {...props.DataExplorerProps} />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <QueueList {...props.QueueListProps} />
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        <SnapshotList {...props.SnapshotListProps} />
      </TabPanel>
      <TabPanel value={tabIndex} index={3}>
        <GraphSettings {...props.GraphSettingsProps} />
      </TabPanel>
    </Box>
  );
}
function useEffect(arg0: () => void, arg1: (number | undefined)[]) {
  throw new Error("Function not implemented.");
}
