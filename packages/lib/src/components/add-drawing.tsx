import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

export interface AddDrawingProps {
  onAddClick: () => void;
}

export default function AddDrawing(props: AddDrawingProps) {
  return (
    <Box p={2}>
      <Paper variant="outlined" sx={{ p: 1, pt: 0, pb: 0, display: "flex", justifyContent: "center" }}>
        <IconButton size="small" onClick={props.onAddClick}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Box>
  );
}
