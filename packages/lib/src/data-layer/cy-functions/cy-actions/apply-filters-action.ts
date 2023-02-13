import { appFilperOperatorsToBackendFilterOperators, backendFilterOperatorsToAppFilperOperators } from "../../constants";
import { CSS_AGGREGATIONS, CSS_AGGREGATIONS_HIDDEN, CSS_CONNECTIONS_COUNT, CSS_CONNECTIONS_COUNT_HIDDEN, CSS_FILTERED, CSS_FILTERED_HIDDEN } from "../../cy-constants";
import { Field, MetaField, Node } from "../../../http/api";
import { attributeFilter, CyCallbackAction, CyEdge, CyNode, dashboardFilter, filters, mappedFilterData, UseDispatchCyActionProps } from "../../../types";
import { isNodeGroup } from "../../../utils";
import Big from "big.js";
import cytoscape from "cytoscape";
import Fuse from "fuse.js";
import _isEmpty from "lodash/isEmpty";
import moment from "moment";

export function mapDashboardFiltersToAppFilters(dashboardFilters: dashboardFilter[], currentFilters: filters) {
  const [attributes, metaAttributes] = mapDashboardFiltersToGraphAttributeFilters(dashboardFilters);

  const filters: filters = {
    ...currentFilters,
    attributes,
    metaAttributes,
  };

  return filters;
}

export function mapDashboardFiltersToGraphAttributeFilters(dashboardFilters: dashboardFilter[]) {
  const attributes: filters["attributes"] = [];
  const metaAttributes: filters["metaAttributes"] = [];

  dashboardFilters.forEach((item) => {
    const res = item.meta_field ? metaAttributes : attributes;
    if ([">", "<", ">=", "<=", "="].includes(item.condition_enum) && (item.condition_value || "").trim().match(/^\d{4}-\d{2}-\d{2}$/)) {
      const dateRange =
        ((item.condition_enum === ">" || item.condition_enum === ">=") && { from: new Date(item.condition_value!) }) ||
        ((item.condition_enum === "<" || item.condition_enum === "<=") && { to: new Date(item.condition_value!) }) ||
        (item.condition_enum === "=" && { to: new Date(item.condition_value!), from: new Date(item.condition_value!) }) ||
        {};
      res.push({
        filterKey: item.crud_field_name || `${item.meta_field_id}`,
        condition: "date-range",
        dateRange,
      });
      return;
    }
    res.push({
      condition: backendFilterOperatorsToAppFilperOperators[item.condition_enum],
      filterKey: item.crud_field_name || `${item.meta_field_id}`,
      value: item.condition_value,
    });
  });
  return [attributes, metaAttributes];
}

export function mapGraphFiltersToDashboardFilters(filters: filters) {
  const res: dashboardFilter[] = [];
  filters.attributes.forEach((item) => {
    if (!item.filterKey || !item.condition) return;
    if (item.condition === "str-fuzzy") {
      // res.push({
      //   // meta_field:
      //   condition_enum: appFilperOperatorsToBackendFilterOperators["str-eq"],
      //   crud_field_name: item.filterKey,
      //   condition_value: item.value,
      // });
      return;
    }

    if (item.condition === "date-range") {
      const condition = (item.dateRange?.from && ">=") || (item.dateRange?.to && "<=");
      const value = moment(item.dateRange?.from || item.dateRange?.to).format("YYYY-MM-DD");

      if (!condition) return;

      // res.push({
      //   condition_enum: condition,
      //   crud_field_name: item.filterKey,
      //   condition_value: value,
      // });
      return;
    }

    // res.push({
    //   condition_enum: appFilperOperatorsToBackendFilterOperators[item.condition],
    //   crud_field_name: item.filterKey,
    //   condition_value: item.value,
    // });
  });
  return res;
}

export function mapFiltersToDashboardLikeFilters(filters: filters) {
  const newFilters = { ...filters };
  const attributes: typeof filters["attributes"] = [];

  newFilters.attributes.forEach((item) => {
    if (item.condition === "str-fuzzy") {
      attributes.push({
        ...item,
        fuzzyValue: "1",
      });
    } else if (item.condition === "date-range") {
      if (item.dateRange?.from) {
        attributes.push({
          ...item,
          dateRange: { from: item.dateRange?.from },
        });
      }
      if (item.dateRange?.to) {
        attributes.push({
          ...item,
          dateRange: { to: item.dateRange?.to },
        });
      }
    } else {
      attributes.push(item);
    }
  });

  newFilters.attributes = attributes;

  return newFilters;
}

