import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useEffect } from "react";
import { MetaGroupsInfo } from "../http/api";
import { OnSearchMetagroupCreateRequest } from "../types";
import Collapse from "./collapse";
import CreateSearchElementsRequest from "./create-search-elements-request";

export interface MetaSearchProps {
  metagroups: MetaGroupsInfo[];
  onMount: () => void;
  onSearchMetagroupCreateRequest: OnSearchMetagroupCreateRequest;
}

export default function MetaSearch(props: MetaSearchProps) {
  useEffect(() => {
    props.onMount();
  }, []);

  return (
    <Box>
      <Paper sx={{ m: 2 }} elevation={12}>
        <Collapse
          isOpen
          label="Поиск элементов"
          ListItemTextProps={{ primaryTypographyProps: { variant: "body1" } }}
          ListItemButtonProps={{ sx: { p: 1.5, pb: 1 } }}
          rootBoxProps={{ sx: { mb: 2 } }}
        >
          <CreateSearchElementsRequest metagroups={props.metagroups} onCreate={props.onSearchMetagroupCreateRequest} />
        </Collapse>
      </Paper>
    </Box>
  );
}
