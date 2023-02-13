import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { SearchInfo } from "../http/api";
import CommonSearch, { CommonSearchProps } from "./common-search";
import MetaSearch, { MetaSearchProps } from "./meta-search";
import SearchesList, { SearchesListProps } from "./searches-list";

export interface QueueListProps {
  createdSearches: SearchInfo[];
  onGetClick: SearchesListProps["onGetClick"];
  onChangeClick: SearchesListProps["onChangeClick"];
  onRefreshClick: () => void;
  CommonSearchProps: CommonSearchProps;
  MetaSearchProps: MetaSearchProps;
}

export default function QueueList(props: QueueListProps) {
  return (
    <Box>
      <MetaSearch {...props.MetaSearchProps} />
      <CommonSearch {...props.CommonSearchProps} />
      <Box sx={{ m: 2, mb: 0, display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={props.onRefreshClick}>Обновить</Button>
      </Box>
      <Box
        sx={{
          ".MuiList-root": {
            mt: 0,
            pt: 0,
          },
        }}
      >
        <SearchesList items={props.createdSearches} onGetClick={props.onGetClick} onChangeClick={props.onChangeClick} />
      </Box>
    </Box>
  );
}
