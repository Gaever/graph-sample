import { CollapseEdgesKind } from "../types";
import AlignHorizontalLeftIcon from "@mui/icons-material/AlignHorizontalLeft";
import CallMergeIcon from "@mui/icons-material/CallMerge";
import { ClickAwayListener } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
// import Popover from "@mui/material/Popover";
import { Popover } from "./popover";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";

export interface CollapseEdgesPickerProps {
  onChange: (kind: CollapseEdgesKind) => void;
}

export default function CollapseEdgesPicker(props: CollapseEdgesPickerProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (anchorEl !== event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <Box>
      <IconButton onClick={handleClick} onMouseOver={handleClick}>
        <CallMergeIcon />
      </IconButton>
      <Popover
        anchorEl={anchorEl}
        open={open}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handleClose}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Box onMouseLeave={handleClose} sx={{ p: 1 }}>
            <Tooltip title="Свернуть связи по типам (X)">
              <IconButton
                onClick={() => {
                  props.onChange("collapse-by-system-id");
                }}
                sx={{ position: "relative" }}
              >
                <CallMergeIcon sx={{ position: "absolute", left: 0 }} />
                <CallMergeIcon sx={{ position: "relative", left: 6 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Свернуть связи">
              <IconButton
                onClick={() => {
                  props.onChange("collapse-all");
                }}
              >
                <CallMergeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </ClickAwayListener>
      </Popover>
    </Box>
  );
}
