import { CSS_CONNECTIONS_COUNT } from "../../cy-constants";
import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import _set from "lodash/set";

export function setConnectionsCountAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "SET_CONNECTIONS_COUNT") return;

  const el = cy.$id(action.payload.guid);
  const newData = el.data();
  _set(newData, "payload.connections_count", action.payload.count);
  el.addClass(CSS_CONNECTIONS_COUNT);
}
