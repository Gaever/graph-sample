import { appStateCtx } from "../data-layer/app-state-provider";
import { ConfirmDialogState } from "../types";
import { useContext } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

export const initialConfirmDialogState: ConfirmDialogState = {
  cancelButtonMessage: undefined,
  confirmButtonMessage: undefined,
  message: undefined,
  onCancelCb: undefined,
  onConfirmCb: undefined,
  isOpen: false,
};

export function useConfirmDialog() {
  const {
    guiState: { confirmDialogState },
    dispatchGuiAction,
  } = useContext(appStateCtx);

  const createDialog = function (args: Omit<ConfirmDialogState, "isOpen">) {
    const onCancelCb = () => {
      args?.onCancelCb?.();
      dispatchGuiAction({
        type: "SET_CONFIRM_DIALOG_STATE",
        payload: initialConfirmDialogState,
      });
    };
    const onConfirmCb = () => {
      args?.onConfirmCb?.();
      dispatchGuiAction({
        type: "SET_CONFIRM_DIALOG_STATE",
        payload: initialConfirmDialogState,
      });
    };
    dispatchGuiAction({ type: "SET_CONFIRM_DIALOG_STATE", payload: { ...args, onCancelCb, onConfirmCb, isOpen: true } });
  };

  return {
    confirmDialogState,
    createDialog,
  };
}

export interface ConfirmDialogProps {}

export default function ConfirmDialog(_props: ConfirmDialogProps) {
  const { confirmDialogState } = useConfirmDialog();

  if (!confirmDialogState.isOpen) return null;

  return (
    <Dialog open={confirmDialogState.isOpen} onClose={confirmDialogState.onCancelCb}>
      <DialogTitle>{confirmDialogState.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{confirmDialogState.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={confirmDialogState.onCancelCb}>{confirmDialogState.cancelButtonMessage || "Отмена"}</Button>
        <Button onClick={confirmDialogState.onConfirmCb}>{confirmDialogState.confirmButtonMessage || "ОК"}</Button>
      </DialogActions>
    </Dialog>
  );
}
