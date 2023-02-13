import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function alignAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "ALIGN") return;

  const selectedNodes = cy.$("node:selected");
  const bbOpt = { includeLabels: false, includeEdges: false, includeMainLabels: false, includeNodes: true };
  const bb = selectedNodes.boundingBox(bbOpt);

  cy.batch(() => {
    switch (action.payload) {
      case "hl":
        selectedNodes.forEach((node) => {
          const nodeBb = node.boundingBox(bbOpt);
          node.position({
            x: bb.x1 + nodeBb.w / 2,
            y: node.position().y,
          });
        });
        break;

      case "hc":
        selectedNodes.forEach((node) => {
          node.position({
            x: (bb.x1 + bb.x2) / 2,
            y: node.position().y,
          });
        });
        break;

      case "hr":
        selectedNodes.forEach((node) => {
          const nodeBb = node.boundingBox(bbOpt);
          node.position({
            x: bb.x2 - nodeBb.w / 2,
            y: node.position().y,
          });
        });
        break;

      case "vb":
        selectedNodes.forEach((node) => {
          const nodeBb = node.boundingBox(bbOpt);
          node.position({
            x: node.position().x,
            y: bb.y2 - nodeBb.h / 2,
          });
        });
        break;

      case "vc":
        selectedNodes.forEach((node) => {
          const nodeBb = node.boundingBox(bbOpt);
          node.position({
            x: node.position().x,
            y: (bb.y1 + bb.y2) / 2,
          });
        });
        break;

      case "vt":
        selectedNodes.forEach((node) => {
          const nodeBb = node.boundingBox(bbOpt);
          node.position({
            x: node.position().x,
            y: bb.y1 + nodeBb.h / 2,
          });
        });
        break;

      case "dh": {
        const sorted = Array.from(selectedNodes).sort((a, b) => a.position().x - b.position().x);
        const last = sorted[sorted.length - 1];
        const first = sorted[0];
        const lastLeftX = last.position().x;
        const lastWidth = last.boundingBox(bbOpt).w;
        const lastCenterX = lastLeftX + lastWidth / 2;

        const firstLeftX = first.position().x;
        const firstWidth = first.boundingBox(bbOpt).w;
        const firstCenterX = firstLeftX + firstWidth / 2;

        const length = lastCenterX - firstCenterX;
        const elementsCount = sorted.length;

        const step = length / (elementsCount - 1);

        sorted.forEach((node, index) => {
          const x = firstCenterX - firstWidth / 2 + step * index;
          node.position({
            x,
            y: node.position().y,
          });
        });
        break;
      }

      case "dv": {
        const sorted = Array.from(selectedNodes).sort((a, b) => a.position().y - b.position().y);
        const last = sorted[sorted.length - 1];
        const first = sorted[0];
        const lastTopY = last.position().y;
        const lastHeight = last.boundingBox(bbOpt).h;
        const lastCenterY = lastTopY + lastHeight / 2;

        const firstTopY = first.position().y;
        const firstHeight = first.boundingBox(bbOpt).h;
        const firstCenterY = firstTopY + firstHeight / 2;

        const length = lastCenterY - firstCenterY;
        const elementsCount = sorted.length;

        const step = length / (elementsCount - 1);

        sorted.forEach((node, index) => {
          const y = firstCenterY - firstHeight / 2 + step * index;
          node.position({
            x: node.position().x,
            y,
          });
        });
        break;
      }
    }
  });
}
