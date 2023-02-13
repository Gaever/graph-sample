import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Box, { BoxProps } from "@mui/material/Box";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import FolderOffIcon from "@mui/icons-material/FolderOff";
import { Tooltip } from "@mui/material";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

export interface ElementActionsProps {
  onAggregationsClick?: IconButtonProps["onClick"];
  onAggregationsClickTooltipTitle?: string;
  onAggregationsClickRef?: IconButtonProps["ref"];

  onChangeClick?: IconButtonProps["onClick"];
  onChangeClickTooltipTitle?: string;
  onChangeClickRef?: IconButtonProps["ref"];

  onDeleteClick?: IconButtonProps["onClick"];
  onDeleteClickTooltipTitle?: string;
  onDeleteClickRef?: IconButtonProps["ref"];

  onGroupClick?: IconButtonProps["onClick"];
  onGroupClickRef?: IconButtonProps["ref"];
  onGroupClickTooltipTitle?: string;

  onUngroupClick?: IconButtonProps["onClick"];
  onUngroupClickRef?: IconButtonProps["ref"];
  onUngroupClickTooltipTitle?: string;

  onSplitClick?: IconButtonProps["onClick"];
  onSplitClickRef?: IconButtonProps["ref"];
  onSplitClickTooltipTitle?: string;

  onCountLinksClick?: IconButtonProps["onClick"];
  onCountLinksClickRef?: IconButtonProps["ref"];
  onCountLinksClickTooltipTitle?: string;

  onHideClick?: IconButtonProps["onClick"];
  onHideClickRef?: IconButtonProps["ref"];
  onHideClickTooltipTitle?: string;

  onShowClick?: IconButtonProps["onClick"];
  onShowClickRef?: IconButtonProps["ref"];
  onShowClickTooltipTitle?: string;

  rootBoxProps?: BoxProps;
}

export default function ElementActions(props: ElementActionsProps) {
  return (
    <Box sx={{ ml: 1, mr: 1, display: "flex", justifyContent: "flex-start" }} {...props.rootBoxProps}>
      {props.onAggregationsClick && (
        <Tooltip title={props?.onAggregationsClickTooltipTitle || "Агрегации"}>
          <IconButton size="small" onClick={props.onUngroupClick} ref={props.onAggregationsClickRef}>
            <CreateNewFolderIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {props.onChangeClick && (
        <Tooltip title={props?.onChangeClickTooltipTitle || "Изменить"}>
          <IconButton size="small" onClick={props.onChangeClick} ref={props.onChangeClickRef}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {props.onDeleteClick && (
        <Tooltip title={props?.onDeleteClickTooltipTitle || "Удалить"}>
          <IconButton size="small" onClick={props.onDeleteClick} ref={props.onDeleteClickRef}>
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {props.onGroupClick && (
        <Tooltip title={props?.onGroupClickTooltipTitle || "Сгруппировать"}>
          <IconButton size="small" onClick={props.onGroupClick} ref={props.onGroupClickRef}>
            <CreateNewFolderIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {props.onUngroupClick && (
        <Tooltip title={props?.onUngroupClickTooltipTitle || "Разгруппировать"}>
          <IconButton size="small" onClick={props.onUngroupClick} ref={props.onUngroupClickRef}>
            <FolderOffIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {props.onSplitClick && (
        <Tooltip title={props?.onSplitClickTooltipTitle || "Развернуть связи"}>
          <IconButton size="small" onClick={props.onSplitClick} ref={props.onSplitClickRef}>
            <CallSplitIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {props.onCountLinksClick && (
        <Tooltip title={props?.onCountLinksClickTooltipTitle || "Получить количество связей"}>
          <IconButton size="small" onClick={props.onCountLinksClick} ref={props.onCountLinksClickRef}>
            <DeviceHubIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {props.onHideClick && (
        <Tooltip title={props?.onHideClickTooltipTitle || "Скрыть"}>
          <IconButton size="small" onClick={props.onHideClick} ref={props.onHideClickRef}>
            <VisibilityOffOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {props.onShowClick && (
        <Tooltip title={props?.onShowClickTooltipTitle || "Показать"}>
          <IconButton size="small" onClick={props.onShowClick} ref={props.onShowClickRef}>
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
