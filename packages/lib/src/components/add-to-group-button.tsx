import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

export interface AddToGroupButtonProps {
  onClick: () => void;
}

export default function AddToGroupButton({ onClick }: AddToGroupButtonProps) {
  return (
    <Box sx={{ height: "22px", position: "relative", width: "100%" }}>
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", position: "absolute", top: "-10px" }}>
        <Tooltip title="Добавить узлы в группу">
          <IconButton onClick={onClick} size="small">
            <ArrowCircleDownIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
