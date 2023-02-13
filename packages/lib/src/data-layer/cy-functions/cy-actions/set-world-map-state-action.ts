import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import { EVENT_WORLD_MAP_STATE, SCRATCH_WORLD_MAP_SCALE, SCRATCH_WORLD_MAP_SHOW } from "../../cy-constants";

export function setWorldMapStateAction(cy: cytoscape.Core, action: CyCallbackAction, _props: UseDispatchCyActionProps) {
  if (action.type !== "SET_WORLD_MAP_STATE") return;

  cy.scratch(SCRATCH_WORLD_MAP_SHOW, action.payload.show);
  cy.scratch(SCRATCH_WORLD_MAP_SCALE, action.payload.scale);

  cy.trigger(EVENT_WORLD_MAP_STATE);
}
