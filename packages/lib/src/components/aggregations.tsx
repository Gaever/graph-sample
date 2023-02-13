import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import _set from "lodash/set";
import { useEffect, useMemo, useRef, useState } from "react";
import { CSS_AGGREGATIONS } from "../data-layer/cy-constants";
import { elementsToAttributesMap } from "../data-layer/format-response";
import { aggregationFunctions } from "../utils";
import { AggregationItem } from "./aggregation-item";
import Big from "big.js";
import { NodeCollection } from "cytoscape";
import { Field } from "../http/api";
import { AggregationFuncKind, GroupAggregation } from "../types";
import { formatString } from "../utils";

export interface AggregationsProps {
  groupElement: cytoscape.NodeSingular | cytoscape.EdgeSingular;
  nodesToAggregate: cytoscape.NodeCollection;
  groupElementType: "node" | "edge";
  maxAggregations?: number;
  disableToggleVisibility?: boolean;
  onChange?: () => void;
}

export function doAggrFunc(func: AggregationFuncKind, value: number, aggregatedResult: Big | undefined): Big {
  switch (func) {
    case "sum":
      if (!aggregatedResult) aggregatedResult = new Big(0);
      aggregatedResult = aggregatedResult.plus(value);
      break;
    case "min":
      if (!aggregatedResult) aggregatedResult = new Big(value);

      if (aggregatedResult.gt(value)) {
        aggregatedResult = new Big(value);
      }
      break;
    case "max":
      if (!aggregatedResult) aggregatedResult = new Big(value);

      if (aggregatedResult.lt(value)) {
        aggregatedResult = new Big(value);
      }
      break;
    case "avg":
      if (!aggregatedResult) aggregatedResult = new Big(value);

      aggregatedResult = aggregatedResult.plus(value).div(2);
      break;
    default:
      throw new Error("invalid aggregate function");
  }

  return aggregatedResult;
}

export function doAggregate(nodes: NodeCollection, aggregations: GroupAggregation[]): GroupAggregation[] {
  const results: { key: string; result: Big | undefined }[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const attributes: Field[] = nodes[i]?.data?.()?.payload?.data || [];

    const attributeMap: Record<string, Field> = {};
    attributes.forEach((item) => {
      if (!item.key) return;
      attributeMap[item.key] = item;
    });

    aggregations.forEach((aggregation, index) => {
      const field = aggregation.field || "";
      const func = (aggregation.func || "") as AggregationFuncKind;
      if (!field || !func) return;

      const attribute = attributeMap[field];
      const value = parseFloat(attribute?.value || "");

      if (attribute === undefined || isNaN(value)) return;

      if (!results[index]) {
        results[index] = { key: field || "", result: undefined };
      }

      if (func !== "avg") {
        const res = doAggrFunc(func, value, results[index].result);

        results[index].result = res;
      } else {
        const res = doAggrFunc("sum", value, results[index].result);

        results[index].result = res;
      }
    });
  }

  return aggregations.map((item, index) => {
    const aggregation = item;
    let result = results[index]?.result || new Big(0);

    if (item.func === "avg") {
      result = result.div(nodes.length);
    }

    return {
      ...aggregation,
      result: Number(result.toString()),
      formattedValue: formatString(result.toString(), aggregation.formatVariant || 0),
    };
  });
}

function setGroupAggregations(
  groupElement: cytoscape.NodeSingular | cytoscape.EdgeSingular,
  newAggregations: GroupAggregation[],
  groupElementType: AggregationsProps["groupElementType"]
) {
  const newData = groupElement.data();

  if (newAggregations.length > 0) {
    _set(newData, "payload.aggregations", newAggregations);
    if (groupElementType === "node") {
      groupElement.removeClass(CSS_AGGREGATIONS);
      groupElement.addClass(CSS_AGGREGATIONS);
    }
  } else {
    _set(newData, "payload.aggregations", undefined);
    if (groupElementType === "node") {
      groupElement.removeClass(CSS_AGGREGATIONS);
    }
  }

  groupElement.data(newData);
}

function getGroupAggregations(group: cytoscape.NodeSingular | cytoscape.EdgeSingular) {
  return (group.data()?.payload?.aggregations || []) as GroupAggregation[];
}

export default function Aggregations(props: AggregationsProps) {
  const [uniqueChildrenAttributes] = useMemo(() => elementsToAttributesMap(props.nodesToAggregate), [props.nodesToAggregate]);
  const [aggregations, setAggregations] = useState<GroupAggregation[]>(getGroupAggregations(props.groupElement));
  const aggregationsRef = useRef(aggregations);

  useEffect(() => {
    aggregationsRef.current = aggregations;
  }, [aggregations, aggregationsRef]);

  useEffect(() => {
    const newAggregations = doAggregate(props.nodesToAggregate, aggregationsRef.current);
    setAggregations(newAggregations);
    setGroupAggregations(props.groupElement, newAggregations, props.groupElementType);
  }, [props.groupElement, aggregationsRef]);

  return (
    <Grid container>
      <Grid item xs={12}>
        {(aggregations || []).map((item, index) => (
          <Box sx={{ mt: 1, mb: 1 }} key={`aggr-${item.field}${item.func}${index}`}>
            <AggregationItem
              {...item}
              disableToggleVisibility={props.disableToggleVisibility}
              fields={uniqueChildrenAttributes}
              functions={aggregationFunctions}
              onChange={(newData) => {
                const data = {
                  ...item,
                  ...newData,
                };

                const newAggregations = [...aggregations];
                newAggregations.splice(index, 1, data);

                const resultAggregations = doAggregate(props.nodesToAggregate, newAggregations);

                setAggregations(resultAggregations);
                setGroupAggregations(props.groupElement, resultAggregations, props.groupElementType);

                props?.onChange?.();
              }}
              onDelete={() => {
                const newAggregations = [...aggregations];
                newAggregations.splice(index, 1);
                setAggregations(newAggregations);
                setGroupAggregations(props.groupElement, newAggregations, props.groupElementType);
                props?.onChange?.();
              }}
            />
          </Box>
        ))}
      </Grid>
      {!props.maxAggregations || (props.maxAggregations && aggregations.length < props.maxAggregations) ? (
        <Grid item xs={12}>
          <Button
            sx={{ pt: "3px", pb: 0 }}
            variant="outlined"
            size="small"
            onClick={() => {
              const newAggregations: GroupAggregation[] = [...aggregations, {}];
              setAggregations(newAggregations);
              setGroupAggregations(props.groupElement, newAggregations, props.groupElementType);
              props?.onChange?.();
            }}
          >
            Добавить
          </Button>
        </Grid>
      ) : null}
    </Grid>
  );
}
