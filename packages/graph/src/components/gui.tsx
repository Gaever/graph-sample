import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AdjustIcon from "@mui/icons-material/Adjust";
import AppsIcon from "@mui/icons-material/Apps";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AspectRatioOutlinedIcon from "@mui/icons-material/AspectRatioOutlined";
import BubbleChartOutlinedIcon from "@mui/icons-material/BubbleChartOutlined";
import CableIcon from "@mui/icons-material/Cable";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import FlipToBackIcon from "@mui/icons-material/FlipToBack";
import FlipToFrontIcon from "@mui/icons-material/FlipToFront";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Badge } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import AlignPicker from "@vityaz-graph/lib/src/components/align-picker";
import ClusterPicker, { ClusterPickerProps } from "@vityaz-graph/lib/src/components/cluster-picker";
import CollapseEdgesPicker from "@vityaz-graph/lib/src/components/collapse-edges-picker";
import Filter, { FilterProps } from "@vityaz-graph/lib/src/components/filter";
import GraphRename from "@vityaz-graph/lib/src/components/graph-rename";
import Legend, { LegendProps } from "@vityaz-graph/lib/src/components/legend";
import MergeNodePicker from "@vityaz-graph/lib/src/components/merge-node-picker";
import { Popover, PopoverProps } from "@vityaz-graph/lib/src/components/popover";
import Sidebar, { dataExplorerWidth, SidebarProps } from "@vityaz-graph/lib/src/components/sidebar";
import TimelineDrawer, { TimelineDrawerProps } from "@vityaz-graph/lib/src/components/timeline-drawer";
import ZoomPicker from "@vityaz-graph/lib/src/components/zoom-picker";
import ExportPng from "@vityaz-graph/lib/src/containers/export-png";
import useElementsLength from "@vityaz-graph/lib/src/data-layer/use-elements-length";
import { AlignKind, CollapseEdgesKind, GuiState, MergeKind } from "@vityaz-graph/lib/src/types";
import { useRef, useState } from "react";

const Input = styled("input")({
  display: "none",
});

export interface GuiProps {
  onViewportCenterClick: () => void;
  onToggleFullscreenClick: () => void;
  onUploadJson: (file: File) => void;
  onUploadJsonClick: (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  onDownloadJsonClick: () => void;
  onSaveGraphInDbClick: () => void;
  onDoLayoutClick: (kind: cytoscape.LayoutOptions["name"]) => void;
  onToggleDataExplorer: () => void;
  onFilterClick: () => void;
  onFilterClose: () => void;
  onBringToFrontClick: () => void;
  onBringToBackClick: () => void;
  onCreateNodeGroupClick: () => void;
  onCollapseEdgesClick: (kind: CollapseEdgesKind) => void;
  onExpandEdgesClick: () => void;
  onCreateEdgeClick: () => void;
  onAlignClick: (kind: AlignKind) => void;
  onMergeClick: (kind: MergeKind) => void;
  onChangeZoom: (zoom: number) => void;
  onASearchClick: () => void;
  onCreateSnapshotClick: () => void;
  onGraphRename: (title: string) => void;
  onClusterPickerOpen: () => void;
  onClusterPickerClose: () => void;
  onTimelineClick: () => void;
  onDocxExportClick: () => void;
  onPngExportClick: (args: { maxWidth: number; maxHeight: number }) => void;
  isFullscreen: boolean;
  containerHeight: number;
  containerWidth: number;
  graphTitle?: string;
  drawerProps?: DrawerProps;
  state: GuiState;
  SidebarProps: SidebarProps;
  FilterProps: FilterProps;
  ClusterPickerProps: ClusterPickerProps;
  LegendProps: LegendProps;
  TimelineDrawerProps: TimelineDrawerProps;
}

interface FilterPopoverProps extends FilterProps {
  open: boolean;
  anchorEl: PopoverProps["anchorEl"];
  onClose: () => void;
}

function FilterPopover(props: FilterPopoverProps) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const { open, anchorEl, onClose, ...FilterProps } = props;

