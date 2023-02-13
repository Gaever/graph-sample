import { fitPadding } from "./helpers";
import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

function transformLayoutFromTopLeftOfSelectedBb(elements: cytoscape.NodeCollection) {
  const bb = elements.boundingBox({});

  return (_node: cytoscape.NodeSingular, pos: cytoscape.Position) => {
    return {
      x: bb.x1 + pos.x,
      y: bb.y1 + pos.y,
    };
  };
}

export function layoutAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "LAYOUT") return;

  let elements: cytoscape.NodeCollection = cy.elements();

  if (props.graphState.selectedNodeGroups.size > 0 || props.graphState.selectedNodes.size > 0) {
    elements = cy.$("*:selected[id !*= 'drawing']");
  }

  const transform = transformLayoutFromTopLeftOfSelectedBb(elements);

  switch (action.payload) {
    case "cose": {
      elements.layout({ name: action.payload, animate: true, componentSpacing: 3000, nodeOverlap: 100, padding: fitPadding }).run();
      break;
    }

    case "dagre": {
      elements
        .layout({
          name: "dagre",
          spacingFactor: 1.5,
          animate: true,
          padding: fitPadding,
          nodeDimensionsIncludeLabels: true,
          transform,
        })
        .run();
      break;
    }

    case "klay": {
      elements
        .layout({
          name: "klay",
          // @ts-ignore
          animate: true,
          padding: fitPadding,
          nodeDimensionsIncludeLabels: true,
          klay: {
            direction: "RIGHT",
            layoutHierarchy: true,
          },
          transform,
        })
        .run();
      break;
    }

    case "circle": {
      elements
        .layout({
          name: "circle",
          animate: true,
          padding: fitPadding,
          transform,
        })
        .run();
      break;
    }

    case "grid": {
      elements.layout({ name: "grid", animate: true, padding: fitPadding, transform }).run();
      break;
    }

    case "concentric": {
      elements.layout({ name: "concentric", animate: true, padding: fitPadding, minNodeSpacing: fitPadding, transform }).run();
      break;
    }
  }
}
