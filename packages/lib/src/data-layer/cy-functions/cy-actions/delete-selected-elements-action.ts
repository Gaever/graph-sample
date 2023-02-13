import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function deleteSelectedElementsAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "DELETE_SELECTED_ELEMENTS") return;

  cy.$("*:selected").remove();

  props.dispatchGraphAction({ type: "RESET_SELECTED_ELEMENTS" });
}
