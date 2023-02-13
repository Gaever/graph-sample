import { attributeFilterCondition, dashboardFilterCondition } from "../types";

export const changeGraphFiltersEventName = "changeGraphFilters";
export const onChangeDashboardFiltersEventName = "updateGraphFilters";
export const appFilperOperatorsToBackendFilterOperators: Record<Exclude<attributeFilterCondition, "str-fuzzy" | "date-range">, dashboardFilterCondition> = {
  "str-eq": "=",
  "str-include": "%LIKE%",
  "str-not-include": "NOT LIKE",
  "str-start": "LIKE%",
  "str-end": "%LIKE",
  null: "EMPTY",
  "not-null": "NOT EMPTY",
  "num-gt": ">",
  "num-lt": "<",
  "num-gte": ">=",
  "num-lte": "<=",
  "num-eq": "=",
  "num-neq": "!=",
};

export const backendFilterOperatorsToAppFilperOperators: Record<dashboardFilterCondition, attributeFilterCondition> = {
  "=": "str-eq",
  "%LIKE%": "str-include",
  "NOT LIKE": "str-not-include",
  "LIKE%": "str-start",
  "%LIKE": "str-end",
  EMPTY: "null",
  NULL: "null",
  "NOT EMPTY": "not-null",
  "NOT NULL": "not-null",
  ">": "num-gt",
  "<": "num-lt",
  ">=": "num-gte",
  "<=": "num-lte",
  "!=": "num-neq",
};
