import { hashStyle } from "../../format-response";
import { CyCallbackAction, StylesheetDefaults, StylesheetMap, UseDispatchCyActionProps } from "../../../types";
import { isDrawing } from "../../../utils";
import cytoscape from "cytoscape";
import { getUserClass, refreshStylesheet } from "./helpers";

function createNewNodeStylesheet(knightClassName: string | undefined, stylesheetMap: StylesheetMap, zIndex: number): cytoscape.Css.Node {
  const existNodeStylesheet = knightClassName ? stylesheetMap.get(knightClassName) : undefined;
  const newNodeStylesheet: cytoscape.Css.Node = existNodeStylesheet ? ({ ...existNodeStylesheet.style } as cytoscape.Css.Node) : {};
  newNodeStylesheet["z-index"] = zIndex;

  return newNodeStylesheet;
}

function applyNewNodeStylesheet(node: cytoscape.NodeSingular, oldUserClassName: string | undefined, newUserClassName: string) {
  if (oldUserClassName) {
    node.removeClass(oldUserClassName);
  }
  node.addClass(newUserClassName);
}

function applyNewZindex(node: cytoscape.NodeSingular, newStylesheetMap: StylesheetMap, zIndex: number) {
  if (isDrawing(node)) {
    node.style("z-index", zIndex);
    return;
  }
  const oldUserClassName = getUserClass(node);
  const newStylesheet = createNewNodeStylesheet(oldUserClassName, newStylesheetMap, zIndex);
  const newUserClassName = hashStyle(newStylesheet);
  const selector = `.${newUserClassName}`;
  newStylesheetMap.set(selector, { style: newStylesheet, selector });
  applyNewNodeStylesheet(node, oldUserClassName, newUserClassName);
}

export function bringToFrontAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps, stylesheetDefaults: StylesheetDefaults) {
  if (action.type !== "BRING_TO_FRONT") return;

  const newMaxZindex = props.guiState.maxZindex + 1;
  const newStylesheetMap = new Map(props.graphState.stylesheetMap);

  cy.batch(() => {
    cy.nodes(":selected").forEach((node) => {
      applyNewZindex(node, newStylesheetMap, newMaxZindex);
    });
  });

  props.dispatchGraphAction({ type: "SET_STYLESHEET_MAP", payload: newStylesheetMap });
  refreshStylesheet(props, stylesheetDefaults, newStylesheetMap);
  props.dispatchGuiAction({ type: "SET_MAX_Z_INDEX", payload: newMaxZindex });
}

export function bringToBackAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps, stylesheetDefaults: StylesheetDefaults) {
  if (action.type !== "BRING_TO_BACK") return;

  const newMinZindex = props.guiState.minZindex - 1;
  const newStylesheetMap = new Map(props.graphState.stylesheetMap);

  cy.batch(() => {
    cy.nodes(":selected").forEach((node) => {
      applyNewZindex(node, newStylesheetMap, 0);
    });
  });

  props.dispatchGraphAction({ type: "SET_STYLESHEET_MAP", payload: newStylesheetMap });
  refreshStylesheet(props, stylesheetDefaults, newStylesheetMap);
  props.dispatchGuiAction({ type: "SET_MIN_Z_INDEX", payload: newMinZindex });
}
