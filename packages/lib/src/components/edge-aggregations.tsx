import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useState } from "react";
import { validateNum } from "../utils";
import Aggregations, { AggregationsProps } from "./aggregations";
import { EdgeGroupsListCallbacksProps } from "./edge-groups-list";
import { edgeToStyle } from "./edit-edge";
import _set from "lodash/set";

interface EdgeAggregationsProps extends Pick<AggregationsProps, "groupElement" | "nodesToAggregate"> {
  compiledStyle: cytoscape.Css.Edge | cytoscape.Css.Node;
  EdgeGroupsListCallbacks?: EdgeGroupsListCallbacksProps;
  groupId: string;
}

export function EdgeAggregations(props: EdgeAggregationsProps) {
  const [customMaxV, setCustomMaxV] = useState(props.groupElement.data("payload")?.aggregations?.[0]?.edgeWidthTreshold || 0);

  const changeWidth = () => {
    const newStyle = edgeToStyle(props.groupElement as cytoscape.EdgeSingular, props.compiledStyle);
    const v = props.groupElement.data("payload").aggregations?.[0]?.result;

    if (v) {
      props.groupElement.data("payload").aggregations[0].edgeWidthTreshold = customMaxV;
    }

    if (isNaN(v)) {
      props.EdgeGroupsListCallbacks?.onChangeEdgeGroup?.({
        groupId: props.groupId,
        data: {
          style: newStyle,
        },
      });
    } else {
      let width = Math.floor(v / (customMaxV / 12));

      if (width < 1 || !width) width = 1;
      if (width > 12) width = 12;

      newStyle.width = width;

      props.EdgeGroupsListCallbacks?.onChangeEdgeGroup?.({
        groupId: props.groupId,
        data: {
          style: newStyle,
        },
      });
    }
  };

  useEffect(() => {
    changeWidth();
  }, [customMaxV]);

  return (
    <>
      <Aggregations
        disableToggleVisibility
        groupElement={props.groupElement}
        nodesToAggregate={props.nodesToAggregate}
        groupElementType={"edge"}
        maxAggregations={1}
        onChange={changeWidth}
      />
      {props.groupElement.data("payload")?.aggregations ? (
        <TextField
          label="Максимальное значение"
          placeholder="Максимальное значение"
          size="small"
          fullWidth
          value={customMaxV}
          onChange={(event) => {
            if (!validateNum(event.target.value)) {
              return false;
            }
            const v = +event.target.value;
            setCustomMaxV(v);
          }}
        />
      ) : null}
    </>
  );
}
