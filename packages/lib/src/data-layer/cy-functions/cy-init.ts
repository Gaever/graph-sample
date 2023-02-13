import { AppStateCtx, CyGroup } from "../../types";
import { aggregationFunctionTitles, isDrawing, isEdge, isEdgeGroup, isNode, isNodeGroup } from "../../utils";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import cyExpandCollapse from "cytoscape-expand-collapse";
// @ts-ignore
import klay from "cytoscape-klay";
// @ts-ignore
import nodeHtmlLabel from "cytoscape-node-html-label";
import _debounce from "lodash/debounce";
// @ts-ignore
import edgehandles from "cytoscape-edgehandles";
// @ts-ignore
import gridGuide from "cytoscape-grid-guide";
import { v4 as uuid } from "uuid";
import { handleMerge } from "./cy-node-merge";
// @ts-ignore
import {
  CSS_AGGREGATIONS,
  CSS_APP_PREFIX,
  CSS_CONNECTIONS_COUNT,
  EVENT_WORLD_MAP_STATE,
  SCRATCH_LEGEND_SHALL_UPDATE,
  SCRATCH_WORLD_MAP_SCALE,
  SCRATCH_WORLD_MAP_SHOW,
} from "../cy-constants";
// @ts-ignore
import cyCanvas from "cytoscape-canvas";
// @ts-ignore
import cise from "cytoscape-cise";

cytoscape.use(cyExpandCollapse);
cytoscape.use(dagre);
cytoscape.use(klay);
nodeHtmlLabel(cytoscape);
cytoscape.use(edgehandles);
gridGuide(cytoscape);
// cytoscape.use(cytoscapeMapboxgl);
cyCanvas(cytoscape);
// @ts-ignore
cytoscape.use(cise);

export function initCy(props: {
  dispatchGraphAction: AppStateCtx["dispatchGraphAction"];
  cyContainer: HTMLElement | null;
  dispatchGuiAction: AppStateCtx["dispatchGuiAction"];
  guiState: AppStateCtx["guiState"];
}) {
  const cy = cytoscape({
    container: props.cyContainer,
    // hideEdgesOnViewport: true,
    // textureOnViewport: true,
    layout: {
      name: "random",
      animate: true,
      fit: true,
      padding: 80,
    },
  });

  // Конфиг плагина для разворачивания/свертывания группы в один узел
  initExpandCollapse(cy);

  // Выбор элементов мышкой (по одному или рамкой с shift)
  initSelectionListeners({ cy, dispatchGuiAction: props.dispatchGuiAction, dispatchGraphAction: props.dispatchGraphAction, guiState: props.guiState });

  // Сокрытие элементов
  initHiddenElementsListener({ cy, dispatchGuiAction: props.dispatchGuiAction, dispatchGraphAction: props.dispatchGraphAction });

  // Плагин для отображение аггрегаций под группой
  initNodeHtmlLable(cy);

  // Плагин для создания (рисования) связей мышкой
  initEdgeHandles(cy);

  initZoomListener(cy, props.dispatchGuiAction);

  // Плагин интерактивной карты (отказались от использования)
  // initMapbox(cy, props.cyContainer);

  initCyCanvas(cy);

  // Перемещение элемента мы считаем изменением данных графа (потому что меняются координаты и мы их записываем в базу при сохранении).
  // Устанавливаем флаг несохраненных данных при перемещении элементов.
  // registerPositionListener(cy, props.dispatchGuiAction);

  return cy;
}

