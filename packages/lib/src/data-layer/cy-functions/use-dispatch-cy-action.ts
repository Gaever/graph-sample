import { aSearchAction } from "./cy-actions/a-search-action";
import { addNodeAction } from "./cy-actions/add-node-action";
import { addNodeAttributeAction } from "./cy-actions/add-node-attribute-action";
import { addNodesToGroupAction } from "./cy-actions/add-nodes-to-group-action";
import { alignAction } from "./cy-actions/align-action";
import { applyFiltersAction } from "./cy-actions/apply-filters-action";
import { breakEdgehandlesAction } from "./cy-actions/break-edgehandles-action";
import { bringToBackAction, bringToFrontAction } from "./cy-actions/bring-to-action";
import { changeEdgeAction } from "./cy-actions/change-edge-action";
import { changeEdgeGroupAction } from "./cy-actions/change-edge-group-action";
import { changeNodeAction } from "./cy-actions/change-node-action";
import { changeNodeAttributeAction } from "./cy-actions/change-node-attribute-action";
import { changeNodeGroupAction } from "./cy-actions/change-node-group-action";
import { createEdgeGroupAction } from "./cy-actions/create-edge-group-action";
import { createNodeGroupAction } from "./cy-actions/create-node-group-action";
import { deleteEdgeAction } from "./cy-actions/delete-edge-action";
import { deleteEdgeGroupAndChildrenAction } from "./cy-actions/delete-edge-group-and-children-action";
import { deleteNodeAction } from "./cy-actions/delete-node-action";
import { deleteNodeAttribute } from "./cy-actions/delete-node-attribute";
import { deleteNodeGroupAndChildrenAction } from "./cy-actions/delete-node-group-and-children-action";
import { deleteSelectedElementsAction } from "./cy-actions/delete-selected-elements-action";
import { enableEdgehandlesAction } from "./cy-actions/enable-edgehandles-action";
import { fitPadding, refreshStylesheet, setUnsaved } from "./cy-actions/helpers";
import { hideSelectedElementsAction } from "./cy-actions/hide-selected-elements-action";
import { layoutAction } from "./cy-actions/layout-action";
import { removeChildFromNodeGroupAction } from "./cy-actions/remove-child-from-node-group-action";
import { removeEdgeGroupAction } from "./cy-actions/remove-edge-group-action";
import { removeNodeGroupAction } from "./cy-actions/remove-node-group-action";
import { selectAllAction } from "./cy-actions/select-all-action";
import { setConnectionsCountAction } from "./cy-actions/set-connections-count-action";
import { setElementsAction } from "./cy-actions/set-elements-action";
import { setGridSettingsAction } from "./cy-actions/set-grid-settings-action";
import { setZoomAction } from "./cy-actions/set-zoom-action";
import { showHiddenElementsAction } from "./cy-actions/show-hidden-elements-action";
import { useDefaultCyStylesheet } from "../../theme";
import { CyCallback, CyCallbackAction, UseDispatchCyActionProps } from "../../types";
import { useCallback, useRef } from "react";
import { setWorldMapStateAction } from "./cy-actions/set-world-map-state-action";
import { addDrawingAction } from "./cy-actions/add-drawing-action";
import { applyConditionStylesheetAction } from "./cy-actions/apply-condition-stylesheet-action";
import { deleteConditionStylesheetAction } from "./cy-actions/delete-condition-stylesheet-action";
import { changeConditionStylesheetAction } from "./cy-actions/change-condition-stylesheet-action";
import { clusterAction } from "./cy-actions/cluster-action";
import { changeNodeTimelineSettingsAction } from "./cy-actions/change-node-timeline-settings-action";

let i = 0;

