import { MergeKind } from "../types";
import JoinFullIcon from "@mui/icons-material/JoinFull";
import JoinLeftIcon from "@mui/icons-material/JoinLeft";
import JoinRightIcon from "@mui/icons-material/JoinRight";
import { ClickAwayListener, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
// import Popover from "@mui/material/Popover";
import { Popover } from "./popover";
import { useState } from "react";

export interface MergeNodePickerProps {
  onChange: (kind: MergeKind) => void;
}

export default function MergeNodePicker(props: MergeNodePickerProps) {
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
        <JoinLeftIcon />
      </IconButton>
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Box onMouseLeave={handleClose} sx={{ p: 1 }}>
            <Tooltip title="Выберите этот инструмент и кликните на втором узле чтобы объединить два узла. Первый узел удаляется, все поля сохраняются во втором узле. При совпадении одинаковые поля дублируются с префиксом _merged_.">
              <IconButton onClick={() => props.onChange("full-merge")}>
                <JoinFullIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Выберите этот инструмент и кликните на втором узле чтобы объединить два узла. Первый узел удаляется, все поля сохраняются во втором узле. При совпадении сохраняется поле из первого узла.">
              <IconButton onClick={() => props.onChange("left-merge")}>
                <JoinLeftIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Выберите этот инструмент и кликните на втором узле чтобы объединить два узла. Первый узел удаляется, все поля сохраняются во втором узле. При совпадении сохраняется поле из второго узла.">
              <IconButton onClick={() => props.onChange("right-merge")}>
                <JoinRightIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </ClickAwayListener>
      </Popover>
    </Box>
  );
}
