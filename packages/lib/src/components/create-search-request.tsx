import { SearchAllPossibleParams, SearchInfo } from "../http/api";
import { CyNode, OnSearchCreateRequest } from "../types";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import { IconButton, Stack, Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import moment from "moment";
import { useMemo, useState } from "react";
import { ConnectionStatistic, ConnectionStatisticProps } from "./connection-statistic";
import SearchRequestTypePicker, { SearchRequestTypePickerProps } from "./search-request-type-picker";

export interface CreateSearchRequestProps {
  selectedNodes: cytoscape.NodeSingular[];
  onCreate: OnSearchCreateRequest;
  SearchRequestTypePickerProps: Partial<SearchRequestTypePickerProps>;
  ConnectionStatisticProps: Omit<ConnectionStatisticProps, "nodes">;
}

interface CreateSearchRequestState {
  name: string;
  searchType: SearchInfo["search_type"];
  isFavorites: boolean;
  filters: SearchAllPossibleParams["request_params"];
}

function getTime() {
  return moment().format("DD-MM-YYYY HH:mm");
}

export const searchTypes = [
  {
    id: "connected",
    name: "связанные",
  },
  {
    id: "flows",
    name: "потоки",
  },
  {
    id: "chains",
    name: "цепочки",
  },
  {
    id: "common_obj",
    name: "общие объекты",
  },
  {
    id: "common_links",
    name: "общие связи",
  },
];

export default function CreateSearchRequest(props: CreateSearchRequestProps) {
  const [state, setState] = useState<CreateSearchRequestState>({
    name: getTime(),
    searchType: undefined,
    isFavorites: false,
    filters: undefined,
  });

  const disabled =
    !state.name || !state.searchType || ((state.searchType === "connected" || state.searchType === "flows" || state.searchType === "similar") && (state?.filters?.length || 0) < 1);
  const nodes = useMemo(() => props.selectedNodes.map((node) => ({ id: node.data("payload")?.item_id, system_id: node.data("payload")?.system_id })), [props.selectedNodes]);

  return (
    <Grid container spacing={2} p={2}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>тип поиска</InputLabel>
          <Select
            label="тип поиска"
            fullWidth
            size="small"
            value={state.searchType || ""}
            onChange={(event) => {
              const selectedType = searchTypes.find((item) => item.id === event.target.value);
              setState((prev) => ({ ...prev, name: `${selectedType?.id || ""} - ${getTime()}`, searchType: selectedType?.id as SearchInfo["search_type"] }));
            }}
          >
            {searchTypes.map((type) => (
              <MenuItem value={type.id} key={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Название"
          label="Название"
          value={state.name}
          onChange={(event) => {
            setState((prev) => ({ ...prev, name: event.target.value }));
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <ConnectionStatistic {...props.ConnectionStatisticProps} nodes={nodes} />
        <FormControlLabel
          control={
            <Checkbox
              checked={state.isFavorites}
              icon={<StarBorderOutlinedIcon />}
              checkedIcon={<StarIcon />}
              onChange={() => {
                setState((prev) => ({ ...prev, isFavorites: !prev.isFavorites }));
              }}
            />
          }
          componentsProps={{
            typography: {
              variant: "body2",
              sx: {
                position: "relative",
                top: "2px",
              },
            },
          }}
          label={
            <Stack direction="row" justifyContent="center" alignItems="center">
              <Typography
                variant="body2"
                sx={{
                  position: "relative",
                  bottom: "1px",
                  mr: 1,
                  ml: 1,
                }}
              >
                Сохранить в избранное
              </Typography>
              <Tooltip title="Добавление в избранное предотвратит результат запроса от удаления. Запросы, не добавленные в избранное будут очищены через некоторое время.">
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          }
        />
      </Grid>

      {state.searchType && ["connected", "flows", "similar"].includes(state.searchType) ? (
        <Grid item xs={12}>
          <SearchRequestTypePicker
            searchType={state.searchType}
            connectionsList={props.SearchRequestTypePickerProps.connectionsList || []}
            onSearchTypeChange={props.SearchRequestTypePickerProps.onSearchTypeChange}
            selectedNodes={props.selectedNodes}
            onChange={(value) => setState((prev) => ({ ...prev, filters: value }))}
          />
        </Grid>
      ) : null}

      <Grid item xs={12}>
        <Tooltip title={disabled ? "Выберите тип поиска и заполните название запроса" : ""}>
          <span>
            <Button
              disabled={disabled}
              variant="contained"
              fullWidth
              onClick={() => {
                props.onCreate({
                  name: state.name,
                  search_type: state.searchType,
                  is_favorites: state.isFavorites,
                  nodes,
                  request_params: state.filters,
                });
              }}
            >
              Создать
            </Button>
          </span>
        </Tooltip>
      </Grid>
    </Grid>
  );
}