  return (
    <Popover onClose={onClose} open={open} anchorEl={anchorEl} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: 20 }}>
      <ClickAwayListener
        onClickAway={() => {
          if (!isSelectOpen) {
            onClose();
          }
        }}
      >
        <Box>
          <Filter
            {...FilterProps}
            onSelectOpen={() => {
              setIsSelectOpen(true);
            }}
            onSelectClose={() => {
              setIsSelectOpen(false);
            }}
            onClose={props.onClose}
          />
        </Box>
      </ClickAwayListener>
    </Popover>
  );
}

interface ClusterPickerPopoverProps extends ClusterPickerProps {
  open: boolean;
  anchorEl: PopoverProps["anchorEl"];
  onClose: () => void;
}

function ClusterPickerPopover(props: ClusterPickerPopoverProps) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const { open, anchorEl, onClose, ...ClusterPickerProps } = props;

  return (
    <Popover
      onClose={props.onClose}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: 20 }}
    >
      <ClickAwayListener
        onClickAway={() => {
          if (!isSelectOpen) {
            onClose();
          }
        }}
      >
        <Box>
          <ClusterPicker
            {...ClusterPickerProps}
            onSelectOpen={() => {
              setIsSelectOpen(true);
            }}
            onSelectClose={() => {
              setIsSelectOpen(false);
            }}
            onClose={props.onClose}
          />
        </Box>
      </ClickAwayListener>
    </Popover>
  );
}