function initCyCanvas(cy: cytoscape.Core) {
  const worldMapPngPath = window.WORLD_MAP_IMG_PATH || process.env.REACT_APP_WORLD_MAP_IMG_PATH!;
  const background = new Image();
  background.onload = function () {
    // @ts-ignore
    const bottomLayer = cy.cyCanvas({
      zIndex: -1,
    });
    const canvas: HTMLCanvasElement = bottomLayer.getCanvas();
    canvas.classList.add(`${CSS_APP_PREFIX}-bg-white`);
    const ctx = canvas.getContext("2d")!;

    const pxrate = window.devicePixelRatio;
    const russiaPngPos = [-1100, -300];

    cy.on(EVENT_WORLD_MAP_STATE, () => {
      if (!cy.scratch(SCRATCH_WORLD_MAP_SHOW)) {
        bottomLayer.clear(ctx);
      }
    });

    cy.on(`render cyCanvas.resize ${EVENT_WORLD_MAP_STATE}`, (evt) => {
      if (cy.scratch(SCRATCH_WORLD_MAP_SHOW)) {
        const scale = cy.scratch(SCRATCH_WORLD_MAP_SCALE);
        bottomLayer.resetTransform(ctx);
        bottomLayer.clear(ctx);
        const pan = evt.cy.pan();
        const zoom = evt.cy.zoom();

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(pan.x * pxrate, pan.y * pxrate);
        ctx.scale(zoom * pxrate * scale, zoom * pxrate * scale);

        ctx.save();
        ctx.drawImage(background, russiaPngPos[0], russiaPngPos[1]);
        ctx.restore();
      } else {
        bottomLayer.clear(ctx);
      }
    });
  };
  background.src = worldMapPngPath;
}

function initZoomListener(cy: cytoscape.Core, dispatchGuiAction: AppStateCtx["dispatchGuiAction"]) {
  cy.on("zoom", (event) => {
    dispatchGuiAction({ type: "SET_ZOOM", payload: event.target.zoom() });
  });
}

function initEdgeHandles(cy: cytoscape.Core) {
  // @ts-ignore
  const edgehandlesInstance = cy.edgehandles({
    canConnect: function (sourceNode: cytoscape.NodeSingular, targetNode: cytoscape.NodeSingular) {
      return !sourceNode.same(targetNode) && !isNodeGroup(targetNode) && !isNodeGroup(sourceNode) && !isDrawing(sourceNode) && !isDrawing(targetNode);
    },
    edgeParams: function (sourceNode: cytoscape.NodeSingular, targetNode: cytoscape.NodeSingular) {
      // const guid = edgeGuid(sourceNode, targetNode);
      const guid = uuid();
      return {
        data: {
          id: guid,
          payload: {
            fromGuid: sourceNode.id(),
            toGuid: targetNode.id(),
            guid,
          },
        },
      };
    },
  });
  cy.scratch("_app", { edgehandlesInstance });
  cy.on("ehstop", () => {
    cy.scratch(SCRATCH_LEGEND_SHALL_UPDATE, true);
  });
}

function initNodeHtmlLable(cy: cytoscape.Core) {
  // @ts-ignore
  cy.nodeHtmlLabel([
    {
      query: `.${CSS_AGGREGATIONS}`,
      halign: "left",
      valign: "bottom",
      halignBox: "right",
      valignBox: "bottom",
      tpl(data: CyGroup["data"]) {
        const aggregations = data.payload?.aggregations || [];
        if (aggregations.length < 1) return "";

        return `<div class="aggregate-title">${(data.payload?.aggregations || [])
          .map((item) => {
            if (!item.func || !item.field || !item.isVisible) return "";
            return `<div><span>${aggregationFunctionTitles[item.func] || item.func}</span> <span>${item.fieldLabel || item.field}</span>: <span>${
              item.formattedValue || item.result || "0"
            }</span></div>`;
          })
          .join("")}</div>`;
      },
    },
    {
      query: `.${CSS_CONNECTIONS_COUNT}`,
      halign: "right",
      valign: "bottom",
      halignBox: "center",
      valignBox: "center",
      tpl(data: CyGroup["data"]) {
        // @ts-ignore
        return data.payload?.connections_count ? `<span class="connections-count-badge">${data.payload?.connections_count}</span>` : "";
      },
    },
  ]);

  // Баг на уровне cytoscape-node-html-label или cytoscape.
  // Проверено на чистом проекте только лишь с реактом и cytoscape, без плагинов.
  //
  // Вызов метода width() в следующем участке кода
  //
  // cy.on("bounds", (event) => {
  //  event.target.width()
  // })
  //
  // приведет к коллапсу всех стилей на графе.
  //
  // Чтобы избежать баги принудительно отписываемся
  // от этого события(на него подписан обработчик внутри cytoscape - node - html - label).
  // Отключение события приводит к незначительному багу - положение подписей с агрегациями под нодой не обновляются во время
  // перетаскивания ноды для свернутой группы. Для развернутой группы
  // положение подписи синхронизируется с задержкой
  cy.off("bounds");
}

