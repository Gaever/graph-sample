import { AttributeListItemProps } from "./attribute-list-item";
import FormatSelect from "./format-select";
import { Field } from "../http/api";
import { OnChangeAttributePayload } from "../types";
import { formatString } from "../utils";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import StorageIcon from "@mui/icons-material/Storage";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper, { PaperProps } from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

export type OnChange = (args: OnChangeAttributePayload) => void;

export interface EditAttributeProps extends Field {
  isNodeAttribute?: boolean;
  isEdgeAttribute?: boolean;

  systemId?: string;
  isLocal?: AttributeListItemProps["isLocal"];
  formatVariant?: number;
  onChange: OnChange;

  labelTextFieldProps?: TextFieldProps;

  onLabelChange?: (label: string) => void;
  onValueChange?: (value: string) => void;
  onClose: () => void;

  title?: string;
  batchGroupElement?: React.ReactNode;
  rootPaperProps?: PaperProps;
  onClickAwayDisabled?: boolean;
  isSaveDisabled?: boolean;
}

interface EditListItemState {
  label: string | undefined;
  value: string | undefined;
  isSelectOpen: boolean;
  formatVariant?: number;
  isApplyLabelToAllNodesWithSameSystemId: boolean;
  isApplyFormatVariantToAllNodesWithSameSystemId: boolean;
  isApplyStyleToAllGroups: boolean;
}

export default function EditAttribute(props: EditAttributeProps) {
  const [state, setState] = useState<EditListItemState>({
    isSelectOpen: false,
    label: props.label,
    value: props.value,
    formatVariant: props.formatVariant || 0,
    isApplyLabelToAllNodesWithSameSystemId: false,
    isApplyFormatVariantToAllNodesWithSameSystemId: false,
    isApplyStyleToAllGroups: false,
  });

  const formattedValue = formatString(state.value || "", +(state.formatVariant || 0));

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (!state.isSelectOpen && !props.onClickAwayDisabled) {
          props.onClose();
        }
      }}
    >
      <Paper sx={{ p: 2, width: "380px" }} {...props.rootPaperProps}>
        <Grid container spacing={2}>
          <Grid item xs={12} justifyContent="space-between" alignItems="center" display="flex">
            <Typography>{props.title ? props.title : "Изменить поле"}</Typography>
            <IconButton size="small" onClick={props.onClose}>
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </Grid>

          {/* Изменить label */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Название"
              value={state.label || ""}
              onChange={(event) => {
                setState((prev) => ({ ...prev, label: event.target.value }));
                props?.onLabelChange?.(event.target.value);
              }}
              {...props.labelTextFieldProps}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Значение"
              value={state.value || ""}
              onChange={(event) => {
                setState((prev) => ({ ...prev, value: event.target.value }));
                props?.onValueChange?.(event.target.value);
              }}
            />
          </Grid>

          {/* Выбор форматирования */}
          <Grid item xs={12}>
            <FormatSelect
              str={state.value || ""}
              formatVariant={state.formatVariant}
              onChange={(formatVariant) => {
                setState((prev) => ({ ...prev, formatVariant }));
              }}
              onOpen={() => {
                setState((prev) => ({ ...prev, isSelectOpen: true }));
              }}
              onClose={() => {
                setState((prev) => ({ ...prev, isSelectOpen: false }));
              }}
            />
            <TextField size="small" fullWidth value={formattedValue} disabled label="Форматированное значение" />
          </Grid>

          {/* Флаги пакетной обработки */}
          {props.systemId && !props.batchGroupElement && props.isNodeAttribute ? (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, pb: 1 }}>
                <Typography variant="body2">Применить для всех узлов этого типа ({props.systemId}):</Typography>
                <Divider sx={{ mt: 1, mb: 0.5 }} />
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={state.isApplyLabelToAllNodesWithSameSystemId}
                        size="small"
                        onChange={() => {
                          setState((prev) => ({ ...prev, isApplyLabelToAllNodesWithSameSystemId: !prev.isApplyLabelToAllNodesWithSameSystemId }));
                        }}
                      />
                    }
                    componentsProps={{
                      typography: {
                        variant: "body2",
                      },
                    }}
                    label="Название"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={state.isApplyFormatVariantToAllNodesWithSameSystemId}
                        size="small"
                        onChange={() => {
                          setState((prev) => ({ ...prev, isApplyFormatVariantToAllNodesWithSameSystemId: !prev.isApplyFormatVariantToAllNodesWithSameSystemId }));
                        }}
                      />
                    }
                    componentsProps={{
                      typography: {
                        variant: "body2",
                      },
                    }}
                    label="Форматирование"
                  />
                </FormGroup>
              </Paper>
            </Grid>
          ) : null}
          {props.systemId && !props.batchGroupElement && props.isEdgeAttribute ? (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, pb: 1 }}>
                <Typography variant="body2">Применить для всех связей этого типа ({props.systemId}):</Typography>
                <Divider sx={{ mt: 1, mb: 0.5 }} />
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={state.isApplyStyleToAllGroups}
                        size="small"
                        onChange={() => {
                          setState((prev) => ({ ...prev, isApplyStyleToAllGroups: !prev.isApplyStyleToAllGroups }));
                        }}
                      />
                    }
                    componentsProps={{
                      typography: {
                        variant: "body2",
                      },
                    }}
                    label="Стиль"
                  />
                </FormGroup>
              </Paper>
            </Grid>
          ) : null}

          {props.batchGroupElement ? (
            <Grid item xs={12}>
              {props.batchGroupElement}
            </Grid>
          ) : null}

          {/* Сохранить */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                disabled={props.isSaveDisabled}
                onClick={() => {
                  props.onChange({
                    key: props.key,

                    label: state.label,
                    value: state.value,
                    formatVariant: state.formatVariant,
                    isApplyLabelToAllNodesWithSameSystemId: !!state.isApplyLabelToAllNodesWithSameSystemId,
                    isApplyFormatVariantToAllNodesWithSameSystemId: !!state.isApplyFormatVariantToAllNodesWithSameSystemId,
                    isApplyStyleToAllGroups: !!state.isApplyStyleToAllGroups,
                    saveInDb: false,
                  });
                }}
              >
                Сохранить
              </Button>
              {!props.isLocal && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    props.onChange({
                      key: props.key,
                      label: state.label,
                      value: state.value,
                      formatVariant: state.formatVariant,
                      isApplyLabelToAllNodesWithSameSystemId: !!state.isApplyLabelToAllNodesWithSameSystemId,
                      isApplyFormatVariantToAllNodesWithSameSystemId: !!state.isApplyFormatVariantToAllNodesWithSameSystemId,
                      isApplyStyleToAllGroups: !!state.isApplyStyleToAllGroups,

                      saveInDb: true,
                    });
                  }}
                  startIcon={<StorageIcon />}
                >
                  Сохранить в БД
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </ClickAwayListener>
  );
}
