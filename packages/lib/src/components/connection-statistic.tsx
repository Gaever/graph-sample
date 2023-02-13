import { useGraphDataRequests } from "../data-layer/use-graph-requests";
import { ConnectedCountResponse } from "../http/api";
import { Box, LinearProgress } from "@mui/material";
import { formatString } from "../utils";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from "react";
import Collapse from "./collapse";
import KeyValueList, { KeyValueListItem } from "./key-value-list";

export interface ConnectionStatisticProps {
  nodes: { id: any; system_id: any }[];
  getNodeConnectionStatisticMutation: ReturnType<typeof useGraphDataRequests>["getNodeConnectionStatisticMutation"];
}

export function ConnectionStatistic(props: ConnectionStatisticProps) {
  const mutation = props.getNodeConnectionStatisticMutation;
  const [data, setData] = useState<ConnectedCountResponse[] | undefined>();

  const onOpenStatistic = useCallback(async () => {
    try {
      if (!data) {
        const response = await mutation.mutateAsync(props.nodes);
        setData(response);
      }
    } catch {}
  }, [mutation, data, props.nodes]);

  return (
    <Box>
      <Typography variant="body2" sx={{ ml: "12px" }}>
        Выбрано узлов: {props.nodes.length}
      </Typography>
      <Collapse
        label="Показать статистику"
        onToggleOpen={(isOpen) => {
          if (isOpen) {
            onOpenStatistic();
          }
        }}
      >
        <Box sx={{ pl: "12px", pr: "12px" }}>
          {mutation.isLoading ? <LinearProgress sx={{ height: "2px" }} /> : null}
          {(data?.length || 0) === 1 ? (
            <KeyValueList>
              {data?.[0].count ? (
                <KeyValueListItem
                  label="Связей"
                  value={data?.[0]?.print_count || data?.[0]?.count}
                  labelTypographyProps={{ variant: "body2" }}
                  valueTypographyProps={{ variant: "body2" }}
                />
              ) : null}
              {data?.[0]?.link_types
                ? Object.entries(data?.[0]?.link_types).map((entry) => {
                    const [key, value] = entry;
                    return <KeyValueListItem label={key} value={value} key={key} labelTypographyProps={{ variant: "body2" }} valueTypographyProps={{ variant: "body2" }} />;
                  })
                : null}
            </KeyValueList>
          ) : null}
          {(data?.length || 0) > 1 ? (
            <KeyValueList>
              <KeyValueListItem
                label="Связей"
                value={formatString(`${(data || []).reduce((prev, item) => prev + parseInt(item.count), 0)}`, 11)}
                labelTypographyProps={{ variant: "body2" }}
                valueTypographyProps={{ variant: "body2" }}
              />
            </KeyValueList>
          ) : null}
        </Box>
      </Collapse>
    </Box>
  );
}