function initExpandCollapse(cy: cytoscape.Core) {
  cy.expandCollapse({
    fisheye: false,
    undoable: false,
    allowNestedEdgeCollapse: false,
    expandCollapseCuePosition: (node) => {
      // Корректируем положение "плюса" и "минуса" для раскрытия/свертывания группы

      const isExpandable = cy.expandCollapse("get").isExpandable(node);

      if (isExpandable) {
        return node.position();
      }

      const bb = node.boundingBox({
        includeNodes: true,
        includeMainLabels: false,
        includeEdges: false,
        includeLabels: false,
        includeSourceLabels: false,
        includeTargetLabels: false,
        includeOverlays: false,
      });
      return { x: bb.x1 + 15, y: bb.y1 + 15 };
    },
  });
}

/**
 * Из соображений оптимизации регистрируем одноразовый listener (cy.one) на события
 * select и unselect и по факту выполнения события рекурсивно снова регистрируем
 * этот же обработчик.
 * Сильно ускоряет производительность при выделении рамкой большого количества элементов.
 *
 * Следующие варианты сильно медленнее:
 *
 * 1. На каждый выделенный элемент сработает событие и будет вызван селектор. Очень медленно,
 * умирает уже на 10 элементах
 * cy.on("select", "node", function() {
 *   const nodes = cy.$("node:selected");
 *    .....
 * });
 *
 * 2. Тормозит из-за перерендеров. Производительность примерно такая же как в первом случае.
 * cy.on("select", "node", function(event) {
 *   setSelectedNodesData(prev => [...prev, event.target.data()])
 *    .....
 * });
 *
 * Реализованный ниже вариант работает практически без задержки.
 */
const getOptimizedHandler = (cy: cytoscape.Core, eventName: string, cb: (...args: any[]) => void) => {
  const optimizedHandler = function () {
    return function (event: cytoscape.EventObject) {
      cb(event, eventName);
      requestAnimationFrame(() => {
        cy.one(eventName, optimizedHandler());
      });
    };
  };
  return optimizedHandler();
};

