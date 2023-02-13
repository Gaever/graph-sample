import EditAttribute, { OnChange } from "./edit-attribute";
import ElementActions from "./element-actions";
import { Field } from "../http/api";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
// import Popover from "@mui/material/Popover";
import { Popover } from "./popover";
import { useRef, useState } from "react";

export interface AttributeListItemProps extends Field {
  editable?: boolean;
  deletable?: boolean;
  onChange?: OnChange;
  onDelete?: () => void;
  isLocal?: boolean;
  systemId?: string;
}

export function AttributeListItem(props: AttributeListItemProps) {
  const [isEdit, setIsEdit] = useState(false);
  const popoverAnchorElRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <Box ref={popoverAnchorElRef}>
        <ListItem
          sx={{
            "& .MuiListItemSecondaryAction-root": { right: 0, display: "none" },
            "&:hover": { "& .MuiListItemSecondaryAction-root": { display: "inherit" } },
            pr: props.onChange && props.onDelete ? 9 : 3,
          }}
          disablePadding
          secondaryAction={
            <ElementActions
              onChangeClick={
                props.onChange
                  ? () => {
                      setIsEdit(true);
                    }
                  : undefined
              }
              onDeleteClick={props.onDelete}
            />
          }
        >
          <ListItemText
            sx={{ m: 0, mb: 1 }}
            primary={props?.label}
            secondary={props.formattedValue || props.value}
            primaryTypographyProps={{ variant: "subtitle2" }}
            secondaryTypographyProps={{ sx: { wordWrap: "break-word" } }}
          />
        </ListItem>
      </Box>

      <Popover
        anchorEl={popoverAnchorElRef.current}
        anchorOrigin={{
          vertical: "top",
          horizontal: -24,
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isEdit}
        onClose={() => {
          setIsEdit(false);
        }}
      >
        <EditAttribute
          label={props.label}
          value={props.value}
          formatVariant={props.formatVariant}
          isLocal={props.isLocal}
          systemId={props.systemId}
          onChange={(data) => {
            props?.onChange?.(data);
            setIsEdit(false);
          }}
          onClose={() => {
            setIsEdit(false);
          }}
        />
      </Popover>
    </>
  );
}
