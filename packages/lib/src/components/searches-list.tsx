import Collapse from "./collapse";
import { SearchInfo } from "../http/api";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import { IconButton, List, Stack, Theme, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { searchTypes } from "./create-search-request";

export interface SearchesListProps {
  items: SearchInfo[];
  onGetClick: (item: SearchInfo) => void;
  onChangeClick: (item: SearchInfo) => void;
}

export interface SearchesListItemProps extends SearchInfo {
  isOpen: boolean;
  onGetClick: () => void;
  onChangeClick: (args: SearchInfo) => void;
}

interface SearchesListItemState {
  name: string;
  isFavorites: boolean;
}

export interface KeyValueListItemProps {
  label: React.ReactNode;
  value: React.ReactNode;
}

function KeyValueListItem(props: KeyValueListItemProps) {
  return (
    <>
      <Grid item xs={6}>
        <Typography>{props.label}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography sx={{ color: (theme) => theme.palette.grey[700] }}>{props.value}</Typography>
      </Grid>
    </>
  );
}

function statusToColor(status: string, theme: Theme) {
  switch (status) {
    case "new":
    case "searching":
      return theme.palette.grey[400];
    case "done":
      return theme.palette.success.light;
    case "error":
      return theme.palette.error.main;
    default:
      return theme.palette.grey[400];
  }
}

function statusToTitle(status: string | undefined) {
  switch (status) {
    case "new":
      return "новый";
    case "searching":
      return "поиск";
    case "done":
      return "готово";
    case "error":
      return "ошибка";
    default:
      return status;
  }
}

function SearchesListItem(props: SearchesListItemProps) {
  const [state, setState] = useState<SearchesListItemState>({
    name: props.name || "",
    isFavorites: !!props.is_favorites,
  });

  const isDirty = props.name !== state.name || !!props.is_favorites !== !!state.isFavorites;
  return (
    <Paper sx={{ m: 2 }} elevation={12}>
      <Collapse
        isOpen={props.isOpen}
        label={
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ height: "8px", width: "8px", borderRadius: "50px", backgroundColor: (theme) => statusToColor(props.status || "", theme) }} />
            <Typography>{props.name}</Typography>
          </Stack>
        }
        ListItemTextProps={{ primaryTypographyProps: { variant: "body1" } }}
        ListItemButtonProps={{ sx: { p: 1.5, pb: 1 } }}
        rootBoxProps={{ sx: { mb: 2 } }}
      >
        <Grid container spacing={1} sx={{ p: 2 }}>
          <Grid item xs={12}>
            <TextField
              sx={{ mb: 1 }}
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
            <Grid container>
              <KeyValueListItem label="id:" value={props.id} />
              <KeyValueListItem label="статус:" value={statusToTitle(props.status)} />
              <KeyValueListItem label="тип поиска:" value={searchTypes.find((item) => item.id === props?.search_type)?.name || ""} />
              <KeyValueListItem label="найдено узлов:" value={props.found_nodes_count} />
              <KeyValueListItem label="найдено связей:" value={props.found_connections_count} />
            </Grid>
          </Grid>

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
                      ml: 1,
                      mr: 1,
                      position: "relative",
                      bottom: "1px",
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
            <Stack direction="column" spacing={2}>
              <Button
                disabled={props.status !== "done"}
                variant="outlined"
                fullWidth
                onClick={() => {
                  props.onGetClick();
                }}
              >
                Добавить на граф
              </Button>
              {isDirty ? (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    props.onChangeClick({
                      name: state.name,
                      is_favorites: state.isFavorites,
                      id: props.id,
                    });
                  }}
                >
                  Сохранить
                </Button>
              ) : null}
            </Stack>
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
}

export default function SearchesList(props: SearchesListProps) {
  return (
    <List>
      {props.items.map((item) => (
        <SearchesListItem
          {...item}
          key={item.id}
          onChangeClick={props.onChangeClick}
          onGetClick={() => {
            props.onGetClick(item);
          }}
          isOpen={false}
        />
      ))}
    </List>
  );
}
