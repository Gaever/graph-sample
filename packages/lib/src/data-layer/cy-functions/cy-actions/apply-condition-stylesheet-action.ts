import { ConditionStyle, CyCallbackAction, mappedFilterData, StylesheetDefaults, UseDispatchCyActionProps } from "../../../types";
import { isEdgeGroup, isNodeGroup, isUserClassName, removeLeadingDot } from "../../../utils";
import cytoscape from "cytoscape";
import { applyFilterConditions, mapFilterData } from "./apply-filters-action";

export function applyConditionStylesheetAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps, stylesheetDefaults: StylesheetDefaults) {
  if (action.type !== "APPLY_CONDITION_STYLE") return;

  if (action.payload.kind === "node") {
    applyConditionStylesheetToNodes(cy, action.payload.item);
  }

  if (action.payload.kind === "edge") {
    applyConditionStylesheetToEdges(cy, action.payload.item);
  }
}

function processPassed(element: cytoscape.SingularElementArgument, className: string) {
  let userClassName = "";
  const classes = [
    ...(element.classes() as unknown as string[]).filter((item) => {
      if (isUserClassName(item)) {
        userClassName = item;
        return false;
      }
      return true;
    }),
  ];
  classes.push(className);
  element.classes(classes);
  if (userClassName) element.addClass(userClassName);
}

function processNotPassed(element: cytoscape.SingularElementArgument, className: string) {
  element.removeClass(className);
}

export function applyConditionStylesheetToNode(element: cytoscape.SingularElementReturnValue, filterData: mappedFilterData, className: string) {
  if (isNodeGroup(element)) {
    element.children().forEach((node) => {
      const pass = applyFilterConditions(filterData, node.data());
      if (pass) {
        processPassed(node, className);
      } else {
        processNotPassed(node, className);
      }
    });
  } else {
    const pass = applyFilterConditions(filterData, element.data());
    if (pass) {
      processPassed(element, className);
    } else {
      processNotPassed(element, className);
    }
  }
}

export function applyConditionStylesheetToEdge(element: cytoscape.SingularElementReturnValue, filterData: mappedFilterData, className: string) {
  if (isEdgeGroup(element)) {
    ((element.data("collapsedEdges") || []) as cytoscape.EdgeCollection).forEach((child) => {
      const pass = applyFilterConditions(filterData, child.data());
      if (pass) {
        processPassed(child, className);
      } else {
        processNotPassed(child, className);
      }
    });
  } else {
    const pass = applyFilterConditions(filterData, element.data());
    if (pass) {
      processPassed(element, className);
    } else {
      processNotPassed(element, className);
    }
  }
}

function applyConditionStylesheetToNodes(cy: cytoscape.Core, conditionStylesheet: ConditionStyle) {
  const expandCollapse = cy.expandCollapse("get");
  const filters = conditionStylesheet.filter;
  const className = removeLeadingDot(conditionStylesheet.selector);
  const filterData = mapFilterData(filters);

  cy.batch(() => {
    const collapsedGroups: cytoscape.NodeCollection = expandCollapse.expandableNodes();
    expandCollapse.expandAll();

    cy.$("node[id !*= 'drawing']").forEach((element) => {
      applyConditionStylesheetToNode(element, filterData, className);
    });

    requestAnimationFrame(() => {
      // Баг, без requestAnimationFrame элементы в свернутых группах
      // не применяют новые стили.
      // С requestAnimationFrame происходит видимое раскрытие и скрытие групп на мгновение.
      // Решение пока не найдено.
      expandCollapse.collapse(collapsedGroups);
    });
  });
}

function applyConditionStylesheetToEdges(cy: cytoscape.Core, conditionStylesheet: ConditionStyle) {
  const expandCollapse = cy.expandCollapse("get");
  const filters = conditionStylesheet.filter;
  const className = removeLeadingDot(conditionStylesheet.selector);
  const filterData = mapFilterData(filters);

  cy.batch(() => {
    const collapsedGroups: cytoscape.NodeCollection = expandCollapse.expandableNodes();
    expandCollapse.expandAll();

    cy.$("edge").forEach((element) => {
      applyConditionStylesheetToEdge(element, filterData, className);
    });

    requestAnimationFrame(() => {
      // Баг, без requestAnimationFrame элементы в свернутых группах
      // не применяют новые стили.
      // С requestAnimationFrame происходит видимое раскрытие и скрытие групп на мгновение.
      // Решение пока не найдено.

      expandCollapse.collapse(collapsedGroups);
    });
  });
}

export function getElementDefinitionClassesByConditionStylesheets(conditionStylesheetMap: Map<string, ConditionStyle>, element: cytoscape.ElementDefinition) {
  const classes: string[] = [];
  conditionStylesheetMap.forEach((conditionStylesheet, selector) => {
    const filterData = mapFilterData(conditionStylesheet.filter);
    const className = removeLeadingDot(selector);

    const pass = applyFilterConditions(filterData, element.data);
    if (pass) {
      classes.push(className);
    }
  });
  return classes;
}
