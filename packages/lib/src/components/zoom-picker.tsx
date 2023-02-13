import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";

export interface ZoomPickerProps {
  zoom: number;
  onChange: (zoom: number) => void;
}

export default function ZoomPicker(props: ZoomPickerProps) {
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
      <Button onClick={handleClick} onMouseOver={handleClick} sx={{ cursor: "auto", color: "grey.700" }}>
        {(Number(props.zoom.toFixed(2)) * 100).toFixed(0)}%
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} MenuListProps={{ onMouseLeave: handleClose }}>
        {[0.25, 0.5, 1, 1.5, 2].map((zoom) => (
          <MenuItem
            key={zoom}
            onClick={() => {
              props.onChange(zoom);
              handleClose();
            }}
          >
            {zoom * 100}%
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
