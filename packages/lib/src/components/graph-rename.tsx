import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { ClickAwayListener, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";

export interface GraphRenameProps {
  title?: string;
  onChange: (title: string) => void;
}

export default function GraphRename(props: GraphRenameProps) {
  const [isEdit, setIsEdit] = useState(false);
  const [title, setTitle] = useState(props.title);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [textFieldWidth, setTextFieldWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current?.offsetWidth) {
      setTextFieldWidth(containerRef.current?.offsetWidth + 1);
    }
  }, [containerRef.current]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (title) {
      props.onChange(title);
    }
    setIsEdit(false);
  };

  const handleCancel = () => {
    setIsEdit(false);
    setTitle(props.title);
  };

  useEffect(() => {
    setTitle(props.title);
  }, [props.title]);

  if (isEdit) {
    return (
      <ClickAwayListener onClickAway={handleCancel}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack direction="row" justifyContent="center" alignItems="center">
            <TextField
              sx={{ width: textFieldWidth }}
              fullWidth
              size="small"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              autoFocus
              onFocus={(event) => {
                event.target.focus();
                event.target.setSelectionRange(0, (title || "").length);
              }}
            />
            <Box sx={{ ml: 0.5 }}>
              <IconButton size="small" onClick={handleSubmit}>
                <CheckIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ ml: 0.5 }}>
              <IconButton size="small" onClick={handleCancel}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          </Stack>
        </Box>
      </ClickAwayListener>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "40px",
        p: "7.5px 13px",
        borderRadius: "5px",
        transition: (theme) => theme.transitions.create(["border-color"]),
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "transparent",
        "&:hover, &:active": {
          cursor: "text",
          borderColor: "grey.400",
        },
      }}
      onClick={() => {
        setIsEdit(true);
      }}
    >
      <Typography>{title}</Typography>
    </Box>
  );
}
