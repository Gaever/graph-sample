import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Box, { BoxProps } from "@mui/material/Box";
import MUICollapse, { CollapseProps as MUICollapseProps } from "@mui/material/Collapse";
import ListItemButton, { ListItemButtonProps } from "@mui/material/ListItemButton";
import ListItemText, { ListItemTextProps } from "@mui/material/ListItemText";
import { useEffect, useState } from "react";
import ElementActions, { ElementActionsProps } from "./element-actions";

export interface CollapseProps {
  isOpen?: boolean;
  label?: ListItemTextProps["primary"];
  children?: React.ReactNode;
  showExpander?: boolean;
  rootBoxProps?: BoxProps;
  ListItemButtonProps?: ListItemButtonProps;
  ListItemTextProps?: ListItemTextProps;
  MUICollapseProps?: MUICollapseProps;
  ElementActionsProps?: ElementActionsProps;
  headerElementActionsProps?: ElementActionsProps;
  startAdornment?: React.ReactNode;
  startAdornmentBeforeListItemButton?: React.ReactNode;
  onToggleOpen?: (isOpen: boolean) => void;
}

export default function Collapse(props: CollapseProps) {
  const [isOpen, setIsOpen] = useState(props.isOpen || false);

  useEffect(() => {
    setIsOpen(!!props.isOpen);
  }, [props.isOpen]);

  return (
    <Box {...props.rootBoxProps}>
      <ListItemButton
        onClick={() => {
          const v = !isOpen;
          setIsOpen(v);
          props?.onToggleOpen?.(v);
        }}
        sx={{ pr: 1.5, pl: 1.5, pb: 0, pt: 0.5 }}
        {...props.ListItemButtonProps}
      >
        {props.startAdornment}
        <ListItemText primaryTypographyProps={{ variant: "subtitle2" }} primary={props.label} {...props.ListItemTextProps} />
        {props.headerElementActionsProps ? <ElementActions {...props.headerElementActionsProps} /> : null}
        {props.showExpander === false ? null : <>{isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}</>}
      </ListItemButton>
      <MUICollapse in={isOpen || props.showExpander === false} unmountOnExit {...props.MUICollapseProps} onClick={() => {}}>
        <ElementActions {...props.ElementActionsProps} />
        {props.children}
      </MUICollapse>
    </Box>
  );
}
