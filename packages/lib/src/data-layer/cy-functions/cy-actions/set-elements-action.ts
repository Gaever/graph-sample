import { CSS_DRAWING } from "../../cy-constants";
import { CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import { fitPadding } from "./helpers";

export function setElementsAction(cy: cytoscape.Core, action: CyCallbackAction, _props: UseDispatchCyActionProps) {
  if (action.type !== "SET_ELEMENTS") return;
  const expandCollapse = cy.expandCollapse("get");

  const nodes = Array.from(action.payload.nodes.values());
  const groups = Array.from(action.payload.groups.values());
  const edges = Array.from(action.payload.edges.values());
  const drawings = Array.from(action.payload.drawings.values());

  cy.batch(() => {
    cy.remove(cy.elements());
    cy.json({ elements: JSON.parse(JSON.stringify([...nodes, ...drawings, ...groups, ...edges])) });
    // Скрываем все элементы, потому что манипуляции с расстановкой, скрытием и раскрытием групп вызывают
    // неприятные графические артефакты
    cy.elements().addClass("transparent");

    // У плагина для сворачивания группы нет возможности экспортировать и импортировать полноценно
    // информацию о сгруппированных узлах.
    // В json мы храним признак свернутой группы, но нужно явно вызвать метод
    // чтобы группа отобразилать свернутой. Выбираем группы, которые будем сворачивать.
    const collapsedGroups = cy.$("[?collapsed]");

    // Бэк может отдать ноды без указания координат.
    // Часть нод может содержать координаты.
    // Мы хотим автоматически расставить ноды без координат и сохранить новые координаты в json
    const unpositionedNodes = cy.nodes("[id !*= 'group'][id !*= 'drawing'][!positionX][!positionY]");

    unpositionedNodes.layout({ name: "grid", animate: true, fit: true, padding: fitPadding }).run();
    unpositionedNodes.forEach((item) => {
      item.data("positionX", item.position().y);
      item.data("positionY", item.position().x);
    });

    cy.$(`.${CSS_DRAWING}`).forEach((node) => {
      // Устанавливаем стили для графических элементов, которые не являются
      // узлами графа данных (простые квадратики, треугольники и тд.)

      if (node.data("style")) {
        Object.keys(node.data("style") || {}).forEach((key) => {
          node.style(key, node.data("style")[key]);
        });
      }
    });

    requestAnimationFrame(() => {
      // Сворачивание групп конфликтует с применением фильтров.
      // Отправляем эту операцию в конец цикла рендеринга.

      cy.elements().removeClass("transparent");

      // Визуально сворачиваем группы
      expandCollapse.collapse(collapsedGroups);

      if (action.payload.edgeGroups) {
        // Сворачиваем группы связей.
        action.payload.edgeGroups.forEach((item) => {
          if (Array.isArray(item.connections_ids)) {
            const selector = `#${item.connections_ids.join(",#")}`;
            const connectionsToCollapse = cy.elements(selector);
            connectionsToCollapse.removeClass("transparent");

            // Перед тем как сворачивать группу связей обязательно сначала надо свернуть группу узлов (см. выше expandCollapse.collapse).
            const connectionGroup = expandCollapse.collapseEdges(connectionsToCollapse);
            (item.classes || []).forEach((classname) => {
              connectionGroup.edges[0].addClass(classname);
            });
            if (item.aggregations) {
              // Применяем агрегации на свернутой группе связей
              connectionGroup.edges[0].data("payload", { aggregations: item.aggregations });
            }
          }
        });
      }

      cy.fit(undefined, fitPadding);
      cy.emit("set-elements");
      if (unpositionedNodes.length > 0) {
        action.callback?.();
      }
    });
  });
}
