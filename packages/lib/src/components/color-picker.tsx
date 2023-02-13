import { colorPickerColors } from "../theme";
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
// import Popover from "@mui/material/Popover";
import { Popover } from "./popover";
import Tooltip from "@mui/material/Tooltip";
import { useRef, useState } from "react";
import { CirclePicker, CirclePickerProps } from "react-color";

export interface ColorPickerProps extends CirclePickerProps {
  size?: "small" | "medium";
  variant?: "contained" | "outline";
  tooltipTitle?: string;
  icon?: React.ReactNode;
}

export default function ColorPicker(props: ColorPickerProps) {
  const anchorElRef = useRef<HTMLDivElement | null>(null);
  const size = props.size || "medium";
  const variant = props.variant || "contained";
  const [isOpen, setIsOpen] = useState(false);

  const theme = useTheme();

  const isWhite = props.color === "white" || props.color === "#ffffff" || props.color === "rgb(255,255,255)";

  const sizes = {
    medium: {
      outerSize: "56px",
      innerSize: "44px",
    },
    small: {
      outerSize: "40px",
      innerSize: "28px",
    },
  };

  const variants = {
    contained: {
      outer: {
        borderWidth: 1,
        borderColor: "grey.400",
      },
      inner: {
        backgroundColor: props.color as string,
      },
    },
    outline: {
      outer: {
        backgroundColor: "background.paper",
        borderWidth: 4,
        borderColor: props.color as string,
        ...(isWhite ? { borderWidth: 1, backgroundColor: "white", borderColor: "grey.400", borderStyle: "solid" } : null),
      },
      inner: {
        backgroundColor: "background.paper",
        ...(isWhite ? { borderWidth: 1, borderColor: "grey.400", borderStyle: "solid" } : null),
      },
    },
  };

  return (
    <Box>
      <Tooltip title={props.tooltipTitle || ""}>
        {props.icon ? (
          <Box ref={anchorElRef}>
            <IconButton
              sx={{ ...(isWhite ? { filter: "drop-shadow( 0px 1px 2px rgba(0, 0, 0, 0.5))" } : null) }}
              onClick={() => {
                setIsOpen(true);
              }}
            >
              {props.icon}
            </IconButton>
          </Box>
        ) : (
          <Box
            ref={anchorElRef}
            onClick={() => {
              setIsOpen(true);
            }}
            sx={{
              boxSizing: "border-box",
              backgroundColor: "background.paper",
              width: sizes[size].outerSize,
              height: sizes[size].outerSize,
              borderRadius: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderStyle: "solid",
              transition: (theme) => theme.transitions.create(["box-shadow"]),
              "&:hover, &:active": {
                cursor: "pointer",
                boxShadow: (theme) => theme.shadows[4],
              },
              ...variants[variant].outer,
            }}
          >
            <Box
              sx={{
                width: sizes[size].innerSize,
                height: sizes[size].innerSize,
                borderRadius: "60px",
                ...variants[variant].inner,
              }}
            />
          </Box>
        )}
      </Tooltip>

      <Popover
        open={isOpen}
        anchorEl={anchorElRef.current}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: -10, horizontal: "left" }}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <ClickAwayListener
          onClickAway={() => {
            setIsOpen(false);
          }}
        >
          <Paper elevation={0} sx={{ p: 2 }}>
            <CirclePicker
              color={props.color}
              onChangeComplete={(...args) => {
                setIsOpen(false);
                props?.onChangeComplete?.(...args);
              }}
              colors={colorPickerColors}
            />
          </Paper>
        </ClickAwayListener>
      </Popover>
    </Box>
  );
}
