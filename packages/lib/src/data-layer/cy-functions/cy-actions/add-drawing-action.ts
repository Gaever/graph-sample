import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import { v4 as uuid } from "uuid";
import _random from "lodash/random";
import { CSS_DRAWING } from "../../cy-constants";
import { fitPadding } from "./helpers";

export function addDrawingAction(cy: cytoscape.Core, action: CyCallbackAction, _props: UseDispatchCyActionProps) {
  if (action.type !== "ADD_DRAWING") return;
  const bb = cy.elements().boundingBox({});
  const style: cytoscape.Css.Node = {
    "border-color": "#42a5f5",
    "background-color": "#42a5f5",
    "border-width": "0px",
  };
  const drawing: cytoscape.NodeDefinition = {
    data: {
      id: `drawing-${uuid()}`,
      label: "",
      style,
    },
    position: {
      x: _random(bb.x1, bb.x2),
      y: _random(bb.y1, bb.y2),
    },
    classes: CSS_DRAWING,
  };
  const el = cy.add(drawing);
  el.style("z-index", 10000);

  if (bb.h === 0 && bb.w === 0 && bb.x1 === 0 && bb.x2 === 0 && bb.y1 === 0 && bb.y2 === 0) {
    cy.fit(undefined, fitPadding);
  }
}
