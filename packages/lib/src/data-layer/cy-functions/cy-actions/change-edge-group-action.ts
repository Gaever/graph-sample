import { CSS_GROUP_LABEL_OFFSET, CSS_GROUP_LABEL_OFFSET_NEG } from "../../cy-constants";
import { getHiddenNode, noUserClasses, refreshStylesheet } from "./helpers";
import { hashStyle, pickDefaultGroupEdgeLabel } from "../../format-response";
import { CyCallbackAction, OnChangeEdgeGroupPayload, StylesheetDefaults, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";
import _omitBy from "lodash/omitBy";
import _set from "lodash/set";

export function changeEdgeGroupAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps, stylesheetDefaults: StylesheetDefaults) {
  if (action.type !== "CHANGE_EDGE_GROUP") return;

  const groupId = action.payload.groupId;

  const element = getHiddenNode(props, groupId) || cy.$id(groupId);
  let elements: cytoscape.EdgeCollection = element;

  const isBatch = action.payload.data.isApplyStyleToAllGroups || action.payload.data.isApplyLabelToAllGroups;

  cy.batch(() => {
    if (isBatch) {
      elements = cy.edges(`[?collapsedEdges]`);
    }

    // Если значение свойства пустое, выкидываем его из таблицы стилей
    const newStyle = _omitBy(action.payload.data.style, (item) => item === undefined || item === null || item === "");
    const newUserClassName = hashStyle(newStyle);

    const stylesheetMap = new Map(props.graphState.stylesheetMap);
    const selectedEdgeGroups = new Map(props.graphState.selectedEdgeGroups);

    let isSelectedEdgeGroupsDirty = false;
    let isStylesheetDirty = false;

    const originElementId = groupId;

    function changeElement(args: {
      element: cytoscape.SingularElementReturnValue | cytoscape.EdgeSingular;
      doSkipOriginElement: boolean;
      doChangeLabel?: boolean;
      doChangeStyle?: boolean;
      data: OnChangeEdgeGroupPayload;
    }) {
      if (args.doSkipOriginElement && args.element.id() === originElementId) return;

      // Меняем каждый выбранный элемент
      const newData = args.element.data();

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

      if (args.doChangeLabel) {
        // Меняем подпись
        const displayedLabel = args.data.label || pickDefaultGroupEdgeLabel(args.element) || "";
        // _set(newData, "label", displayedLabel);
        _set(newData, "payload.label", displayedLabel);
        if (args.data.edgeAggregations) {
          _set(newData, "payload.aggregations", args.data.edgeAggregations);
        }

        applyLabelOffset(args.element, newStyle);
      }

      args.element.data(newData);

      if (selectedEdgeGroups.has(args.element.id())) {
        // Обновляем сайдбар
        selectedEdgeGroups.set(args.element.id(), args.element);
        isSelectedEdgeGroupsDirty = true;
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
        doChangeStyle: action.payload.data.isApplyStyleToAllGroups,
        doChangeLabel: action.payload.data.isApplyLabelToAllGroups,
      });
    });

    if (isSelectedEdgeGroupsDirty) {
      props.dispatchGraphAction({
        type: "SET_SELECTED_ELEMENTS",
        payload: {
          ...(isSelectedEdgeGroupsDirty ? { selectedEdgeGroups } : null),
        },
      });
    }

    if (isStylesheetDirty) {
      props.dispatchGraphAction({ type: "SET_STYLESHEET_MAP", payload: stylesheetMap });
      refreshStylesheet(props, stylesheetDefaults, stylesheetMap);
    }
  });
}

function applyLabelOffset(element: cytoscape.EdgeSingular, newStyle: cytoscape.Css.Edge) {
  if (newStyle["source-text-offset"] && !element.hasClass(CSS_GROUP_LABEL_OFFSET)) {
    element.addClass(CSS_GROUP_LABEL_OFFSET);
  }
  if (newStyle["target-text-offset"] && !element.hasClass(CSS_GROUP_LABEL_OFFSET_NEG)) {
    element.addClass(CSS_GROUP_LABEL_OFFSET_NEG);
  }
  if (!newStyle["source-text-offset"]) {
    element.removeClass(CSS_GROUP_LABEL_OFFSET);
  }
  if (!newStyle["target-text-offset"]) {
    element.removeClass(CSS_GROUP_LABEL_OFFSET_NEG);
  }
}
