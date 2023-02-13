import { EdgeAggregations, GroupAggregation } from "../types";
import { aggregationFunctionTitles, edgeAggregationsToGroupAggregations, groupAggregationToLabel } from "../utils";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";

export interface PickGroupAggregationsProps {
  edgeAggregations: EdgeAggregations | undefined;
  sourceGroupAggregations: GroupAggregation[] | undefined;
  targetGroupAggregations: GroupAggregation[] | undefined;
  onChange: (args: EdgeAggregations | undefined) => void;
}

export default function PickGroupAggregations(props: PickGroupAggregationsProps) {
  const pickedSourceGroupAggregations = useMemo(() => {
    const groupAggregationIndecies: number[] = [];

    (props?.edgeAggregations?.sourceGroupAggregationIndecies as number[])?.forEach((aggregationIndex) => {
      if (props.sourceGroupAggregations?.[aggregationIndex]) groupAggregationIndecies.push(aggregationIndex);
    });

    return groupAggregationIndecies;
  }, [props.edgeAggregations, props.sourceGroupAggregations]);

  const pickedTargetGroupAggregations = useMemo(() => {
    const groupAggregationIndecies: number[] = [];

    (props?.edgeAggregations?.targetGroupAggregationIndecies as number[])?.forEach((aggregationIndex) => {
      if (props.targetGroupAggregations?.[aggregationIndex]) groupAggregationIndecies.push(aggregationIndex);
    });

    return groupAggregationIndecies;
  }, [props.edgeAggregations, props.targetGroupAggregations]);

  function renderItem(item: GroupAggregation, index: number) {
    if (!item.func) return null;
    return (
      <MenuItem key={JSON.stringify([item, index])} value={index}>
        <Stack direction="row" alignItems="center">
          <Typography>{groupAggregationToLabel(item)}</Typography>
        </Stack>
      </MenuItem>
    );
  }

  return (
    <Grid container spacing={2}>
      {props.sourceGroupAggregations?.length ? (
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>доступные агрегации (from)</InputLabel>
            <Select
              value={pickedSourceGroupAggregations}
              multiple
              input={<OutlinedInput label="доступные агрегации (from)" />}
              onChange={(event) => {
                const indecies = event.target.value;
                if (indecies && Array.isArray(indecies)) {
                  props.onChange({
                    ...(props.edgeAggregations || {}),
                    sourceGroupAggregationIndecies: indecies.map(Number),
                  });
                }
              }}
              renderValue={(selected) =>
                selected.map((index) => (props?.sourceGroupAggregations?.[index] ? groupAggregationToLabel(props?.sourceGroupAggregations?.[index]) : "")).join(", ")
              }
              size="small"
            >
              {(props.sourceGroupAggregations || []).map(renderItem)}
            </Select>
          </FormControl>
        </Grid>
      ) : null}
      {props.targetGroupAggregations?.length ? (
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>доступные агрегации (to)</InputLabel>
            <Select
              value={pickedTargetGroupAggregations}
              multiple
              input={<OutlinedInput label="доступные агрегации (to)" />}
              onChange={(event) => {
                const indecies = event.target.value;
                if (indecies && Array.isArray(indecies)) {
                  props.onChange({
                    ...(props.edgeAggregations || {}),
                    targetGroupAggregationIndecies: indecies.map(Number),
                  });
                }
              }}
              renderValue={(selected) =>
                selected.map((index) => (props?.targetGroupAggregations?.[index] ? groupAggregationToLabel(props?.targetGroupAggregations?.[index]) : "")).join(", ")
              }
              size="small"
            >
              {(props.targetGroupAggregations || []).map(renderItem)}
            </Select>
          </FormControl>
        </Grid>
      ) : null}
    </Grid>
  );
}
