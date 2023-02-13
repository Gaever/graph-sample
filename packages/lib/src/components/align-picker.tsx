import { AlignKind } from "../types";
import AlignHorizontalCenterIcon from "@mui/icons-material/AlignHorizontalCenter";
import AlignHorizontalLeftIcon from "@mui/icons-material/AlignHorizontalLeft";
import AlignHorizontalRightIcon from "@mui/icons-material/AlignHorizontalRight";
import AlignVerticalBottomIcon from "@mui/icons-material/AlignVerticalBottom";
import AlignVerticalCenterIcon from "@mui/icons-material/AlignVerticalCenter";
import AlignVerticalTopIcon from "@mui/icons-material/AlignVerticalTop";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import { ClickAwayListener } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
// import Popover from "@mui/material/Popover";
import { Popover } from "./popover";
import { useState } from "react";

export interface AlignPickerProps {
  onChange: (kind: AlignKind) => void;
}

export default function AlignPicker(props: AlignPickerProps) {
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
        <AlignHorizontalLeftIcon />
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
        onClose={() => {
          handleClose();
        }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Box onMouseLeave={handleClose} sx={{ p: 1 }}>
            <IconButton onClick={() => props.onChange("hl")}>
              <AlignHorizontalLeftIcon />
            </IconButton>

            <IconButton onClick={() => props.onChange("hc")}>
              <AlignHorizontalCenterIcon />
            </IconButton>

            <IconButton onClick={() => props.onChange("hr")}>
              <AlignHorizontalRightIcon />
            </IconButton>

            <IconButton onClick={() => props.onChange("vb")}>
              <AlignVerticalBottomIcon />
            </IconButton>

            <IconButton onClick={() => props.onChange("vc")}>
              <AlignVerticalCenterIcon />
            </IconButton>
            <IconButton onClick={() => props.onChange("vt")}>
              <AlignVerticalTopIcon />
            </IconButton>

            <IconButton sx={{ transform: "rotate(90deg)" }} onClick={() => props.onChange("dh")}>
              <FormatAlignCenterIcon />
            </IconButton>

            <IconButton onClick={() => props.onChange("dv")}>
              <FormatAlignCenterIcon />
            </IconButton>
          </Box>
        </ClickAwayListener>
      </Popover>
    </Box>
  );
}