function applyFilterCondition(fieldValue: Field["value"], filter: attributeFilter, displayedLabel?: string | undefined) {
  const filterKeyIsLabel = filter.filterKey === "Подпись";

  const filterValueStr = filter?.value?.toString?.()?.trim?.();
  const filterValueDate = new Date(filterValueStr || "");

  const lowercasedFilterValueStr = filterValueStr?.toLowerCase?.() || "";
  const filterValueNum = parseFloat(filter?.value || "");

  const attributeValueStr = (fieldValue || (filterKeyIsLabel && displayedLabel) || "")?.toString?.()?.trim?.();
  const lowercasedAtributeValueStr = attributeValueStr?.toLowerCase?.() || "";
  const attributeValueNum = parseFloat(attributeValueStr || "");

  const valuesAreEmpty = _isEmpty(attributeValueStr) && _isEmpty(filterValueStr);

  const attributeDateValue = new Date(attributeValueStr || "");
  const attributeDateTs = attributeDateValue.getTime();
  const filterValueDateTs = filterValueDate.getTime();

  const isDateString = filterValueDate.toString() !== "Invalid Date" || !isNaN(attributeDateTs);

  switch (filter.condition) {
    case "str-eq":
      if (valuesAreEmpty) return true;
      return lowercasedFilterValueStr === lowercasedAtributeValueStr;

    case "str-include": {
      if (valuesAreEmpty) return true;
      return lowercasedAtributeValueStr.indexOf(lowercasedFilterValueStr) !== -1;
    }

    case "str-not-include": {
      if (valuesAreEmpty) return false;
      return lowercasedAtributeValueStr.indexOf(lowercasedFilterValueStr) === -1;
    }

    case "str-start": {
      if (valuesAreEmpty) return false;
      return lowercasedAtributeValueStr.indexOf(lowercasedFilterValueStr) === 0;
    }

    case "str-end": {
      if (valuesAreEmpty) return false;
      return lowercasedAtributeValueStr.indexOf(lowercasedFilterValueStr) === lowercasedAtributeValueStr.length - lowercasedFilterValueStr.length;
    }

    case "null": {
      return valuesAreEmpty;
    }

    case "not-null": {
      return !valuesAreEmpty;
    }

    case "str-fuzzy": {
      const threshold = +(filter.fuzzyValue || 0);
      if (isNaN(threshold)) return false;

      if (valuesAreEmpty) return true;

      const fuse = new Fuse([attributeValueStr], {
        isCaseSensitive: false,
        threshold: 1 - threshold,
      });
      return fuse.search(filterValueStr || "").length > 0;
    }

    case "num-eq": {
      if (isNaN(filterValueNum) || isNaN(attributeValueNum)) return false;
      return new Big(attributeValueNum).eq(filterValueNum);
    }

    case "num-neq": {
      if (isNaN(filterValueNum) || isNaN(attributeValueNum)) return false;
      return !new Big(attributeValueNum).eq(filterValueNum);
    }

    case "num-gt": {
      if (isDateString) {
        return !isNaN(filterValueDateTs) && attributeDateTs > filterValueDateTs;
      } else if (isNaN(filterValueNum) || isNaN(attributeValueNum)) return false;
      return new Big(attributeValueNum).gt(filterValueNum);
    }

    case "num-lt": {
      if (isDateString) {
        return !isNaN(filterValueDateTs) && attributeDateTs < filterValueDateTs;
      } else if (isNaN(filterValueNum) || isNaN(attributeValueNum)) return false;
      return new Big(attributeValueNum).lt(filterValueNum);
    }

    case "num-gte": {
      if (isDateString) {
        return !isNaN(filterValueDateTs) && attributeDateTs >= filterValueDateTs;
      } else if (isNaN(filterValueNum) || isNaN(attributeValueNum)) return false;
      return new Big(attributeValueNum).gte(filterValueNum);
    }

    case "num-lte": {
      if (isDateString) {
        return !isNaN(filterValueDateTs) && attributeDateTs <= filterValueDateTs;
      } else if (isNaN(filterValueNum) || isNaN(attributeValueNum)) return false;
      return new Big(attributeValueNum).lte(filterValueNum);
    }

    case "date-range": {
      const filterDateFrom = filter.dateRange?.from;
      const filterDateTo = filter.dateRange?.to;

      const filterTsFrom = Number(filterDateFrom);
      const filterTsTo = Number(filterDateTo);

      const attributeDateValue = new Date(attributeValueStr || "");
      const attributeDateTs = attributeDateValue.getTime();

      if (isNaN(attributeDateTs)) return false;

      if (isNaN(filterTsTo) && !isNaN(filterTsFrom)) return attributeDateTs >= filterTsFrom;
      if (isNaN(filterTsFrom) && !isNaN(filterTsTo)) return attributeDateTs <= filterTsTo;

      if (filterTsTo === filterTsFrom) {
        return attributeDateTs >= filterTsFrom && attributeDateTs <= filterTsTo + 1000 * 60 * 60 * 24;
      }

      return attributeDateTs >= filterTsFrom && attributeDateTs <= filterTsTo;
    }

    default:
      return false;
  }
}

