import { ConnectionsList, Field, SearchConnectedParams, SearchInfo, SearchLookAlike } from "../http/api";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import _flatten from "lodash/flatten";

type SearchConnectedParamsType = NonNullable<SearchConnectedParams["request_params"]>[number];
type SearchLookAlikeType = NonNullable<SearchLookAlike["request_params"]>[number];
type SearchRequestAttributeFilterItem = NonNullable<SearchConnectedParamsType["params"]>[number];

export interface SearchRequestAttributeFilterProps {
  fields: NonNullable<ConnectionsList[number]["fields"]>;
  onChange: (args: SearchRequestAttributeFilterItem) => void;
  onRemoveClick: (() => void) | undefined;
}

function SearchRequestAttributeFilter(props: SearchRequestAttributeFilterProps) {
  const [state, setState] = useState<SearchRequestAttributeFilterItem>({});

  useEffect(() => {
    props.onChange(state);
  }, [state]);

  return (
    <Grid item xs={12} justifyContent="space-between" alignItems="center" display="flex">
      <FormControl fullWidth>
        <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>поле</InputLabel>
        <Select
          value={state.field || ""}
          label="поле"
          onChange={(event) => {
            setState((prev) => ({ ...prev, field: event.target.value || "" }));
          }}
          size="small"
        >
          {props.fields.map((item) => (
            <MenuItem key={item.key} value={item.key}>
              <Typography>{item.label || item.key}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ ml: 1 }}>
        <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>условие</InputLabel>
        <Select
          value={state.condition || ""}
          label="условие"
          onChange={(event: SelectChangeEvent) => {
            const condition = event.target.value as SearchRequestAttributeFilterItem["condition"];
            if (condition) {
              setState((prev) => ({ ...prev, condition }));
            }
          }}
          size="small"
        >
          <MenuItem value="eq">
            <Typography>{"="}</Typography>
          </MenuItem>
          <MenuItem value="ne">
            <Typography>{"!="}</Typography>
          </MenuItem>
          <MenuItem value="lt">
            <Typography>{"<"}</Typography>
          </MenuItem>
          <MenuItem value="gt">
            <Typography>{">"}</Typography>
          </MenuItem>
          <MenuItem value="lte">
            <Typography>{"=<"}</Typography>
          </MenuItem>
          <MenuItem value="gte">
            <Typography>{">="}</Typography>
          </MenuItem>
          <MenuItem value="like">
            <Typography>{"~"}</Typography>
          </MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ ml: 1 }}>
        <TextField
          value={state.value || ""}
          label="значение"
          placeholder="значение"
          onChange={(event) => {
            const value = event.target.value || "";
            setState((prev) => ({ ...prev, value }));
          }}
          size="small"
        />
      </FormControl>

      {props.onRemoveClick ? (
        <Box sx={{ ml: 1 }}>
          <IconButton size="small" onClick={props.onRemoveClick}>
            <RemoveIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : null}
    </Grid>
  );
}

export interface SearchRequestAttributeFilterTypeConnectedProps {
  fields: Field[];
  onChange: (args: SearchRequestAttributeFilterItem) => void;
  onRemoveClick: (() => void) | undefined;
}

