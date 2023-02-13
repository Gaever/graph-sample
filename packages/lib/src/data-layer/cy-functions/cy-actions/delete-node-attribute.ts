import { getHiddenNode, updateElementDisplayedLabel, updateElementItemDataInGraphState } from "./helpers";
import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function deleteNodeAttribute(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "DELETE_NODE_ATTRIBUTE") return;
  // Удалить поле из данных элемента - узела или связи, НЕ группы.
  // Удалять данные узлов и связей внутри группы - ок.
  const element = getHiddenNode(props, action.payload.elementGuid) || cy.$id(action.payload.elementGuid);

  const newData = element.data();
  (newData?.payload?.data || []).splice(action.payload.attributeIndex, 1);

  updateElementDisplayedLabel(newData);

  element.data(newData);
  element.connectedEdges().forEach((edge) => {
    // заставляем обновиться подписи на смежных связях
    edge.data(edge.data());
  });

  updateElementItemDataInGraphState(props, element, newData);
}
