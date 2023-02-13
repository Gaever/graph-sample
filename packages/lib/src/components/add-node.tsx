import NodeIcon from "./node-icon";
import { Graph, NodeTypeList } from "../http/api";
import { NodeTemplate, OnAddNodeClick, OnConfirmAddNode } from "../types";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { CircularProgress, Stack, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useState } from "react";

export interface AddNodeProps {
  nodeTypeList: NodeTypeList[];
  icons: Graph["icons"];
  onAddNodeClick: OnAddNodeClick;
  onConfirmAddNode: OnConfirmAddNode;
  nodeTemplate: NodeTemplate | undefined;
  isLoadingSystemId: string | undefined;
  onCancel: () => void;
  error: string | undefined;
}

export interface RequiredAttributeTextFieldProps {
  onConfirm: (value: string) => void;
  onCancel: () => void;
  error: string | undefined;
  requiredKey: string;
}

function RequiredAttributeTextField(props: RequiredAttributeTextFieldProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if (value) {
      props.onConfirm(value);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack direction="row" justifyContent="center" alignItems="flex-start">
        <TextField
          fullWidth
          size="small"
          required
          label={props.requiredKey}
          value={value}
          error={!!props.error}
          helperText={props.error || ""}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          autoFocus
        />
        <Box sx={{ ml: 0.5, mt: 0.75 }}>
          <IconButton size="small" onClick={handleSubmit}>
            <CheckIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ ml: 0.5, mt: 0.75 }}>
          <IconButton size="small" onClick={props.onCancel}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>
      </Stack>
    </Box>
  );
}

export default function AddNode(props: AddNodeProps) {
  if (props.nodeTypeList.length < 1) return null;

  return (
    <List>
      {props.nodeTypeList.map((item) => (
        <Box key={item.system_id}>
          <ListItem disablePadding key={item.system_id}>
            <ListItemButton
              onClick={() => {
                props.onAddNodeClick(item);
              }}
            >
              {props.isLoadingSystemId === item.system_id ? (
                <ListItemIcon sx={{ "& span": { width: "30px !important", height: "30px !important" } }}>
                  <CircularProgress />
                </ListItemIcon>
              ) : (
                <ListItemIcon>
                  {props.icons?.[item?.icon || ""] ? (
                    <Box sx={{ width: 30, height: 30 }}>
                      <NodeIcon width="30px" height="30px" base64src={props.icons[item.icon || ""]?.src || ""} />
                    </Box>
                  ) : (
                    <Box sx={{ width: 30, height: 30, borderRadius: 100, borderWidth: 2, borderStyle: "solid", borderColor: "primary.main" }} />
                  )}
                </ListItemIcon>
              )}
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
          {props.nodeTemplate && item.system_id && item.system_id === props.nodeTemplate.systemId && props.nodeTemplate.requiredKey ? (
            <Box sx={{ m: 2 }}>
              <RequiredAttributeTextField
                error={props.error}
                requiredKey={props.nodeTemplate.requiredKey}
                onCancel={props.onCancel}
                onConfirm={(value) => {
                  if (!props.nodeTemplate) return;
                  props.onConfirmAddNode({
                    ...props.nodeTemplate,
                    attributes: (props.nodeTemplate?.attributes || [])?.map?.((attribute) => {
                      if (attribute.key === props.nodeTemplate?.requiredKey) {
                        return {
                          ...attribute,
                          value,
                        };
                      }

                      return attribute;
                    }),
                  });
                }}
              />
            </Box>
          ) : null}
        </Box>
      ))}
    </List>
  );
}