export function initSelectionListeners(props: {
  cy: cytoscape.Core;
  dispatchGraphAction: AppStateCtx["dispatchGraphAction"];
  dispatchGuiAction: AppStateCtx["dispatchGuiAction"];
  guiState: AppStateCtx["guiState"];
}) {
  const optimizedSelectHandler = (eventName: string) =>
    getOptimizedHandler(props.cy, eventName, () => {
      // Ищем все выделенные элементы - и связи и узлы (в том числе группы)
      const selectedNodes = props.cy.$("node:selected");
      const selectedEdges = props.cy.$("edge:selected");

      _debounce(() => {
        // debounce убирает визуальный фриз рамки выделении элементов при закрытом сайдбаре.
        // 250мс отнимает открытие сайдбара

        const nodes: AppStateCtx["graphState"]["selectedNodes"] = new Map();
        const edges: AppStateCtx["graphState"]["selectedEdges"] = new Map();
        const nodeGroups: AppStateCtx["graphState"]["selectedNodeGroups"] = new Map();
        const edgeGroups: AppStateCtx["graphState"]["selectedEdgeGroups"] = new Map();

        let selectedDrawing: cytoscape.NodeSingular | null = null;

        const grouppableSelectedNodes: AppStateCtx["graphState"]["grouppableSelectedNodes"] = new Set();

        let nodeToMerge: cytoscape.NodeSingular | undefined = undefined;

        selectedNodes.forEach((element, index) => {
          if (element.removed()) return;

          if (isDrawing(element)) {
            selectedDrawing = element;
            return;
          }

          if (isNodeGroup(element)) {
            nodeGroups.set(element.id(), element);
          } else if (isNode(element)) {
            nodes.set(element.id(), element);
            if (!element.data().parent) {
              grouppableSelectedNodes.add(element.id());
            }

            if (!nodeToMerge && index === 0) nodeToMerge = element;
          }
        });
        selectedEdges.forEach((element) => {
          if (element.removed()) return;

          if (isEdgeGroup(element)) {
            edgeGroups.set(element.id(), element);
          } else if (isEdge(element)) {
            edges.set(element.id(), element);
          }
        });

        props.dispatchGraphAction({
          type: "SET_SELECTED_ELEMENTS",
          payload: {
            selectedNodes: nodes,
            selectedEdges: edges,
            selectedNodeGroups: nodeGroups,
            selectedEdgeGroups: edgeGroups,
            grouppableSelectedNodes,
          },
        });

        props.dispatchGraphAction({ type: "SET_SELECTED_DRAWING", payload: selectedDrawing });

        handleMerge(props.cy, nodes, nodeToMerge);

        if (eventName === "select") {
          // открываем сайдбар после выделения элементов если он был закрыт
          props.dispatchGuiAction({ type: "TOGGLE_SHOW_DATA_EXPLORER", payload: true });
        }
      }, 50)();
    });

  props.cy.one("select", optimizedSelectHandler("select"));
  props.cy.one("unselect", optimizedSelectHandler("unselect"));
}

function initHiddenElementsListener(props: { cy: cytoscape.Core; dispatchGraphAction: AppStateCtx["dispatchGraphAction"]; dispatchGuiAction: AppStateCtx["dispatchGuiAction"] }) {
  const optimizedHiddenHandler = (eventName: string) =>
    getOptimizedHandler(props.cy, eventName, () => {
      requestAnimationFrame(() => {
        const hiddenNodes = props.cy.$("node:hidden");
        const hiddenEdges = props.cy.$("edge:hidden");

        const nodes: AppStateCtx["graphState"]["hiddenNodes"] = new Map();
        const edges: AppStateCtx["graphState"]["hiddenEdges"] = new Map();
        const nodeGroups: AppStateCtx["graphState"]["hiddenNodeGroups"] = new Map();
        const edgeGroups: AppStateCtx["graphState"]["hiddenEdgeGroups"] = new Map();

        hiddenNodes.forEach((element) => {
          if (element.removed()) return;

          if (isNodeGroup(element)) {
            nodeGroups.set(element.id(), element);
          } else if (isNode(element)) {
            nodes.set(element.id(), element);
          }
        });

        hiddenEdges.forEach((element) => {
          if (element.removed()) return;

          if (isEdgeGroup(element)) {
            edgeGroups.set(element.id(), element);
          } else if (isEdge(element)) {
            edges.set(element.id(), element);
          }
        });

        props.dispatchGraphAction({
          type: "SET_HIDDEN_ELEMENTS",
          payload: {
            hiddenNodes: nodes,
            hiddenEdges: edges,
            hiddenNodeGroups: nodeGroups,
            hiddenEdgeGroups: edgeGroups,
          },
        });
      });
    });

  props.cy.one("style", optimizedHiddenHandler("style"));
}

export function registerPositionListener(cy: cytoscape.Core, dispatchGuiAction: AppStateCtx["dispatchGuiAction"]) {
  const handler = _debounce(
    () => {
      dispatchGuiAction({ type: "SET_IS_GRAPH_UNSAVED", payload: true });
    },
    500,
    { trailing: true }
  );
  cy.on("position", handler);
}
