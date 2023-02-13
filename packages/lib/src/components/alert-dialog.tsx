import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function AlertDialog(props: AlertDialogProps) {
  return (
    <Dialog open={props.isOpen} onClose={props.onClose}>
      <DialogContent>
        <DialogContentText>{props.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>{props.cancelText || "Отмена"}</Button>
        <Button onClick={props.onConfirm} autoFocus>
          {props.confirmText || "ОК"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
