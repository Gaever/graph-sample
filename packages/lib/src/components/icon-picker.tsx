import { Graph, Icon } from "../http/api";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Grid, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
// import Popover from "@mui/material/Popover";
import { Popover } from "./popover";
import AddIcon from "@mui/icons-material/Add";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { useRef, useState } from "react";
import NodeIcon from "./node-icon";

export interface IconPickerProps {
  iconKey?: string;
  icons: Graph["icons"];
  onChange: (iconKey: string | undefined) => void;
  onAddIcon?: (file: File) => void;
  onUpdateIcon?: (iconKey: string, icon: Icon) => void;
  emptyIconFallback?: React.ReactNode;
}

export interface UploadIconButtonProps {
  onUploadIconClick?: (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  onUploadIcon: (file: File) => void;
}

const Input = styled("input")({
  display: "none",
});

function UploadIconButton(props: UploadIconButtonProps) {
  return (
    <Box component="label" htmlFor="upload-icon-file" sx={{ mb: 0 }}>
      <Input
        accept="image/*"
        id="upload-icon-file"
        type="file"
        onClick={props.onUploadIconClick}
        onChange={(event) => {
          const file = event?.target?.files?.[0];

          if (file) {
            props.onUploadIcon(file);
          }
        }}
      />
      <IconButton component="span" size="medium">
        <AddIcon fontSize="medium" sx={{ color: "grey.400" }} />
      </IconButton>
    </Box>
  );
}

export interface IconItemsProps {
  label: string;
  src: string;
  selected: boolean;
  onChange: () => void;
  onSelect: () => void;
  onChangeLabel: (label: string) => void;
}

function IconItem(props: IconItemsProps) {
  const [label, setLabel] = useState(props.label);

  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
      <Box
        sx={{
          width: "50px",
        }}
      >
        <NodeIcon onClick={props.onSelect} base64src={props.src} />
      </Box>
      <Box>
        <TextField
          size="small"
          variant="standard"
          value={label}
          onChange={(event) => {
            setLabel(event.target.value);
          }}
        />
      </Box>
      <Box>
        <Tooltip title="Сохранить название">
          <IconButton
            onClick={() => {
              props.onChangeLabel(label);
            }}
            size="small"
          >
            <CheckOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Stack>
  );
}

export interface IconsPopoverContentProps {
  icons: IconPickerProps["icons"];
  selectedIconKey?: string;
  onChange: IconPickerProps["onChange"];
  onAddIcon?: IconPickerProps["onAddIcon"];
  onUpdateIcon?: IconPickerProps["onUpdateIcon"];
}

function IconsPopoverContent(props: IconsPopoverContentProps) {
  const iconsKeys = Object.keys(props.icons || {});

  if (iconsKeys.length < 1) {
    return (
      <Grid container sx={{ alignItems: "center", justifyContent: "center", height: "75px", width: "250px", m: 2 }}>
        <Typography>Нет доступных иконок. Вы можете загрузить новую.</Typography>
      </Grid>
    );
  }

  return (
    <Grid container sx={{ display: "flex", maxWidth: "300px", maxHeight: "450px", overflow: "scroll" }} spacing={0}>
      <Grid
        item
        xs={12}
        sx={{
          alignItems: "center",
          justifyContent: "flex-start",
          display: "flex",
          mt: 1,
          mb: 1,
          pr: 2,
          pl: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ width: "50px" }}>
            <IconButton
              onClick={() => {
                props.onChange(undefined);
              }}
              sx={{ borderRadius: "100px", borderWidth: 2, borderColor: "grey.400", borderStyle: "dashed", display: "flex", alignItems: "center", justifyContent: "center" }}
              size="medium"
            >
              <CloseIcon fontSize="medium" sx={{ color: "grey.400" }} />
            </IconButton>
          </Box>
          <Box>
            <Typography>Без иконки</Typography>
          </Box>
        </Stack>
      </Grid>

      {iconsKeys.map((iconKey) => {
        const icon = props.icons?.[iconKey || ""];
        if (!icon) return null;

        return (
          <Grid
            key={`icons-popover-icon-${iconKey}`}
            item
            xs={12}
            sx={{
              alignItems: "center",
              justifyContent: "flex-start",
              display: "flex",
              pr: 2,
              pl: 2,
              mt: 1,
              mb: 1,
              ...(props.selectedIconKey === iconKey ? { backgroundColor: (theme) => theme.palette.grey[300] } : null),
            }}
          >
            <Box>
              <IconItem
                onSelect={() => {
                  props.onChange(iconKey);
                }}
                onChange={() => {}}
                selected={props.selectedIconKey === iconKey}
                src={icon.src || ""}
                label={icon.label || iconKey}
                onChangeLabel={(label) => {
                  props?.onUpdateIcon?.(iconKey, { ...icon, label });
                }}
              />
            </Box>
          </Grid>
        );
      })}

      {props.onAddIcon ? (
        <Grid
          item
          xs={12}
          sx={{
            alignItems: "center",
            justifyContent: "flex-start",
            display: "flex",
            pr: 2,
            pl: 2,
            mt: 1,
            mb: 1,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <Box sx={{ width: "50px" }}>
              <UploadIconButton onUploadIcon={props.onAddIcon} />
            </Box>
            <Box>
              <Typography>Загрузить</Typography>
            </Box>
          </Stack>
        </Grid>
      ) : null}
    </Grid>
  );
}

export default function IconPicker(props: IconPickerProps) {
  const anchorElRef = useRef<HTMLDivElement | null>(null);
  const selectedIcon = props.icons?.[props?.iconKey || ""];
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }} ref={anchorElRef}>
        {selectedIcon ? <NodeIcon onClick={handleOpen} base64src={selectedIcon?.src || ""} /> : null}
        {!selectedIcon && props.emptyIconFallback ? <Box onClick={handleOpen}>{props.emptyIconFallback}</Box> : null}
        {!selectedIcon && !props.emptyIconFallback ? (
          <Box>
            <IconButton
              onClick={handleOpen}
              sx={{ borderRadius: "100px", borderWidth: 2, borderColor: "grey.400", borderStyle: "dashed", display: "flex", alignItems: "center", justifyContent: "center" }}
              size="large"
            >
              <KeyboardArrowDownIcon fontSize="medium" sx={{ color: "grey.400" }} />
            </IconButton>
          </Box>
        ) : null}
      </Box>

      <Popover
        onClose={handleClose}
        open={isOpen}
        anchorEl={anchorElRef.current}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: -10, horizontal: "left" }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Box>
            <IconsPopoverContent
              icons={props.icons}
              selectedIconKey={props.iconKey}
              onChange={(args) => {
                handleClose();
                props.onChange(args);
              }}
              onAddIcon={props.onAddIcon}
              onUpdateIcon={props.onUpdateIcon}
            />
          </Box>
        </ClickAwayListener>
      </Popover>
    </>
  );
}
