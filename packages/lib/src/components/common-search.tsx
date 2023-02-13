import { SearchInfo } from "../http/api";
import { OnSearchCreateRequest } from "../types";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import CreateSearchRequest, { CreateSearchRequestProps } from "./create-search-request";
import { SearchRequestTypePickerProps } from "./search-request-type-picker";
import SearchesList, { SearchesListProps } from "./searches-list";
import Stack from "@mui/material/Stack";
import Collapse from "./collapse";

export interface CommonSearchProps {
  selectedNodes: cytoscape.NodeSingular[];
  onSearchCreateRequest: OnSearchCreateRequest;
  SearchRequestTypePickerProps: Partial<SearchRequestTypePickerProps>;
  ConnectionStatisticProps: CreateSearchRequestProps["ConnectionStatisticProps"];
}

export default function CommonSearch(props: CommonSearchProps) {
  return (
    <Box>
      <Paper sx={{ m: 2 }} elevation={12}>
        <Collapse
          isOpen={false}
          label="Поиск связей"
          ListItemTextProps={{ primaryTypographyProps: { variant: "body1" } }}
          ListItemButtonProps={{ sx: { p: 1.5, pb: 1 } }}
          rootBoxProps={{ sx: { mb: 2 } }}
        >
          {props.selectedNodes.length > 0 ? (
            <CreateSearchRequest
              ConnectionStatisticProps={props.ConnectionStatisticProps}
              selectedNodes={props.selectedNodes}
              onCreate={props.onSearchCreateRequest}
              SearchRequestTypePickerProps={props.SearchRequestTypePickerProps}
            />
          ) : (
            <Paper sx={{ m: 2, p: 3, mb: 2 }} variant="outlined">
              <Typography>Выберите узел или несколько узлов чтобы создать запрос на поиск элементов</Typography>
            </Paper>
          )}
        </Collapse>
      </Paper>
    </Box>
  );
}
