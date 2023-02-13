import { CSS_LABEL_OFFSET, CSS_LABEL_OFFSET_NEG } from "../../cy-constants";
import { noUserClasses, refreshStylesheet } from "./helpers";
import { hashStyle } from "../../format-response";
import { CyCallbackAction, OnChangeEdgePayload, StylesheetDefaults, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import _omitBy from "lodash/omitBy";
import _set from "lodash/set";

export function changeEdgeAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps, stylesheetDefaults: StylesheetDefaults) {
  if (action.type !== "CHANGE_EDGE") return;
  const expandCollapse = cy.expandCollapse("get");

  const elementGuid = action.payload.edgeGuid;

  const element = cy.$id(elementGuid);
  let elements: cytoscape.EdgeCollection = element;

  const isBatch = action.payload.data.isApplyStyleToAllEdges || action.payload.data.isApplyLabelToAllEdges;

  cy.batch(() => {
    let collapsedGroups: cytoscape.NodeCollection | undefined = undefined;

    if (isBatch) {
      collapsedGroups = expandCollapse.expandableNodes();
      expandCollapse.expandAll();
      elements = cy.edges();
    }

    // Если значение свойства пустое, выкидываем его из таблицы стилей
    const newStyle = _omitBy(action.payload.data.style, (item) => item === undefined || item === null || item === "");
    const newUserClassName = hashStyle(newStyle);

    const stylesheetMap = new Map(props.graphState.stylesheetMap);
    const selectedEdges = new Map(props.graphState.selectedEdges);

    let isSelectedEdgesDataDirty = false;
    let isStylesheetDirty = false;

    const originElementId = elementGuid;

    function changeElement(args: {
      element: cytoscape.SingularElementReturnValue | cytoscape.EdgeSingular;
      doSkipOriginElement: boolean;
      doChangeLabel?: boolean;
      doChangeStyle?: boolean;
      data: OnChangeEdgePayload;
    }) {
      if (args.doSkipOriginElement && args.element.id() === originElementId) return;

      // Меняем каждый выбранный элемент
      const newData = args.element.data();

      if (args.doChangeLabel) {
        // Меняем подпись
        _set(newData, "payload.label_template", args.data.labelTemplate);
        if (args.data.edgeAggregations) {
          _set(newData, "payload.aggregations", args.data.edgeAggregations);
        }

        applyLabelOffset(args.element, newStyle);
      }

      if (args.doChangeStyle) {
        if (newStyle !== undefined && !args.element.hasClass(newUserClassName)) {
          // Обновляем стиль

          for (const styleKey of Object.keys(newStyle)) {
            // Проходим по всем полям в новых стилях, устанавливаем их в data поля элемента
            // и назначаем элементу новый класс
            if (args.element.group() === "edges") {
              const key = styleKey as keyof cytoscape.Css.Edge;
              const style = newStyle as cytoscape.Css.Edge;
              _set(newData, `payload.styles.${styleKey}`, style[key]);
            }
          }

          args.element.classes([...noUserClasses(args.element), newUserClassName]);
          _set(newData, "className", newUserClassName);
        }
      }
      args.element.data(newData);

      if (selectedEdges.has(args.element.id())) {
        // Обновляем сайдбар
        selectedEdges.set(args.element.id(), args.element);
        isSelectedEdgesDataDirty = true;
      }

      const selector = `.${newUserClassName}`;
      if (!stylesheetMap.has(selector) && newStyle) {
        // Создаем стиль в таблице стилей если такой стиль новый
        stylesheetMap.set(selector, { selector, style: newStyle });
        isStylesheetDirty = true;
      }
    }

    changeElement({
      element,
      data: action.payload.data,
      doSkipOriginElement: false,
      doChangeLabel: true,
      doChangeStyle: true,
    });

    elements.forEach((element) => {
      changeElement({
        element,
        data: action.payload.data,
        doSkipOriginElement: true,
        doChangeLabel: action.payload.data.isApplyLabelToAllEdges,
        doChangeStyle: action.payload.data.isApplyStyleToAllEdges,
      });
    });

    if (isSelectedEdgesDataDirty) {
      props.dispatchGraphAction({
        type: "SET_SELECTED_ELEMENTS",
        payload: {
          ...(isSelectedEdgesDataDirty ? { selectedEdges } : null),
        },
      });
    }

    if (isStylesheetDirty) {
      props.dispatchGraphAction({ type: "SET_STYLESHEET_MAP", payload: stylesheetMap });
      refreshStylesheet(props, stylesheetDefaults, stylesheetMap);
    }

    if (collapsedGroups && collapsedGroups.length > 0) {
      expandCollapse.collapse(collapsedGroups);
    }
  });
}

function applyLabelOffset(element: cytoscape.EdgeSingular, newStyle: cytoscape.Css.Edge) {
  if (newStyle["source-text-offset"] && !element.hasClass(CSS_LABEL_OFFSET)) {
    element.addClass(CSS_LABEL_OFFSET);
  }
  if (newStyle["target-text-offset"] && !element.hasClass(CSS_LABEL_OFFSET_NEG)) {
    element.addClass(CSS_LABEL_OFFSET_NEG);
  }
  if (!newStyle["source-text-offset"]) {
    element.removeClass(CSS_LABEL_OFFSET);
  }
  if (!newStyle["target-text-offset"]) {
    element.removeClass(CSS_LABEL_OFFSET_NEG);
  }
}
