import { Graph } from "../http/api";
import { filters, GraphState, GuiState, LegendSettingsState } from "../types";
import AddIcon from "@mui/icons-material/Add";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper, { PaperProps } from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import IconFilter from "./icon-filter";
import SystemIdFilter from "./system-id-filter";
import AttributeFilter from "./attribute-filter";

export interface FilterProps {
  icons: Graph["icons"];
  isIgnoreDashboardFilters?: GuiState["isIgnoreDashboardFilters"];
  attributesMap: GraphState["attributesMap"];
  metaAttributesMap?: GraphState["metaAttributesMap"];
  usedNodeIcons: LegendSettingsState["usedNodeIcons"];
  systemIds: GraphState["nodeSystemIds"] | GraphState["edgeSystemIds"];
  systemTypes: GraphState["nodeTypesMap"] | GraphState["edgeTypesMap"];
  filters: filters;
  hideHeader?: boolean;
  isDashboard?: boolean;
  onChange?: (filters: filters, isApplyOnDashboard?: boolean) => void;
  onToggleisIgnoreDashboardFilters?: (value: boolean) => void;
  onClose?: () => void;
  onSelectOpen?: () => void;
  onSelectClose?: () => void;
  onStateChange?: (filters?: filters) => void;
  PaperProps?: PaperProps;
  displayedOptions?: ("icon" | "system-id" | "attributes" | "meta-attributes" | "hide-filtered" | "accept-dashboard-filters-cb")[];
  SubmitComponent?: (props: FilterProps) => React.ReactElement;
}

export const initialFilterState: filters = {
  icons: [],
  attributes: [],
  metaAttributes: [],
  systemIds: [],
  isHideFiltered: false,
};

export interface AttributeFilterRowProps extends Pick<FilterProps, "onSelectClose" | "onSelectOpen"> {
  filterStateAttributes: filters["attributes"] | filters["metaAttributes"];
  attributesMap: Map<string, string>;
  onChange: (item: filters["attributes"][number] | filters["metaAttributes"][number], index: number) => void;
  onRemoveClick: (index: number) => void;
  onAddIconClick: () => void;
  attributeSelectPlaceholder?: string;
}

function AttributeFilterRow(props: AttributeFilterRowProps) {
  const { filterStateAttributes, attributesMap, onSelectClose, onSelectOpen, onChange, onRemoveClick, onAddIconClick, attributeSelectPlaceholder } = props;

  return (
    <>
      {filterStateAttributes.map((attributeFilter, index) => {
        return (
          <Grid item xs={12} justifyContent="space-between" alignItems="center" display="flex" key={`${attributeFilter.filterKey}${attributeFilter.condition}${index}`}>
            <AttributeFilter
              {...attributeFilter}
              attributeSelectPlaceholder={attributeSelectPlaceholder}
              attributesMap={attributesMap}
              onSelectClose={onSelectClose}
              onSelectOpen={onSelectOpen}
              onChange={(item) => {
                onChange(item, index);
              }}
              onRemoveClick={() => {
                onRemoveClick(index);
              }}
            />
          </Grid>
        );
      })}

      <Grid item xs={12} justifyContent="flex-end" alignItems="center" display="flex">
        <Paper sx={{ width: "100%", height: "40px", borderStyle: "dashed", borderWidth: 2 }} variant="outlined" />
        <Box sx={{ ml: 1 }}>
          <IconButton size="small" onClick={onAddIconClick}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Grid>
    </>
  );
}