function SearchRequestAttributeFilterTypeConnected(props: SearchRequestAttributeFilterTypeConnectedProps) {
  const [state, setState] = useState<SearchRequestAttributeFilterItem>({
    condition: "eq",
  });

  useEffect(() => {
    props.onChange(state);
  }, [state]);

  return (
    <Grid item xs={12} justifyContent="space-between" alignItems="center" display="flex">
      <FormControl fullWidth>
        <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>поле</InputLabel>
        <Select
          value={state.field || ""}
          label="поле"
          onChange={(event) => {
            setState((prev) => ({ ...prev, field: event.target.value || "" }));
          }}
          size="small"
        >
          {props.fields.map((item) => (
            <MenuItem key={item.key} value={item.key}>
              <Typography>{item.label || item.key}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ ml: 1 }}>
        <TextField
          value={state.value || ""}
          label="значение"
          placeholder="значение"
          onChange={(event) => {
            const value = event.target.value || "";
            setState((prev) => ({ ...prev, value }));
          }}
          size="small"
        />
      </FormControl>

      {props.onRemoveClick ? (
        <Box sx={{ ml: 1 }}>
          <IconButton size="small" onClick={props.onRemoveClick}>
            <RemoveIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : null}
    </Grid>
  );
}

export interface SearchRequestTypePickerItemProps extends Pick<SearchRequestTypePickerProps, "connectionsList"> {
  onChange: (args: SearchConnectedParamsType) => void;
}

function SearchRequestTypePickerItem(props: SearchRequestTypePickerItemProps) {
  const [state, setState] = useState<SearchConnectedParamsType>({
    params: [{}],
  });

  const fields = (props.connectionsList || []).find((item) => item.connection_system_id === state.connected_type)?.fields;

  useEffect(() => {
    props.onChange(state);
  }, [state]);

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>тип связи</InputLabel>

        <Select
          value={state.connected_type || ""}
          label="тип связи"
          onChange={(event) => {
            setState((prev) => ({ ...prev, connected_type: event.target.value || "" }));
          }}
          size="small"
        >
          {props.connectionsList.map((connectionListItem) => (
            <MenuItem key={connectionListItem.connection_system_id} value={connectionListItem.connection_system_id}>
              <Typography>{connectionListItem.label}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {[...Array(state.params?.length || 0).keys()].map((_, index) => (
        <Box key={`search-req-type-picker-attr-${index}`} mb={1}>
          <SearchRequestAttributeFilter
            fields={fields || []}
            onChange={(value) => {
              const newParams = [...(state.params || [])];
              newParams.splice(index, 1, value);
              setState((prev) => ({ ...prev, params: newParams }));
            }}
            onRemoveClick={
              index === (state.params?.length || 0) - 1 && index !== 0
                ? () => {
                    const newParams = [...(state.params || [])];
                    newParams.splice(index, 1);
                    if (newParams.length < 1) newParams.push({});
                    setState((prev) => ({ ...prev, params: newParams }));
                  }
                : undefined
            }
          />
        </Box>
      ))}

      <Grid item xs={12} justifyContent="flex-end" alignItems="center" display="flex">
        <Paper sx={{ width: "100%", height: "40px", borderStyle: "dashed", borderWidth: 2 }} variant="outlined" />
        <Box sx={{ ml: 1 }}>
          <IconButton
            size="small"
            onClick={() => {
              setState((prev) => ({
                ...prev,
                params: [...(prev.params || []), {}],
              }));
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Grid>
    </Box>
  );
}

export interface SearchRequestTypePickerItemTypeConnectedProps {
  nodeAttributes: Field[];
  onChange: (args: SearchLookAlikeType) => void;
}

function SearchRequestTypePickerItemTypeConnected(props: SearchRequestTypePickerItemTypeConnectedProps) {
  const [state, setState] = useState<SearchConnectedParamsType>({
    params: [{}],
  });

  useEffect(() => {
    props.onChange(state);
  }, [state]);

  return (
    <Box>
      {[...Array(state.params?.length || 0).keys()].map((index) => (
        <Box mb={1} key={`search-req-type-picker-attr-${index}`}>
          <SearchRequestAttributeFilterTypeConnected
            fields={props.nodeAttributes || []}
            onChange={(value) => {
              const newParams = [...(state.params || [])];
              newParams.splice(index, 1, value);
              setState((prev) => ({ ...prev, params: newParams }));
            }}
            onRemoveClick={
              index === (state.params?.length || 0) - 1 && index !== 0
                ? () => {
                    const newParams = [...(state.params || [])];
                    newParams.splice(index, 1);
                    if (newParams.length < 1) newParams.push({});
                    setState((prev) => ({ ...prev, params: newParams }));
                  }
                : undefined
            }
          />
        </Box>
      ))}

      <Grid item xs={12} justifyContent="flex-end" alignItems="center" display="flex">
        <Paper sx={{ width: "100%", height: "40px", borderStyle: "dashed", borderWidth: 2 }} variant="outlined" />
        <Box sx={{ ml: 1 }}>
          <IconButton
            size="small"
            onClick={() => {
              const newParams = [...(state.params || [])];
              newParams.push({});

              setState((prev) => ({
                ...prev,
                params: newParams,
              }));
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Grid>
    </Box>
  );
}

export interface SearchRequestTypePickerProps {
  searchType: NonNullable<SearchInfo["search_type"]>;
  connectionsList: ConnectionsList;
  onChange: (args: SearchConnectedParamsType[]) => void;
  onSearchTypeChange?: (searchType: NonNullable<SearchInfo["search_type"]>) => void;
  selectedNodes: cytoscape.NodeSingular[];
}

export default function SearchRequestTypePicker(props: SearchRequestTypePickerProps) {
  const [state, setState] = useState<SearchConnectedParamsType[]>([{}]);

  useEffect(() => {
    if (props.searchType) {
      props?.onSearchTypeChange?.(props.searchType);
    }
  }, [props.searchType]);

  useEffect(() => {
    props.onChange(state);
  }, [state]);

  const selectedNodesSystemIds = new Set();
  props.selectedNodes.forEach((node) => selectedNodesSystemIds.add(node.data("payload").system_id));

  if (props.searchType === "similar" && props.selectedNodes.length === 1) {
    return (
      <SearchRequestTypePickerItemTypeConnected
        nodeAttributes={_flatten(props.selectedNodes.map((node) => node.data("payload").data))}
        onChange={(value) => {
          setState([value]);
        }}
      />
    );
  }

  if (props.searchType === "similar" && props.selectedNodes.length === 1) {
    return (
      <Box>
        <Typography>Для поиска типа "похожие" можно выбрать не более 1 узла</Typography>
      </Box>
    );
  }

  if ((props.searchType === "flows" || props.searchType === "connected") && selectedNodesSystemIds.size > 1) {
    return (
      <Box>
        <Typography>Для поиска типа "потоки" и "связанные" выберите узлы одного типа</Typography>
      </Box>
    );
  }

  if (props.searchType === "flows" || props.searchType === "connected") {
    return (
      <>
        {[...Array(state.length || 0).keys()].map((_, index) => {
          return (
            <Box sx={{ mb: 2 }} key={`SearchRequestTypePickerItem-${index}`}>
              <SearchRequestTypePickerItem
                connectionsList={props.connectionsList}
                onChange={(value) => {
                  const newState = state;
                  state.splice(index, 1, value);
                  setState(newState);
                }}
              />
            </Box>
          );
        })}
        <Button
          onClick={() => {
            const newState = [...state];
            newState.push({});
            setState(newState);
          }}
        >
          Добавить тип связи
        </Button>
        {state.length > 1 ? (
          <Button
            onClick={() => {
              const newState = [...state];
              newState.pop();
              setState(newState);
            }}
            color="error"
          >
            Убрать тип связи
          </Button>
        ) : null}
      </>
    );
  }

  return null;
}