export function applyFilterFunction(
  elementAttributes: Record<string, Field>,
  elementMetaAttributes: Record<string, Field["value"][]> | null,
  filter: attributeFilter,
  displayedLabel?: string | undefined
): boolean {
  const filterKeyIsLabel = filter.filterKey === "Подпись";

  if (!elementMetaAttributes && (!filter.filterKey || (!elementAttributes[filter.filterKey] && !filterKeyIsLabel))) {
    if (["str-not-include", "num-neq"].includes(filter.condition || "")) {
      return true;
    }
    return false;
  }

  if (elementMetaAttributes && (!filter.filterKey || !elementMetaAttributes[filter.filterKey])) {
    if (["str-not-include", "num-neq"].includes(filter.condition || "")) {
      return true;
    }
    return false;
  }

  const fieldValues = elementMetaAttributes ? elementMetaAttributes[filter.filterKey!] : [elementAttributes[filter.filterKey!]?.value];

  return fieldValues.some((fieldValue) => applyFilterCondition(fieldValue, filter, displayedLabel));
}

export function applyFilterConditions(filterData: mappedFilterData, elementData: CyNode["data"] | CyEdge["data"]): boolean {
  const { iconsSet, systemIdsSet, attributeFilters, metaAttributeFilters } = filterData;

  // @ts-ignore
  if (iconsSet.size > 0 && !iconsSet.has(elementData?.payload?.icon || "")) {
    return false;
  }

  if (systemIdsSet.size > 0 && !systemIdsSet.has(elementData?.payload?.system_id || "")) {
    return false;
  }

  if (attributeFilters && attributeFilters.length > 0) {
    const payload = elementData?.payload as Node;
    const attributes = payload.data || [];
    const attributeMap: Record<string, Field> = {};

    if ((!attributes || attributes.length < 1) && !elementData?.label) {
      return false;
    } else {
      (payload.data || []).forEach((item) => {
        if (item.key) {
          attributeMap[item.key] = item;
        }
      });

      const isExcluded = attributeFilters.find((filter) => !applyFilterFunction(attributeMap, null, filter, elementData?.label));

      if (isExcluded) {
        return false;
      }
    }
  }

  if (metaAttributeFilters && metaAttributeFilters.length > 0) {
    const payload = elementData?.payload as Node;
    const attributes = payload.data || [];
    const attributeMap: Record<string, Field> = {};
    const metaAttributeMap: Record<string, Field["value"][]> = {};

    if ((!attributes || attributes.length < 1) && !elementData?.label) {
      return false;
    } else {
      (payload.data || []).forEach((item) => {
        if (item.key) {
          attributeMap[item.key] = item;
          item.meta_fields?.forEach?.((metaField) => {
            if (!metaAttributeMap[metaField.id!]) {
              metaAttributeMap[metaField.id!] = [];
            }
            metaAttributeMap[metaField.id!].push(item.value!);
          });
        }
      });

      const isExcluded = metaAttributeFilters.find((filter) => !applyFilterFunction(attributeMap, metaAttributeMap, filter, elementData?.label));

      if (isExcluded) {
        return false;
      }
    }
  }

  return true;
}