export function useDispatchCyAction(props: UseDispatchCyActionProps) {
  const cy = props.cy;
  const stylesheetDefaults = useDefaultCyStylesheet();
  // При старте приложения могут быть запрошены действия (CyCallbackAction) до инициализации cytoscape канвы.
  // Они попадают в очередь и будут выполнены после инициализации.
  const dispatchQueueRef = useRef<CyCallbackAction[]>([]);
  const dispatchQueue = dispatchQueueRef.current;

  const dispatchCyAction = useCallback<CyCallback>(
    (action) => {
      if (!cy) {
        dispatchQueue.push(action);
        return;
      }

      switch (action.type) {
        case "SET_UNSAVED": {
          setUnsaved(props);
          break;
        }
        case "SET_ELEMENTS": {
          // Передаем в cytoscape новые данные (связи, узлы, но НЕ стили),
          // расставляем нерасставленные элементы (те у которых x,y = 0),
          // сворачиваем группы для которых из новых данных пришел признак collapsed: true
          setElementsAction(cy, action, props);
          break;
        }

        case "REFRESH_STYLESHEET": {
          // Обновляем таблицу стилей
          // при получении новых данных, изменении узла, связи или группы.
          refreshStylesheet(props, stylesheetDefaults, action.payload);
          break;
        }

        case "CENTER": {
          // Перемещаем фокус так, чтобы были видны все элементы на экране
          cy.fit(undefined, fitPadding);
          break;
        }

        case "LAYOUT": {
          // Расставляем элементы в соответствии с выбранным алгоритмом
          layoutAction(cy, action, props);
          break;
        }

        case "CHANGE_NODE": {
          // Изменить подпись, стиль, иконку итд для узла
          changeNodeAction(cy, action, props, stylesheetDefaults);
          break;
        }

        case "DELETE_NODE": {
          // Удаляем узел или связь
          deleteNodeAction(cy, action, props);
          break;
        }

        case "CREATE_NODE_GROUP": {
          // Создаем группу из выбранных узлов
          createNodeGroupAction(cy, action, props);
          break;
        }

        case "CHANGE_NODE_GROUP": {
          // Меняем подпись, стиль, иконку итд для группы
          changeNodeGroupAction(cy, action, props, stylesheetDefaults);
          break;
        }

        case "ADD_NODES_TO_GROUP": {
          // Добавить несколько узлов в группу.
          // Узлы, принадлежащие другой группе игнорируются.
          addNodesToGroupAction(cy, action, props);
          break;
        }

        case "REMOVE_NODE_GROUP": {
          // Расформируем группу (но не удаляем узлы внутри)
          removeNodeGroupAction(cy, action, props);
          break;
        }

        case "REMOVE_CHILD_FROM_NODE_GROUP": {
          // Убираем один элемент из группы (но ничего не удаляем).
          // Если был убран последний элемент из группы, расформируем группу.
          removeChildFromNodeGroupAction(cy, action, props);
          break;
        }

        case "DELETE_NODE_GROUP_AND_CHILDREN": {
          // Удаляем группу вместе с принадлежащей ей узлами.
          deleteNodeGroupAndChildrenAction(cy, action, props);
          break;
        }

        case "ADD_NODE_ATTRIBUTE": {
          // Добавляем новый атрибут в поля узла. Можно добавить во все ноды с одинаковым system_id
          addNodeAttributeAction(cy, action, props);
          break;
        }

        case "CHANGE_NODE_ATTRIBUTE": {
          // Меняем ключ или значение атрибута узла
          changeNodeAttributeAction(cy, action, props);
          break;
        }

        case "DELETE_NODE_ATTRIBUTE": {
          // Удаляем атрибут из данных узла
          deleteNodeAttribute(cy, action, props);
          break;
        }

        case "CHANGE_EDGE": {
          // Изменить подпись, стиль, иконку итд для связи
          changeEdgeAction(cy, action, props, stylesheetDefaults);
          break;
        }

        case "DELETE_EDGE": {
          deleteEdgeAction(cy, action, props);
          break;
        }

        case "CREATE_EDGE_GROUP": {
          createEdgeGroupAction(cy, action, props);
          break;
        }

        case "CHANGE_EDGE_GROUP": {
          // Изменить подпись, стиль, иконку итд для группы узлов
          changeEdgeGroupAction(cy, action, props, stylesheetDefaults);
          break;
        }

        case "REMOVE_EDGE_GROUP": {
          removeEdgeGroupAction(cy, action, props);
          break;
        }

        case "REMOVE_CHILD_FROM_EDGE_GROUP": {
          removeEdgeGroupAction(cy, action, props);
          break;
        }

        case "DELETE_EDGE_GROUP_AND_CHILDREN": {
          // Изменить подпись, стиль, иконку итд для узла
          deleteEdgeGroupAndChildrenAction(cy, action, props);
          break;
        }

        // На текущий момент нет необходимости в атрибутах связи
        // case "ADD_EDGE_ATTRIBUTE": {
        //   break;
        // }

        // case "CHANGE_EDGE_ATTRIBUTE": {
        //   break;
        // }

        // case "DELETE_EDGE_ATTRIBUTE": {
        //   break;
        // }

        case "APPLY_FILTERS": {
          // Применить фильтры (по иконке, атрибутам итд).
          // Элементы, не прошедшие по условиям фильтра становятся полупрозрачными
          // (или скрываются с display: none если был выбран соответствующий флаг в графическом интерфейсе).
          applyFiltersAction(cy, action, props);
          break;
        }

        case "BRING_TO_FRONT": {
          // Переместить выбранные узлы на передний план
          bringToFrontAction(cy, action, props, stylesheetDefaults);
          break;
        }

        case "BRING_TO_BACK": {
          // Переместить выбранные узлы на задний план
          bringToBackAction(cy, action, props, stylesheetDefaults);
          break;
        }

        case "ADD_NODE": {
          // Новый узел
          addNodeAction(cy, action, props);
          break;
        }

        case "ENABLE_EDGEHANDLE": {
          // Начать рисовать связь
          enableEdgehandlesAction(cy, action, props);
          break;
        }

        case "BREAK_EDGEHANDLE": {
          // Остановить отрисовку связи
          breakEdgehandlesAction(cy, action, props);
          break;
        }

        case "SET_GRID_SETTINGS": {
          // Настройки сетки
          setGridSettingsAction(cy, action, props);
          break;
        }

        case "ALIGN": {
          // Выравнивание
          alignAction(cy, action, props);
          break;
        }

        case "SELECT_ALL": {
          // Выделить все
          selectAllAction(cy, action, props);
          break;
        }

        case "DELETE_SELECTED_ELEMENTS": {
          deleteSelectedElementsAction(cy, action, props);
          break;
        }

        case "SHOW_HIDDEN_ELEMENTS": {
          showHiddenElementsAction(cy, action, props);
          break;
        }

        case "HIDE_SELECTED_ELEMENTS": {
          hideSelectedElementsAction(cy, action, props);
          break;
        }

        case "SET_CONNECTIONS_COUNT": {
          setConnectionsCountAction(cy, action, props);
          break;
        }

        case "SET_ZOOM": {
          setZoomAction(cy, action, props);
          break;
        }

        case "A_SEARCH": {
          aSearchAction(cy, action, props);
          break;
        }

        case "SET_WORLD_MAP_STATE": {
          setWorldMapStateAction(cy, action, props);
          break;
        }

        case "ADD_DRAWING": {
          addDrawingAction(cy, action, props);
          break;
        }

        case "CHANGE_CONDITION_STYLE": {
          changeConditionStylesheetAction(cy, action, props, stylesheetDefaults);
          break;
        }

        case "APPLY_CONDITION_STYLE": {
          applyConditionStylesheetAction(cy, action, props, stylesheetDefaults);
          break;
        }

        case "DELETE_CONDITION_STYLE": {
          deleteConditionStylesheetAction(cy, action, props, stylesheetDefaults);
          break;
        }

        case "CLUSTER": {
          clusterAction(cy, action, props);
          break;
        }

        case "CHAGNE_NODE_TIMELINE_SETTINGS": {
          changeNodeTimelineSettingsAction(cy, action, props);
          break;
        }
      }

      switch (action.type) {
        case "SET_ELEMENTS":
        case "REFRESH_STYLESHEET":
        case "CENTER":
        case "SELECT_ALL":
        case "SET_ZOOM":
        case "A_SEARCH":
          break;
        default:
          if (props.guiState.isTrackGraphUnsaved) {
            props.dispatchGuiAction({ type: "SET_IS_GRAPH_UNSAVED", payload: true });
          }
      }
    },
    [props, stylesheetDefaults]
  );

  while (dispatchQueue.length > 0) {
    if (i > 1000) {
      throw new Error("dispatch queue is too large, something is wrong. Break while loop.");
    }
    i++;
    const action = dispatchQueue.pop();
    if (action) dispatchCyAction(action);
  }

  return dispatchCyAction;
}
