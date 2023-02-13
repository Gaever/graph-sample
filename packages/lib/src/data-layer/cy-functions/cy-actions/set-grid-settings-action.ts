import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function setGridSettingsAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "SET_GRID_SETTINGS") return;

  const show = action.payload.show;
  const snap = action.payload.snap;
  const panGrid = action.payload.panGrid;
  const snapToGridCenter = action.payload.snapToGridCenter;

  // @ts-ignore
  cy.gridGuide({
    snapToGridOnRelease: snap, // Snap to grid on release
    snapToGridDuringDrag: snap, // Snap to grid during drag
    snapToAlignmentLocationOnRelease: false, // Snap to alignment location on release
    snapToAlignmentLocationDuringDrag: false, // Snap to alignment location during drag
    distributionGuidelines: false, // Distribution guidelines
    geometricGuideline: false, // Geometric guidelines
    initPosAlignment: false, // Guideline to initial mouse position
    centerToEdgeAlignment: false, // Center to edge alignment
    resize: false, // Adjust node sizes to cell sizes
    parentPadding: false, // Adjust parent sizes to cell sizes by padding
    drawGrid: show, // Draw grid background

    // General
    gridSpacing: action.payload.size || 20, // Distance between the lines of the grid.
    snapToGridCenter: snapToGridCenter, // Snaps nodes to center of gridlines. When false, snaps to gridlines themselves. Note that either snapToGridOnRelease or snapToGridDuringDrag must be true.

    // Draw Grid
    zoomDash: true, // Determines whether the size of the dashes should change when the drawing is zoomed in and out if grid is drawn.
    panGrid: panGrid, // Determines whether the grid should move then the user moves the graph if grid is drawn.
    gridStackOrder: 0, // Namely z-index
    gridColor: "#dedede", // Color of grid lines
    lineWidth: 1.0, // Width of grid lines

    // Guidelines
    guidelinesStackOrder: 4, // z-index of guidelines
    guidelinesTolerance: 2.0, // Tolerance distance for rendered positions of nodes' interaction.

    // Parent Padding
    parentSpacing: -1, // -1 to set paddings of parents to gridSpacing
  });
}