export default function Filter(props: FilterProps) {
  const [filterState, setFilterState] = useState<filters>({
    attributes: props.filters.attributes.length < 1 ? [{}] : props.filters.attributes,
    metaAttributes: (props.filters?.metaAttributes?.length || 0) < 1 ? [{}] : props.filters?.metaAttributes || [],
    icons: props.filters.icons,
    systemIds: props.filters.systemIds,
    isHideFiltered: props.filters.isHideFiltered,
  });

  const sortedAttributes = [...props.attributesMap.entries()].sort();
  const attributesMap = new Map([["Подпись", "Подпись"], ...sortedAttributes]);

  const flattenMetaAttributes = useMemo(() => {
    const m: Map<string, string> = new Map();

    Array.from(props.metaAttributesMap?.keys?.() || []).forEach((key) => {
      m.set(key, props.metaAttributesMap?.get(key)?.label!);
    });

    return m;
  }, [props.metaAttributesMap]);

  const sortedMetaAttributes = [...(flattenMetaAttributes?.entries?.() || [])].sort();
  const metaAttributesMap = new Map(sortedMetaAttributes);

  const systemIds = useMemo(() => Array.from(props.systemIds), [props.systemIds]);

  useEffect(() => {
    props?.onStateChange?.(filterState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterState]);

  return (
    <Paper sx={{ p: 2, maxWidth: "750px" }} {...props.PaperProps}>
      <Grid container spacing={2}>
        {props.hideHeader ? null : (
          <Grid item xs={12} justifyContent="space-between" alignItems="center" display="flex">
            <Typography>Фильтр</Typography>
            <IconButton size="small" onClick={props.onClose}>
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </Grid>
        )}

        {!props.displayedOptions || props.displayedOptions?.some((item) => item === "icon") ? (
          <Grid item xs={12} justifyContent="space-between" alignItems="center" display="flex">
            <IconFilter
              icons={props.icons}
              usedNodeIcons={props.usedNodeIcons}
              selectedIcons={filterState.icons || ""}
              onSelectOpen={props.onSelectOpen}
              onSelectClose={props.onSelectClose}
              onChange={(icons) => {
                setFilterState((prev) => ({ ...prev, icons }));
              }}
              onClearClick={() => {
                setFilterState((prev) => ({ ...prev, icons: [] }));
              }}
            />
          </Grid>
        ) : null}
        {!props.displayedOptions || props.displayedOptions?.some((item) => item === "system-id") ? (
          <Grid item xs={12} justifyContent="space-between" alignItems="center" display="flex">
            <SystemIdFilter
              systemTypes={props.systemTypes}
              systemIds={systemIds}
              selectedSystemIds={filterState.systemIds}
              onSelectOpen={props.onSelectOpen}
              onSelectClose={props.onSelectClose}
              onChange={(systemIds) => {
                setFilterState((prev) => ({ ...prev, systemIds: systemIds }));
              }}
              onClearClick={() => {
                setFilterState((prev) => ({ ...prev, systemIds: [] }));
              }}
            />
          </Grid>
        ) : null}
        {!props.displayedOptions || props.displayedOptions?.some((item) => item === "attributes") ? (
          <AttributeFilterRow
            attributeSelectPlaceholder="по атрибутам"
            filterStateAttributes={filterState.attributes}
            attributesMap={attributesMap}
            onAddIconClick={() => {
              setFilterState((prev) => ({
                ...prev,
                attributes: [...prev.attributes, {}],
              }));
            }}
            onChange={(attributeFilter, index) => {
              const filters = [...filterState.attributes];
              filters.splice(index, 1, attributeFilter);

              setFilterState((prev) => ({
                ...prev,
                attributes: filters,
              }));
            }}
            onRemoveClick={(index) => {
              const filters = [...filterState.attributes];
              filters.splice(index, 1);

              if (filters.length < 1) filters.push({});

              setFilterState((prev) => ({
                ...prev,
                attributes: filters,
              }));
            }}
            onSelectClose={props.onSelectClose}
            onSelectOpen={props.onSelectOpen}
          />
        ) : null}

        {!props.displayedOptions || props.displayedOptions?.some((item) => item === "meta-attributes") ? (
          <AttributeFilterRow
            attributeSelectPlaceholder="по мета-полям"
            filterStateAttributes={filterState.metaAttributes}
            attributesMap={metaAttributesMap}
            onAddIconClick={() => {
              setFilterState((prev) => ({
                ...prev,
                attributes: [...prev.metaAttributes, {}],
              }));
            }}
            onChange={(metaAttributeFilter, index) => {
              const filters = [...filterState.metaAttributes];
              filters.splice(index, 1, metaAttributeFilter);

              setFilterState((prev) => ({
                ...prev,
                metaAttributes: filters,
              }));
            }}
            onRemoveClick={(index) => {
              const filters = [...filterState.metaAttributes];
              filters.splice(index, 1);

              if (filters.length < 1) filters.push({});

              setFilterState((prev) => ({
                ...prev,
                metaAttributes: filters,
              }));
            }}
            onSelectClose={props.onSelectClose}
            onSelectOpen={props.onSelectOpen}
          />
        ) : null}

        <Grid item xs={12}>
          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "hide-filtered") ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterState.isHideFiltered}
                  size="small"
                  onChange={() => {
                    setFilterState((prev) => ({ ...prev, isHideFiltered: !prev.isHideFiltered }));
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
              label="Скрывать отфильтрованное"
            />
          ) : null}

          {!props.displayedOptions || props.displayedOptions?.some((item) => item === "accept-dashboard-filters-cb") ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={props.isIgnoreDashboardFilters}
                  size="small"
                  onChange={() => {
                    props.onToggleisIgnoreDashboardFilters?.(!props.isIgnoreDashboardFilters);
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
              label="Игнорировать фильтры дашборда"
            />
          ) : null}
        </Grid>

        {props.SubmitComponent !== undefined ? (
          props.SubmitComponent?.(props)
        ) : (
          <Grid item xs={12}>
            <Stack spacing={1} direction="row">
              <Button
                variant="contained"
                onClick={() => {
                  props.onChange?.(filterState);
                }}
              >
                Применить
              </Button>
              {/* {props.isDashboard ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    props.onChange?.(filterState, true);
                    props.onClose?.();
                  }}
                >
                  Применить на дашборде
                </Button>
              ) : null} */}
              <Button
                variant="outlined"
                onClick={() => {
                  setFilterState({
                    ...initialFilterState,
                    attributes: [{}],
                    metaAttributes: [{}],
                  });
                  props.onChange?.(initialFilterState);
                }}
              >
                Очистить
              </Button>
            </Stack>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
