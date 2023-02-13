import EditAttribute, { EditAttributeProps } from "./edit-attribute";
import { Field } from "../http/api";
import { OnAddNodeAttributePayload } from "../types";
import AddIcon from "@mui/icons-material/Add";
import { Tooltip } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import { useState, useMemo } from "react";

export interface AddNodeAttributeProps extends Pick<EditAttributeProps, "onClose" | "systemId"> {
  isOpen: boolean;
  onAddClick: () => void;
  onChange: (args: OnAddNodeAttributePayload) => void;
  existAttributes: Field[];
}

interface AddAttributeState {
  isAddToAllNodesWithSameSystemId: boolean;
  label: string;
}

export default function AddNodeAttribute(props: AddNodeAttributeProps) {
  const [state, setState] = useState<AddAttributeState>({
    isAddToAllNodesWithSameSystemId: false,
    label: "",
  });
  const existAttributes = useMemo<Record<string, boolean>>(() => {
    const record: Record<string, boolean> = {};
    props.existAttributes.forEach((item) => {
      if (!item.key) return;
      record[item.key] = true;
    });
    return record;
  }, [props.existAttributes]);

  const isDuplicateAttributeKey = Boolean(existAttributes[state.label]);

  if (!props.isOpen) {
    return (
      <Paper variant="outlined" sx={{ p: 1, pt: 0, pb: 0, display: "flex", justifyContent: "center" }}>
        <Tooltip title="Добавить атрибут">
          <IconButton size="small" onClick={props.onAddClick}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>
    );
  }

  return (
    <EditAttribute
      title="Добавить атрибут"
      systemId={props.systemId}
      onClose={props.onClose}
      isSaveDisabled={isDuplicateAttributeKey || !state.label}
      labelTextFieldProps={{
        error: isDuplicateAttributeKey,
        helperText: isDuplicateAttributeKey ? "Дубликат" : "",
      }}
      onChange={(data) => {
        props.onChange({
          label: data.label,
          formatVariant: data.formatVariant,
          value: data.value,
          isAddToAllNodesWithSameSystemId: state.isAddToAllNodesWithSameSystemId,
        });
        setState({
          label: "",
          isAddToAllNodesWithSameSystemId: false,
        });
      }}
      isLocal
      onLabelChange={(label) => {
        setState((prev) => ({ ...prev, label }));
      }}
      rootPaperProps={{
        sx: {
          p: 1,
          width: "auto",
          variant: "outlined",
          boxShadow: "none",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "grey.400",
        },
      }}
      onClickAwayDisabled
      batchGroupElement={
        props.systemId ? (
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.isAddToAllNodesWithSameSystemId}
                  size="small"
                  onChange={() => {
                    setState((prev) => ({ ...prev, isAddToAllNodesWithSameSystemId: !prev.isAddToAllNodesWithSameSystemId }));
                  }}
                />
              }
              componentsProps={{
                typography: {
                  variant: "body2",
                },
              }}
              label="для всех узлов этого типа"
            />
          </FormGroup>
        ) : null
      }
    />
  );
}