function Gui(props: GuiProps) {
  const isDataExplorerOpen = props.state.isDataExplorerOpen;

  const filterIconRef = useRef<HTMLDivElement | null>(null);
  const clusterIconRef = useRef<HTMLDivElement | null>(null);

  const { selectedNodesLength, selectedEdgesLength, selectedNodeGroupsLength, selectedEdgeGroupsLength, isDrawingSelected } = useElementsLength({
    selectedNodes: props.SidebarProps.DataExplorerProps.SelectedElementsListProps.selectedNodes,
    selectedEdges: props.SidebarProps.DataExplorerProps.SelectedElementsListProps.selectedEdges,
    selectedNodeGroups: props.SidebarProps.DataExplorerProps.SelectedElementsListProps.selectedNodeGroups,
    selectedEdgeGroups: props.SidebarProps.DataExplorerProps.SelectedElementsListProps.selectedEdgeGroups,
    selectedDrawing: props.SidebarProps.DataExplorerProps.SelectedElementsListProps.selectedDrawing,
  });

  const isExpandCollapseSectionDisplayed = selectedEdgesLength > 1 || selectedEdgeGroupsLength > 0;
  const isCreateEdgeDisplayed = selectedNodesLength === 1;
  const isCreateNodeGroupDisplayed = props.SidebarProps.DataExplorerProps.SelectedElementsListProps.grouppableSelectedNodes.size > 1;
  const isDisplayedArrange = selectedNodesLength > 0 || selectedNodeGroupsLength > 0 || isDrawingSelected;
  const isDisplayedAlign = selectedNodesLength > 1 || selectedNodeGroupsLength > 1 || (selectedNodesLength >= 1 && selectedNodeGroupsLength >= 1) || isDrawingSelected;
  const isASearchDisplayed =
    (selectedNodesLength === 2 && selectedNodeGroupsLength === 0) ||
    (selectedNodesLength === 0 && selectedNodeGroupsLength === 2) ||
    (selectedNodesLength === 1 && selectedNodeGroupsLength === 1);
  const isMergeDisplayed = selectedNodesLength === 1;

  const scrollableToolbarRef = useRef<HTMLDivElement | null>(null);

  const isMd = props.containerWidth <= 900;

  return (
    <>
      <AppBar position="absolute" color="default" sx={{}}>
        <Toolbar variant="dense" sx={{ "& hr": { mx: 0.5 }, overflow: "hidden" }}>
          <Box
            ref={scrollableToolbarRef}
            sx={{ display: "flex", overflow: "hidden", pr: "20px" }}
            onWheel={(event) => {
              event.preventDefault();
              if (scrollableToolbarRef.current) {
                scrollableToolbarRef.current.scrollLeft += event.deltaY;
              }
            }}
          >
            <Tooltip title={`Сохранить граф в базе${props.state.isGraphUnsaved ? " (не сохранено)" : ""}`}>
              <IconButton onClick={props.onSaveGraphInDbClick}>
                <Badge badgeContent=" " overlap="circular" variant="dot" color={props.state.isGraphUnsaved ? "error" : undefined}>
                  <SaveOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Создать снимок">
              <IconButton onClick={props.onCreateSnapshotClick}>
                <PhotoCameraOutlinedIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Загрузить json">
              <Box component="label" htmlFor="icon-button-file">
                <Input
                  accept="application/JSON"
                  id="icon-button-file"
                  type="file"
                  onClick={props.onUploadJsonClick}
                  onChange={(event) => {
                    const file = event?.target?.files?.[0];

                    if (file) {
                      props.onUploadJson(file);
                    }
                  }}
                />
                <IconButton component="span">
                  <UploadFileIcon />
                </IconButton>
              </Box>
            </Tooltip>
            <Tooltip title="Скачать json">
              <IconButton onClick={props.onDownloadJsonClick}>
                <FileDownloadOutlinedIcon />
              </IconButton>
            </Tooltip>

            <ExportPng onExport={props.onPngExportClick} />

            {selectedNodesLength >= 1 ? (
              <Tooltip title="Экспорт в word">
                <IconButton onClick={props.onDocxExportClick}>
                  <DescriptionOutlinedIcon />
                </IconButton>
              </Tooltip>
            ) : null}

            <Divider orientation="vertical" variant="middle" flexItem />
            <Tooltip title="Матричная расстановка">
              <IconButton onClick={() => props.onDoLayoutClick("grid")}>
                <AppsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Расставить кольцом">
              <IconButton onClick={() => props.onDoLayoutClick("circle")}>
                <CircleOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Расстановка веером">
              <IconButton onClick={() => props.onDoLayoutClick("concentric")}>
                <AdjustIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Расставить иерархией (вертикально)">
              <IconButton onClick={() => props.onDoLayoutClick("dagre")} sx={{ transform: "rotate(90deg)" }}>
                <AccountTreeOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Расстановка иерархией (горизонтально, KLay)">
              <IconButton onClick={() => props.onDoLayoutClick("klay")}>
                <AccountTreeOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Кластер">
              <Box ref={clusterIconRef}>
                <IconButton onClick={props.onClusterPickerOpen}>
                  <BubbleChartOutlinedIcon />
                </IconButton>
              </Box>
            </Tooltip>

            <Divider orientation="vertical" variant="middle" flexItem />

            <Tooltip title="Фильтр">
              <Box ref={filterIconRef}>
                <IconButton onClick={props.onFilterClick}>
                  <FilterAltOutlinedIcon />
                </IconButton>
              </Box>
            </Tooltip>

            {isMergeDisplayed ? <MergeNodePicker onChange={props.onMergeClick} /> : null}

            {isExpandCollapseSectionDisplayed ? (
              <>
                <CollapseEdgesPicker onChange={props.onCollapseEdgesClick} />

                <Tooltip title="Развернуть связи">
                  <IconButton onClick={props.onExpandEdgesClick}>
                    <CallSplitIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : null}

            {isCreateEdgeDisplayed ? (
              <Tooltip title="Создать связь (С)">
                <IconButton onClick={props.onCreateEdgeClick}>
                  <CableIcon />
                </IconButton>
              </Tooltip>
            ) : null}

            {isCreateNodeGroupDisplayed ? (
              <Tooltip title="Создать группу (G)">
                <IconButton onClick={props.onCreateNodeGroupClick}>
                  <CreateNewFolderIcon />
                </IconButton>
              </Tooltip>
            ) : null}

            {isDisplayedArrange ? (
              <>
                <Tooltip title="На первый план">
                  <IconButton onClick={props.onBringToFrontClick}>
                    <FlipToFrontIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="На задний план">
                  <IconButton onClick={props.onBringToBackClick}>
                    <FlipToBackIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : null}

            {isASearchDisplayed ? (
              <Tooltip title="Поиск кратчайшего пути">
                <IconButton onClick={props.onASearchClick}>
                  <MapOutlinedIcon />
                </IconButton>
              </Tooltip>
            ) : null}

            {isDisplayedAlign ? (
              <>
                <Divider orientation="vertical" variant="middle" flexItem />
                <AlignPicker onChange={props.onAlignClick} />
              </>
            ) : null}

            {props.graphTitle ? (
              <>
                <Divider orientation="vertical" variant="middle" flexItem />
                <Box sx={{ ml: 1 }}>
                  <GraphRename title={props.graphTitle} onChange={props.onGraphRename} />
                </Box>
              </>
            ) : null}
          </Box>

          <Box sx={{ flexGrow: 1, zIndex: 2, height: "56px", backgroundColor: "background.paper" }} />
          <Box
            sx={{
              display: "flex",
              boxShadow: "-20px 0px 10px 3px rgba(245,245,245,0.9)",
              zIndex: 1,
              position: "relative",
            }}
          >
            <Box sx={{ position: "absolute", top: 5, left: -20, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Box>
                <IconButton
                  size="small"
                  onMouseDown={() => {
                    if (scrollableToolbarRef.current) {
                      scrollableToolbarRef.current.scrollLeft += 50;
                    }
                  }}
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Tooltip title="Переключить вид на временную шкалу">
              <IconButton onClick={props.onTimelineClick}>
                <AccessTimeIcon />
              </IconButton>
            </Tooltip>
            <ZoomPicker zoom={props.state.zoom} onChange={props.onChangeZoom} />
            <Tooltip title="Центрировать">
              <IconButton onClick={props.onViewportCenterClick}>
                <CenterFocusWeakIcon />
              </IconButton>
            </Tooltip>
            {props.isFullscreen ? (
              <Tooltip title="Выйти из полноэкранного режима">
                <IconButton onClick={props.onToggleFullscreenClick}>
                  <CloseFullscreenIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Полный экран">
                <IconButton onClick={props.onToggleFullscreenClick}>
                  <AspectRatioOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={isDataExplorerOpen ? "Скрыть панель" : "Показать панель"}>
              <IconButton onClick={props.onToggleDataExplorer}>
                <MenuOpenIcon sx={{ ...(isDataExplorerOpen ? { transform: "rotate(180deg)" } : null) }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              minWidth: dataExplorerWidth,
              display: isDataExplorerOpen ? "block" : "none",
              ...(isMd
                ? {
                    display: "none",
                  }
                : null),
            }}
          />
        </Toolbar>
      </AppBar>
      {props.state.isProgressBarEnabled && (
        <Box sx={{ position: "absolute", top: "57px", width: "100%" }}>
          <LinearProgress />
        </Box>
      )}

      <FilterPopover open={props.state.isFilterOpen} anchorEl={filterIconRef.current} onClose={props.onFilterClose} {...props.FilterProps} />
      <ClusterPickerPopover open={props.state.isClusterOpen} anchorEl={clusterIconRef.current} onClose={props.onClusterPickerClose} {...props.ClusterPickerProps} />

      <TimelineDrawer {...props.TimelineDrawerProps} />

      <Drawer
        anchor="right"
        variant={isDataExplorerOpen ? "permanent" : "temporary"}
        open={isDataExplorerOpen}
        sx={{
          "& .MuiDrawer-paper": {
            position: "absolute",
            ...(isMd
              ? {
                  height: `calc(100% - 57px)`,
                  top: 57,
                }
              : null),
          },
        }}
      >
        <Sidebar {...props.SidebarProps} />
      </Drawer>
      {props.state.legendSettings.show ? (
        <Box sx={{ position: "absolute", zIndex: 1000, top: 72, left: 16 }}>
          <Legend {...props.LegendProps} />
        </Box>
      ) : null}
    </>
  );
}

export default Gui;
