import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import { IconButton, Stack, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
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
import { MetaGroupsInfo } from "../http/api";
import { metaGroupFilter, OnSearchMetagroupCreateRequest } from "../types";
import MetaGroupSearchFilter from "./meta-group-search-filter";

export interface CreateSearchElementsRequestProps {
  onCreate: OnSearchMetagroupCreateRequest;
  metagroups: MetaGroupsInfo[];
}

interface CreateSearchElementsRequestState {
  name: string;
  selectedMetaGroupId: string | undefined;
  isFavorites: boolean;
  filters: metaGroupFilter[];
  pickedNodeTypesIds: Set<string | number>;
}

function getTime() {
  return moment().format("DD-MM-YYYY HH:mm");
}

type FlattenElements = { id: string | number; name: string | undefined; level: number };

function doFlattenElements(metaGroups: CreateSearchElementsRequestProps["metagroups"]) {
  const flattenElements: FlattenElements[] = [];

  metaGroups.forEach((metaGroup) => {
    if (!metaGroup.id) return;
    flattenElements.push({ id: metaGroup.id, name: metaGroup.name, level: 1 });

    (metaGroup["node-types"] || []).forEach((nodeType) => {
      if (!nodeType.id) return;
      flattenElements.push({ id: `${metaGroup.id}-${nodeType.id}`, name: nodeType.name, level: 2 });
    });
  });

  return flattenElements;
}

type metaField = { id?: number | string | undefined; name?: string | undefined };

function getMetaFields(metaGroups: CreateSearchElementsRequestProps["metagroups"], selectedMetaGroupId: string | undefined): metaField[] {
  if (!selectedMetaGroupId) return [];

  const nodeTypeEntry = (metaGroups || []).find((item) => `${item.id}` === `${selectedMetaGroupId}`)?.["node-types"] || [];
  const metaFieldsMap: Record<string, metaField> = {};

  nodeTypeEntry.forEach((item) => {
    item["meta-fields"]?.forEach?.((metaField) => {
      if (!metaField.id) return;
      metaFieldsMap[metaField.id] = metaField;
    });
  });

  return Object.values(metaFieldsMap);
}

export default function CreateSearchElementsRequest(props: CreateSearchElementsRequestProps) {
  const [state, setState] = useState<CreateSearchElementsRequestState>({
    name: `элементы - ${getTime()}`,
    selectedMetaGroupId: undefined,
    pickedNodeTypesIds: new Set(),
    isFavorites: false,
    filters: [],
  });

  const nodeTypes = state.selectedMetaGroupId ? props.metagroups.find((item) => item.id === state.selectedMetaGroupId)?.["node-types"] || [] : [];
  const metaFields = useMemo(() => getMetaFields(props.metagroups, state.selectedMetaGroupId), [props.metagroups, state.selectedMetaGroupId]);
  const selectedMetaFieldsSet = new Set(state.filters.map((item) => `${item.filterKey || ""}`).filter(Boolean));
  const hasUncompleteFilter = useMemo(() => !!state.filters.find((item) => !item.condition || !item.filterKey), [state]);

  const disabled = hasUncompleteFilter || !state.name || !state.selectedMetaGroupId || selectedMetaFieldsSet.size < 1 || state.pickedNodeTypesIds.size < 1;

  return (
    <Grid container spacing={2} p={2}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>Мета-группа</InputLabel>
          <Select
            label="Мета-группа"
            fullWidth
            size="small"
            value={state.selectedMetaGroupId || ""}
            onChange={(event) => {
              setState((prev) => ({ ...prev, selectedMetaGroupId: event.target.value, filters: [{}] }));
            }}
          >
            {props.metagroups.map((item) => (
              <MenuItem value={item.id} key={item.id}>
                {item.name}
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

      {state.selectedMetaGroupId && metaFields.length > 0 ? (
        <>
          {(state.filters || []).map((filter, index) => {
            return (
              <Grid item xs={12} justifyContent="space-between" alignItems="center" display="flex" key={`${filter.filterKey}${filter.condition}${index}`}>
                <MetaGroupSearchFilter
                  {...filter}
                  metaFields={metaFields}
                  onChange={(value) => {
                    const filters = [...state.filters];
                    filters.splice(index, 1, value);

                    setState((prev) => ({
                      ...prev,
                      filters,
                    }));
                  }}
                  onRemoveClick={() => {
                    const filters = [...state.filters];
                    filters.splice(index, 1);

                    if (filters.length < 1) filters.push({});

                    setState((prev) => ({
                      ...prev,
                      filters,
                    }));
                  }}
                />
              </Grid>
            );
          })}

          <Grid item xs={12} justifyContent="flex-end" alignItems="center" display="flex">
            <Paper sx={{ width: "100%", height: "40px", borderStyle: "dashed", borderWidth: 2 }} variant="outlined" />
            <Box sx={{ ml: 1 }}>
              <IconButton
                size="small"
                onClick={() => {
                  setState((prev) => ({
                    ...prev,
                    filters: [...prev.filters, {}],
                  }));
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </>
      ) : null}

      {state.selectedMetaGroupId && metaFields.length < 1 ? (
        <Grid item xs={12}>
          <Typography>Мета-группа не содержит типов узлов</Typography>
        </Grid>
      ) : null}

      {(nodeTypes?.length || 0) > 0 ? (
        <Grid item xs={12}>
          <Typography variant="body2">Типы элементов</Typography>
          <Box maxHeight={"150px"} overflow="scroll" mt={1}>
            <FormGroup>
              {nodeTypes.map((nodeType) => {
                const someOfPickedMetaFieldsAreMissingInTodeType = Array.from(selectedMetaFieldsSet.values()).some(
                  (pickedMetaFieldId) => !nodeType["meta-fields"]?.map((mf) => `${mf.id}`)?.includes(`${pickedMetaFieldId}`)
                );
                const disabled = selectedMetaFieldsSet.size < 1 || someOfPickedMetaFieldsAreMissingInTodeType;

                return (
                  <FormControlLabel
                    key={nodeType.id!}
                    control={
                      <Checkbox
                        disabled={disabled}
                        size="small"
                        checked={state.pickedNodeTypesIds.has(nodeType.id!)}
                        onChange={() => {
                          const newValue = new Set(state.pickedNodeTypesIds);
                          if (state.pickedNodeTypesIds.has(nodeType.id!)) {
                            newValue.delete(nodeType.id!);
                          } else {
                            newValue.add(nodeType.id!);
                          }
                          setState((prev) => ({ ...prev, pickedNodeTypesIds: newValue }));
                        }}
                      />
                    }
                    label={nodeType.name}
                  />
                );
              })}
            </FormGroup>
          </Box>
        </Grid>
      ) : null}

      <Grid item xs={12}>
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

      <Grid item xs={12}>
        <Tooltip title={disabled ? "Выберите тип поиска, заполните название запроса и укажите фильтры" : ""}>
          <span>
            <Button
              disabled={disabled}
              variant="contained"
              fullWidth
              onClick={() => {
                props.onCreate({
                  name: state.name,
                  // @ts-expect-error
                  search_type: "meta-group",
                  is_favorites: state.isFavorites,
                  // @ts-expect-error
                  nodes: Array.from(state.pickedNodeTypesIds.values()).map((item) => ({ node_type_id: item })),
                  // @ts-expect-error
                  request_params: state.filters.map((item) => ({
                    meta_field_id: item.filterKey,
                    value: item.value,
                    condition: item.condition,
                  })),
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