export function mapFilterData(filters: filters): mappedFilterData {
  const iconsSet: Set<string> = new Set();
  const nodeSystemIdsSet: Set<string> = new Set();

  filters.icons.forEach((item) => {
    iconsSet.add(item);
  });
  filters.systemIds.forEach((item) => {
    nodeSystemIdsSet.add(item);
  });
  const attributeFilters = filters.attributes.filter((item) => !!item.filterKey);
  const metaAttributeFilters = (filters?.metaAttributes || []).filter((item) => !!item.filterKey);

  return {
    iconsSet,
    systemIdsSet: nodeSystemIdsSet,
    attributeFilters,
    metaAttributeFilters,
  };
}

export function exclude(element: cytoscape.NodeSingular, isHideFiltered: boolean) {
  if (isHideFiltered) {
    element.removeClass(CSS_FILTERED);
    element.addClass(CSS_FILTERED_HIDDEN);
    if (element.hasClass(CSS_AGGREGATIONS)) {
      element.removeClass(CSS_AGGREGATIONS);
      element.addClass(CSS_AGGREGATIONS_HIDDEN);
    }
    if (element.hasClass(CSS_CONNECTIONS_COUNT)) {
      element.removeClass(CSS_CONNECTIONS_COUNT);
      element.addClass(CSS_CONNECTIONS_COUNT_HIDDEN);
    }
  } else {
    element.removeClass(CSS_FILTERED_HIDDEN);
    element.addClass(CSS_FILTERED);
  }
}

export function show(element: cytoscape.NodeSingular) {
  element.removeClass(`${CSS_FILTERED} ${CSS_FILTERED_HIDDEN}`);
  if (element.hasClass(CSS_AGGREGATIONS_HIDDEN)) {
    element.addClass(CSS_AGGREGATIONS);
    element.removeClass(CSS_AGGREGATIONS_HIDDEN);
  }
  if (element.hasClass(CSS_CONNECTIONS_COUNT_HIDDEN)) {
    element.removeClass(CSS_CONNECTIONS_COUNT_HIDDEN);
    element.addClass(CSS_CONNECTIONS_COUNT);
  }
}

export function applyFiltersAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "APPLY_FILTERS") return;
  const expandCollapse = cy.expandCollapse("get");

  const filters = action.payload;
  const isHideFiltered = !!action.payload.isHideFiltered;
  const filterData = mapFilterData(filters);
  const { iconsSet, systemIdsSet: nodeSystemIdsSet, attributeFilters, metaAttributeFilters } = filterData;

  if (iconsSet.size < 1 && nodeSystemIdsSet.size < 1 && attributeFilters.length < 1 && metaAttributeFilters.length < 1) {
    cy.batch(() => {
      const collapsedGroups: cytoscape.NodeCollection = expandCollapse.expandableNodes();
      expandCollapse.expandAll();

      cy.$(`.${CSS_FILTERED},.${CSS_FILTERED_HIDDEN}`).removeClass(`${CSS_FILTERED} ${CSS_FILTERED_HIDDEN}`);
      const groupsWithHiddenAggregations = cy.$(`.${CSS_AGGREGATIONS}`);
      groupsWithHiddenAggregations.removeClass(CSS_AGGREGATIONS_HIDDEN);
      groupsWithHiddenAggregations.addClass(CSS_AGGREGATIONS);

      expandCollapse.collapse(collapsedGroups);
    });
    return;
  }

  cy.batch(() => {
    const collapsedGroups: cytoscape.NodeCollection = expandCollapse.expandableNodes();
    expandCollapse.expandAll();

    cy.$("node[id !*= 'drawing']").forEach((element) => {
      if (isNodeGroup(element)) {
        let showGroup = false;
        Array.from(element.children()).forEach((node) => {
          const pass = applyFilterConditions(filterData, node.data());
          if (pass) {
            showGroup = true;
            show(node);
          } else {
            exclude(node, isHideFiltered);
          }
        });
        if (showGroup) {
          show(element);
        } else {
          exclude(element, isHideFiltered);
        }
      } else {
        const pass = applyFilterConditions(filterData, element.data());
        if (pass) {
          show(element);
        } else {
          exclude(element, isHideFiltered);
        }
      }
    });

    expandCollapse.collapse(collapsedGroups);

    // https://jira.alfakom.org/browse/VITYAZ3-1153
    // "отобранные по результатам фильтра иконки автоматически селектить"
    if (iconsSet.size > 0) {
      cy.elements().unselect();
      cy.$("node[id !*= 'drawing']").not(`.${CSS_FILTERED},.${CSS_FILTERED_HIDDEN}`).select();
    }
  });
}
