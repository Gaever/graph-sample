import PickSubicon, { PickedSubicons } from "./pick-subicon/pick-subicon";
// import { Popover } from "@mui/material";
import { Popover } from "./popover";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import { useRef, useState } from "react";

export interface SubiconPickerPopoverProps {
  subIcons: string[];
  onChange: (subIcons: string[]) => void;
}

export function SubiconPickerPopover(props: SubiconPickerPopoverProps) {
  const anchorElRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  function onIconClick(icon: string) {
    const subIconIndex = props.subIcons.findIndex((item) => item === icon);
    if (subIconIndex !== -1) {
      const subIcons = [...props.subIcons];
      subIcons.splice(subIconIndex, 1);
      props.onChange(subIcons);
    } else {
      const subIcons = [...props.subIcons, icon];
      props.onChange(subIcons);
    }
    setIsOpen(false);
  }

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }} ref={anchorElRef}>
        <PickedSubicons
          picked={props.subIcons || []}
          onIconClick={onIconClick}
          onAddClick={() => {
            setIsOpen(true);
          }}
        />
      </Box>
      <Popover
        onClose={() => {
          setIsOpen(false);
        }}
        anchorEl={anchorElRef.current}
        open={isOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <ClickAwayListener
          onClickAway={() => {
            setIsOpen(false);
          }}
        >
          <Paper sx={{ p: 0.5 }}>
            <PickSubicon picked={props.subIcons} onIconClick={onIconClick} />
          </Paper>
        </ClickAwayListener>
      </Popover>
    </>
  );
}
